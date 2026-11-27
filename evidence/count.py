"""Script đếm bằng chứng từ data/preclass/ (chat.csv và answers.csv).

Chạy:
    python evidence/count.py --data-dir data-btc/preclass

Chỉ dùng thư viện chuẩn của Python. Người khác chạy lại trên cùng thư mục
data/preclass/ của BTC sẽ ra cùng kết quả.
"""
import argparse
from collections import Counter
import csv
import os
import statistics
import sys

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CANDIDATES = [
    os.path.join(ROOT, "data-btc", "preclass"),
    os.path.join(os.path.dirname(ROOT), "data-btc", "preclass"),
    os.path.join(os.path.dirname(ROOT), "data", "preclass"),
]
PREFERRED_JOIN_KEYS = [
    "chat_id",
    "question_id",
    "message_id",
    "msg_id",
    "turn_id",
    "row_id",
    "id",
]
TEXT_COL_CANDIDATES = [
    "question",
    "cau_hoi",
    "content",
    "noi_dung",
    "text",
    "message",
    "prompt",
    "query",
]
PII_COL_KEYWORDS = ("user", "email", "name", "ten", "sdt", "phone", "hoc_vien", "student")


def find_data_dir(explicit_dir: str | None) -> str | None:
    if explicit_dir:
        return os.path.abspath(explicit_dir)
    for cand in DEFAULT_CANDIDATES:
        if os.path.isfile(os.path.join(cand, "chat.csv")) and os.path.isfile(os.path.join(cand, "answers.csv")):
            return cand
    return None


