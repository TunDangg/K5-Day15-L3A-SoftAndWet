# Đào data — cách đếm và kết quả

> Điền ở guide bước 1.2. Ôn lại: ngày 2, ngày 6 · lab ngày 2, lab ngày 6.
> Không đào data thì xoá file này. Script / công thức đếm để trong repo (vd `evidence/count.py` hoặc ghi công thức Sheets ngay dưới), người khác chạy lại phải ra cùng số.
> Repo chỉ chứa số đã tổng hợp và vài dòng ví dụ — không chép lại nguyên file data.

## 1. Cách đếm — viết TRƯỚC khi chạy

- **Data dùng:** `data/preclass/chat.csv` và `data/preclass/answers.csv` (nhật ký hành vi thật trên trang pre-class do BTC cấp, từ 05/11 đến 25/11/2026, đã ẩn danh; đặt ngoài git tại `data-btc/preclass/`).
- **Đếm gì · trên tập nào · lọc gì:**
  1. **Tỉ lệ câu hỏi ngắn dưới video:** lọc các dòng có `channel = video_question` trong `chat.csv`, đếm số câu có `do_dai_cau_hoi <= 20` ký tự (kèm mức siêu ngắn `<= 10` ký tự).
  2. **So sánh độ bám bài giữa câu ngắn và câu dài:** nối các dòng `channel = video_question` trong `chat.csv` với `answers.csv` theo mã câu hỏi/phiên chung, so sánh phân phối và điểm trung bình `rubric_bam_bai` giữa nhóm câu ngắn (`<= 20` ký tự) và nhóm câu dài hơn (`> 20` ký tự).
- **Mẫu số là gì:**
  - Với tỉ lệ câu hỏi ngắn: mẫu số `N` = tổng số câu hỏi có `channel = video_question` trong `chat.csv` (không tính các `channel` khác).
  - Với so sánh `rubric_bam_bai`: mẫu số của từng nhóm (`<= 20` và `> 20`) = số câu `video_question` thuộc nhóm đó có bản ghi khớp và có giá trị `rubric_bam_bai` hợp lệ trong `answers.csv`.
- **Script / công thức:** `python evidence/count.py --data-dir data-btc/preclass`

## 2. Đọc trước, đếm sau

*(Chờ chạy `python evidence/count.py --data-dir data-btc/preclass` trên bộ data BTC thật để đọc 30–50 dòng đầu, kiểm tra tên cột thực tế và ghi các kiểu hành vi thấy được — không điền trước khi đọc data thật.)*

## 3. Kết quả

*(Chờ chạy `evidence/count.py` trên data BTC thật để điền số `x/N (%)` chính xác.)*

| Đếm gì | x / N | % | Ghi chú |
|---|---|---|---|
| Câu hỏi dưới video `channel = video_question` dài `<= 20` ký tự | *(chờ chạy `count.py`)* | | |
| Câu hỏi dưới video dài `<= 10` ký tự | *(chờ chạy `count.py`)* | | |
| Điểm `rubric_bam_bai` nhóm câu ngắn (`<= 20` ký tự) | *(chờ chạy `count.py`)* | | |
| Điểm `rubric_bam_bai` nhóm câu dài (`> 20` ký tự) | *(chờ chạy `count.py`)* | | |

## 4. ≥5 ví dụ cụ thể (mã dòng / mã đã ẩn danh, không đoán ai là ai)

*(Chờ chạy `evidence/count.py` trên data BTC thật để trích ≥5 ví dụ nguyên văn đã ẩn danh.)*

1.
2.
3.
4.
5.

## 5. Giới hạn của data

- Data chỉ cho thấy hành vi học viên **gõ câu hỏi ngắn** và điểm **bám bài (`rubric_bam_bai`)** của câu trả lời nhận lại — **không cho biết vì sao** học viên gõ ngắn, họ mất bao nhiêu phút để tua lại video tự tìm, hay họ có mang chỗ kẹt đó vào lớp hay không.
- Dữ liệu chỉ ghi nhận những học viên có bấm gửi câu hỏi dưới video, không thấy được những người gặp chỗ kẹt nhưng bỏ qua không hỏi.
- **→ Kiểm lại bằng phỏng vấn:** phỏng vấn ≥3 học viên lớp L3 ngoài nhóm (`evidence/interviews/P1.md`–`P3.md`) về lần gần nhất gặp chỗ kẹt khi xem video pre-class trong 1 tháng qua.
