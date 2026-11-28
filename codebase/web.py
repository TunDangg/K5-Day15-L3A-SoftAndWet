"""Backend web cho TA — chạy: python codebase/web.py [--port 8000]

API (JSON, tiền tố /api/):
    GET    /api/health                 trạng thái server + model đang cấu hình
    GET    /api/questions              câu hỏi gốc (data/open_answers.json) + câu hỏi TA đã import
    GET    /api/answers?qid=Q01        câu trả lời của một câu (đã bỏ nhãn tay)
    POST   /api/analyze                {"text": "..."} → chạy agent.answer() → kết quả + guardrails + meta + trace
    GET    /api/stats                  số liệu lớp đã tổng hợp (data/class_stats.json) cho dashboard
    POST   /api/import                 upload .csv / .json câu trả lời mới → mã câu hỏi mới (Q101…)
    GET    /api/drafts[?qid=&limit=]   lịch sử bản nháp (tóm tắt)
    POST   /api/drafts                 lưu bản nháp TA đã chỉnh {"qid","text","title"?,"groups"?}
    GET    /api/drafts/<id>            một bản nháp đầy đủ
    DELETE /api/drafts/<id>            xoá một bản nháp

Giao diện: có frontend/dist (React + Vite build) thì phục vụ SPA (mọi đường dẫn không phải /api/ và không phải
file tĩnh → index.html); không có thì phục vụ trang cũ codebase/web_static/legacy.html. Trang cũ luôn có ở /legacy.

Nguyên tắc (giữ từ bản trước):
- KHÔNG sửa agent.py / tools.py / ai.py / tracing.py. Mọi kết quả phân tích lấy từ agent.answer(text).
- Không có endpoint gửi đi đâu (không gửi lớp, Discord, email). Bản nháp chỉ lưu cục bộ.
- Không trả nhan_tay / nhom_nhan_tay: câu trả lời chỉ đọc qua tools.get_answers (đã bỏ nhãn tay).
- tracing dùng biến toàn cục → begin/answer/end nằm trong một Lock; đang bận trả 409.
- CORS chỉ cho http://localhost:5173 (Vite dev) + WEB_CORS_ORIGINS.

Chạy / deploy (biến môi trường, xem .env.example):
- HOST (mặc định 127.0.0.1), PORT (mặc định 8000). Docker / Railway / Render: HOST=0.0.0.0, PORT do nền tảng cấp.
- APP_PASSWORD (+ APP_USER, mặc định "ta"): bật đăng nhập HTTP Basic cho mọi trang + API, trừ GET /api/health.
- Nghe ngoài localhost mà KHÔNG có APP_PASSWORD → từ chối khởi động (dữ liệu lớp + API key sẽ lộ cho ai có URL),
  trừ khi đặt ALLOW_NO_AUTH=1 một cách chủ động.
"""
import argparse
import base64
import hmac
import json
import mimetypes
import os
import re
import sys
import threading
import time
from email.parser import BytesParser
from email.policy import HTTP as HTTP_POLICY
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

try:
    import ai
    import agent
    import tools
    import tracing
    import web_store
except Exception as _e:  # lỗi cú pháp / thiếu thư viện trong codebase/
    print("Không nạp được codebase/: %s: %s" % (type(_e).__name__, _e))
    sys.exit(1)

VERSION = "2.0"
MAX_TEXT = 500
LIMITS = {"/api/analyze": 16 * 1024, "/api/drafts": 512 * 1024, "/api/import": web_store.MAX_IMPORT_BYTES + 64 * 1024}
STATS_PATH = os.path.join(ROOT, "data", "class_stats.json")
LEGACY_PATH = os.path.join(HERE, "web_static", "legacy.html")
FRONTEND_DIST = os.environ.get("WEB_FRONTEND_DIST") or os.path.join(ROOT, "frontend", "dist")
APP_USER = (os.environ.get("APP_USER") or "ta").strip()
APP_PASSWORD = os.environ.get("APP_PASSWORD") or ""
AUTH_EXEMPT = {("GET", "/api/health"), ("HEAD", "/api/health")}      # để Railway / Render kiểm tra sức khoẻ


def is_loopback(host):
    return host in ("127.0.0.1", "localhost", "::1") or host.startswith("127.")


def public_bind_problem(host, password, allow_no_auth):
    """Trả thông báo lỗi nếu nghe ngoài localhost mà không có mật khẩu (và không chủ động cho phép)."""
    if is_loopback(host) or password or allow_no_auth:
        return None
    return ("Từ chối khởi động: đang nghe %s (ai có URL cũng vào được) nhưng chưa đặt APP_PASSWORD.\n"
            "  Dữ liệu lớp, bản nháp và lượt gọi model (API key) sẽ lộ ra ngoài.\n"
            "  → Đặt biến môi trường APP_PASSWORD (và APP_USER nếu muốn) trên dashboard deploy,\n"
            "    hoặc ALLOW_NO_AUTH=1 nếu thật sự muốn mở công khai." % host)