def read_csv_rows(path: str) -> tuple[list[str], list[dict[str, str]]]:
    with open(path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
        rows = list(reader)
    return fields, rows


def detect_join_key(chat_fields: list[str], ans_fields: list[str], explicit_key: str | None) -> str | None:
    if explicit_key:
        if explicit_key in chat_fields and explicit_key in ans_fields:
            return explicit_key
        return None
    common = [c for c in chat_fields if c in ans_fields]
    for pref in PREFERRED_JOIN_KEYS:
        if pref in common:
            return pref
    return common[0] if common else None


def detect_text_col(fields: list[str]) -> str | None:
    lower_map = {f.lower(): f for f in fields}
    for cand in TEXT_COL_CANDIDATES:
        if cand in lower_map:
            return lower_map[cand]
    return None


def parse_length(row: dict[str, str], text_col: str | None) -> int | None:
    raw_len = (row.get("do_dai_cau_hoi") or "").strip()
    if raw_len:
        try:
            return int(float(raw_len))
        except ValueError:
            pass
    if text_col and row.get(text_col) is not None:
        return len(row[text_col].strip())
    return None


def redact_row(row: dict[str, str]) -> dict[str, str]:
    out = {}
    for k, v in row.items():
        if any(p in k.lower() for p in PII_COL_KEYWORDS):
            out[k] = "<da_an_danh>" if v else ""
        else:
            val = (v or "").replace("\r", " ").replace("\n", " ")
            out[k] = val[:80] + ("..." if len(val) > 80 else "")
    return out


def pct(x: int, n: int) -> str:
    return f"{(100.0 * x / n):.1f}%" if n else "N/A"


def summarize_rubric(values: list[str]) -> dict:
    counts = Counter(values)
    nums = []
    for v in values:
        try:
            nums.append(float(v))
        except ValueError:
            pass
    summary = {"n": len(values), "counts": counts}
    if len(nums) == len(values) and nums:
        summary["mean"] = statistics.mean(nums)
        summary["median"] = statistics.median(nums)
        summary["le_1"] = sum(1 for x in nums if x <= 1.0)
        summary["eq_0"] = sum(1 for x in nums if x == 0.0)
    return summary


def print_rubric_summary(label: str, values: list[str]) -> None:
    if not values:
        print(f"  - {label}: n = 0 (không có bản ghi hợp lệ)")
        return
    s = summarize_rubric(values)
    dist = ", ".join(f"{k}: {v}/{s['n']} ({pct(v, s['n'])})" for k, v in sorted(s["counts"].items()))
    print(f"  - {label}: n = {s['n']} | phân bố: {dist}")
    if "mean" in s:
        print(
            f"      mean = {s['mean']:.3f}, median = {s['median']:.3f} | "
            f"<=1: {s['le_1']}/{s['n']} ({pct(s['le_1'], s['n'])}) | "
            f"==0: {s['eq_0']}/{s['n']} ({pct(s['eq_0'], s['n'])})"
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Đếm bằng chứng từ data/preclass/ (chat.csv, answers.csv)")
    parser.add_argument("--data-dir", help="Thư mục chứa chat.csv và answers.csv (mặc định tìm ở data-btc/preclass)")
    parser.add_argument("--join-key", help="Tên cột khóa để nối chat.csv với answers.csv")
    parser.add_argument("--short-max", type=int, default=20, help="Ngưỡng ký tự coi là câu hỏi ngắn (mặc định 20)")
    parser.add_argument("--examples", type=int, default=10, help="Số ví dụ câu ngắn in ra (mặc định 10)")
    args = parser.parse_args()

    data_dir = find_data_dir(args.data_dir)
    if not data_dir:
        print(
            "Chưa tìm thấy chat.csv và answers.csv.\n"
            "Hãy copy thư mục preclass/ từ bộ đề BTC vào: data-btc/preclass/ (đã có trong .gitignore)\n"
            "hoặc truyền đường dẫn qua: python evidence/count.py --data-dir <duong-dan-toi-preclass>",
            file=sys.stderr,
        )
        return 1

    chat_path = os.path.join(data_dir, "chat.csv")
    ans_path = os.path.join(data_dir, "answers.csv")
    if not os.path.isfile(chat_path) or not os.path.isfile(ans_path):
        print(f"Thiếu chat.csv hoặc answers.csv trong thư mục: {data_dir}", file=sys.stderr)
        return 1

    chat_fields, chat_rows = read_csv_rows(chat_path)
    ans_fields, ans_rows = read_csv_rows(ans_path)
    text_col = detect_text_col(chat_fields)
    join_key = detect_join_key(chat_fields, ans_fields, args.join_key)

    print("=== 1. KIỂM TRA CẤU TRÚC (cho evidence/data-mining.md Mục 2) ===")
    print(f"Thư mục data: {data_dir}")
    print(f"chat.csv: {len(chat_rows)} dòng | cột: {', '.join(chat_fields)}")
    print(f"answers.csv: {len(ans_rows)} dòng | cột: {', '.join(ans_fields)}")
    print(f"Cột nội dung câu hỏi phát hiện: {text_col or '(không tìm thấy)'}")
    print(f"Cột khóa nối phát hiện: {join_key or '(không tìm thấy)'}")

    if "channel" in chat_fields:
        ch_counts = Counter((r.get("channel") or "(trống)").strip() for r in chat_rows)
        print("Phân bố channel trong chat.csv:", dict(ch_counts))

    print("\n5 dòng mẫu đầu tiên của chat.csv (đã ẩn danh cột nhận dạng):")
    for idx, row in enumerate(chat_rows[:5], start=1):
        print(f"  [{idx}] {redact_row(row)}")

    print("\n=== 2. ĐẾM CÂU HỎI NGẮN DƯỚI VIDEO (cho Mục 3) ===")
    if "channel" in chat_fields:
        vq_rows = [(i + 2, r) for i, r in enumerate(chat_rows) if (r.get("channel") or "").strip().lower() == "video_question"]
    else:
        vq_rows = [(i + 2, r) for i, r in enumerate(chat_rows)]

    n_vq = len(vq_rows)
    print(f"Số dòng channel=video_question: {n_vq}/{len(chat_rows)} ({pct(n_vq, len(chat_rows))})")

    short_rows = []
    ultra_short_rows = []
    long_rows = []
    missing_len = 0

    for lineno, r in vq_rows:
        qlen = parse_length(r, text_col)
        if qlen is None:
            missing_len += 1
            continue
        if qlen <= args.short_max:
            short_rows.append((lineno, r, qlen))
        else:
            long_rows.append((lineno, r, qlen))
        if qlen <= 10:
            ultra_short_rows.append((lineno, r, qlen))

    valid_n = len(short_rows) + len(long_rows)
    print(f"Mẫu số hợp lệ có độ dài (video_question): {valid_n} (thiếu độ dài: {missing_len})")
    print(f"Câu ngắn (<= {args.short_max} ký tự): {len(short_rows)}/{valid_n} ({pct(len(short_rows), valid_n)})")
    print(f"Câu siêu ngắn (<= 10 ký tự): {len(ultra_short_rows)}/{valid_n} ({pct(len(ultra_short_rows), valid_n)})")

    print("\n=== 3. SO SÁNH rubric_bam_bai CÂU NGẮN VS CÂU DÀI (cho Mục 3) ===")
    ans_by_key: dict[str, dict[str, str]] = {}
    if join_key and "rubric_bam_bai" in ans_fields:
        for r in ans_rows:
            k = (r.get(join_key) or "").strip()
            if k and k not in ans_by_key:
                ans_by_key[k] = r

        short_scores, long_scores = [], []
        matched = 0
        for _, r, qlen in short_rows + long_rows:
            k = (r.get(join_key) or "").strip()
            ar = ans_by_key.get(k)
            if not ar:
                continue
            matched += 1
            score = (ar.get("rubric_bam_bai") or "").strip()
            if not score:
                continue
            if qlen <= args.short_max:
                short_scores.append(score)
            else:
                long_scores.append(score)

        print(f"Số dòng video_question khớp được trong answers.csv theo '{join_key}': {matched}/{valid_n} ({pct(matched, valid_n)})")
        print_rubric_summary(f"Nhóm câu ngắn (<= {args.short_max} ký tự)", short_scores)
        print_rubric_summary(f"Nhóm câu dài (> {args.short_max} ký tự)", long_scores)
    else:
        print("Không thể tự nối để tính rubric_bam_bai (thiếu cột khóa chung hoặc thiếu cột rubric_bam_bai trong answers.csv).")
        print("Hãy chỉ định rõ cột khóa bằng: --join-key <ten_cot>")

    print(f"\n=== 4. {args.examples} VÍ DỤ CÂU NGẮN ẨN DANH (cho Mục 4 & benchmark source=data_that) ===")
    for idx, (lineno, r, qlen) in enumerate(short_rows[: args.examples], start=1):
        rid = (r.get(join_key) or "").strip() if join_key else ""
        ar = ans_by_key.get(rid, {}) if rid else {}
        rubric = (ar.get("rubric_bam_bai") or "").strip() if ar else ""
        qtext = (r.get(text_col) or "").replace("\r", " ").replace("\n", " ").strip() if text_col else ""
        meta_parts = [f"dong_csv={lineno}"]
        if rid:
            meta_parts.append(f"{join_key}={rid}")
        for extra_col in ("video_id", "lesson_id", "day", "ngay", "timestamp"):
            if r.get(extra_col):
                meta_parts.append(f"{extra_col}={r[extra_col]}")
        meta_parts.append(f"len={qlen}")
        if rubric:
            meta_parts.append(f"rubric_bam_bai={rubric}")
        print(f"  {idx}. [{', '.join(meta_parts)}] \"{qtext}\"")

    return 0


if __name__ == "__main__":
    sys.exit(main())
