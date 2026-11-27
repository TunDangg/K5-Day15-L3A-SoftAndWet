"""Đếm kết quả khảo sát học viên (27–28/11/2026). Chạy: python evidence/survey/analyze.py
Đọc evidence/survey/results.csv (đã bỏ giờ gửi, không có tên / email). Quy tắc loại và mã hoá câu tự do
viết TRƯỚC khi đếm, ghi ngay dưới đây để người khác chạy lại ra cùng số."""
import csv, os, re, collections, statistics

HERE = os.path.dirname(os.path.abspath(__file__))
rows = list(csv.DictReader(open(os.path.join(HERE, "results.csv"), encoding="utf-8-sig")))

# Quy tắc loại phiếu (không phải trải nghiệm pre-class của chính người trả lời)
LOAI = {
    "S02": "câu 2 là văn bản chatbot dán vào, không kể trải nghiệm của người trả lời; câu 3 ghi 100 lần / tháng",
    "S13": "câu 7 tự nói không có thời gian dùng pre-class; câu 2 và câu 3 mâu thuẫn nhau",
    "S17": "tự nói chưa sử dụng pre-class lần nào",
}

# Mã hoá câu 2 (lần gần nhất) — người nhóm đọc và gán
Q2 = {"trong_2_tuan": "S01 S04 S05 S07 S08 S10 S11 S12 S15 S18 S19 S20",
      "khoang_1_thang": "S03", "khong_nho_khong_ro": "S06 S14 S16", "chua_sai_bao_gio": "S09"}

# Mã hoá câu 7 (bất tiện nhất) — một phiếu có thể thuộc nhiều chủ đề
Q7 = {
    "sai_ma_khong_ro_vi_sao": "S04 S05 S07 S15 S18",
    "giai_thich_ngan_khong_ky": "S01 S04 S10 S12",
    "phai_tu_hoi_ngoai_hoac_tu_tim": "S01 S05 S12 S15 S19",
    "khong_tro_ve_doan_video_slide": "S19",
    "on_dau_buoi_chung_chung_hoac_nhanh": "S05 S07 S10 S11",
    "tu_giai_thich_ton_thoi_gian_luoi_go": "S05 S07 S11 S12 S18",
    "tu_giai_thich_khong_biet_dien_dat_khi_dang_mo_ho": "S10 S11 S18",
    "tu_giai_thich_khong_co_phan_hoi": "S05 S19",
    "tu_giai_thich_thich_hoi_truc_tiep": "S15",
    "khong_thay_bat_tien": "S03 S06 S09 S14",
    "khac_khong_ro_y": "S08 S16 S20",
}

def so_lan(s):
    m = re.search(r"\d+", s)
    return int(m.group()) if m else None   # khoảng "3–5" lấy cận dưới

ok = [r for r in rows if r["id"] not in LOAI]
N, NA = len(ok), len(rows)
def pct(x, n): return "%d/%d (%.0f%%)" % (x, n, 100 * x / n)
def dem(col, data):
    return collections.Counter(r[col] for r in data).most_common()

print("Phiếu thu: %d · loại: %d (%s) · hợp lệ: %d" % (NA, len(LOAI), ", ".join(LOAI), N))
print("Vai:", dem("q1_vai", rows))
for col, ten in [("q6_on_dau_buoi", "Câu 6 — ôn đầu buổi có trúng chỗ hiểu nhầm?"),
                 ("q4_xu_ly", "Câu 4 — lần gần nhất xử lý thế nào?"),
                 ("q5_mat_bao_lau", "Câu 5 — mất bao lâu?")]:
    print("\n" + ten)
    for k, v in dem(col, ok): print("  ", pct(v, N), k)
    print("   (tính trên cả %d phiếu:)" % NA, [(v, k[:25]) for k, v in dem(col, rows)])
ids = {r["id"] for r in ok}
print("\nCâu 2 — lần gần nhất:")
for k, v in Q2.items(): print("  ", pct(len(set(v.split()) & ids), N), k)
nums = [so_lan(r["q3_so_lan_1_thang"]) for r in ok]
nums = [x for x in nums if x is not None]
print("\nCâu 3 — số lần / 1 tháng (cận dưới):", sorted(nums), "· trung vị", statistics.median(nums),
      "· ≥3 lần:", pct(sum(x >= 3 for x in nums), len(nums)))
lau = {"5 – 10 phút", "10 – 15 phút", "Trên 15 phút (hoặc đến giờ vẫn chưa rõ hẳn)"}
print("Câu 5 — mất ≥5 phút:", pct(sum(r["q5_mat_bao_lau"] in lau for r in ok), N))
print("\nCâu 7 — chủ đề (một phiếu nhiều chủ đề):")
for k, v in Q7.items(): print("  ", pct(len(set(v.split()) & ids), N), k)
tgt = set(" ".join(v for k, v in Q7.items() if k.startswith("tu_giai_thich")).split()) & ids
print("Nêu lý do chưa / ít dùng ô tự giải thích:", pct(len(tgt), N))