def check_basic_auth(header, user, password):
    if not password:
        return True
    if not header or not header.startswith("Basic "):
        return False
    try:
        u, _, p = base64.b64decode(header[6:].strip()).decode("utf-8").partition(":")
    except (ValueError, UnicodeDecodeError):
        return False
    return hmac.compare_digest(u.encode(), user.encode()) & hmac.compare_digest(p.encode(), password.encode())


CORS_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"} | {
    o.strip().rstrip("/") for o in (os.environ.get("WEB_CORS_ORIGINS") or "").split(",") if o.strip()}

CSP_APP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; "
           "font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; "
           "frame-ancestors 'none'")
CSP_LEGACY = CSP_APP.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")

_LOCK = threading.Lock()
_STARTED = time.time()

# Bản KHÔNG ghi trace của get_answers (cùng logic, cùng bỏ nhãn tay) — cho endpoint chỉ đọc, để một lần đọc
# trong lúc đang phân tích không lọt vào trace của lượt phân tích đó.
_read_answers = getattr(tools.get_answers, "__wrapped__", tools.get_answers)


class ApiError(Exception):
    def __init__(self, status, code, title, hint="", soft=False):
        super().__init__(title)
        self.status = status
        self.body = {"ok": False, "status": "error", "error": {"code": code, "title": title, "hint": hint}}
        if soft:                                    # lỗi nhập nhẹ (trống / quá dài): FE hiện cảnh báo, không hiện lỗi đỏ
            self.body["soft"] = True


# ---------------------------------------------------------------- tách output của agent._render

KIND_PREFIX = [("Bỏ trống / không biết", "bo_trong"), ("Hiểu đúng", "dung"), ("Hiểu sai", "sai"),
               ("Lạc đề", "lac_de"), ("Chưa xếp", "chua_xep")]
HEADER = re.compile(r"^Nháp — (Q\d+): (.*) · (\d+) câu trả lời\s*$")
ITEM = re.compile(r"^\s*\d+\.\s+")
ONE_SUFFIX = "chỉ 1 câu"


def _split_kind(prefix):
    for label, kind in KIND_PREFIX:
        if prefix.lower().startswith(label.lower()):
            rest = prefix[len(label):]
            name = rest[1:].strip() if rest.startswith(":") else prefix
            return kind, label, name or prefix
    return "khac", "Nhóm", prefix


def _parse_report(output):
    lines = output.split("\n")
    m = HEADER.match(lines[0]) if lines else None
    if not m:
        raise ValueError("thiếu dòng đầu báo cáo")
    rep = {"kind": "report", "qid": m.group(1), "cau_hoi": m.group(2), "n": int(m.group(3)),
           "notes": [], "groups": [], "after": [], "limit": "", "fixes": "", "footer": ""}
    current = None
    for line in lines[1:]:
        if not line.strip():
            current = None
            continue
        g = tools.GROUP_LINE.search(line)
        if g and ITEM.match(line):
            prefix = ITEM.sub("", line[:g.start()]).rstrip().rstrip("—").rstrip()
            kind, label, name = _split_kind(prefix)
            current = {"kind": kind, "label": label, "name": name, "x": int(g.group(1)), "n": int(g.group(2)),
                       "ids": [i.strip() for i in g.group(3).split(",")], "desc": "", "quote": "",
                       "one": ONE_SUFFIX in line[g.end():]}
            rep["groups"].append(current)
            continue
        if line.startswith("   ") and current is not None:
            s = line.strip()
            if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
                current["quote"] = s[1:-1]
            else:
                current["desc"] = (current["desc"] + " " + s).strip()
            continue
        current = None
        s = line.strip()
        if not rep["groups"]:
            rep["notes"].append(s)
        elif s.startswith("Giới hạn:"):
            rep["limit"] = s
        elif s.startswith("Code đã sửa bản của AI:"):
            rep["fixes"] = s
        elif s.startswith("Nháp — chờ TA duyệt"):
            rep["footer"] = s
        else:
            rep["after"].append(s)
    if not rep["groups"]:
        raise ValueError("không có nhóm")
    return rep


def parse_output(output, text):
    """report (có dòng nhóm) | notice (hỏi lại, dừng, AI sai định dạng…) | raw (tách hỏng — hiện nguyên văn)."""
    output = output if isinstance(output, str) else str(output)
    has_group = any(tools.GROUP_LINE.search(l) and ITEM.match(l) for l in output.split("\n"))
    if has_group:
        try:
            return _parse_report(output)
        except Exception:
            return {"kind": "raw"}
    qid, problem = agent.extract_qid(text)
    enough = [q for q in tools.available_questions()
              if _read_answers(q).get("so_cau_tra_loi", 0) >= tools.MIN_ANSWERS and q != qid]
    level, title, hint, actions = "info", "Thông báo", "", []
    if problem == "thieu":
        title, hint, actions = "Cần chọn một câu hỏi", "Bấm một câu hỏi dưới đây, hoặc gõ kèm mã dạng [Q01].", enough
    elif problem:
        title, hint, actions = "Có nhiều hơn một mã câu hỏi", "Mỗi lần phân tích một câu. Bấm câu muốn xem trước.", enough
    elif qid not in tools.available_questions():
        title, hint, actions = "Không có câu hỏi %s" % qid, "Chọn một câu hỏi có trong dữ liệu.", enough
    elif output.startswith("Nháp — "):
        level, title, hint = "warn", "Chưa có bản nháp đạt kiểm", "Code đã chặn bản chưa đạt kiểm, không đưa cho TA. Bấm Phân tích để thử lại."
    else:
        title, hint, actions = "Quá ít câu trả lời để phân nhóm", "Không phân nhóm để tránh kết luận từ quá ít câu. Có thể xem câu hỏi khác.", enough
    return {"kind": "notice", "level": level, "title": title, "hint": hint, "actions": actions}


