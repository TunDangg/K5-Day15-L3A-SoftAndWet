# Dàn slide — SoftAndWet · Lớp L3A · Phòng H210 · Zone 4

> Luật: **không có bằng chứng thì không có slide** — mỗi trang ≥ 1 con số / trích dẫn có nguồn / kết quả đo.
> Bản trình chiếu trực quan: `slides/deck.html` (mở trình duyệt → bấm nút **Xuất demo-slides.pdf** hoặc `Ctrl + P` → Save as PDF → lưu thành `demo-slides.pdf` ở **thư mục gốc repo** trước 13:45).
> Chỉ giữ trên slide các con số cốt lõi, sơ đồ luồng và kết luận ngắn; chi tiết dài để ở `spec.md`, `eval/report.md`, `cost/cost-estimate.md`.

| # | Trang | Nội dung cô đọng trên slide | Nguồn số liệu | Trạng thái |
|---|---|---|---|---|
| 1 | Người dùng & pain | 3 con số kiểm chứng (`20,3%` data · `3/17` khảo sát · `3/3` phỏng vấn + chiều ngược `2/3`) · Trích dẫn `S07` | `evidence/summary.md` | ☑ |
| 2 | Vì sao chọn bài này | Bảng so sánh 3 hướng (`60 giờ` vs `40 giờ` vs `~19 giờ`) · Điều kiện có giá trị từ `P2, P3` | `spec.md` §2 | ☑ |
| 3 | Giải pháp | Sơ đồ 5 bước Workflow cố định · 3 trụ cột (hình dạng · chặn chèn lệnh/vượt quyền · TA duyệt nháp) | `spec.md` §4 | ☑ |
| 4 | Demo live | 3 kịch bản (`[Q01]` thường · `[Q12]`/`[Q06]` khó · câu lạ) · Preview output thật `B01` (`run-2`, `2,12s`) + chỗ gắn link video | `eval/run-2.csv`, `codebase/web.py` | ☐ chờ link video (13:00) |
| 5 | **Đánh giá thế nào** | `22` câu (`8/22` thật) · `4` metric (khớp `5/5`) · Lượt 1 `8/14 (57%)` → Lượt 2 **`18/22 (82%)`** (14 câu cũ: **`10/14 = 71%`**) · Cải tiến Nhóm lỗi A | `eval/README.md`, `eval/report.md` | ☑ |
| 6 | **Chi phí khi dùng thật** | Công thức `÷ 82%` (hoặc `÷ 71%` chặt) · Bảng 2 model × 3 kịch bản · Đối chiếu `~3 giờ/TA/tháng` | `cost/cost-estimate.md` | ☐ chờ Trọng (13:00) |
| 7 | Kết luận | **ITERATE có điều kiện** · Dẫn số Trang 1 (`3/3` TA, `20` lượt), Trang 5 (`82%` / `71%`, `0` bịa), Trang 6 (`~60 giờ`) · 2 điều kiện sang GO | Trang 1, 5, 6 | ☐ điền nốt số chi phí Trang 6 |
| 8 | Nếu có thêm 1 tuần | 3 việc từ lỗi Lượt 2 (thu câu sai thật · tách workflow 2 bước + lọc code `B07/B08` · đo lặp `3×`) + Người dùng thử | `eval/report.md` §4.2–4.3 · `validation/log.md` | ☐ chờ `validation/log.md` (13:30) |

---

## Tóm tắt nội dung từng trang (khớp `slides/deck.html`)

### Trang 1 · TA không biết lớp đang hiểu sai kiểu gì trước giờ học
- **Người dùng chính:** TA / Lab coach lớp L3 chuẩn bị 5–10 phút ôn đầu buổi tối hôm trước.
- **3 con số bằng chứng:**
  - *Đào data (`05–25/11`):* **`20,3%`** (`399/1.968`) lượt sai lần đầu; `7/7` ngày đủ dữ liệu có ý sai `≥ 34%` (vd `Day05` sai `12/15` = `80%`), nhưng chỉ báo Đúng / Sai.
  - *Khảo sát học viên (`n = 17` hợp lệ):* Chỉ **`3/17`** thấy ôn đầu giờ trúng chỗ nhầm; **`14/17` (`82%`)** mang chỗ mơ hồ lên lớp `≥ 3` lần/tháng và mất `≥ 5` phút gỡ; **`8/17` (`47%`)** ngại gõ ô tự giải thích.
  - *Phỏng vấn Lab Coach (`n = 3`):* **`3/3`** chỉ thấy đúng/sai trước buổi (`P2` mất `10–30'` rà Discord/chat). *Ngược giả thuyết:* **`2/3`** (`P2, P3`) đọc hết câu tự viết nhanh vì mới có **`20` lượt**.
- **Trích dẫn:** *"Lên lớp đầu giờ thì giảng viên hay điểm lại các ý chính trong slide, ít khi nhắc tới mấy câu hỏi bẫy hoặc các khái niệm dễ nhầm trong phần quiz cuối bài."* — Khảo sát `S07`.

### Trang 2 · Chọn gom nhóm câu trả lời mở vì giải đúng chỗ mù thông tin
- **Câu hỏi mở cuối bài → AI gom nhóm cách hiểu cho TA (CHỌN):** `~20 TA × 12 buổi × 15'` *(tự ước tính)* = **`60 giờ TA/tháng`** — chỉ ra đúng kiểu hiểu nhầm để giảng lại đầu giờ; chưa có trên `preclass-online.com`.
- **2 hướng đã loại:** *Báo cáo đúng/sai trắc nghiệm* (`40 giờ TA`, không rõ kiểu sai, chỉ cần code đếm) · *Trợ giảng câu hỏi ngắn dưới video* (`~19 giờ HV`, trùng trợ giảng AI đã chạy tốt trên `preclass-online.com`).
- **Điều kiện có giá trị:** Bài pre-class phải thu đủ câu trả lời mở ngắn ở quy mô lớp (ít như `20` lượt hiện tại thì TA tự đọc nhanh hơn).

