"""Lưu trữ cục bộ cho web: câu hỏi TA import + lịch sử bản nháp. Chỉ thư viện chuẩn (sqlite3, csv, json).

- Dữ liệu nằm ở data/runtime/app.db (đổi bằng biến môi trường WEB_RUNTIME_DIR). Thư mục này bị .gitignore:
  câu trả lời TA import là dữ liệu lớp thật, KHÔNG commit.
- KHÔNG sửa data/open_answers.json, agent.py, tools.py. Câu hỏi import được ghép vào bộ nhớ đệm dữ liệu của
  tools (tools._cache) trong process web theo kiểu copy-on-write, nên get_answers / check_report / extract_qid
  chạy y nguyên. run.py, eval, simulate chạy process khác nên không thấy dữ liệu import.
- Mã câu hỏi import bắt đầu từ Q101 để không đụng mã gốc (Q01…Q99).
- Riêng tư: chỉ giữ chữ câu trả lời; bỏ mọi cột khác (họ tên, email…); ẩn email, số điện thoại, mã học viên L+4 số.
"""
import contextlib
import csv
import io
import json
import os
import re
import sqlite3
import threading
import time
import unicodedata

import tools

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUNTIME_DIR = os.environ.get("WEB_RUNTIME_DIR") or os.path.join(ROOT, "data", "runtime")
DB_PATH = os.path.join(RUNTIME_DIR, "app.db")

IMPORT_QID_START = 101
IMPORT_QID_MAX = 999
MAX_IMPORT_BYTES = 2 * 1024 * 1024
MAX_QUESTIONS_PER_FILE = 20
MAX_ANSWERS = 300
MAX_ANSWER_CHARS = 2000
MAX_QUESTION_CHARS = 500
MAX_DRAFT_CHARS = 50000
MAX_DRAFT_GROUPS_BYTES = 200 * 1024

_WRITE_LOCK = threading.Lock()


class ImportError_(ValueError):
    """Lỗi định dạng file import — thông điệp tiếng Việt, trả thẳng cho TA."""


# ---------------------------------------------------------------- SQLite

@contextlib.contextmanager
def _connect():
    """Mỗi thao tác một kết nối: commit khi xong, rollback khi lỗi, luôn đóng."""
    os.makedirs(RUNTIME_DIR, exist_ok=True)
    con = sqlite3.connect(DB_PATH, timeout=10)
    try:
        con.row_factory = sqlite3.Row
        con.execute("PRAGMA busy_timeout=10000")
        yield con
        con.commit()
    except BaseException:
        con.rollback()
        raise
    finally:
        con.close()