# ---------------------------------------------------------------- trace → bước hiển thị + guardrails

def build_steps(text, events):
    qid, problem = agent.extract_qid(text)
    steps = [{"type": "code", "title": "Code lấy mã câu hỏi từ câu TA gõ",
              "detail": qid if qid else ("không thấy mã câu hỏi" if problem == "thieu" else "có nhiều hơn 1 mã")}]
    for e in events:
        k = e.get("kind")
        if k == "tool" and e.get("name") == "get_answers":
            steps.append({"type": "tool", "name": "get_answers", "title": "Công cụ get_answers(%s)" % (qid or "?"),
                          "detail": "đọc câu hỏi + câu trả lời của lớp (đã bỏ nhãn tay)",
                          "latency_s": e.get("latency_s"), "error": e.get("error")})
        elif k == "tool" and e.get("name") == "check_report":
            out = e.get("output") or ""
            steps.append({"type": "tool", "name": "check_report", "title": "Công cụ check_report — code kiểm lần cuối",
                          "detail": "đạt kiểm (0 lỗi)" if out == "[]" else "báo lỗi: %s" % out, "passed": out == "[]",
                          "latency_s": e.get("latency_s"), "error": e.get("error")})
        elif k == "tool":
            steps.append({"type": "tool", "name": e.get("name"), "title": "Công cụ %s" % e.get("name"), "detail": "",
                          "latency_s": e.get("latency_s"), "error": e.get("error")})
        elif k == "model":
            steps.append({"type": "model", "name": e.get("name"),
                          "title": "Gọi model %s" % (e.get("model") or ai.MODEL_NAME or ai.MODEL_PROVIDER),
                          "detail": "xếp mỗi câu trả lời vào 1 nhóm (trả JSON) · token vào %s / ra %s"
                                    % (e.get("tokens_in", 0), e.get("tokens_out", 0)),
                          "latency_s": e.get("latency_s"), "error": e.get("error")})
        elif k == "note":
            steps.append({"type": "note", "title": "Code ghi chú", "detail": e.get("text", "")})
    return steps


def guardrails(text, output, events):
    """Đọc quyết định của code (note trong trace + câu cố định của agent) → danh sách guardrail cho FE."""
    out, notes = [], [e.get("text", "") for e in events if e.get("kind") == "note"]
    has = lambda s: any(s in n for n in notes)
    qid, problem = agent.extract_qid(text)
    if problem == "thieu":
        out.append(("missing_qid", "warn", "Yêu cầu không có mã câu hỏi — hệ thống hỏi lại, không tự chọn."))
    elif problem:
        out.append(("multiple_qid", "warn", "Yêu cầu có nhiều mã câu hỏi — hệ thống hỏi lại."))
    if has("dừng: không có câu hỏi"):
        out.append(("unknown_qid", "warn", "Không có câu hỏi %s trong dữ liệu — không phân tích, không bịa nhóm." % qid))
    if has("(<%d)" % tools.MIN_ANSWERS):
        out.append(("too_few_answers", "warn", "Dưới %d câu trả lời — không phân nhóm (không đủ kết luận, dễ lộ ai viết gì)."
                    % tools.MIN_ANSWERS))
    if agent.RANK_LINE in (output or ""):
        out.append(("rank_refusal", "block", agent.RANK_LINE))
    if any("chỉ dẫn" in n for n in notes):
        out.append(("injection_isolated", "block", "Có câu trả lời chứa chỉ dẫn chèn — code chuyển sang nhóm lạc đề, không trích nội dung."))
    if has("model không trả JSON"):
        out.append(("model_format_error", "warn", "AI trả sai định dạng — không đưa báo cáo chưa kiểm cho TA."))
    if has("check_report báo lỗi"):
        out.append(("check_failed", "warn", "check_report báo lỗi — chặn bản nháp chưa đạt kiểm."))
    if has("code sửa bản của model"):
        out.append(("ai_corrected", "info", "Code đã sửa bản của AI (id lạ / trùng / bỏ sót, câu trích không nguyên văn)."))
    if ai.MODEL_PROVIDER == "fake" and any(e.get("kind") == "model" for e in events):
        out.append(("fake_model", "info", "Đang dùng model giả — chưa gọi AI thật."))
    return [{"code": c, "level": l, "message": m} for c, l, m in out]