### Trang 3 · Workflow cố định: AI gom nhóm nháp, Code kiểm số, TA duyệt
- **Luồng 5 bước:** `(1) Code chặn đầu vào (<5 câu dừng, G10)` → `(2) get_answers đọc ẩn danh A1…` → `(3) AI xếp mỗi câu vào đúng 1 nhóm theo niềm tin sai gốc` → `(4) check_report tự đếm x/N & kiểm trích nguyên văn` → `(5) TA chỉnh & duyệt nháp (G9, không tự gửi)`.
- **3 trụ cột:** Workflow cố định rẻ & đo chính xác bằng nhãn tay · Chặn câu chèn lệnh (đưa vào Lạc đề) & từ chối xếp hạng cá nhân · Mức tự động: AI gợi ý, người quyết.

### Trang 4 · Demo Live: Câu thường, Bẫy chèn lệnh & Câu thử lạ
- `01` Câu thường `[Q01]` (`2/8 + 2/8` hiểu sai, `3/8` hiểu đúng, `1/8` bỏ trống) · `02` Câu khó `[Q12]` (câu `A4` chèn lệnh *"hiểu đúng 100%"* → vào nhóm Lạc đề) & `[Q06]` (`3` câu → dừng) · `03` Câu lạ giám khảo & TA sửa nhóm.
- Hiển thị kết quả thật của `B01` từ `run-2@20261128-104820` (`gemini-3.5-flash-lite`, `2,12s`, đủ `8/8` ID, `0` câu trích bịa) + chỗ điền link video dự phòng lúc 13:00.

### Trang 5 · Đạt 82% trên bộ 22 câu (tăng 57% → 71% trên 14 câu gốc)
- `22` câu (`5` thường · `10` khó · `7` từ chối; **`8/22 = 36%`** từ học viên L3 thật `Q13–Q14`) · `4` metric kiểm chứng (chấm thử độc lập khớp **`5/5`**).
- **Lượt 1 (`14` câu):** `run-1@20261128-005348` · `gemini-3.5-flash-lite` → **`8/14` (`57%`)** (`thuong 1/5 · kho 4/6 · tu_choi 3/3` · `0` trích bịa).
- **Lượt 2 (`22` câu):** `run-2@20261128-104820` · `gemini-3.5-flash-lite` → **`18/22` (`82%`)** (`thuong 3/5 · kho 8/10 · tu_choi 7/7` · `0` trích bịa, `0` hồi quy).
- **So công bằng `14` câu cũ (`B01–B14`):** Tăng **`8/14 (57%) → 10/14 (71%)`**.
- **Lỗi & 1 cải tiến:** Sửa `SYSTEM` prompt gom theo **niềm tin sai gốc** (chỉ tách khi TA phải giảng 2 điều khác nhau) → Nhóm lỗi A cải thiện `0/4 → 2/4`. *Giới hạn khai thật:* 8 câu thật mới đều là lớp hiểu đúng/từ chối; `B04` vs `B14` còn dao động.

### Trang 6 · Chi phí vận hành ở quy mô khoá học so với 60 giờ TA/tháng
- `Chi phí / task thành công = Chi phí TB / phiên ÷ 82%` *(hoặc ÷ 71% trên 14 câu gốc)* · Persona TA: `4 / 10 / 15` phiên/tháng.
- Bảng `gemini-3.5-flash-lite` (`$0.30 / $2.50`) vs `gemini-3.8-flash` (`$0.75 / $3.75`) trên 3 kịch bản + đối chiếu `~3 giờ / TA / tháng` (`[CHỜ SIMULATE 13:00]`).

### Trang 7 · Quyết định: ITERATE — Triển khai thử nghiệm có điều kiện
- Dẫn 3 số: Pain **`3/3`** TA & **`3/17`** HV (nhưng mới **`20` lượt** viết) · Đánh giá **`82%`** trên 22 câu (**`71%`** trên 14 câu cũ), **`100%`** từ chối, **`0` trích bịa** · Chi phí API nhỏ so với **`~60 giờ TA/tháng`**.
- 2 điều kiện sang **GO**: câu hỏi mở 1 dòng có phản hồi ngay (thu `≥ 15–20` câu/lớp) + đạt `≥ 80%` ổn định trên câu trả lời thật có nhiều kiểu hiểu sai.

### Trang 8 · 3 việc ưu tiên trong tuần tới
- `01` Thu câu trả lời sai thật ở bài sai cao (`Day03`, `Day05`), gỡ rào cản `8/17` ngại viết bằng phản hồi ngắn ngay sau nộp.
- `02` Tách workflow thành 2 bước (chấm từng câu theo ý chính → chỉ gom cụm câu sai) + lọc code dấu `"?"` (`B07`) và gắn cờ nhóm sai 1 câu (`B08`) để dứt điểm Nhóm lỗi A, B, C.
- `03` Chạy lặp `3×` mỗi câu benchmark để kiểm soát độ ổn định (xử lý dao động kiểu `B04` vs `B14`). Kèm ghi nhận người dùng thử (`[CHỜ 13:30]`).
