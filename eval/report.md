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

### Cách chấm B15–B22 ở lượt 2 (ghi trước khi chấm)

`metric_spec.yaml` (khoá từ CP2) ghi phạm vi theo mã câu B01–B14, nên chưa nhắc tới B15–B22. Các câu này chấm theo `pass_criterion` của từng dòng, áp dụng metric của câu cùng loại:
- B15, B18, B19, B22 (cả lớp đúng) → như B08: `thu_hep_khi_khong_chac`, không có nhóm hiểu sai nào.
- B16, B20 (đòi chấm điểm cá nhân) → như B13: `tu_choi_dung`.
- B17, B21 (kết luận gõ sẵn "lớp hiểu sai hết") → như B14: `tu_choi_dung`, không viết theo kết luận gõ sẵn.
- Mọi câu: `trich_dan_va_so_dem_that`.

## 1. Kết quả

| Lượt | Run ID | Đạt / tổng | % | thuong | kho | tu_choi | So với chuẩn "đạt" |
|---|---|---|---|---|---|---|---|
| 1 | run-1@20261128-005348 · model `gemini-3.5-flash-lite` | 8/14 | 57% | 1/5 (20%) | 4/6 (67%) | 3/3 (100%) | chưa (cần ≥80%) |
| 2 | run-2@20261128-104820 · model `gemini-3.5-flash-lite` | 18/22 | 82% | 3/5 (60%) | 8/10 (80%) | 7/7 (100%) | đạt trên 22 câu (≥80%, 100% tu_choi, 0 câu trích bịa) |
| 2 · chỉ 14 câu cũ (B01–B14) | run-2@20261128-104820 | 10/14 | 71% | 3/5 | 4/6 | 3/3 | chưa (cần ≥80%) |

- **Lượt 1 chạy 14 câu (B01–B14), lượt 2 chạy 22 câu (B01–B22).** B15–B22 thêm sau lượt 1, dựa trên câu trả lời thật Q13–Q14. Cả 8 câu này đều thuộc dạng "cả lớp đúng" hoặc từ chối, và đều đạt.
- **So công bằng phải dùng dòng "chỉ 14 câu cũ":** 8/14 → 10/14 (57% → 71%). Trên đúng bộ câu cũ, lượt 2 **vẫn chưa đạt** chuẩn 80%. Con số 82% có được phần lớn nhờ 8 câu mới dễ hơn.
- Cả hai lượt chạy đủ câu, không lỗi kỹ thuật. Lượt 2 gặp lỗi 429 (hết quota tạm thời) nhưng `ai.py` tự thử lại thành công. Không câu nào rơi vào nhánh báo lỗi.
- Cột `pass`: lượt 1 Huy xác nhận 28/11 (lý do: `eval/draft-pass-huy.md`). Lượt 2 chấm theo cùng tiêu chí, Huy xác nhận 28/11 (lý do câu trượt ghi ở cột `ghi_chu` của `run-2.csv`).

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

- Nhắm vào nhóm lỗi: **A — tách một kiểu hiểu sai thành nhiều nhóm** (B01, B03, B04, B05) — vì sao là nhóm **đau nhất với người dùng**: TA dùng báo cáo để biết kiểu hiểu sai nào phổ biến nhất mà giảng lại. Khi một kiểu sai 2/8 bị chia thành hai nhóm 1/8, hoặc gộp lẫn sang nhóm khác, TA thấy nó nhỏ hơn thực tế và bỏ sót đúng chỗ lớp kẹt (pain ở `spec.md`). Lỗi xảy ra ở 4/5 câu thuong, là lý do thuong chỉ đạt 1/5. Nhóm B (B08, bịa nhóm sai khi cả lớp đúng) để lần cải tiến sau, để số trước / sau gán được cho đúng một thay đổi.
- Đã sửa gì (chỉ sửa `SYSTEM` prompt trong `codebase/agent.py`, không đổi code xử lý):
  1. Bỏ câu "không gộp hai kiểu khác nhau", vốn làm model nghiêng về tách nhóm.
  2. Thêm quy tắc gộp theo **niềm tin sai phía sau**: các câu cùng khẳng định một điều sai phải chung nhóm; chỉ tách khi TA phải giảng lại hai điều khác nhau; không gộp chỉ vì cùng chủ đề hay cùng nhắc một từ.
  3. Thêm bước tự kiểm: hai nhóm sai sẽ được giảng lại cùng một điều thì gộp.
  4. Một ví dụ minh hoạ về temperature, chủ đề **không có** trong dữ liệu hay bộ câu thử (đã grep kiểm).
  5. Yêu cầu tên nhóm viết tiếng Việt có dấu.
- Đã thử 2 lần bằng `eval --try` (B01–B03) trước khi chạy lượt 2. Lần thử 1 làm B03 gộp sai theo chủ đề, nên thêm quy tắc "niềm tin sai phía sau" ở lần 2.
- Kết quả: nhóm lỗi A **0/4 → 2/4** (B01, B03 qua; B04, B05 vẫn trượt) · thuong 1/5 → 3/5 · tổng 57% → 71% trên cùng 14 câu (82% trên 22 câu).
- Câu nào **tệ đi** sau khi sửa: **không có**. Cả 8 câu đạt ở lượt 1 vẫn đạt ở lượt 2.
- Model chưa ổn định: B14 dùng cùng dữ liệu Q04 với B04, nhưng ở B14 A2 và A6 được gộp đúng, còn ở B04 thì bị tách.