def friendly_error(exc):
    """Lỗi gọi model → thông báo cho TA. Ưu tiên MÃ HTTP (do ai.post_json ghi "HTTP 503: …"); chỉ dò từ khoá khi
    không có mã — dò chuỗi "rate" mù sẽ khớp cả "generateContent" và báo nhầm 503 thành hết lượt."""
    msg = "%s" % exc
    low = msg.lower()
    m = re.search(r"\bHTTP (\d{3})\b", msg)
    status = int(m.group(1)) if m else None
    if status in (401, 403) or (status is None and re.search(r"\bapi[ _]?key\b|permission|unauthori[sz]ed", low)):
        code, title, hint = "model_auth", "Model từ chối khoá API", "Kiểm tra API_KEY và MODEL_NAME trong .env (hoặc biến môi trường khi deploy) rồi khởi động lại."
    elif status == 429 or (status is None and re.search(r"\bquota\b|rate[ _-]?limit|resource_exhausted|too many requests", low)):
        code, title, hint = "model_quota", "Model báo hết lượt / gọi quá nhanh", "Đợi khoảng 1 phút rồi thử lại, hoặc đổi khoá có hạn mức cao hơn."
    elif status is not None and status >= 500:
        code, title, hint = "model_upstream", "Máy chủ model đang quá tải hoặc lỗi (HTTP %d)" % status, "Lỗi phía nhà cung cấp, không phải do yêu cầu của bạn. Thử lại sau ít giây."
    elif status == 404:
        code, title, hint = "model_not_found", "Không tìm thấy model", "Kiểm tra MODEL_NAME có đúng mã model của nhà cung cấp không."
    elif status is not None and 400 <= status < 500:
        code, title, hint = "model_bad_request", "Model từ chối yêu cầu (HTTP %d)" % status, "Kiểm tra MODEL_NAME / cấu hình model rồi thử lại."
    elif isinstance(exc, (TimeoutError, OSError)) or "urlopen" in low or "timed out" in low:
        code, title, hint = "model_network", "Không kết nối được tới model (mất mạng / quá thời gian chờ)", "Kiểm tra mạng rồi thử lại."
    elif "chưa có hàm gọi" in low:
        code, title, hint = "model_provider", "MODEL_PROVIDER chưa được hỗ trợ", "Sửa MODEL_PROVIDER (gemini / openai / anthropic / ollama / fake)."
    elif "không trả nội dung" in low or "bị chặn" in low:
        code, title, hint = "model_blocked", "Model không trả nội dung (bị bộ lọc chặn hoặc rỗng)", "Thử lại; nếu lặp lại, kiểm tra nội dung câu trả lời của lớp."
    else:
        code, title, hint = "model_error", "Có lỗi khi phân tích", "Thử lại. Chi tiết ở cửa sổ terminal / log server."
    return {"code": code, "title": title, "hint": hint,
            "detail": type(exc).__name__ + (" · HTTP %d" % status if status else "")}


# ---------------------------------------------------------------- nghiệp vụ

def model_info():
    fake = ai.MODEL_PROVIDER == "fake"
    return {"provider": ai.MODEL_PROVIDER, "name": None if fake else (ai.MODEL_NAME or None), "fake": fake}


def question_info(qid):
    if not qid:
        return None
    d = _read_answers(qid)
    if not d.get("co_cau_hoi"):
        return None
    return {"qid": d["question_id"], "cau_hoi": d["cau_hoi"], "kc_code": d.get("kc_code"),
            "so_cau_tra_loi": d["so_cau_tra_loi"], "source": "import" if qid in web_store.imported_qids() else "goc"}


def list_questions():
    meta, imported = web_store.import_meta(), web_store.imported_qids()
    out = []
    for qid in tools.available_questions():
        d = _read_answers(qid)
        item = {"qid": qid, "cau_hoi": d.get("cau_hoi", ""), "kc_code": d.get("kc_code"),
                "so_cau_tra_loi": d.get("so_cau_tra_loi", 0), "source": "import" if qid in imported else "goc"}
        if qid in meta:
            item.update(meta[qid])
        out.append(item)
    return out


