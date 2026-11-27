# Phân công CP2 · nộp 19:30 Thứ Sáu 27/11

> **Đã đổi lát cắt lúc 18:30:** Track A · A1 (tính năng mới), báo cáo "lớp đang kẹt gì" cho TA / lab coach trước buổi. Lý do: ghi ở `canvas.md` dòng "Đã đổi gì so với CP1".
> **`eval/metric_spec.yaml` và chuẩn "đạt" (`spec.md` §7) bị khoá lúc 19:30.** Sửa sau thì khối R4 bị 0 điểm.
> Mỗi người xong phần nào thì tick `[x]` ở file này rồi push.

## Đã có bản nháp (18:45), cần người duyệt

- [x] `spec.md` dòng 1, dòng Track, §4 (sơ đồ, công cụ, quy tắc đếm, nguyên tắc), §5 (10 kịch bản, 2 tấn công)
- [x] `canvas.md` dòng 1–7 + dòng "Đã đổi gì so với CP1"
- [x] `evidence/hypothesis.md`: thêm Giả thuyết 2 (giữ Giả thuyết 1)
- [x] `data/build_class_stats.py` → `data/class_stats.json` (số đã tổng hợp, không có mã học viên) + `data/DATA_CARD.md`
- [x] `eval/benchmark.csv` 16 câu (thuong 6 · kho 6 · tu_choi 4 · data_that 10/16) · `eval/metric_spec.yaml` 3 metric
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

- [ ] Duyệt §4–§5, sửa câu chữ, xoá dòng "Bản nháp"
- [ ] Dòng 1 `spec.md`: điền Phòng, Zone
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
- [ ] Duyệt 16 câu trong `eval/benchmark.csv`; sau phỏng vấn thêm câu nguồn `nguoi_dung` (CP3 cần 20–30 câu)
- [ ] Làm người thứ hai chấm thử 5 output

## Nguyễn Đức Trọng · bản chạy thử

- [ ] `codebase/tools.py`: `class_stats(day)` đọc `data/class_stats.json`, áp quy tắc: <5 học viên → `du_lieu_it`; chỉ trả ý ≥10 lượt, xếp theo tỉ lệ sai. `check_report(report, day)` kiểm số x/N, mã ý, mẫu `L` + 4 số, dòng "Nháp". Docstring đủ 4 ý
- [ ] `codebase/agent.py`: tách ngày từ input (`[DayNN]`) → thiếu thì hỏi lại → `class_stats` → model viết nháp → `check_report`; viết `SYSTEM` prompt
- [ ] `python run.py` đi hết luồng với AI giả
- [ ] Lấy API key, gọi thử được 1 câu tối nay. `.env` **không commit**

## Nguyễn Văn Huy · metric, eval

- [ ] Duyệt 3 metric trong `eval/metric_spec.yaml`, sửa ngưỡng nếu nhóm muốn, xoá dòng "NHÁP"
- [ ] Tổ chức chấm thử 5 output với Quỳnh Anh (chưa có model thật thì nhóm tự viết tay 5 output mẫu để chấm), khớp ≥4/5
- [ ] `eval/README.md` mục 1–4
- [ ] Chạy `python run.py check`, báo Đăng

## Để sau CP2 (không làm tối nay)

- Mỗi chỗ kẹt kèm 1 câu hỏi khởi động gợi ý cho TA dùng đầu buổi (TA duyệt)
- Xu hướng qua nhiều ngày: ý nào sai lặp lại
- Vòng phản hồi: TA đánh dấu điểm nào dùng được → đo "hữu ích" (G15)
- Nối mã ý kiến thức với tên bài / slide