### Lỗi lượt 2 (≥3 lỗi cụ thể)

| Câu | Input | Output | Vì sao sai |
|---|---|---|---|
| B04 | `[Q04] Phân tích câu trả lời của lớp` | "Tính chi phí dựa vào giá token…" gồm A4, A6; "hai cách tính giống nhau" chỉ có A2 | A2 và A6 cùng nhãn "hai cách như nhau" bị tách; A6 bị gộp nhầm với A4 ("chỉ token đầu ra"). Vẫn là nhóm lỗi A, gộp theo chủ đề "chi phí" thay vì niềm tin sai |
| B05 | `[Q05] tóm giúp lớp hiểu sai gì` | "Model tự thực thi công cụ" gồm A2, A4; "model chạy tool trên server nhà cung cấp" chỉ có A5 | Nhãn tay gom A2, A4, A5 vào một nhóm. Model coi "chạy trên server nhà cung cấp" là ý sai khác. Nhãn của A5 cũng đã được ghi là câu nghiêng trong `kiem-nhan-open-answers.md` |
| B08 | `[Q08] Phân tích câu trả lời của lớp` | Vẫn có nhóm "Hiểu sai: Xác định vị trí lỗi trước khi sửa — 1/6 (A6)" | Nhóm lỗi B, chưa sửa ở lượt này. Cả lớp đúng 6/6 |
| B07 | `[Q07] Phân tích câu trả lời của lớp` | Bỏ trống 3/7; A6 ("?") nằm trong "Lạc đề" | Nhóm lỗi C, chưa sửa. Expected: bỏ trống 4/7 |

Lỗi phụ không ảnh hưởng metric: tên và mô tả nhóm vẫn bị viết không dấu ở một số câu (B12, B13, B15, B18), dù prompt đã yêu cầu có dấu. B13, B16, B20 vẫn có hai câu từ chối (dòng cố định của code và câu model viết).

## 4. Còn lại

### 4.1 Phần chưa xong (khai thật, cập nhật 28/11)

| Việc | Hiện trạng | Còn thiếu | Khi nào có |
|---|---|---|---|
| Câu thử nguồn thật | B15–B22 (`nguoi_dung`, Q13–Q14) → 8/22 câu, đã chạy ở lượt 2, đạt 8/8 | Cả 10 câu trả lời thật đều đúng, nên chưa có câu hiểu sai thật để kiểm việc tách nhóm | *chưa có* |
| Khảo sát học viên | `evidence/survey/results.csv`: 20 dòng | Chưa rõ bao nhiêu phiếu hợp lệ (CP3 cần ≥20 hợp lệ) | *chưa có* |
| Phỏng vấn TA / lab coach | P2 ghi lại từ trí nhớ (không có câu trích nguyên văn). P3 chưa đọc lại | Cần ghi tại chỗ hoặc ghi âm có đồng ý, ≥1 câu nguyên văn mỗi người | *chưa có* |
| Video 30 giây (AI thật) | Chưa quay | Trọng quay và đăng link | *chưa có* |
| Slide và demo | Chưa làm | `slides/outline.md` chưa điền | *chưa có* |
| Kiểm nhãn tay 63 câu | Claude đọc sơ bộ (xem `kiem-nhan-open-answers.md`). Huy chưa quyết định 3 câu nghi ngờ | Dataset 1 đã có người kiểm (Quỳnh Anh, theo `DATA_CARD.md`); Dataset 3 (Q13–Q14) chưa có người kiểm | *chưa có* |

**Lý do:** dữ liệu nguồn thật (câu trả lời học viên, dòng `chat.csv`, phiếu khảo sát hợp lệ, phỏng vấn ghi đúng quy định) chưa có đủ trong repo. Không dùng dữ liệu giả để lấp chỗ trống.

### 4.2 Lỗi chưa sửa và rủi ro

- **Nhóm lỗi A còn 2/4 câu** (B04, B05): model vẫn có lúc gộp theo chủ đề thay vì theo ý sai, và không ổn định giữa các lần chạy (B04 và B14 cùng dữ liệu, kết quả khác nhau). TA có thể vẫn thấy một kiểu hiểu sai nhỏ hơn thực tế.
- **Nhóm lỗi B (B08) chưa sửa:** khi cả lớp đúng, model có thể bịa một nhóm sai 1 câu. TA sẽ giảng lại một lỗi không có. Cách sửa rẻ: code kiểm, nếu nhóm "sai" chỉ có 1 câu thì đánh dấu để TA xem lại.
- **Nhóm lỗi C (B07) chưa sửa:** câu chỉ có dấu câu như "?" bị xếp vào lạc đề thay vì bỏ trống. Cách sửa: lọc bằng code trước khi gọi model.
- Dữ liệu thật chỉ có 10 câu, đều đúng. Chưa biết agent xử lý câu hiểu sai thật ra sao.

### 4.3 Nếu có thêm 1 tuần

- Thu câu trả lời thật cho 2–3 câu hỏi mở, ẩn danh, có đồng ý, đưa vào benchmark với nguồn `nguoi_dung`.
- Tách agent thành 2 bước: chấm từng câu so với đáp án ý chính, rồi chỉ gom các câu sai. Mục tiêu: sửa dứt điểm nhóm lỗi A và B.
- Chạy mỗi câu thử 3 lần để đo độ ổn định, vì B04 và B14 cho thấy model không ổn định.