def analyze(text):
    t0 = time.perf_counter()
    if not _LOCK.acquire(blocking=False):
        raise ApiError(409, "busy", "Đang phân tích một yêu cầu khác", "Đợi yêu cầu trước xong rồi thử lại.")
    try:
        tracing.begin("web")
        try:
            result = agent.answer(text)
            error = None
        except Exception as e:
            print("[web] lỗi khi phân tích: %s: %s" % (type(e).__name__, e), flush=True)
            result, error = None, e
        summary, events = tracing.end()
    finally:
        _LOCK.release()
    elapsed = int((time.perf_counter() - t0) * 1000)
    steps = build_steps(text, events)
    qid, _ = agent.extract_qid(text)
    checks = [s for s in steps if s.get("name") == "check_report"]
    meta = {"model": model_info(), "models_called": summary["models"], "elapsed_ms": elapsed,
            "model_calls": summary["model_calls"], "tool_calls": summary["tool_calls"],
            "tokens_in": summary["tokens_in"], "tokens_out": summary["tokens_out"],
            "check_report": ("pass" if checks[-1]["passed"] else "fail") if checks else "skipped"}
    trace = {"summary": summary, "steps": steps}
    legacy = {"summary": summary, "steps": steps, "elapsed_ms": elapsed,
              "model_provider": ai.MODEL_PROVIDER, "model_name": ai.MODEL_NAME}
    if error is not None:
        err = friendly_error(error)
        body = dict({"ok": False, "status": "error", "qid": qid, "error": err, "guardrails": [], "meta": meta,
                     "trace": trace}, **legacy)
        return 502, body
    output = result.get("output", "") if isinstance(result, dict) else str(result)
    try:
        parsed = parse_output(output, text)
    except Exception as e:                      # output bất thường: vẫn trả nguyên văn, không 500
        print("[web] không tách được output: %s: %s" % (type(e).__name__, e), flush=True)
        parsed = {"kind": "raw"}
    try:
        rails, info = guardrails(text, output, events), question_info(qid)
    except Exception as e:
        print("[web] lỗi đọc guardrail: %s: %s" % (type(e).__name__, e), flush=True)
        rails, info = [], None
    body = dict({"ok": True, "status": "report" if parsed["kind"] == "report" else parsed["kind"],
                 "qid": qid, "question": info,
                 "result": {"output": output, "parsed": parsed},
                 "guardrails": rails, "meta": meta, "trace": trace,
                 "output": output, "parsed": parsed}, **legacy)
    return 200, body