def init():
    # WAL đặt MỘT lần (lưu trong file DB); lệnh này cần khoá độc quyền nên thử lại nếu process khác đang mở DB.
    for attempt in range(20):
        try:
            with _connect() as con:
                con.execute("PRAGMA journal_mode=WAL")
            break
        except sqlite3.OperationalError:
            if attempt == 19:
                raise
            time.sleep(0.1 * (attempt + 1))
    with _connect() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS imports (
            qid TEXT PRIMARY KEY, cau_hoi TEXT NOT NULL, kc_code TEXT, answers_json TEXT NOT NULL,
            filename TEXT, created_at REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS drafts (
            id INTEGER PRIMARY KEY AUTOINCREMENT, qid TEXT NOT NULL, title TEXT, text TEXT NOT NULL,
            groups_json TEXT, source TEXT NOT NULL DEFAULT 'ta', created_at REAL NOT NULL);
        CREATE INDEX IF NOT EXISTS drafts_qid ON drafts(qid, created_at DESC);
        """)
    load_imports_into_tools()


# ---------------------------------------------------------------- ghép câu hỏi import vào tools

def _overlay(entries):
    """entries: {qid: {"cau_hoi", "kc_code", "cau_tra_loi": [{"id","text"}]}}. Copy-on-write: dựng dict mới rồi gán
    một lần, để luồng đang đọc dict cũ (vd đang phân tích) không bị đổi giữa chừng. Không ghi đè mã gốc."""
    data = tools._data()
    merged = dict(data["cau_hoi"])
    for qid, q in entries.items():
        if qid in merged and qid not in imported_qids():
            continue
        merged[qid] = q
    new = dict(data)
    new["cau_hoi"] = merged
    tools._cache["d"] = new


_imported = set()


def imported_qids():
    return set(_imported)


def load_imports_into_tools():
    with _connect() as con:
        rows = con.execute("SELECT qid, cau_hoi, kc_code, answers_json FROM imports ORDER BY qid").fetchall()
    entries = {}
    for r in rows:
        answers = json.loads(r["answers_json"])
        entries[r["qid"]] = {"cau_hoi": r["cau_hoi"], "kc_code": r["kc_code"],
                             "cau_tra_loi": [{"id": "A%d" % (i + 1), "text": t} for i, t in enumerate(answers)]}
    _overlay(entries)
    _imported.clear()
    _imported.update(entries)
    return len(entries)


def import_meta():
    with _connect() as con:
        rows = con.execute("SELECT qid, filename, created_at FROM imports").fetchall()
    return {r["qid"]: {"filename": r["filename"], "imported_at": r["created_at"]} for r in rows}


def _next_qids(n):
    taken = set(tools.available_questions())
    out, k = [], IMPORT_QID_START
    while len(out) < n:
        if k > IMPORT_QID_MAX:
            raise ImportError_("Đã hết mã câu hỏi cho dữ liệu import (Q%d–Q%d)." % (IMPORT_QID_START, IMPORT_QID_MAX))
        q = "Q%02d" % k
        if q not in taken:
            out.append(q)
        k += 1
    return out


# ---------------------------------------------------------------- đọc + kiểm file import

_EMAIL = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
_PHONE = re.compile(r"(?<!\d)(?:\+?84|0)(?:[\s.-]?\d){8,10}(?!\d)")
_STUDENT = tools.STUDENT_CODE

TEXT_COLS = ("text", "answer", "cau_tra_loi", "tra_loi", "noi_dung", "response", "cau_tl")
QUESTION_COLS = ("cau_hoi", "question", "de_bai", "cau_hoi_mo")
KC_COLS = ("kc_code", "kc")


def _fold(s):
    s = unicodedata.normalize("NFD", str(s or "")).replace("đ", "d").replace("Đ", "D")
    s = "".join(c for c in s if unicodedata.category(c) != "Mn").lower().strip()
    return re.sub(r"[^a-z0-9]+", "_", s).strip("_")


def _redact(text, counter):
    def sub(pattern, label, t):
        n = len(pattern.findall(t))
        if n:
            counter[label] = counter.get(label, 0) + n
        return pattern.sub("[%s ẩn]" % label, t)
    t = sub(_EMAIL, "email", text)
    t = sub(_STUDENT, "mã học viên", t)
    t = sub(_PHONE, "số điện thoại", t)
    return t


def _clean_answer(raw, counter):
    t = unicodedata.normalize("NFC", str(raw if raw is not None else "")).replace("\r\n", "\n").strip()
    if len(t) > MAX_ANSWER_CHARS:
        raise ImportError_("Có câu trả lời dài hơn %d ký tự." % MAX_ANSWER_CHARS)
    return _redact(t, counter)


def _check_question(q, answers, label):
    q = unicodedata.normalize("NFC", str(q or "")).strip()
    if not q:
        raise ImportError_("%s: thiếu nội dung câu hỏi." % label)
    if len(q) > MAX_QUESTION_CHARS:
        raise ImportError_("%s: câu hỏi dài hơn %d ký tự." % (label, MAX_QUESTION_CHARS))
    if not answers:
        raise ImportError_("%s: không có câu trả lời nào." % label)
    if len(answers) > MAX_ANSWERS:
        raise ImportError_("%s: quá %d câu trả lời." % (label, MAX_ANSWERS))
    return q


def _decode(data):
    if len(data) > MAX_IMPORT_BYTES:
        raise ImportError_("File quá lớn (giới hạn %d MB)." % (MAX_IMPORT_BYTES // (1024 * 1024)))
    if not data.strip():
        raise ImportError_("File rỗng.")
    # UTF-16 CHỈ khi có BOM: thử UTF-16 mù sẽ "giải mã thành công" mọi file có số byte chẵn ra chữ rác
    # (vd CSV Latin-1 / Windows-1258 từ Excel cũ) và báo nhầm "thiếu cột" thay vì "sai bảng mã".
    enc = "utf-16" if data[:2] in (b"\xff\xfe", b"\xfe\xff") else "utf-8-sig"
    try:
        text = data.decode(enc)
    except UnicodeDecodeError:
        raise ImportError_("File không phải UTF-8 (có thể đang là bảng mã Windows / Excel cũ). "
                           "Trong Excel: Lưu thành → \u201CCSV UTF-8 (phân tách bằng dấu phẩy)\u201D rồi thử lại.")
    if "\x00" in text:
        raise ImportError_("File có vẻ là file nhị phân (vd .xlsx đổi đuôi), không phải CSV/JSON dạng chữ.")
    return text


def parse_csv(text, cau_hoi=None, kc_code=None):
    sample = text[:4096]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel
    reader = csv.reader(io.StringIO(text), dialect)
    rows = [r for r in reader if any((c or "").strip() for c in r)]
    if len(rows) < 2:
        raise ImportError_("CSV cần một dòng tiêu đề và ít nhất một dòng câu trả lời.")
    header = [_fold(h) for h in rows[0]]
    find = lambda names: next((i for i, h in enumerate(header) if h in names), None)
    ti, qi, ki = find(TEXT_COLS), find(QUESTION_COLS), find(KC_COLS)
    if ti is None:
        raise ImportError_("CSV thiếu cột câu trả lời. Đặt tên cột là một trong: %s." % ", ".join(TEXT_COLS))
    ignored = [rows[0][i].strip() for i in range(len(header)) if i not in (ti, qi, ki) and rows[0][i].strip()]
    groups, order = {}, []
    for n, r in enumerate(rows[1:], start=2):
        r = r + [""] * (len(header) - len(r))
        q = (r[qi].strip() if qi is not None else "") or (cau_hoi or "").strip()
        if not q:
            raise ImportError_("Dòng %d: thiếu câu hỏi. Thêm cột cau_hoi hoặc điền ô “Câu hỏi” khi import." % n)
        if q not in groups:
            groups[q] = {"cau_hoi": q, "kc_code": (r[ki].strip() if ki is not None else "") or kc_code, "answers": []}
            order.append(q)
        groups[q]["answers"].append(r[ti])
    return [groups[q] for q in order], ignored


def parse_json(text, cau_hoi=None, kc_code=None):
    try:
        obj = json.loads(text)
    except ValueError as e:
        raise ImportError_("JSON không hợp lệ: %s" % e)
    if isinstance(obj, dict) and isinstance(obj.get("cau_hoi"), dict):      # cùng dạng data/open_answers.json
        items = list(obj["cau_hoi"].values())
    elif isinstance(obj, dict) and isinstance(obj.get("questions"), list):
        items = obj["questions"]
    elif isinstance(obj, dict):
        items = [obj]
    elif isinstance(obj, list) and obj and all(isinstance(x, str) for x in obj):
        items = [{"cau_hoi": cau_hoi, "cau_tra_loi": obj}]                  # chỉ là danh sách câu trả lời
    elif isinstance(obj, list):
        items = obj
    else:
        raise ImportError_("JSON phải là object hoặc danh sách.")
    out = []
    for i, it in enumerate(items, 1):
        if not isinstance(it, dict):
            raise ImportError_("Mục %d trong JSON không phải object." % i)
        raw = it.get("cau_tra_loi", it.get("answers"))
        if not isinstance(raw, list):
            raise ImportError_("Mục %d: thiếu danh sách “cau_tra_loi”." % i)
        answers = []
        for a in raw:
            if isinstance(a, dict):
                a = a.get("text", a.get("tra_loi", ""))         # bỏ mọi trường khác (nhan_tay, mã học viên…)
            if not isinstance(a, (str, int, float)) and a is not None:
                raise ImportError_("Mục %d: câu trả lời phải là chữ." % i)
            answers.append(a)
        out.append({"cau_hoi": it.get("cau_hoi", it.get("question")) or cau_hoi,
                    "kc_code": it.get("kc_code") or kc_code, "answers": answers})
    return out, []


def import_file(filename, data, cau_hoi=None, kc_code=None):
    """Kiểm + lưu. Trả (danh sách câu hỏi mới, cảnh báo). Lỗi định dạng → ImportError_."""
    filename = os.path.basename(str(filename or "upload"))[:120]
    text = _decode(data)
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".json" or (ext not in (".csv", ".tsv", ".txt") and text.lstrip()[:1] in "[{"):
        groups, ignored = parse_json(text, cau_hoi, kc_code)
    elif ext in (".csv", ".tsv", ".txt", ""):
        groups, ignored = parse_csv(text, cau_hoi, kc_code)
    else:
        raise ImportError_("Chỉ nhận file .csv hoặc .json.")
    if not groups:
        raise ImportError_("File không có câu hỏi nào.")
    if len(groups) > MAX_QUESTIONS_PER_FILE:
        raise ImportError_("Một file tối đa %d câu hỏi." % MAX_QUESTIONS_PER_FILE)

    redacted, prepared = {}, []
    for i, g in enumerate(groups, 1):
        label = "Câu hỏi %d" % i if len(groups) > 1 else "File"
        answers = [_clean_answer(a, redacted) for a in g["answers"]]
        q = _check_question(g["cau_hoi"], answers, label)
        kc = (str(g["kc_code"]).strip()[:80] or None) if g.get("kc_code") else None
        prepared.append((q, kc, answers))

    warnings = []
    if ignored:
        warnings.append({"code": "ignored_columns", "message": "Đã bỏ các cột không dùng (không lưu): %s." % ", ".join(ignored)})
    if redacted:
        warnings.append({"code": "redacted", "message": "Đã ẩn thông tin cá nhân trong câu trả lời: %s."
                         % ", ".join("%d %s" % (n, k) for k, n in redacted.items())})

    now = time.time()
    created = []
    with _WRITE_LOCK:
        qids = _next_qids(len(prepared))
        with _connect() as con:
            for qid, (q, kc, answers) in zip(qids, prepared):
                con.execute("INSERT INTO imports(qid, cau_hoi, kc_code, answers_json, filename, created_at) VALUES (?,?,?,?,?,?)",
                            (qid, q, kc, json.dumps(answers, ensure_ascii=False), filename, now))
        load_imports_into_tools()
    for qid, (q, kc, answers) in zip(qids, prepared):
        blank = sum(1 for a in answers if not a)
        item = {"qid": qid, "cau_hoi": q, "kc_code": kc, "so_cau_tra_loi": len(answers), "so_bo_trong": blank,
                "analyze_text": "[%s] Phân tích câu trả lời của lớp" % qid}
        if len(answers) < tools.MIN_ANSWERS:
            warnings.append({"code": "too_few_answers", "qid": qid,
                             "message": "%s chỉ có %d câu trả lời (<%d): hệ thống sẽ không phân nhóm câu này."
                                        % (qid, len(answers), tools.MIN_ANSWERS)})
        created.append(item)
    return created, warnings


# ---------------------------------------------------------------- bản nháp

def _draft_row(r, full):
    d = {"id": r["id"], "qid": r["qid"], "title": r["title"], "source": r["source"], "created_at": r["created_at"],
         "chars": len(r["text"])}
    if full:
        d["text"] = r["text"]
        d["groups"] = json.loads(r["groups_json"]) if r["groups_json"] else None
    else:
        d["preview"] = r["text"][:200]
    return d


def save_draft(qid, text, title=None, groups=None, source="ta"):
    groups_json = json.dumps(groups, ensure_ascii=False) if groups is not None else None
    if groups_json and len(groups_json.encode("utf-8")) > MAX_DRAFT_GROUPS_BYTES:
        raise ValueError("Trường groups quá lớn.")
    with _WRITE_LOCK, _connect() as con:
        cur = con.execute("INSERT INTO drafts(qid, title, text, groups_json, source, created_at) VALUES (?,?,?,?,?,?)",
                          (qid, title, text, groups_json, source, time.time()))
        row = con.execute("SELECT * FROM drafts WHERE id = ?", (cur.lastrowid,)).fetchone()
    return _draft_row(row, full=False)


def list_drafts(qid=None, limit=50):
    limit = max(1, min(int(limit), 200))
    with _connect() as con:
        if qid:
            rows = con.execute("SELECT * FROM drafts WHERE qid = ? ORDER BY created_at DESC, id DESC LIMIT ?", (qid, limit)).fetchall()
        else:
            rows = con.execute("SELECT * FROM drafts ORDER BY created_at DESC, id DESC LIMIT ?", (limit,)).fetchall()
    return [_draft_row(r, full=False) for r in rows]


def get_draft(draft_id):
    with _connect() as con:
        r = con.execute("SELECT * FROM drafts WHERE id = ?", (int(draft_id),)).fetchone()
    return _draft_row(r, full=True) if r else None


def delete_draft(draft_id):
    with _WRITE_LOCK, _connect() as con:
        return con.execute("DELETE FROM drafts WHERE id = ?", (int(draft_id),)).rowcount > 0


def count_drafts():
    with _connect() as con:
        return con.execute("SELECT COUNT(*) FROM drafts").fetchone()[0]
