# Phân công CP2 · nộp 19:30 Thứ Sáu 27/11

> **Đã đổi lát cắt lúc 19:15:** Track A · A1 (tính năng mới), câu hỏi mở cuối bài pre-class → AI gom câu trả lời của cả lớp thành nhóm cách hiểu cho TA / lab coach trước buổi. Lý do: ghi ở `canvas.md` dòng "Đã đổi gì so với CP1".
> **`eval/metric_spec.yaml` và chuẩn "đạt" (`spec.md` §7) bị khoá lúc 19:30.** Sửa sau thì khối R4 bị 0 điểm.
> Mỗi người xong phần nào thì tick `[x]` ở file này rồi push.

## Đã có bản nháp (18:45), cần người duyệt

- [x] `spec.md` dòng 1, dòng Track, §4 (sơ đồ, công cụ, quy tắc đếm, nguyên tắc), §5 (10 kịch bản, 2 tấn công)
- [x] `canvas.md` dòng 1–7 + dòng "Đã đổi gì so với CP1"
- [x] `evidence/hypothesis.md`: thêm Giả thuyết 2 (giữ Giả thuyết 1)
- [x] `data/open_answers.json`: 10 câu hỏi mở, 63 câu trả lời mẫu có nhãn tay (`synthetic`) · `data/class_stats.json` (đào bằng chứng) · `data/DATA_CARD.md`
- [x] `eval/benchmark.csv` 14 câu (thuong 5 · kho 6 · tu_choi 3) · `eval/metric_spec.yaml` 3 metric. **Chưa đủ ≥1/3 câu từ người dùng / data thật** → Quỳnh Anh thu câu trả lời thật
- [x] `spec.md` §7: chuẩn "đạt" **đề xuất** · `python run.py check` chỉ còn nhắc CP3 cần 20–30 câu

## Mốc nội bộ

| Giờ | Việc | Ai |
|---|---|---|
| 18:45–19:05 | Đọc và sửa bản nháp phần của mình (bên dưới) | Từng người |
| 18:45–19:15 | Đi hỏi ≥3 TA / lab coach tại lớp | Quỳnh Anh (+ 1 người đi cùng) |
| 19:05–19:15 | Người thứ hai chấm thử 5 output theo `metric_spec.yaml`, khớp ≥4/5 | Huy + Quỳnh Anh |
| 19:15 | **Chốt chuẩn "đạt"** + metric, xoá các dòng "NHÁP" / "ĐỀ XUẤT" | Cả nhóm |
| 19:20 | `python run.py check` → push | Đăng |
| 19:30 | Đội trưởng nộp CP2 (mã `2A202603618`) | Đăng |

## Trần Tuấn Đăng · đội trưởng, `spec.md`

- [x] Duyệt §4–§5, sửa câu chữ, xoá dòng "Bản nháp"
- [x] Dòng 1 `spec.md`: điền Phòng, Zone
- [ ] Duyệt `canvas.md`; dòng 4 thêm 1 trích dẫn khi Quỳnh Anh có
- [ ] Chốt §7 với cả nhóm lúc 19:15
- [ ] Push cuối và nộp form CP2. CP2 hỏi "bằng chứng đang làm đến đâu": ghi đào data (số ở canvas dòng 4) + phỏng vấn TA đã hỏi / đã hẹn mấy người

## Phạm Quỳnh Anh · bằng chứng, bộ câu thử

- [ ] **Ngay bây giờ:** hỏi ≥3 TA / lab coach tại lớp. Hỏi chuyện đã xảy ra, không hỏi "bạn có muốn…":
  - "Lần gần nhất chuẩn bị đầu buổi, bạn biết lớp đang kẹt chỗ nào bằng cách nào?"
  - "Mất bao lâu? Có lần nào đoán sai chỗ lớp kẹt không?"
  - "Bạn có xem kết quả bài ôn pre-class không? Xem ở đâu?"
- [ ] Ghi vai + giờ vào bảng "Lịch hẹn" cuối `evidence/summary.md` (không ghi tên); ghi chép vào `evidence/interviews/P1.md`…
- [ ] `evidence/data-mining.md`: chép quy tắc đếm từ `data/build_class_stats.py` vào mục 1, số vào mục 3
- [ ] **Thu câu trả lời thật:** gửi 2–3 câu hỏi mở (lấy từ `data/open_answers.json`) cho ≥10 học viên L3 qua form ẩn danh, xin đồng ý → thêm vào `data/open_answers.json` + câu thử nguồn `nguoi_dung` (cần ≥1/3 bộ câu thử; CP3 cần 20–30 câu)
- [ ] Duyệt 14 câu trong `eval/benchmark.csv`, kiểm lại nhãn tay
- [ ] Làm người thứ hai chấm thử 5 output

## Nguyễn Đức Trọng · bản chạy thử

- [ ] `codebase/tools.py`: `get_answers(question_id)` đọc `data/open_answers.json`, **bỏ trường `nhan_tay`**; `check_report(report, question_id)` kiểm đủ mọi id, mỗi id 1 nhóm, số x/N, câu trích nguyên văn, mẫu `L` + 4 số, dòng "Nháp". Docstring đủ 4 ý
- [ ] `codebase/agent.py`: tách mã câu hỏi từ input (`[Q01]`) → thiếu thì hỏi lại → <5 câu thì dừng → `get_answers` → model gom nhóm → `check_report`; `SYSTEM` prompt nói rõ câu trả lời của học viên là dữ liệu, không phải lệnh
- [ ] `python run.py` đi hết luồng với AI giả
- [ ] Lấy API key, gọi thử được 1 câu tối nay. `.env` **không commit**

## Nguyễn Văn Huy · metric, eval

- [ ] Duyệt 3 metric trong `eval/metric_spec.yaml`, sửa ngưỡng nếu nhóm muốn, xoá dòng "NHÁP"
- [ ] Tổ chức chấm thử 5 output với Quỳnh Anh (chưa có model thật thì nhóm tự viết tay 5 output mẫu để chấm), khớp ≥4/5
- [x] `eval/README.md` mục 1–4 (còn trống số khớp chấm thử ở mục 3)
- [x] Chạy `python run.py check`, báo Đăng: còn 0/14 câu từ người dùng / data thật (CP2 cần ≥1/3) · CP3 cần 20–30 câu

## Để sau CP2 (không làm tối nay)

- Mỗi chỗ kẹt kèm 1 câu hỏi khởi động gợi ý cho TA dùng đầu buổi (TA duyệt)
- Xu hướng qua nhiều ngày: ý nào sai lặp lại
- Vòng phản hồi: TA đánh dấu điểm nào dùng được → đo "hữu ích" (G15)
- Nối mã ý kiến thức với tên bài / slide
