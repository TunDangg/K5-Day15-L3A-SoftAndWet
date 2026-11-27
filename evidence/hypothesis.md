# Giả thuyết — viết TRƯỚC khi tìm bằng chứng (5 phút, commit ngay)

> Điền ở guide bước 1.1. Ôn lại: ngày 2 · lab ngày 2.
> Viết **trước** khi đọc dòng data đầu tiên hay hỏi người đầu tiên, để không sửa cho khớp kết quả. Kết quả ngược giả thuyết vẫn đủ điểm nếu số là thật.

- Ngày giờ viết: 16:20 Thứ Sáu 27/11/2026 *(trước đó nhóm đã xem một số đếm sơ bộ: độ dài câu hỏi dưới video trong `chat.csv`)*
- Người dùng chính (một vai cụ thể): học viên lớp L3 khoá AI20K đang xem video pre-class trước buổi học
- **Mình nghĩ:** học viên L3 gặp khó khi hỏi về chỗ chưa hiểu trong video pre-class vì họ chỉ gõ câu hỏi rất ngắn, không nói rõ đang hỏi đoạn nào, hậu quả là nhận câu trả lời không bám bài, phải tua lại tự tìm hoặc mang chỗ kẹt vào lớp.
- **Có thể còn cách giải thích khác:** câu ngắn vẫn đủ rõ nhờ ngữ cảnh video (trợ giảng đã biết học viên đang ở đoạn nào); hoặc học viên ít hỏi vì không tin câu trả lời chứ không phải vì câu hỏi mơ hồ.
- **Mình đúng nếu thấy:** (1) câu hỏi ≤20 ký tự có điểm `rubric_bam_bai` trung bình thấp hơn rõ so với câu dài hơn; và (2) ≥2/3 học viên được phỏng vấn kể được một lần trong 1 tháng qua hỏi trợ giảng mà câu trả lời không giúp tìm ra chỗ trong bài
- **Nguồn sẽ dùng** (≥1 nguồn đạt ngưỡng, guide 1.2): [x] đào data · [x] phỏng vấn ≥3 · [ ] khảo sát ≥20 — nguồn chính: đào data `data/preclass/` (`chat.csv`, `answers.csv`) · nguồn để kiểm lại: phỏng vấn ≥3 học viên L3 tại lớp

---

## Giả thuyết 2 — sau khi đổi lát cắt (18:40 Thứ Sáu 27/11)

> Giả thuyết 1 ở trên giữ nguyên để thấy nhóm đã đổi gì. Lý do đổi: trợ giảng hiện có trên trang pre-class đã xử lý câu hỏi ngắn (nhóm tự thử), nên lát cắt cũ trùng sản phẩm có sẵn.

- Ngày giờ viết: 18:40 Thứ Sáu 27/11/2026 *(đã xem số tổng hợp bài ôn cuối ngày trong `data/class_stats.json` trước khi viết; chưa hỏi TA nào)*
- Người dùng chính (một vai cụ thể): TA / lab coach lớp L3, tối trước buổi học
- **Mình nghĩ:** TA / lab coach gặp khó khi chuẩn bị mở đầu buổi học vì không biết lớp đang hiểu sai ý nào ở bài pre-class (số liệu nằm trên trang pre-class, chưa ai tổng hợp cho họ), hậu quả là giảng lại theo cảm giác và có thể bỏ sót chỗ lớp kẹt thật.
- **Có thể còn cách giải thích khác:** TA đã biết lớp kẹt chỗ nào qua câu hỏi trên Discord / tại lớp, nên không cần số liệu; hoặc TA không có thời gian đọc báo cáo trước buổi; hoặc đầu buổi do giảng viên chứ không phải TA phụ trách.
- **Mình đúng nếu thấy:** ≥2/3 TA / lab coach được phỏng vấn kể được một lần trong 2 tuần qua chuẩn bị buổi mà không biết lớp đang kẹt ý nào, hoặc phải tự hỏi / tự đoán; và data cho thấy mỗi ngày có ý kiến thức sai lần đầu cao hơn rõ mức trung bình 20%.
- **Nguồn sẽ dùng:** [x] đào data · [x] phỏng vấn ≥3 · [ ] khảo sát ≥20 — nguồn chính: phỏng vấn ≥3 TA / lab coach tại lớp chiều 27/11 · nguồn kiểm lại: đào data `data/preclass/` (đếm bằng `data/build_class_stats.py`)

---

## Giả thuyết 3 — câu hỏi mở (19:15 Thứ Sáu 27/11)

> Thay Giả thuyết 2 (báo cáo theo số đúng / sai). Lý do: số đúng / sai không cho biết học viên hiểu sai kiểu nào.

- Ngày giờ viết: 19:15 Thứ Sáu 27/11/2026 *(đã xem số tổng hợp bài ôn trong `data/class_stats.json`; chưa hỏi TA nào)*
- Người dùng chính: TA / lab coach lớp L3, tối trước buổi học
- **Mình nghĩ:** TA / lab coach gặp khó khi chuẩn bị mở đầu buổi vì chỉ thấy đúng / sai của câu trắc nghiệm, không biết học viên hiểu sai theo kiểu nào, và không có thời gian đọc câu trả lời tự do của cả lớp; hậu quả là giảng lại chung chung, không nhắm đúng cách hiểu sai.
- **Có thể còn cách giải thích khác:** TA đã nghe được cách hiểu sai qua câu hỏi trên Discord / tại lớp; học viên không chịu viết câu trả lời tự do (ô tự giải thích hiện chỉ có 20 lượt) nên không đủ câu để phân tích.
- **Mình đúng nếu thấy:** ≥2/3 TA / lab coach được phỏng vấn kể được một lần trong 2 tuần qua không biết lớp hiểu sai kiểu gì trước buổi, và nói sẽ dùng bản tóm nhóm cách hiểu nếu có; và ≥10 học viên L3 chịu viết câu trả lời cho 1 câu hỏi mở khi nhóm thử thu.
- **Nguồn sẽ dùng:** [x] đào data · [x] phỏng vấn ≥3 · [ ] khảo sát ≥20 — nguồn chính: phỏng vấn ≥3 TA / lab coach · nguồn kiểm lại: đào data `data/preclass/` + thử thu câu trả lời mở từ học viên L3
