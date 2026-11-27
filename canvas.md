# Canvas — SoftAndWet · Track A

> Điền ở guide bước 1.4. CP1 17:00 Thứ Sáu 27/11: nộp bản đầu, đủ 7 dòng (dòng 4 được ghi giả thuyết + nguồn sẽ kiểm).
> CP2 19:30 Thứ Sáu 27/11: cập nhật (số bằng chứng đầu, lát cắt đã chốt) và điền dòng "Đã đổi gì so với CP1".
> Track F: chép thêm thẻ đề của nhóm (khung trong file track F) xuống dưới bảng này.

| # | Dòng | Nhóm điền |
|---|---|---|
| 1 | Track + lát cắt dự kiến | Track A · A1 (trợ giảng dưới video pre-class). Lát cắt: xử lý câu hỏi ngắn / mơ hồ: trả lời kèm mã đoạn, hỏi lại, hoặc nói "không có trong bài" |
| 2 | Người dùng chính (một vai cụ thể — không phải "học viên nói chung") | Học viên lớp L3 khoá AI20K đang xem video pre-class trước buổi học, gõ câu hỏi cho trợ giảng ngay dưới video |
| 3 | Pain một câu: ai — đang làm gì — vướng đâu — hậu quả | Học viên L3 đang xem video pre-class, gặp chỗ chưa hiểu nhưng chỉ gõ một câu hỏi rất ngắn, nhận lại câu trả lời không trỏ về đoạn nào trong bài → phải tua lại tự tìm, hoặc mang chỗ kẹt vào lớp |
| 4 | Bằng chứng đầu — CP1: giả thuyết + nguồn sẽ kiểm · CP2: số đầu tiên + 1 trích dẫn | **Giả thuyết:** câu hỏi dưới video thường rất ngắn, và câu ngắn thì ít bám vào bài (mơ hồ). **Số sơ bộ:** 183/1.108 câu hỏi dưới video (16,5%) dài ≤20 ký tự (`chat.csv`, `channel = video_question`, `do_dai_cau_hoi ≤ 20`). **Sẽ kiểm bằng:** (1) đào data: so `rubric_bam_bai` trong `answers.csv` giữa câu ngắn và câu dài; (2) phỏng vấn ≥3 học viên L3 tại lớp |
| 5 | **Lát cắt MỘT CÂU** (1 người dùng · 1 việc · 1 quyết định AI · 1 kết quả) | Một học viên L3 gửi một câu hỏi ngắn dưới video pre-class · trợ giảng quyết định trả lời kèm mã đoạn, hỏi lại cho rõ, hay nói "không có trong bài" · học viên tự kiểm được bằng cách mở đúng đoạn |
| 6 | AI tự làm đến đâu + 1 dòng lý do: sai thì ai chịu gì | AI tự trả lời khi tìm được đoạn bài khớp (kèm mã đoạn); không chắc thì hỏi lại; không có căn cứ thì nói "không có trong bài". Lý do: sai thì học viên hiểu sai trước buổi học, nhưng AI chỉ đọc bài, không tác động ra ngoài, và học viên tự kiểm được bằng mã đoạn → sai thì sửa rẻ |
| 7 | Phân công có tên | Trần Tuấn Đăng: điều phối, `spec.md`, chi phí · Phạm Quỳnh Anh: bằng chứng (đào data + phỏng vấn), bộ câu thử · Nguyễn Đức Trọng: bản chạy thử (`codebase/`) · Nguyễn Văn Huy: metric, eval, slide, demo |
| — | *(CP2)* Đã đổi gì so với CP1 | |
