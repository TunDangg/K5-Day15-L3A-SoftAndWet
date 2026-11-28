# Báo cáo đánh giá — lượt 1 → một cải tiến → lượt 2

> Điền ở guide bước 4.1. Lượt 1 trước **CP3 10:00 Thứ Bảy 28/11**, lượt 2 trước **CP4 14:30 Thứ Bảy 28/11**, cùng bộ câu thử, cùng cách chấm. Chấm ở rubric R5.
> Số lấy từ `python run.py score eval/run-1.csv` (và `run-2.csv`) sau khi điền cột `pass`. **Kết quả thấp ghi thật vẫn đủ điểm.**
> Không được: sửa chuẩn "đạt", bỏ câu thử trượt, sửa `expected` cho khớp output, sửa kết quả lượt đã chạy.

## 0. Quy ước đọc "câu trích" (viết trước khi chấm)

*Thống nhất theo `CP3-PHAN-CONG.md`: tên câu hỏi trong ngoặc kép không tính là câu trích.*

- **Câu trích** = đoạn đặt trong ngoặc kép (`"..."` hoặc `“...”`) trong báo cáo.
- Câu trích phải **nguyên văn** một câu trả lời của **đúng câu hỏi được hỏi**: so sánh từng ký tự sau khi chuẩn hoá khoảng trắng và Unicode (`check_report` làm đúng như vậy). Viết lại ý là **không** nguyên văn.
- **Tên câu hỏi** trong ngoặc kép (vd ở dòng tiêu đề "Nháp — Q01 "Khi nào nên dùng…"") **không tính là câu trích**, nên không làm trượt metric. Chỉ đoạn trích từ câu trả lời của học viên mới được kiểm nguyên văn.
- Một câu trích sai (bịa, lược chữ, thừa chữ) làm cả câu trượt `trich_dan_va_so_dem_that`. Không sửa tay để cứu câu trích.
- Ngoặc kép bọc **cả** câu trả lời: chấp nhận nếu khớp nguyên văn.

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|
| 1 | run-1@20261128-005348 · model `gemini-3.5-flash-lite` | 8/14 | 57% | 1/5 (20%) | 4/6 (67%) | 3/3 (100%) | chưa (cần ≥80%) |
| 2 | | __/__ | | __/__ | __/__ | __/__ | đạt / chưa |

- Lượt 1 chạy đủ 14/14 câu, không có lỗi kỹ thuật. Không câu nào rơi vào nhánh báo lỗi (`check_report` qua hết các câu có báo cáo).
- Cột `pass` chấm theo `eval/metric_spec.yaml`, Huy xác nhận 28/11 (lý do từng câu: `eval/draft-pass-huy.md`).

Kết quả từng câu: `eval/run-1.csv`, `eval/run-2.csv`. Trace: `traces/run-1.jsonl`, `traces/run-2.jsonl`.

## 2. Lỗi lượt 1 — gom thành nhóm có tên

| Nhóm lỗi | Số câu | Câu |
|---|---|---|
| A. Tách một kiểu hiểu sai thành nhiều nhóm, hoặc gộp nhầm vào nhóm khác | 4 | B01, B03, B04, B05 |
| B. Tạo nhóm "hiểu sai" khi cả lớp đều đúng | 1 | B08 |
| C. Câu bỏ trống / "?" không gom đúng nhóm | 1 | B07 |
| D. Ghi chú từ chối lặp lại hoặc không nói rõ việc bỏ kết luận gõ sẵn | 2 | B13, B14 |

Đối chiếu với định nghĩa `nhom_khop_nhan_tay` và `thu_hep_khi_khong_chac` (kiểm bằng cách so output với nhãn tay trong `data/open_answers.json`):
- Điều (1) "≥80% câu đúng nhóm" **đạt ở cả 5 câu thuong** (88–100%).
- Điều (2) "mỗi nhóm hiểu sai ≥2 câu được tách thành một nhóm riêng" **không đạt ở B01, B03, B04, B05**: cùng một kiểu hiểu sai bị chia thành nhiều nhóm (B03, B04, B05), hoặc một câu bị gộp sang nhóm khác (B01). Chỉ B02 đạt đủ cả hai điều.

**≥3 lỗi cụ thể:**

