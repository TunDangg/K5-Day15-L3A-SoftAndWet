# Reflection — Phạm Quỳnh Anh

> Làm ở guide bước 5.3. Mỗi người một file: chép file này thành `reflection/<ten-khong-dau>.md` (viết thường, không dấu). Hạn: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. Vai trò + phần mình làm (trỏ tới file / commit):
   - **Vai trò:** Thành viên (`2A202603671`), phụ trách Bằng chứng pain, Impact, Kiểm chéo dữ liệu/metric và Bộ Slide 8 trang (nhánh `quynhanh`, PR `#8`, `#12`, `#19`).
   - **Bằng chứng & Spec:** Tổng hợp số đếm đào data (`399/1.968` lượt sai), ghi chép phỏng vấn `P1–P3` và đúc kết chiều ngược giả thuyết (`2/3` Lab Coach đọc nhanh do mới có `20` lượt viết) tại `evidence/data-mining.md`, `evidence/interviews/P1.md`–`P3.md`, `evidence/summary.md`; viết pain và bảng so sánh 3 hướng + công thức impact `60 giờ TA/tháng` ở `spec.md` §1–§2 (commit `e1b33dc`).
   - **Kiểm chứng đánh giá:** Duyệt 14 câu thử gốc `B01–B14` (`eval/benchmark.csv`), rà tay 100% nhãn `63/63` câu synthetic và `10/10` câu thật `Q13–Q14` (`data/DATA_CARD.md`, commit `7eb2a30`), chấm thử độc lập 5 output mẫu khớp `5/5` với Huy (`eval/cham-thu-cp2.md`).
   - **Slide thuyết trình:** Thiết kế toàn bộ bộ slide 8 trang 16:9 và bản tóm tắt chữ tại `slides/deck.html`, `slides/outline.md` (commit `932e4fc`, xuất `demo-slides.pdf`).

2. AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):
   - **Công cụ & việc dùng:** Dùng coding agent (**Antigravity**) hỗ trợ đối chiếu số liệu từ `data/class_stats.json` sang `evidence/data-mining.md`, rà câu hỏi khảo sát tránh dẫn dắt, soạn khung bảng impact `spec.md` §2 và dựng giao diện HTML/CSS cho `slides/deck.html`.
   - **Chỗ phải kiểm và sửa lại output AI:** Khi dựng `slides/deck.html` bản đầu, AI nhồi quá nhiều chữ kỹ thuật, tự thêm bảng phân công người thuyết trình và trộn font monospace (`Consolas`) làm lệch dấu tiếng Việt — mình đã yêu cầu xoá mục phân công, lược bỏ chi tiết thừa chỉ giữ con số cốt lõi có nguồn và đồng bộ về một họ font `Inter`/`Arial`.
   - **Kiểm chứng thủ công không giao cho AI:** Không để AI tự gán nhãn hay ước tính mù — mình tự đọc kiểm lại từng câu trong `63/63` câu synthetic + `10/10` câu thật ở `data/DATA_CARD.md`, tự chấm độc lập 5 mẫu ở `eval/cham-thu-cp2.md`, và bắt buộc ghi rõ `*(tự ước tính)*` cho mọi thừa số chưa có log trực tiếp trong `spec.md` §2.

3. Một câu thử trượt của nhóm và mình học được gì từ nó:
   - **Câu thử trượt `B04` (`[Q04] Phân tích câu trả lời của lớp`, trượt ở cả `eval/run-1.csv` và `eval/run-2.csv`):** Nhãn tay của `Q04` gom `A2, A6` vào cùng nhóm hiểu sai *"hai cách tính chi phí như nhau"* và tách `A4` vào nhóm *"chỉ tính token đầu ra"*. Dù Lượt 2 đã sửa `SYSTEM` prompt gom theo *niềm tin sai gốc* (cứu được `B01, B03`), ở `B04` model vẫn tách lẻ `A2` và gộp nhầm `A6` sang `A4` vì bị hút theo từ khoá bề mặt *"giá token"*; đáng chú ý là câu `B14` chạy trên **cùng dữ liệu `Q04`** nhưng model lại gộp `A2, A6` đúng.
   - **Bài học 1 (về kỹ thuật AI & đánh giá):** Bắt model vừa phân biệt đúng/sai vừa gom cụm ý sai trong một lần gọi dễ bị nhiễu bởi từ khoá chung chủ đề và dao động giữa các lần chạy — muốn sửa triệt để cần tách workflow thành 2 bước (đối chiếu từng câu với ý chính trước, rồi mới gom riêng các câu sai) và chạy lặp `≥ 3 lần/câu` để đo độ ổn định.
   - **Bài học 2 (về thiết kế sản phẩm):** Khi một kiểu hiểu sai phổ biến bị AI xé lẻ hoặc gộp nhầm, TA dễ đánh giá thấp chỗ lớp đang vướng thật; vì vậy việc giữ chế độ **Bản Nháp** kèm thao tác cho TA bấm đọc nguyên văn và kéo chuyển câu giữa các nhóm (nguyên tắc G9, G11) là chốt chặn thiết yếu chứ không thể chỉ trông chờ vào prompt.
