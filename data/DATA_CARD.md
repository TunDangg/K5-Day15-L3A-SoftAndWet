# Data card — dữ liệu bản chạy thử dùng

> Điền ở guide bước 2.4 (bản đầu ở CP2, đủ ở CP3). Ôn lại: ngày 6 · lab ngày 6. Chấm ở rubric R4.
> Không commit nguyên tài liệu khoá, dữ liệu cá nhân thật hay nguyên file data BTC cấp — chỉ đoạn trích ngắn, bản viết lại, hoặc số đã tổng hợp.

## Dataset 1 · Số liệu lớp đã tổng hợp theo ngày học (`data/class_stats.json`)

| | |
|---|---|
| Dùng để làm gì | nguồn cho công cụ `class_stats` · đáp án kiểm được cho bộ câu thử (`data_that`) · đào bằng chứng |
| Từ đâu | data BTC cấp `data/preclass/` trong repo đề: `answers.csv`, `chat.csv` (nhật ký thật, đã ẩn danh) |
| Xử lý những bước gì | lọc bài ôn cuối ngày (`nguon = pre_post_post`, `lan_thu = 1`, có đúng/sai) · lọc câu hỏi dưới video (`channel = video_question`) · gom theo ngày học (từ `lesson_id` / `transcript`) và theo ý kiến thức (`kc_code`) · **chỉ giữ số đếm, bỏ mọi mã học viên** (script: `data/build_class_stats.py`) |
| Số dòng / số đoạn | 13 ngày học (Day01–Day13) · nguồn: 1.968 lượt trả lời bài ôn lần đầu, 1.108 câu hỏi dưới video |
| Phiên bản / ngày lấy | data BTC 05/11–25/11/2026, dựng lại lúc 18:40 27/11/2026 |
| Nhãn | thật (số tổng hợp từ nhật ký thật) |
| Giới hạn | không phân L3A / L3B · chỉ tính học viên có làm bài ôn (Day09–Day13 chỉ 2–4 người) · mã ý kiến thức là mã tiếng Anh, chưa nối với tên bài / slide · data cho biết sai ở đâu, không cho biết vì sao |