def load_stats():
    try:
        with open(STATS_PATH, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        raise ApiError(404, "no_stats", "Chưa có data/class_stats.json", "Chạy python data/build_class_stats.py <data/preclass>.")
    except ValueError:
        raise ApiError(500, "bad_stats", "data/class_stats.json hỏng", "Dựng lại file bằng data/build_class_stats.py.")
    days = data.get("ngay") or {}
    totals = {"so_luot": 0, "so_sai": 0, "so_cau_video": 0, "so_cau_khong_bam_bai": 0}
    for d in days.values():
        b, c = d.get("bai_on") or {}, d.get("cau_hoi_video") or {}
        totals["so_luot"] += b.get("so_luot", 0)
        totals["so_sai"] += b.get("so_sai", 0)
        totals["so_cau_video"] += c.get("so_cau", 0)
        totals["so_cau_khong_bam_bai"] += c.get("so_cau_khong_bam_bai", 0)
    totals["so_ngay"] = len(days)
    totals["ti_le_sai"] = round(totals["so_sai"] / totals["so_luot"], 4) if totals["so_luot"] else None
    return {"ok": True, "source": data.get("nguon"), "days": sorted(days), "totals": totals, "stats": data}


def _need_json(body):
    try:
        obj = json.loads(body.decode("utf-8")) if body else None
    except (ValueError, UnicodeDecodeError):
        raise ApiError(400, "bad_json", "Body không phải JSON hợp lệ", "Gửi Content-Type: application/json.")
    if not isinstance(obj, dict):
        raise ApiError(400, "bad_json", "Body phải là JSON object")
    return obj


def handle_analyze(body):
    text = _need_json(body).get("text")
    if not isinstance(text, str):
        raise ApiError(400, "bad_request", "Thiếu trường text", "Gửi {\"text\": \"[Q01] Phân tích câu trả lời của lớp\"}.")
    text = text.strip()
    if not text:
        raise ApiError(400, "empty", "Chưa có yêu cầu", "Gõ yêu cầu, ví dụ [Q01] Phân tích câu trả lời của lớp.", soft=True)
    if len(text) > MAX_TEXT:
        raise ApiError(400, "too_long", "Yêu cầu quá dài (%d ký tự)" % len(text),
                       "Giới hạn %d ký tự. Chỉ cần mã câu hỏi và một câu ngắn." % MAX_TEXT, soft=True)
    return analyze(text)


def _parse_multipart(ctype, body):
    msg = BytesParser(policy=HTTP_POLICY).parsebytes(b"Content-Type: " + ctype.encode("latin-1") + b"\r\n\r\n" + body)
    if not msg.is_multipart():
        raise ApiError(400, "bad_multipart", "Form upload không hợp lệ")
    fields, file_part = {}, None
    for part in msg.iter_parts():
        name = part.get_param("name", header="content-disposition")
        if not name:
            continue
        if part.get_filename() is not None or name == "file":
            file_part = (part.get_filename() or "upload", part.get_payload(decode=True) or b"")
        else:
            fields[name] = (part.get_payload(decode=True) or b"").decode("utf-8", "replace").strip()
    return fields, file_part


def handle_import(ctype, body, query):
    ctype_l = (ctype or "").lower()
    fields = {k: v[0] for k, v in query.items()}
    if ctype_l.startswith("multipart/form-data"):
        f2, file_part = _parse_multipart(ctype, body)
        fields.update(f2)
        if not file_part:
            raise ApiError(400, "no_file", "Thiếu file", "Gửi form-data có trường “file” (.csv hoặc .json).")
        filename, data = file_part
    elif ctype_l.startswith("application/json"):
        obj = _need_json(body)
        if isinstance(obj.get("content"), str):            # {"filename", "content", "cau_hoi"?, "kc_code"?}
            filename, data = obj.get("filename") or "upload.json", obj["content"].encode("utf-8")
            fields.update({k: obj[k] for k in ("cau_hoi", "kc_code") if isinstance(obj.get(k), str)})
        else:                                               # chính nội dung file JSON
            filename, data = "upload.json", body
    elif ctype_l.startswith(("text/csv", "text/plain", "application/vnd.ms-excel")):
        filename, data = fields.get("filename") or "upload.csv", body
    else:
        raise ApiError(415, "unsupported_type", "Kiểu dữ liệu không hỗ trợ",
                       "Gửi multipart/form-data (trường file), text/csv hoặc application/json.")
    try:
        created, warnings = web_store.import_file(filename, data, fields.get("cau_hoi"), fields.get("kc_code"))
    except web_store.ImportError_ as e:
        raise ApiError(400, "invalid_file", "File chưa đúng định dạng", str(e))
    return 201, {"ok": True, "imported": created, "warnings": warnings,
                 "next": {"qid": created[0]["qid"], "analyze_text": created[0]["analyze_text"]}}


def handle_save_draft(body):
    obj = _need_json(body)
    qid = tools.normalize_qid(obj.get("qid"))
    text = obj.get("text")
    if not qid or not question_info(qid):
        raise ApiError(400, "bad_qid", "Mã câu hỏi không hợp lệ hoặc không tồn tại", "Gửi qid như “Q01”.")
    if not isinstance(text, str) or not text.strip():
        raise ApiError(400, "empty", "Bản nháp trống")
    if len(text) > web_store.MAX_DRAFT_CHARS:
        raise ApiError(413, "too_long", "Bản nháp quá dài", "Giới hạn %d ký tự." % web_store.MAX_DRAFT_CHARS)
    title = obj.get("title")
    title = title.strip()[:200] if isinstance(title, str) and title.strip() else None
    groups = obj.get("groups")
    if groups is not None and not isinstance(groups, list):
        raise ApiError(400, "bad_groups", "groups phải là danh sách")
    source = obj.get("source") if obj.get("source") in ("ta", "ai") else "ta"
    try:
        draft = web_store.save_draft(qid, text, title, groups, source)
    except ValueError as e:
        raise ApiError(413, "too_large", str(e))
    return 201, {"ok": True, "draft": draft}


# ---------------------------------------------------------------- HTTP

def _dist_ready():
    return os.path.isfile(os.path.join(FRONTEND_DIST, "index.html"))


class Handler(BaseHTTPRequestHandler):
    server_version = "TADemo/" + VERSION
    protocol_version = "HTTP/1.1"
    timeout = 30            # giây chờ đọc socket: client gửi thiếu body / treo kết nối không giữ luồng mãi

    def log_message(self, fmt, *args):
        sys.stdout.write("[web] %s\n" % (fmt % args))

    # ---- trả lời
    def _cors(self):
        origin = (self.headers.get("Origin") or "").rstrip("/")
        if origin in CORS_ORIGINS and self.path.startswith("/api/"):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")

    def _send(self, status, body, ctype, csp=CSP_APP, cache="no-store", extra=None):
        data = body.encode("utf-8") if isinstance(body, str) else body
        try:
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", cache)
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "no-referrer")
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("Content-Security-Policy", csp)
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self._cors()
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _json(self, status, obj):
        self._send(status, json.dumps(obj, ensure_ascii=False), "application/json; charset=utf-8")

    def _body(self, path):
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = -1
        if length < 0:
            raise ApiError(400, "bad_length", "Content-Length không hợp lệ")
        if length > LIMITS.get(path, 16 * 1024):
            self.close_connection = True
            raise ApiError(413, "too_large", "Dữ liệu gửi lên quá lớn", "Giới hạn %d KB." % (LIMITS.get(path, 16384) // 1024))
        return self.rfile.read(length) if length else b""

    # ---- định tuyến
    def _authorized(self, method, path):
        if (method, path) in AUTH_EXEMPT:
            return True
        return check_basic_auth(self.headers.get("Authorization"), APP_USER, APP_PASSWORD)

    def _deny(self, path):
        self.close_connection = True
        extra = {"WWW-Authenticate": 'Basic realm="Tro ly phan tich cau tra loi mo", charset="UTF-8"'}
        if path.startswith("/api/"):
            body = json.dumps({"ok": False, "status": "error", "error": {"code": "unauthorized", "title": "Cần đăng nhập",
                               "hint": "Nhập tài khoản do nhóm cấp."}}, ensure_ascii=False)
            return self._send(401, body, "application/json; charset=utf-8", extra=extra)
        return self._send(401, "<!doctype html><meta charset=utf-8><title>Cần đăng nhập</title><p>Cần đăng nhập để dùng trợ lý.</p>",
                          "text/html; charset=utf-8", extra=extra)

    def _route(self, method):
        url = urlparse(self.path)
        path, query = url.path, parse_qs(url.query)
        if not self._authorized(method, path):
            return self._deny(path)
        if path.startswith("/api/"):
            try:
                body = self._body(path) if method in ("POST", "PUT", "DELETE") else b""
                status, obj = self._api(method, path, query, body)
            except ApiError as e:
                status, obj = e.status, e.body
            except Exception as e:
                print("[web] lỗi %s %s: %s: %s" % (method, path, type(e).__name__, e), flush=True)
                status, obj = 500, {"ok": False, "status": "error",
                                    "error": {"code": "internal", "title": "Lỗi máy chủ web", "hint": "Thử lại. Chi tiết ở terminal."}}
            return self._json(status, obj)
        if method not in ("GET", "HEAD"):
            return self._json(405, {"ok": False, "error": {"code": "method", "title": "Phương thức không hỗ trợ"}})
        return self._static(path)

    def _api(self, method, path, query, body):
        if path == "/api/health" and method == "GET":
            return 200, {"ok": True, "status": "ok", "version": VERSION, "model": model_info(), "busy": _LOCK.locked(),
                         "uptime_s": int(time.time() - _STARTED), "frontend": "dist" if _dist_ready() else "legacy",
                         "data": {"questions": len(tools.available_questions()), "imported": len(web_store.imported_qids()),
                                  "drafts": web_store.count_drafts()},
                         "limits": {"max_text": MAX_TEXT, "min_answers": tools.MIN_ANSWERS}}
        if path == "/api/questions" and method == "GET":
            qs = list_questions()
            return 200, {"ok": True, "questions": qs, "count": len(qs), "model_provider": ai.MODEL_PROVIDER,
                         "model_name": ai.MODEL_NAME, "max_text": MAX_TEXT, "min_answers": tools.MIN_ANSWERS}
        if path == "/api/answers" and method == "GET":
            d = _read_answers((query.get("qid") or [""])[0])
            if not d.get("co_cau_hoi"):
                return 404, {"ok": False, "co_cau_hoi": False, "question_id": d.get("question_id"),
                             "cau_hoi_dang_co": d.get("cau_hoi_dang_co", []),
                             "error": {"code": "not_found", "title": "Không có câu hỏi này"}}
            return 200, dict(d, ok=True)
        if path == "/api/analyze" and method == "POST":
            return handle_analyze(body)
        if path == "/api/stats" and method == "GET":
            return 200, load_stats()
        if path == "/api/import" and method == "POST":
            return handle_import(self.headers.get("Content-Type"), body, query)
        if path == "/api/drafts" and method == "GET":
            qid = tools.normalize_qid((query.get("qid") or [""])[0]) if query.get("qid") else None
            try:
                limit = int((query.get("limit") or ["50"])[0])
            except ValueError:
                raise ApiError(400, "bad_limit", "limit phải là số")
            drafts = web_store.list_drafts(qid, limit)
            return 200, {"ok": True, "drafts": drafts, "count": len(drafts)}
        if path == "/api/drafts" and method == "POST":
            return handle_save_draft(body)
        m = re.fullmatch(r"/api/drafts/(\d{1,12})", path)
        if m and method == "GET":
            d = web_store.get_draft(m.group(1))
            if not d:
                raise ApiError(404, "not_found", "Không có bản nháp này")
            return 200, {"ok": True, "draft": d}
        if m and method == "DELETE":
            if not web_store.delete_draft(m.group(1)):
                raise ApiError(404, "not_found", "Không có bản nháp này")
            return 200, {"ok": True, "deleted": int(m.group(1))}
        known = ("/api/health", "/api/questions", "/api/answers", "/api/analyze", "/api/stats", "/api/import", "/api/drafts")
        if path in known or m:
            raise ApiError(405, "method", "Phương thức không hỗ trợ cho %s" % path)
        raise ApiError(404, "not_found", "Không có endpoint %s" % path)

    # ---- tĩnh: SPA (frontend/dist) hoặc trang cũ
    def _static(self, path):
        if path == "/favicon.ico" and not _dist_ready():
            return self._send(204, b"", "image/x-icon")
        if path in ("/legacy", "/legacy/") or (not _dist_ready() and path in ("/", "/index.html")):
            return self._legacy()
        if not _dist_ready():
            return self._json(404, {"ok": False, "error": {"code": "not_found", "title": "Không có đường dẫn này"}})
        rel = unquote(path).lstrip("/")
        base = os.path.realpath(FRONTEND_DIST)
        full = os.path.realpath(os.path.join(base, rel)) if rel else os.path.join(base, "index.html")
        if not (full == base or full.startswith(base + os.sep)):
            return self._json(404, {"ok": False, "error": {"code": "not_found", "title": "Không có đường dẫn này"}})
        if os.path.isfile(full):
            ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
            if ctype.startswith("text/") or ctype in ("application/javascript", "application/json", "image/svg+xml"):
                ctype += "; charset=utf-8"
            cache = "public, max-age=31536000, immutable" if "/assets/" in full.replace(os.sep, "/") else "no-cache"
            with open(full, "rb") as f:
                return self._send(200, f.read(), ctype, cache=cache)
        if os.path.splitext(rel)[1]:                       # đường dẫn có đuôi file mà không có → 404 thật
            return self._json(404, {"ok": False, "error": {"code": "not_found", "title": "Không có file này"}})
        with open(os.path.join(base, "index.html"), "rb") as f:   # SPA routing: /dashboard, /drafts/3…
            return self._send(200, f.read(), "text/html; charset=utf-8", cache="no-cache")

    def _legacy(self):
        try:
            with open(LEGACY_PATH, encoding="utf-8") as f:
                page = f.read()
        except OSError:
            return self._json(500, {"ok": False, "error": {"code": "no_page", "title": "Thiếu codebase/web_static/legacy.html"}})
        return self._send(200, page, "text/html; charset=utf-8", csp=CSP_LEGACY)

    # ---- phương thức
    def do_OPTIONS(self):
        origin = (self.headers.get("Origin") or "").rstrip("/")
        try:
            self.send_response(204 if origin in CORS_ORIGINS else 403)
            if origin in CORS_ORIGINS and self.path.startswith("/api/"):
                self.send_header("Access-Control-Allow-Origin", origin)
                self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type")
                self.send_header("Access-Control-Max-Age", "600")
                self.send_header("Vary", "Origin")
            self.send_header("Content-Length", "0")
            self.end_headers()
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self):
        self._route("GET")

    def do_HEAD(self):
        self._route("HEAD")

    def do_POST(self):
        self._route("POST")

    def do_DELETE(self):
        self._route("DELETE")

    def do_PUT(self):
        self._route("PUT")


def make_server(port, host="127.0.0.1"):
    web_store.init()
    httpd = ThreadingHTTPServer((host, port), Handler)
    httpd.daemon_threads = True
    return httpd


def main():
    try:
        env_port = int(os.environ.get("PORT") or 8000)
    except ValueError:
        print("PORT không hợp lệ: %r" % os.environ.get("PORT"))
        return 1
    ap = argparse.ArgumentParser(description="Backend web cho TA. Cấu hình qua biến môi trường HOST, PORT, APP_PASSWORD (xem .env.example).")
    ap.add_argument("--host", default=os.environ.get("HOST") or "127.0.0.1", help="địa chỉ nghe (mặc định $HOST hoặc 127.0.0.1)")
    ap.add_argument("--port", type=int, default=env_port, help="cổng (mặc định $PORT hoặc 8000)")
    args = ap.parse_args()
    problem = public_bind_problem(args.host, APP_PASSWORD, os.environ.get("ALLOW_NO_AUTH") == "1")
    if problem:
        print(problem, flush=True)
        return 2
    try:
        httpd = make_server(args.port, args.host)
    except web_store.sqlite3.Error as e:
        print("Không mở được kho dữ liệu %s (%s).\n  → Kiểm tra thư mục WEB_RUNTIME_DIR ghi được. Trên Railway có volume: đặt "
              "RAILWAY_RUN_UID=0; nơi khác: chown thư mục cho uid 10001." % (web_store.DB_PATH, e))
        return 1
    except PermissionError as e:
        print("Không ghi được thư mục dữ liệu %s (%s).\n  → Volume phải ghi được bởi uid 10001 (hoặc đặt RAILWAY_RUN_UID=0 trên Railway)."
              % (web_store.RUNTIME_DIR, e))
        return 1
    except OSError as e:
        print("Không mở được %s:%d (%s). Thử cổng khác: --port 8001" % (args.host, args.port, e))
        return 1
    # docker stop / Railway / Render gửi SIGTERM → tắt êm như Ctrl+C
    import signal

    def _term(*_):
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, _term)

    model = "model giả (fake) — chưa gọi AI thật" if ai.MODEL_PROVIDER == "fake" else "%s · %s" % (ai.MODEL_PROVIDER, ai.MODEL_NAME)
    ui = "frontend/dist" if _dist_ready() else "trang cũ (chưa có frontend/dist)"
    shown = "127.0.0.1" if args.host in ("0.0.0.0", "::") else args.host
    print("Web cho TA: http://%s:%d   (nghe %s · %s · giao diện: %s)" % (shown, args.port, args.host, model, ui))
    print("Đăng nhập: %s" % ("bật (APP_USER=%s)" % APP_USER if APP_PASSWORD else "tắt" + ("" if is_loopback(args.host) else " — ALLOW_NO_AUTH=1, MỞ CÔNG KHAI")))
    print("API: /api/health · /api/questions · /api/analyze · /api/stats · /api/import · /api/drafts")
    print("Dữ liệu import + bản nháp: %s" % web_store.DB_PATH)
    print("Dừng: Ctrl+C", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Đang tắt…", flush=True)
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
