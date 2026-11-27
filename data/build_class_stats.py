"""Dựng data/class_stats.json — số liệu ĐÃ TỔNG HỢP theo ngày học, nguồn cho công cụ class_stats.

Chạy: python data/build_class_stats.py <đường-dẫn-tới>/data/preclass
Đọc answers.csv + chat.csv của data BTC (không commit file gốc). Chỉ ghi số đếm, không ghi mã học viên.
Quy tắc đếm (khớp spec.md §4):
- Bài ôn cuối ngày: answers.csv, nguon = pre_post_post, lan_thu = 1, was_correct ∈ {True, False}.
- Ngày học lấy từ lesson_id (program-dayNN:...). Câu hỏi dưới video: chat.csv, channel = video_question, ngày lấy từ transcript (DayNN/...).
- Câu hỏi "không bám bài": answers.csv, nguon = chat, trang_thai_cham = da_cham, rubric_bam_bai = 0.
"""
import csv, json, re, sys, collections, os

src = sys.argv[1] if len(sys.argv) > 1 else "data/preclass"
def rows(name): return list(csv.DictReader(open(os.path.join(src, name), encoding="utf-8-sig")))
def day(s):
    m = re.search(r"day(\d+)", s or "", re.I)
    return "Day%02d" % int(m.group(1)) if m else None

ans, chat = rows("answers.csv"), rows("chat.csv")
out = collections.defaultdict(lambda: {"bai_on": {"so_hoc_vien": 0, "so_luot": 0, "so_sai": 0, "theo_kc": {}},
                                       "cau_hoi_video": {"so_cau": 0, "so_cau_ngan_le_20_ky_tu": 0, "so_cau_khong_bam_bai": 0, "so_cau_da_cham": 0, "theo_video": {}}})
hv = collections.defaultdict(set); kc = collections.defaultdict(lambda: [0, 0])
for r in ans:
    if r["nguon"] == "pre_post_post" and r["lan_thu"] == "1" and r["was_correct"] in ("True", "False"):
        d = day(r["lesson_id"]); b = out[d]["bai_on"]
        b["so_luot"] += 1; b["so_sai"] += r["was_correct"] == "False"; hv[d].add(r["hv"])
        k = kc[(d, r["kc_code"])]; k[0] += 1; k[1] += r["was_correct"] == "False"
for d in hv: out[d]["bai_on"]["so_hoc_vien"] = len(hv[d])
for (d, k), (n, w) in kc.items(): out[d]["bai_on"]["theo_kc"][k] = {"so_luot": n, "so_sai": w}

cid = {}
for r in chat:
    if r["channel"] != "video_question": continue
    d = day(r["transcript"]); c = out[d]["cau_hoi_video"]; cid[r["id"]] = d
    c["so_cau"] += 1; c["so_cau_ngan_le_20_ky_tu"] += int(r["do_dai_cau_hoi"] or 0) <= 20
    v = os.path.basename(r["transcript"]).replace(".txt", "")
    c["theo_video"][v] = c["theo_video"].get(v, 0) + 1
for r in ans:
    if r["nguon"] == "chat" and r["trang_thai_cham"] == "da_cham" and r["ref"] in cid and r["rubric_bam_bai"] != "":
        c = out[cid[r["ref"]]]["cau_hoi_video"]; c["so_cau_da_cham"] += 1; c["so_cau_khong_bam_bai"] += r["rubric_bam_bai"] == "0"

out.pop(None, None)
res = {"nguon": "data BTC data/preclass (05–25/11/2026), đã tổng hợp bằng data/build_class_stats.py; không có mã học viên",
       "ngay": dict(sorted(out.items()))}
json.dump(res, open("data/class_stats.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("Đã ghi data/class_stats.json:", len(out), "ngày")
