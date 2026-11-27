"""Công cụ của bài toán — NHÓM VIẾT. Khớp bảng công cụ ở spec.md §4.

Hai công cụ, đều chỉ ĐỌC / KIỂM, không có công cụ nào tác động ra ngoài:
    class_stats(day)            đọc số đã tổng hợp của một ngày học, áp ngưỡng (code, không phải AI)
    check_report(report, day)   kiểm bản nháp: số x/N, mã ý kiến thức, mã học viên, dòng "Nháp" (code, không phải AI)

Số liệu nằm ở data/class_stats.json (dựng bằng data/build_class_stats.py, không có mã học viên).
Quy tắc đếm / ngưỡng: spec.md §4 — <5 học viên làm bài ôn → `du_lieu_it`; chỉ xét ý kiến thức có ≥10 lượt.
"""
import json
import os
import re
import unicodedata

from tracing import tool, TOOLS  # noqa: F401  (TOOLS: danh sách công cụ đã đăng ký)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATS_PATH = os.path.join(ROOT, "data", "class_stats.json")

MIN_STUDENTS = 5    # ngày có <5 học viên làm bài ôn → không báo cáo theo ý kiến thức
MIN_TURNS = 10      # chỉ xét ý kiến thức có ≥10 lượt trả lời

_PAIR = re.compile(r"(?<![\d/])(\d{1,4})/(\d{1,4})(?![\d/])")
_CODE = re.compile(r"\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b")
_STUDENT = re.compile(r"\bL\d{4}\b", re.I)
_PERCENT = re.compile(r"(\d+(?:[.,]\d+)?)\s*%")

_cache = {}


def _stats():
    if "data" not in _cache:
        with open(STATS_PATH, encoding="utf-8") as f:
            _cache["data"] = json.load(f)
    return _cache["data"]


def normalize_day(day):
    """'Day05' / 'day5' / '5' → 'Day05'. Không hiểu thì trả None."""
    m = re.search(r"(\d{1,2})\s*$", str(day or "").strip())
    return "Day%02d" % int(m.group(1)) if m else None


def available_days():
    return sorted(_stats()["ngay"].keys())


def _rank_key(item):
    # tỉ lệ sai giảm dần; hoà thì nhiều lượt sai hơn, rồi nhiều lượt hơn, rồi theo mã (kết quả luôn như nhau)
    return (-item["so_sai"] / item["so_luot"], -item["so_sai"], -item["so_luot"], item["ma_y"])


def _day_view(day):
    """Số của một ngày sau khi áp ngưỡng. Dùng chung cho class_stats và check_report."""
    d = _stats()["ngay"].get(normalize_day(day))
    if d is None:
        return None
    b = d["bai_on"]
    few = b["so_hoc_vien"] < MIN_STUDENTS
    ideas = [{"ma_y": k, "so_luot": v["so_luot"], "so_sai": v["so_sai"]}
             for k, v in b["theo_kc"].items() if v["so_luot"] >= MIN_TURNS]
    ideas.sort(key=_rank_key)
    for i in ideas:
        i["ti_le_sai"] = round(i["so_sai"] / i["so_luot"], 3)
    v = d["cau_hoi_video"]
    return {"so_hoc_vien": b["so_hoc_vien"], "so_luot": b["so_luot"], "so_sai": b["so_sai"],
            "du_lieu_it": few, "ideas": [] if few else ideas,
            "so_y_duoi_nguong": 0 if few else sum(1 for x in b["theo_kc"].values() if x["so_luot"] < MIN_TURNS),
            "video": v, "all_codes": set(b["theo_kc"])}


