# Khảo sát học viên — câu hỏi, kênh, thời gian

- **Đối tượng:** học viên L3 khoá AI20K (câu 1: cả 20 phiếu chọn "Học viên").
- **Kênh đã gửi:** Discord
- **Mở / chốt:** phiếu đầu 23:48 Thứ Sáu 27/11/2026 · phiếu cuối (bản xuất này) 00:17 Thứ Bảy 28/11/2026.
- **Ngoài nhóm:** form chỉ gửi cho học viên L3 ngoài nhóm
- **Không thu** tên, email, mã học viên. `results.csv` đã bỏ giờ gửi (chỉ giữ ngày), mã phiếu `S01…S20` theo thứ tự gửi. Bản xuất gốc **không commit**.

## Câu hỏi (nguyên văn trong form)

| # | Câu hỏi | Kiểu trả lời |
|---|---|---|
| 1 | Bạn hiện là: | Chọn một |
| 2 | Lần gần nhất bạn làm sai (hoặc chọn theo cảm tính) câu ôn tập cuối bài pre-class, nhưng vẫn chưa rõ mình hiểu nhầm ở đâu trước khi lên lớp là khi nào? | Tự do |
| 3 | Tính trong 1 tháng học qua (từ Day 01 đến nay), bạn gặp tình trạng mang chỗ hiểu mơ hồ từ bài ôn pre-class lên lớp khoảng BAO NHIÊU LẦN? | Tự do |
| 4 | Ở lần gần nhất làm sai câu ôn tập cuối bài pre-class, bạn đã xử lý thế nào? | Chọn một (+ Mục khác) |
| 5 | Ở lần gần nhất đó, bạn mất khoảng bao lâu để tháo được chỗ hiểu nhầm đó? | Chọn một |
| 6 | Khi vào đầu buổi học trên lớp, phần ôn lại bài pre-class của TA / giảng viên thường có trúng đúng chỗ bạn đang hiểu nhầm không? | Chọn một |
| 7 | Điều gì khiến bạn thấy bất tiện nhất ở phần bài ôn cuối bài pre-class hoặc phần ôn lại đầu buổi học hiện nay? (Và nếu bạn chưa từng gõ vào ô "tự giải thích", vì sao?) | Đoạn văn |

## Cách đếm

`python evidence/survey/analyze.py` — quy tắc loại phiếu và bảng mã hoá câu 2, câu 7 ghi ngay đầu script (viết trước khi đếm). Loại 3/20 phiếu: S02 (câu 2 là văn bản chatbot dán vào), S13 (tự nói không có thời gian dùng pre-class, câu 2–3 mâu thuẫn), S17 (chưa dùng pre-class). Script in số trên 17 phiếu hợp lệ và cả trên 20 phiếu.

## Giới hạn

- 17 phiếu hợp lệ **< 20**: chưa đạt ngưỡng khảo sát của đề.
- Người trả lời là **học viên**; người dùng chính của lát cắt là **TA / lab coach** → khảo sát đo phía người chịu hậu quả (học viên), chưa đo phía TA.
- Câu 3 là ô tự do: khoảng "3–5" lấy cận dưới.
- Một số câu 7 dài, văn phong trau chuốt — không kiểm được người trả lời có dùng AI viết hộ hay không.
