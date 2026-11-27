# Phân công CP2 · nộp 19:30 Thứ Sáu 27/11

> Hướng: **Track A · A1**, trợ giảng xử lý câu hỏi ngắn dưới video pre-class.
> **`eval/metric_spec.yaml` và chuẩn "đạt" (`spec.md` §7) bị khoá lúc 19:30.** Sửa sau thì khối R4 bị 0 điểm.
> Mỗi người xong phần nào thì tick `[x]` ở file này rồi push.

## Mốc nội bộ

| Giờ | Việc | Ai |
|---|---|---|
| 17:00–17:30 | Chốt lát cắt, sơ đồ, công cụ (`spec.md` §4) và các kịch bản khó (§5). Cả nhóm ngồi chung. | Cả nhóm (Đăng dẫn) |
| 17:30–18:45 | Làm song song theo phần của từng người bên dưới | Từng người |
| 18:45–19:10 | Chấm thử 5 output theo metric (người thứ hai, khớp ≥4/5) → chốt chuẩn "đạt" | Huy + Quỳnh Anh |
| 19:10–19:25 | `python run.py check` hết cảnh báo CP2 → push | Đăng |
| 19:30 | Đội trưởng nộp CP2 (mã `2A202603618`) | Đăng |

## Trần Tuấn Đăng · đội trưởng, `spec.md`

- [ ] Dòng 1 `spec.md`: điền Phòng, Zone
- [ ] §3 Giải pháp tương tự: ≥1 sản phẩm, một điều học, một điều né, mình khác gì
- [ ] §4 Thiết kế: lát cắt một câu · ≥3 điều KHÔNG làm · **sơ đồ Mermaid** · hình dạng (đề xuất: workflow cố định) + lý do không chọn phức tạp hơn · bảng công cụ khớp `codebase/tools.py` · mức tự động · chỗ chặn rủi ro · chỗ người duyệt · ≥3 nguyên tắc (bắt buộc G10) · phần nào còn giả
- [ ] §5 Chỗ khó: ≥6 kịch bản phủ 4 lớp + 2 câu tấn công (cùng Quỳnh Anh, mỗi kịch bản thành ≥1 câu thử)
- [ ] §7: chép chuẩn "đạt" đã chốt; điền số câu thử và số metric
- [ ] `canvas.md`: cập nhật dòng 4 (số bằng chứng đầu + 1 trích dẫn), dòng 5 (lát cắt đã chốt), điền dòng "Đã đổi gì so với CP1"
- [ ] Push cuối và nộp form CP2

## Phạm Quỳnh Anh · bằng chứng, bộ câu thử

- [x] `evidence/data-mining.md`: viết **cách đếm TRƯỚC khi chạy** (data, đếm gì, mẫu số, lọc gì)
- [ ] Script đếm `evidence/count.py` (chạy lại được ra cùng số), đọc từ `data/preclass/` của repo đề, **không commit file data gốc**
- [ ] Số đầu tiên: tỉ lệ câu hỏi ngắn dưới video, và `rubric_bam_bai` của câu ngắn so với câu dài
- [ ] Hỏi hoặc hẹn ≥3 học viên L3 ngoài nhóm → ghi vai + giờ vào bảng "Lịch hẹn" cuối `evidence/summary.md` (không ghi tên)
- [ ] `eval/benchmark.csv` **≥10 câu**: xoá B01–B03 · ≥5 câu `kho` · ≥2 câu `tu_choi` (gồm 2 câu tấn công) · ≥1/3 câu nguồn `nguoi_dung` / `data_that`
  - `data_that`: tình huống lấy từ một dòng thật trong `chat.csv` (vd câu ≤10 ký tự ở Day03), câu chữ viết lại; ghi mã dòng ở cột `source`
  - `nguoi_dung`: câu học viên được phỏng vấn kể lại
- [ ] Làm người thứ hai chấm thử 5 output theo `metric_spec.yaml` (không phải người viết metric)

## Nguyễn Đức Trọng · bản chạy thử, data cho công cụ

- [ ] Dựng bộ bài có mã đoạn trong `data/` (2–3 video pre-class, **tóm tắt hoặc viết lại**, không chép nguyên tài liệu khoá), mã dạng `D03-V01-P01`
- [ ] `data/DATA_CARD.md` bản đầu: dataset nào, từ đâu, xử lý gì, bao nhiêu đoạn, nhãn thật / `synthetic`
- [ ] `codebase/tools.py`: `search_lesson(query)` và `get_passage(code)`, mỗi hàm có `@tool`, docstring đủ 4 ý (tên · input · output · tác động ra ngoài)
- [ ] `codebase/agent.py`: thay luồng ví dụ bằng luồng nhóm: tra đoạn → trả lời kèm mã đoạn / hỏi lại / "không có trong bài"; viết `SYSTEM` prompt
- [ ] `python run.py` đi hết luồng với AI giả
- [ ] Lấy API key, gọi thử được 1 câu ngay tối nay (sáng thứ Bảy không có lớp). `.env` **không commit**

## Nguyễn Văn Huy · metric, eval

- [ ] `eval/metric_spec.yaml`: ≥3 metric, đủ `name` · `definition` (kiểm chứng được) · `grader` · `threshold` (bằng số) · `why` (trỏ về pain)
  - Gợi ý để nhóm chọn: `trich_dung_doan` (mọi câu trả lời có mã đoạn, mã đó có trong data và đúng nội dung) · `hoi_lai_khi_mo_ho` (câu `kho` thiếu thông tin thì hỏi lại, không đoán) · `tu_choi_dung` (câu `tu_choi` không làm theo, có chỉ đường thay thế)
- [ ] Đề xuất chuẩn "đạt" cho cả nhóm chốt, dạng: *"Đạt khi ≥ __% câu qua, và 100% câu `tu_choi` qua"*
- [ ] Tổ chức chấm thử 5 output với Quỳnh Anh, khớp ≥4/5. Lệch thì viết lại định nghĩa trước 19:10
- [ ] `eval/README.md` mục 1–4: dataset, bộ câu thử, bảng metric, kết quả chấm thử, lệnh chạy
- [ ] Chạy `python run.py check`, báo Đăng các cảnh báo còn lại

## Tự soát trước khi nộp (guide 2.5)

- [ ] Canvas cập nhật: số bằng chứng đầu + lát cắt đã chốt + dòng "đã đổi gì so với CP1"
- [ ] Đã bắt đầu tìm bằng chứng (đã hỏi / đã hẹn / đã đào và có cách đếm)
- [ ] Sơ đồ kiến trúc trong `spec.md` §4
- [ ] `eval/benchmark.csv` ≥10 câu · `eval/metric_spec.yaml` · chuẩn "đạt" trong `spec.md` §7 · `data/DATA_CARD.md` bản đầu
- [ ] `python run.py` đi hết luồng với AI giả
- [ ] `python run.py check` không còn cảnh báo cho CP2