@tool
def class_stats(day: str) -> dict:
    """class_stats — công cụ tra số liệu lớp đã tổng hợp.
    Input: ngày học (str, vd "Day05"). Output: dict gồm co_du_lieu (bool); nếu có: so_hoc_vien làm bài ôn,
    so_luot / so_sai lần trả lời đầu, du_lieu_it (True khi <5 học viên), y_kien_thuc = các ý ≥10 lượt xếp theo
    tỉ lệ sai giảm dần [{ma_y, so_luot, so_sai, ti_le_sai}] (rỗng khi du_lieu_it), so_y_duoi_nguong,
    cau_hoi_video {so_cau, so_cau_khong_bam_bai, so_cau_da_cham, so_cau_ngan}. Không có mã học viên.
    Không tác động ra ngoài (chỉ đọc data/class_stats.json)."""
    name = normalize_day(day)
    view = _day_view(day)
    if view is None:
        return {"co_du_lieu": False, "day": name, "ngay_co_du_lieu": available_days()}
    v = view["video"]
    return {"co_du_lieu": True, "day": name, "so_hoc_vien": view["so_hoc_vien"], "so_luot": view["so_luot"],
            "so_sai": view["so_sai"], "du_lieu_it": view["du_lieu_it"], "y_kien_thuc": view["ideas"],
            "so_y_duoi_nguong": view["so_y_duoi_nguong"],
            "cau_hoi_video": {"so_cau": v["so_cau"], "so_cau_khong_bam_bai": v["so_cau_khong_bam_bai"],
                              "so_cau_da_cham": v["so_cau_da_cham"], "so_cau_ngan": v["so_cau_ngan_le_20_ky_tu"]}}


def _allowed(view):
    """Các cặp (x, N) được phép xuất hiện, theo từng mã ý + cặp chung."""
    if view is None or view["du_lieu_it"]:
        return {}, set()
    per_code = {i["ma_y"]: (i["so_sai"], i["so_luot"]) for i in view["ideas"]}
    general = {(view["so_sai"], view["so_luot"])}
    v = view["video"]
    if v["so_cau_da_cham"]:
        general.add((v["so_cau_khong_bam_bai"], v["so_cau_da_cham"]))
    return per_code, general


def lint_line(day, line):
    """Lỗi của MỘT dòng (không tính dòng 'Nháp'). Trả danh sách chuỗi; rỗng = dòng đạt.
    Không phải @tool: agent gọi từng dòng để bỏ riêng điểm sai mà không làm rối trace."""
    view = _day_view(day)
    per_code, general = _allowed(view)
    errs = []
    if _STUDENT.search(line):
        errs.append("có mẫu mã học viên (L + 4 số)")
    codes = [c for c in _CODE.findall(line)]
    for c in codes:
        if view is None or c not in view["all_codes"]:
            errs.append("mã ý kiến thức %s không có trong class_stats %s" % (c, normalize_day(day)))
        elif c not in per_code:
            errs.append("ý %s có <%d lượt (hoặc ngày <%d học viên), không được nêu" % (c, MIN_TURNS, MIN_STUDENTS))
    known = [c for c in codes if c in per_code]
    # số x/N phải có trong class_stats; dòng nêu ý nào thì số phải đúng của ý đó
    allowed_here = {per_code[c] for c in known} if known else (general | set(per_code.values()))
    for a, b in _PAIR.findall(line):
        if (int(a), int(b)) not in allowed_here:
            errs.append("số %s/%s không khớp class_stats %s" % (a, b, normalize_day(day)))
    # phần trăm (nếu có) phải ứng với một cặp được phép
    ok_pct = {round(100 * x / n) for x, n in (general | set(per_code.values())) if n}
    for p in _PERCENT.findall(line):
        val = float(p.replace(",", "."))
        if not any(abs(val - q) <= 1 for q in ok_pct):
            errs.append("phần trăm %s%% không ứng với số nào trong class_stats %s" % (p, normalize_day(day)))
    return errs


def _has_draft_line(report):
    text = unicodedata.normalize("NFC", report).lower()
    return "nháp" in text


@tool
def check_report(report: str, day: str) -> list:
    """check_report — kiểm bản nháp báo cáo bằng code (không phải AI).
    Input: bản nháp (str) + ngày học (str, vd "Day05"). Output: danh sách lỗi (list[str]), rỗng = đạt. Lỗi gồm:
    số x/N hoặc phần trăm không có trong class_stats của ngày đó, mã ý kiến thức không có / <10 lượt,
    nêu số theo ý kiến thức khi ngày <5 học viên, có mẫu mã học viên (L + 4 số), thiếu dòng "Nháp".
    Không tác động ra ngoài."""
    errors = []
    for n, line in enumerate(str(report).splitlines(), 1):
        for e in lint_line(day, line):
            errors.append("dòng %d: %s" % (n, e))
    if not _has_draft_line(str(report)):
        errors.append("thiếu dòng \"Nháp\"")
    return errors
