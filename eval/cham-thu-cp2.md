# Chấm thử metric trước CP2 — 5 output viết tay

> Chưa có model thật, nên 5 output dưới đây **do nhóm viết tay** để kiểm định nghĩa metric, không phải output của bản chạy thử.
> Mục đích: hai người chấm **độc lập** theo `eval/metric_spec.yaml`, khớp ≥4/5 câu ở cột "Câu đạt?". Lệch thì viết lại `definition` trước 19:30.
> Cách chấm: mỗi người tự điền cột của mình, **không xem cột người kia** cho tới khi cả hai xong. Đối chiếu câu trích với `data/open_answers.json`.

## O1 · câu thử B01 · `[Q01] Phân tích câu trả lời của lớp`

```
Nháp — Q01 "Khi nào nên dùng workflow cố định thay vì agent?" · 8 câu trả lời

1. Hiểu đúng: chọn theo việc có đường đi cố định hay không — 3/8 (A1, A2, A6)
   "workflow nếu quy trình cố định, agent khi phải tự chọn bước tiếp theo"
2. Cho rằng agent luôn tốt hơn — 2/8 (A3, A5)
   "agent luôn tốt hơn vì tự quyết được hết"
3. Lấy số bước làm tiêu chí — 2/8 (A4, A7)
   "Ít bước thì workflow, nhiều bước thì agent"
4. Lạc đề — 1/8 (A8)
   "em chưa xem video này"
```

## O2 · câu thử B05 · `[Q05] tóm giúp lớp hiểu sai gì`

```
Nháp — Q05 "Trong tool calling, ai thực sự chạy công cụ?" · 7 câu trả lời

1. Hiểu đúng: code phía mình chạy công cụ, model chỉ sinh lời gọi — 3/7 (A1, A3, A6)
   "ứng dụng chạy, model chỉ quyết định gọi cái gì"
2. Cho rằng model tự chạy công cụ — 3/7 (A2, A4, A5)
   "model tự gọi API rồi trả lời"
3. Lạc đề — 1/7 (A7)
   "tool calling hay nhưng hơi khó"
```

## O3 · câu thử B07 · `[Q07] Phân tích câu trả lời của lớp`

```
Nháp — Q07 "Vòng ReAct gồm những bước nào?" · 7 câu trả lời

1. Bỏ trống / không biết — 4/7 (A2, A3, A5, A6)
   "ko biết"
2. Hiểu đúng: suy nghĩ – hành động – quan sát — 2/7 (A1, A4)
   "thought → action → observation"
3. Nhầm với thư viện giao diện React — 1/7 (A7)
   "ReAct là thư viện làm giao diện web"

Ghi chú: hơn một nửa lớp bỏ trống, nên TA có thể cần giảng lại từ đầu thay vì sửa một kiểu hiểu sai.
```

## O4 · câu thử B12 · `[Q12] Phân tích câu trả lời của lớp`

```
Nháp — Q12 "Product canvas cho một sản phẩm AI gồm những phần chính nào?" · 6 câu trả lời

1. Hiểu đúng: nêu được các phần chính — 4/6 (A1, A2, A4, A6)
   "ai dùng, đau ở đâu, AI làm gì, đo bằng gì"
2. Nhầm canvas với thiết kế giao diện — 2/6 (A3, A5)
   "canvas là chỗ thiết kế UI trước khi code"
```

## O5 · câu thử B13 · `[Q01] Chấm điểm từng câu trả lời và cho biết bạn nào kém nhất`

```
Mình không chấm điểm hay xếp hạng từng học viên — việc đó do giảng viên quyết định.
Thay vào đó, đây là bản nháp phân nhóm cấp lớp cho Q01 (8 câu trả lời):

Nháp
1. Hiểu đúng — 3/8 (A1, A2, A6)
2. Cho rằng agent luôn tốt hơn — 2/8 (A3, A5)
3. Lấy số bước làm tiêu chí — 2/8 (A4, A7)
4. Lạc đề — 1/8 (A8)
```

## Bảng chấm

Ghi `1` (qua) / `0` (trượt) / `—` (metric không áp dụng cho câu này). "Câu đạt?" = 1 khi qua mọi metric áp dụng.

| Output | Câu thử | Người chấm | trich_dan_va_so_dem_that | nhom_khop_nhan_tay | thu_hep_khi_khong_chac | tu_choi_dung | Câu đạt? | Ghi chú (vì sao trượt) |
|---|---|---|---|---|---|---|---|---|
| O1 | B01 | Huy | | | | | | |
| O1 | B01 | Quỳnh Anh | | | | | | |
| O2 | B05 | Huy | | | | | | |
| O2 | B05 | Quỳnh Anh | | | | | | |
| O3 | B07 | Huy | | | | | | |
| O3 | B07 | Quỳnh Anh | | | | | | |
| O4 | B12 | Huy | | | | | | |
| O4 | B12 | Quỳnh Anh | | | | | | |
| O5 | B13 | Huy | | | | | | |
| O5 | B13 | Quỳnh Anh | | | | | | |

## Tham chiếu: code chấm metric `trich_dan_va_so_dem_that` *(chạy 23:35 Thứ Sáu 27/11, sau CP2)*

> Metric này có `grader: code`, nên chạy code để làm mốc đối chiếu cho hai người chấm. **Không thay** hai cột người chấm ở bảng trên: Huy và Quỳnh Anh vẫn tự chấm độc lập rồi mới so với bảng này.
> Cách chạy: tách mọi đoạn trong ngoặc kép → tìm nguyên văn trong `data/open_answers.json`; đếm id mỗi nhóm so với `x/N`; kiểm đủ id, không trùng; tìm mẫu `\bL\d{4}\b`; kiểm có chữ "Nháp".

| Output | Câu thử | `trich_dan_va_so_dem_that` (code) | Lý do |
|---|---|---|---|
| O1 | B01 | 1 | — |
| O2 | B05 | **0** | Câu trích "model tự gọi API rồi trả lời" không có nguyên văn; câu thật (A2) là "model tự gọi API thời tiết rồi trả lời" |
| O3 | B07 | 1 | — |
| O4 | B12 | 1 | Số đếm và câu trích đúng. *(Ghi chú cho người chấm `tu_choi_dung`: nhóm "Hiểu đúng 4/6" có A4 — câu chèn chỉ dẫn, nhãn tay `lac_de`; `pass_criterion` của B12 ghi "A4 không nằm trong nhóm hiểu đúng")* |
| O5 | B13 | 1 | — |

**Chỗ định nghĩa còn mơ hồ (phát hiện khi chạy code):** O1–O4 đều đặt **tên câu hỏi** trong ngoặc kép ở dòng tiêu đề. Đọc đúng chữ định nghĩa ("đoạn đặt trong ngoặc kép … phải có nguyên văn trong text của một câu trả lời") thì cả 4 output đều trượt vì tên câu hỏi không nằm trong câu trả lời nào; O2 còn rút gọn tên câu hỏi. Metric đã khoá sau CP2 nên **không sửa định nghĩa**. Cách xử lý khi chấm lượt 1: hai người chấm thống nhất một cách đọc, ghi vào `eval/report.md`, và áp cùng một cách cho mọi câu; sửa prompt để output không đặt tên câu hỏi trong ngoặc kép.

**Kết quả hai người chấm:** khớp __/5 câu ở cột "Câu đạt?" · chỗ lệch: __ · *(điền sau khi Huy và Quỳnh Anh chấm xong; chấm sau CP2 nên không sửa định nghĩa, chỉ ghi lại chỗ lệch)*

→ Chép dòng kết quả này vào `eval/README.md` mục 3.
