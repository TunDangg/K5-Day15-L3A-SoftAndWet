# Data card — dữ liệu bản chạy thử dùng

> Điền ở guide bước 2.4 (bản đầu ở CP2, đủ ở CP3). Ôn lại: ngày 6 · lab ngày 6. Chấm ở rubric R4.
> Không commit nguyên tài liệu khoá, dữ liệu cá nhân thật hay nguyên file data BTC cấp — chỉ đoạn trích ngắn, bản viết lại, hoặc số đã tổng hợp.

## Dataset 1 · Câu trả lời mở mẫu (`data/open_answers.json`)

| | |
|---|---|
| Dùng để làm gì | nguồn cho công cụ `get_answers` · bộ câu thử (cột `nhan_tay` dùng để chấm metric `nhom_khop_nhan_tay`) |
| Từ đâu | **nhóm tự viết** lúc 19:10 27/11: 10 câu hỏi mở theo các ý kiến thức có thật trong khoá (`kc_code` lấy từ `answers.csv`), mỗi câu 3–8 câu trả lời mô phỏng các kiểu hiểu sai |
| Xử lý những bước gì | viết tay, gắn nhãn nhóm cách hiểu cho từng câu (`nhan_tay`); không có mã học viên, id câu trả lời dạng `A1…` |
| Số dòng / số đoạn | 10 câu hỏi · 63 câu trả lời |
| Phiên bản / ngày lấy | v1, 19:10 27/11/2026 · người viết: nhóm · người kiểm nhãn: Phạm Quỳnh Anh (đối chiếu 63/63 nhãn với 14 câu benchmark lúc 19:15 27/11) |
| Nhãn | `synthetic` — **không phải bằng chứng pain** |
| Giới hạn | câu trả lời do nhóm viết nên gọn và sạch hơn câu thật; sẽ bổ sung câu trả lời thật thu từ học viên L3 (có đồng ý, ẩn danh) |

## Dataset 3 · Câu trả lời mở thật (`data/open_answers.json`, Q13–Q14)

| | |
|---|---|
| Dùng để làm gì | nguồn cho `get_answers` · câu thử nguồn `nguoi_dung` B15–B22 |
| Từ đâu | **học viên L3 thật**, ngoài nhóm, qua form / Discord, ẩn danh, đã đồng ý cho nhóm dùng để thử sản phẩm. Hai câu hỏi dùng lại đúng chữ Q01 (→ Q13) và Q05 (→ Q14) |
| Xử lý những bước gì | chép nguyên văn câu trả lời, không có tên hay mã học viên, đánh id `A1…`; gắn `nhan_tay` dùng lại bộ nhóm của Q01 / Q05 |
| Số dòng / số đoạn | 2 câu hỏi · 10 câu trả lời (5 + 5) |
| Phiên bản / ngày lấy | v1, thu 28/11/2026 · người gắn nhãn: Huy · người kiểm nhãn: Phạm Quỳnh Anh (28/11: kiểm 10/10 nhãn, giữ dung cho Q13 A5 vì nêu "quy tắc rõ ràng, ít ngoại lệ" và Q14 A5 vì nêu rõ "tách biệt suy luận và thực thi") |
| Nhãn | **thật** |
| Giới hạn | ít câu (5 mỗi câu hỏi, vừa đủ ngưỡng phân nhóm) · cả 10 câu đều được gắn `dung`, nên chỉ kiểm được kịch bản "cả lớp đúng", chưa kiểm được việc tách nhóm hiểu sai trên câu thật · Q13 A5 ("bài toán đơn giản…") và Q14 A5 ("nền tảng đang vận hành mô hình…") là câu nghiêng, cần người kiểm nhãn xem lại |

## Dataset 2 · Số liệu lớp đã tổng hợp theo ngày học (`data/class_stats.json`) — dùng đào bằng chứng

| | |
|---|---|
| Dùng để làm gì | **chỉ đào bằng chứng** (số ở `canvas.md` dòng 4, `evidence/data-mining.md`); bản chạy thử và bộ câu thử hiện **không** dùng file này |
| Từ đâu | data BTC cấp `data/preclass/` trong repo đề: `answers.csv`, `chat.csv` (nhật ký thật, đã ẩn danh) |
| Xử lý những bước gì | lọc bài ôn cuối ngày (`nguon = pre_post_post`, `lan_thu = 1`, có đúng/sai) · lọc câu hỏi dưới video (`channel = video_question`) · gom theo ngày học (từ `lesson_id` / `transcript`) và theo ý kiến thức (`kc_code`) · **chỉ giữ số đếm, bỏ mọi mã học viên** (script: `data/build_class_stats.py`) |
| Số dòng / số đoạn | 13 ngày học (Day01–Day13) · nguồn: 1.968 lượt trả lời bài ôn lần đầu, 1.108 câu hỏi dưới video |
| Phiên bản / ngày lấy | data BTC 05/11–25/11/2026, dựng lại lúc 18:40 27/11/2026 |
| Nhãn | thật (số tổng hợp từ nhật ký thật) |
| Giới hạn | không phân L3A / L3B · chỉ tính học viên có làm bài ôn (Day09–Day13 chỉ 2–4 người) · mã ý kiến thức là mã tiếng Anh, chưa nối với tên bài / slide · data cho biết sai ở đâu, không cho biết vì sao |
