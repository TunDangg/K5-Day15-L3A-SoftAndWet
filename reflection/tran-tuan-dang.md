# Reflection — Trần Tuấn Đăng

1. **Vai trò + phần mình làm:**
   Đội trưởng: chọn Track A1 và lát cắt, chia việc từng chặng (`CP3-PHAN-CONG.md`, `CP4-PHAN-CONG.md`), gộp nhánh và nộp các checkpoint. Viết `spec.md` §0, §3–§5, §7 (dòng kết quả), §8–§10, `canvas.md`, `eval/README.md`, `docs/ai-usage.md`, mục "Quy ước của nhóm" trong `AGENTS.md`.
   Làm web demo cho TA: backend `codebase/web.py` + `web_store.py` (commit `0d0a438`), giao diện React `frontend/` (`99ab7df`, tab Phân tích TA dạng luồng hội thoại `e134a31`), `Dockerfile` (`fe65601`), 35 test ở `tests/` (`5623407`).
   Sửa `codebase/ai.py`: xoá `call_gemini` bị định nghĩa lặp, khôi phục `call_openai` (`24ece6d`). Cuối CP4 xuất `demo-slides.pdf` từ `slides/deck.html` (`87657f1`, `26adea5`).

2. **AI hỗ trợ mình thế nào:**
   Dùng Claude Code để soạn nháp backend API, giao diện React, test, và nháp các mục `spec.md`, file phân công, `eval/README.md`. Mình đọc lại diff, chạy test và gọi thử `[Q01]`, `[Q12]`, `[Q06]` cùng câu lạ bằng model giả trước khi commit.
   Phải sửa output AI ở mấy chỗ, đều phát hiện khi chạy thử chứ không phải lúc đọc code. Lỗi 503 bị báo nhầm là "hết lượt", vì code dò chữ `rate` mà chữ này khớp luôn với `generateContent` trong URL, nên phải đổi sang phân loại theo mã HTTP. File CSV Latin-1 bị đọc thành UTF-16 rồi báo sai "thiếu cột". Trong `ai.py`, bản `call_gemini` cũ đè mất bản mới có ép JSON.
   Với văn bản, mình không để AI tự tạo số hay trích dẫn: mọi số đều chép từ `evidence/`, `data/`, `eval/`, số nào không có nguồn thì ghi *(tự ước tính)*.

3. **Một câu thử trượt của nhóm và mình học được gì:**
   B08 (`[Q08] Phân tích câu trả lời của lớp`): cả lớp đúng 6/6 nhưng model vẫn tạo nhóm "Hiểu sai" 1/6 (A6), trượt ở cả lượt 1 lẫn lượt 2 (`eval/report.md`). Với TA, lỗi này còn tệ hơn bỏ sót: TA sẽ mất 5–10 phút đầu buổi giảng lại một lỗi không có, mà trên web thì nhóm bịa trông y như nhóm thật.
   Bài học thứ nhất: đừng trông vào prompt để chặn kiểu lỗi này. Cách rẻ và chắc hơn là để code kiểm, hễ nhóm "sai" chỉ có 1 câu thì đánh dấu cho TA xem lại.
   Bài học thứ hai đến lúc ghi kết quả lượt 2: 82% (18/22) đạt chuẩn, nhưng 8 câu mới B15–B22 đều dễ. Tính riêng 14 câu cũ thì chỉ 10/14 (71%), vẫn chưa đạt. Vì vậy mình thêm dòng "chỉ 14 câu cũ" vào `eval/README.md` và `spec.md` §7 để không ai đọc nhầm 82% là mức cải tiến thật.
