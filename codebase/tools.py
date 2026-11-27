"""Công cụ của bài toán — NHÓM VIẾT. Khớp bảng công cụ ở spec.md §4.

Hai công cụ, đều chỉ ĐỌC / KIỂM, không có công cụ nào tác động ra ngoài:
    get_answers(question_id)             đọc câu hỏi mở + câu trả lời của lớp, BỎ nhãn tay
    check_report(report, question_id)    kiểm bản nháp bằng code (không phải AI)

Dữ liệu: data/open_answers.json (không có mã học viên; câu trả lời chỉ có id A1, A2…).
"""
import json
import os
import re
import unicodedata

from tracing import tool, TOOLS  # noqa: F401  (TOOLS: danh sách công cụ đã đăng ký)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT, "data", "open_answers.json")

MIN_ANSWERS = 5   # <5 câu trả lời → không phân nhóm (quá ít để kết luận, dễ lộ ai viết gì)

STUDENT_CODE = re.compile(r"\bL\d{4}\b")
# dòng nhóm: "... — 3/8 (A1, A2, A6)"
GROUP_LINE = re.compile(r"(\d+)\s*/\s*(\d+)\s*\(\s*(A\d+(?:\s*,\s*A\d+)*)\s*\)")
ANY_PAIR = re.compile(r"(?<![\d/])(\d+)\s*/\s*(\d+)(?![\d/])")
QUOTE = re.compile(r"\"([^\"\n]+)\"|“([^”\n]+)”")

_cache = {}


def _data():
    if "d" not in _cache:
        with open(DATA_PATH, encoding="utf-8") as f:
            _cache["d"] = json.load(f)
    return _cache["d"]


def norm(s):
    """Chuẩn hoá để so nguyên văn: NFC, gộp khoảng trắng, bỏ khoảng trắng hai đầu (metric_spec: 'Nguyên văn')."""
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", str(s))).strip()


def normalize_qid(qid):
    m = re.fullmatch(r"\s*[Qq]\s*0*(\d{1,3})\s*", str(qid or ""))
    return "Q%02d" % int(m.group(1)) if m else None


def available_questions():
    return sorted(_data()["cau_hoi"].keys())


@tool
def get_answers(question_id: str) -> dict:
    """get_answers — đọc câu trả lời mở của lớp cho một câu hỏi.
    Input: mã câu hỏi (str, vd "Q01").
    Output: dict {co_cau_hoi (bool), question_id, cau_hoi, kc_code, so_cau_tra_loi,
    cau_tra_loi: [{id, text}]}; không có câu hỏi thì co_cau_hoi=False kèm danh sách mã đang có.
    KHÔNG trả nhãn tay (nhan_tay, nhom_nhan_tay) và không có mã học viên.
    Không tác động ra ngoài (chỉ đọc data/open_answers.json)."""
    qid = normalize_qid(question_id)
    q = _data()["cau_hoi"].get(qid)
    if q is None:
        return {"co_cau_hoi": False, "question_id": qid, "cau_hoi_dang_co": available_questions()}
    answers = [{"id": a["id"], "text": a["text"]} for a in q["cau_tra_loi"]]
    return {"co_cau_hoi": True, "question_id": qid, "cau_hoi": q["cau_hoi"], "kc_code": q.get("kc_code"),
            "so_cau_tra_loi": len(answers), "cau_tra_loi": answers}


def _raw_answers(qid):
    q = _data()["cau_hoi"].get(normalize_qid(qid))
    return {a["id"]: a["text"] for a in q["cau_tra_loi"]} if q else {}


@tool
def check_report(report: str, question_id: str) -> list:
    """check_report — kiểm bản nháp báo cáo bằng code (không phải AI).
    Input: bản nháp (str) + mã câu hỏi (str, vd "Q01").
    Output: danh sách lỗi (list[str]), rỗng = đạt. Kiểm: (1) mọi câu trích trong ngoặc kép có nguyên văn trong
    một câu trả lời của câu hỏi đó; (2) mọi id A.. có thật; (3) nếu là báo cáo (có dòng nhóm "x/N (A..)") thì mỗi
    id đúng 1 nhóm, không thiếu id nào; (4) x = số id của nhóm, N = tổng số câu trả lời; (5) không có mẫu mã học
    viên L + 4 số; báo cáo phải có chữ "Nháp".
    Không tác động ra ngoài."""
    text = str(report)
    answers = _raw_answers(question_id)
    errors = []
    if STUDENT_CODE.search(text):
        errors.append("có mẫu mã học viên (L + 4 số)")

    q = _data()["cau_hoi"].get(normalize_qid(question_id))
    q_text = norm(q["cau_hoi"]) if q else ""
    sources = [norm(t) for t in answers.values()]
    for m in QUOTE.finditer(text):
        quote = norm(m.group(1) or m.group(2))
        if quote and quote not in q_text and not any(quote in s for s in sources):
            errors.append("câu trích không có nguyên văn trong dữ liệu: \"%s\"" % quote[:60])

    for aid in set(re.findall(r"\bA\d+\b", text)):
        if aid not in answers:
            errors.append("id %s không có trong câu hỏi %s" % (aid, normalize_qid(question_id)))

    groups = GROUP_LINE.findall(text)
    if groups:
        total = len(answers)
        seen = {}
        for x, n, ids in groups:
            idlist = [i.strip() for i in ids.split(",")]
            if int(x) != len(idlist):
                errors.append("nhóm ghi %s/%s nhưng có %d id" % (x, n, len(idlist)))
            if int(n) != total:
                errors.append("mẫu số %s khác tổng số câu trả lời %d" % (n, total))
            for i in idlist:
                seen[i] = seen.get(i, 0) + 1
        dup = sorted(i for i, c in seen.items() if c > 1)
        missing = sorted(set(answers) - set(seen), key=lambda s: int(s[1:]))
        if dup:
            errors.append("id nằm ở hơn 1 nhóm: %s" % ", ".join(dup))
        if missing:
            errors.append("id chưa xếp nhóm: %s" % ", ".join(missing))
        if "nháp" not in unicodedata.normalize("NFC", text).lower():
            errors.append("thiếu dòng \"Nháp\"")
    return errors
