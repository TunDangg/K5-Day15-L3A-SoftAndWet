# Canvas — SoftAndWet · Track A

> Điền ở guide bước 1.4. CP1 17:00 Thứ Sáu 27/11: nộp bản đầu, đủ 7 dòng (dòng 4 được ghi giả thuyết + nguồn sẽ kiểm).
> CP2 19:30 Thứ Sáu 27/11: cập nhật (số bằng chứng đầu, lát cắt đã chốt) và điền dòng "Đã đổi gì so với CP1".
> Track F: chép thêm thẻ đề của nhóm (khung trong file track F) xuống dưới bảng này.

| # | Dòng | Nhóm điền |
|---|---|---|
| 1 | Track + lát cắt dự kiến | Track A · A1 (tính năng mới): câu hỏi mở cuối bài pre-class, AI gom câu trả lời của cả lớp thành nhóm cách hiểu cho TA / lab coach trước buổi |
| 2 | Người dùng chính (một vai cụ thể — không phải "học viên nói chung") | TA / lab coach lớp L3 khoá AI20K, tối trước buổi học, chuẩn bị phần mở đầu buổi |
| 3 | Pain một câu: ai — đang làm gì — vướng đâu — hậu quả | TA / lab coach chuẩn bị buổi học chỉ thấy đúng / sai của câu trắc nghiệm pre-class nên không biết học viên hiểu sai theo kiểu nào; cho học viên tự viết thì không kịp đọc hết → đầu buổi giảng lại chung chung, không nhắm đúng cách hiểu sai *(giả thuyết, kiểm bằng phỏng vấn TA)* |
| 4 | Bằng chứng đầu — CP1: giả thuyết + nguồn sẽ kiểm · CP2: số đầu tiên + 1 trích dẫn | **Đào data (`data/build_class_stats.py`):** bài ôn cuối ngày là trắc nghiệm, chỉ ghi đúng / sai: 399/1.968 lượt sai lần đầu (20,3%), không cho biết sai vì hiểu nhầm gì; ô tự giải thích chỉ có 20 lượt. **Khảo sát học viên (`evidence/survey/`, 17 phiếu hợp lệ / 20):** chỉ 3/17 nói phần ôn đầu buổi trúng đúng chỗ mình hiểu nhầm; 14/17 mang chỗ mơ hồ lên lớp ≥3 lần / tháng. **Trích dẫn:** "Lên lớp đầu giờ thì giảng viên hay điểm lại các ý chính trong slide, ít khi nhắc tới mấy câu hỏi bẫy hoặc các khái niệm dễ nhầm trong phần quiz cuối bài." — khảo sát S07. *(Chưa có: phỏng vấn ≥3 TA / lab coach)* |
| 5 | **Lát cắt MỘT CÂU** (1 người dùng · 1 việc · 1 quyết định AI · 1 kết quả) | Một TA / lab coach · tối trước buổi học, sau khi lớp đã viết câu trả lời cho một câu hỏi mở · AI gom các câu trả lời thành nhóm cách hiểu (đúng / từng kiểu hiểu sai / bỏ trống), mỗi nhóm kèm số câu và câu trích nguyên văn · TA nhận bản nháp, duyệt rồi dùng mở đầu buổi |
| 6 | AI tự làm đến đâu + 1 dòng lý do: sai thì ai chịu gì | AI chỉ soạn nháp, TA duyệt và quyết định nói gì với lớp; ngưỡng ≥5 câu trả lời và kiểm câu trích do code làm. Lý do: sai thì TA giảng lại sai cách hiểu, tốn giờ cả lớp; lớp ít người thì có thể lộ ai viết gì |
| 7 | Phân công có tên | Trần Tuấn Đăng: điều phối, `spec.md`, chi phí · Phạm Quỳnh Anh: bằng chứng (đào data + phỏng vấn TA / lab coach), thu câu trả lời thật, bộ câu thử · Nguyễn Đức Trọng: bản chạy thử (`codebase/`) · Nguyễn Văn Huy: metric, eval, slide, demo |
| — | *(CP2)* Đã đổi gì so với CP1 | Đổi lát cắt: từ "trợ giảng xử lý câu hỏi ngắn cho học viên" sang "AI phân tích câu trả lời mở của cả lớp cho TA / lab coach". Lý do: trợ giảng hiện có trên trang pre-class đã xử lý câu hỏi ngắn (nhóm tự thử); câu trắc nghiệm chỉ cho đúng / sai, không cho biết học viên hiểu sai kiểu nào |
