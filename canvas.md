# Canvas — SoftAndWet · Track A

> Điền ở guide bước 1.4. CP1 17:00 Thứ Sáu 27/11: nộp bản đầu, đủ 7 dòng (dòng 4 được ghi giả thuyết + nguồn sẽ kiểm).
> CP2 19:30 Thứ Sáu 27/11: cập nhật (số bằng chứng đầu, lát cắt đã chốt) và điền dòng "Đã đổi gì so với CP1".
> Track F: chép thêm thẻ đề của nhóm (khung trong file track F) xuống dưới bảng này.

| # | Dòng | Nhóm điền |
|---|---|---|
| 1 | Track + lát cắt dự kiến | Track A · A1 (tính năng mới): báo cáo "lớp đang kẹt gì" cho TA / lab coach trước buổi học |
| 2 | Người dùng chính (một vai cụ thể — không phải "học viên nói chung") | TA / lab coach lớp L3 khoá AI20K, tối trước buổi học, chuẩn bị phần mở đầu buổi |
| 3 | Pain một câu: ai — đang làm gì — vướng đâu — hậu quả | TA / lab coach chuẩn bị buổi học không biết lớp đang hiểu sai ý nào ở bài pre-class hôm trước, vì kết quả bài ôn và câu hỏi của học viên nằm trên trang pre-class chưa ai tổng hợp → đầu buổi giảng lại theo cảm giác, có thể bỏ sót chỗ lớp kẹt thật *(giả thuyết, kiểm bằng phỏng vấn TA)* |
| 4 | Bằng chứng đầu — CP1: giả thuyết + nguồn sẽ kiểm · CP2: số đầu tiên + 1 trích dẫn | **Số đầu (đào data, `data/build_class_stats.py`):** bài ôn cuối ngày, lần trả lời đầu: 399/1.968 lượt sai (20%); mỗi ngày có ý sai rõ cao, vd Day03 `agentic_fit_scoring_decision` 12/20, Day05 `ai_product_canvas` 12/15. Day09–Day13 chỉ còn 2–4 học viên làm bài ôn. **Trích dẫn:** *(chờ phỏng vấn ≥3 TA / lab coach chiều 27/11)*. Data cho biết lớp sai ở đâu; việc TA có thiếu thông tin này không phải kiểm bằng phỏng vấn |
| 5 | **Lát cắt MỘT CÂU** (1 người dùng · 1 việc · 1 quyết định AI · 1 kết quả) | Một TA / lab coach · tối trước buổi học · AI đọc số liệu đã tổng hợp của ngày học pre-class và chọn tối đa 3 ý kiến thức lớp sai nhiều nhất (hoặc nói "dữ liệu quá ít") · TA nhận bản nháp có số liệu kiểm được, duyệt rồi dùng mở đầu buổi |
| 6 | AI tự làm đến đâu + 1 dòng lý do: sai thì ai chịu gì | AI chỉ soạn nháp, TA duyệt và quyết định nói gì với lớp; ngưỡng dữ liệu và kiểm số do code làm. Lý do: sai thì TA giảng lại sai chỗ, tốn giờ của cả lớp; lớp ít người thì có thể lộ cá nhân |
| 7 | Phân công có tên | Trần Tuấn Đăng: điều phối, `spec.md`, chi phí · Phạm Quỳnh Anh: bằng chứng (đào data + phỏng vấn TA / lab coach), bộ câu thử · Nguyễn Đức Trọng: bản chạy thử (`codebase/`) · Nguyễn Văn Huy: metric, eval, slide, demo |
| — | *(CP2)* Đã đổi gì so với CP1 | Đổi lát cắt: từ "trợ giảng xử lý câu hỏi ngắn cho học viên" sang "báo cáo lớp đang kẹt gì cho TA / lab coach". Lý do: trợ giảng hiện có trên trang pre-class đã xử lý câu hỏi ngắn (nhóm tự thử), lát cắt cũ trùng sản phẩm có sẵn; data bài ôn cuối ngày cho thấy chỗ sai theo từng ý kiến thức nhưng chưa ai tổng hợp cho người dạy |