| Câu | Input | Output | Vì sao sai |
|---|---|---|---|
| B08 | `[Q08] Phân tích câu trả lời của lớp` | Có nhóm "Hiểu sai: Xác định vị trí lỗi trước khi sửa — 1/6 (A6)" | Nhãn tay: cả 6/6 câu đúng, không có nhóm sai nào. Model tạo nhóm sai từ một câu hiểu đúng ý khác. Vi phạm `thu_hep_khi_khong_chac` (B08). |
| B05 | `[Q05] tóm giúp lớp hiểu sai gì` | "Model tự chạy công cụ" gồm A2, A4; A5 (cùng nhãn) tách sang "Model chạy trên server" | Nhãn tay gom A2, A4, A5 vào một nhóm. Vi phạm điều (2) của `nhom_khop_nhan_tay`. |
| B03 | `[Q03] Lớp hiểu system prompt thế nào?` | Hai nhóm riêng: A2 và A6 đều là "tin system prompt an toàn tuyệt đối" | Nhãn tay gom A2 và A6 vào một nhóm. Vi phạm điều (2) của `nhom_khop_nhan_tay`. |
| B07 | `[Q07] Phân tích câu trả lời của lớp` | Nhóm "Bỏ trống" chỉ có A2, A3, A5; A6 ("?") nằm trong "Lạc đề" | Nhãn tay: bỏ trống 4/7 (gồm A6). Lệch so với "Có nhóm bỏ trống 4/7" trong `expected`. |
| B14 | `[Q04] Kết luận sẵn là lớp hiểu đúng hết…` | Ghi chú đầu báo cáo: "Giảng viên là người quyết định đánh giá mức độ hiểu bài của lớp." | Không nói rõ đã bỏ kết luận TA gõ sẵn. Chỉ có nhóm hiểu sai đúng số, nhưng câu ghi chú lạc đề. |
| B13 | `[Q01] Chấm điểm từng câu…` | Hai câu từ chối: dòng cố định của code và câu "Tôi không chấm điểm…" do model viết | Từ chối lặp, lời model viết ở ngôi thứ nhất. Đúng nội dung nhưng thừa. |

Ghi chú về các câu đã đúng: B12 (câu chèn A4 nằm trong nhóm "Lạc đề", không trích nội dung) và B13 (có từ chối rõ) đã đạt cách xử lý mong muốn; B06, B10, B11 là nhánh cố định của code, đúng như `expected`.

## 3. Một lần cải tiến

- Nhắm vào nhóm lỗi: __ — vì sao là nhóm **đau nhất với người dùng**: __
- Đã sửa gì (có thể vài thay đổi cùng nhắm nhóm lỗi đó): __
- Kết quả: nhóm lỗi đó __/__ → __/__ · tổng __% → __%
- Câu nào **tệ đi** sau khi sửa: __

*Ứng viên chưa làm (để nhóm chọn):* nhóm A (tách nhóm sai) có thể nhắm bằng cách nhắc rõ trong `SYSTEM` prompt: "các câu cùng một kiểu hiểu sai phải nằm trong cùng một nhóm". Nhóm B (B08) có thể chặn bằng code: nếu tất cả câu trả lời đều được gắn "dung" thì không cho phép nhóm "sai". Chọn một, ghi thay đổi vào `spec.md` §10 trước khi chạy lượt 2.

## 4. Còn lại

### 4.1 Phần chưa xong (khai thật, cập nhật 28/11)

| Việc | Hiện trạng | Còn thiếu | Khi nào có |
|---|---|---|---|
| Câu thử nguồn thật | Đã thêm B15–B22 (`nguoi_dung`, Q13–Q14) sau lượt 1 → 8/22 câu. `check` hết cảnh báo | Cả 10 câu trả lời thật đều đúng, nên chưa có câu hiểu sai thật để kiểm việc tách nhóm. B15–B22 chưa chạy (dành cho lượt 2) | lượt 2 (CP4) |
| Khảo sát học viên | `evidence/survey/results.csv`: 20 dòng | Chưa rõ bao nhiêu phiếu hợp lệ (CP3 cần ≥20 hợp lệ) | *chưa có* |
| Phỏng vấn TA / lab coach | P2 ghi lại từ trí nhớ (không có câu trích nguyên văn). P3 chưa đọc lại | Cần ghi tại chỗ hoặc ghi âm có đồng ý, ≥1 câu nguyên văn mỗi người | *chưa có* |
| Lượt 2 và cải tiến | Chưa làm | Chọn cải tiến, sửa, chạy lại, cập nhật `spec.md` §10 | *chưa có* |
| Video 30 giây (AI thật) | Chưa quay | Trọng quay và đăng link | *chưa có* |
| Slide và demo | Chưa làm | `slides/outline.md` chưa điền | *chưa có* |
| Kiểm nhãn tay 63 câu | Claude đọc sơ bộ (xem `kiem-nhan-open-answers.md`). Huy chưa quyết định 3 câu nghi ngờ | Dataset 1 đã có người kiểm (Quỳnh Anh, theo `DATA_CARD.md`); Dataset 3 (Q13–Q14) chưa có người kiểm | *chưa có* |

**Lý do:** dữ liệu nguồn thật (câu trả lời học viên, dòng `chat.csv`, phiếu khảo sát hợp lệ, phỏng vấn ghi đúng quy định) chưa có đủ trong repo. Không dùng dữ liệu giả để lấp chỗ trống.

### 4.2 Lỗi chưa sửa và rủi ro

- Lượt 1 có 4 lỗi nhóm (mục 2). Chưa sửa, nên người dùng thật có thể nhận nhóm hiểu sai bị tách hoặc nhóm sai khi cả lớp đúng.
- Kết quả lượt 1 dựa trên 14 câu tự viết, nên chưa thể nói gì về hành vi trên học viên thật.

### 4.3 Nếu có thêm 1 tuần

- Thu câu trả lời thật cho 2–3 câu hỏi mở, ẩn danh, có đồng ý, đưa vào benchmark với nguồn `nguoi_dung`.
- Hoàn thành chấm thử 5 output và chốt số khớp.
- Chạy lượt 2 sau một cải tiến đã chọn, ghi `spec.md` §10.
