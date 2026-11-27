# Tổng hợp bằng chứng pain

> Điền ở guide bước 1.2, xong trước **CP3 10:00 Thứ Bảy 28/11**. Chấm ở rubric R1.
> Ba nguồn ngang nhau — tối thiểu **≥1 nguồn đạt ngưỡng**. Mạnh nhất: đào data ra insight → hỏi người dùng để kiểm lại (hoặc ngược lại).

## 1. Nguồn đã dùng

| Nguồn | Đạt ngưỡng? | File |
|---|---|---|
| Đào data (x/N, %, cách đếm chạy lại được, ≥5 ví dụ) | ☑ — có x/N và %, cách đếm viết trước, script chạy lại được, 7 ví dụ | `evidence/data-mining.md` · `data/build_class_stats.py` |
| Phỏng vấn (≥3 người ngoài nhóm, đúng người dùng) | ☑ về số người: 3/3 lab coach (P1–P3), mỗi người 1 file · **yếu:** ghi chép nhớ lại sau buổi, không có trích nguyên văn, ít con số | `evidence/interviews/P1.md`… |
| Khảo sát (≥20 người ngoài nhóm, đúng người dùng) | ☐ — thu 20 phiếu, **17 hợp lệ** (< 20); người trả lời là **học viên**, người dùng chính là TA | `evidence/survey/` (`questions.md`, `results.csv`, `analyze.py`) |

## 2. Số chính

- **Đào data** (`data/preclass/`, 05–25/11): bài ôn cuối ngày là trắc nghiệm, chỉ ghi đúng / sai — 399/1.968 lượt sai lần đầu (20,3%), không cho biết sai vì hiểu nhầm gì · 7/7 ngày đủ dữ liệu có ít nhất 1 ý kiến thức sai ≥34% · ô tự giải thích chỉ có 20 lượt (`answers.csv`, `nguon = giai_thich`).
- **Phỏng vấn 3 lab coach** *(n nhỏ, không ghi %)*:
  - Không biết trước lớp hiểu sai chỗ nào / chỉ thấy đúng – sai bài ôn: **3/3** (P1, P2, P3) → ủng hộ.
  - Thời gian chuẩn bị đầu buổi: P2 khoảng 10–30 phút, lặp lại nhiều buổi · P1 gần như không tốn · P3 không nhớ.
  - Kể được 1 buổi cụ thể ôn không trúng chỗ lớp kẹt: **0/3** (P1, P2 nói chung chung · P3 chưa gặp, đã nắm qua Discord) → chưa thấy mức độ đau.
  - Câu tự viết của học viên: **2/3 đọc hết nhanh, không cần ai gom** (P2, P3) → **ngược giả thuyết** · 1/3 không kịp / hầu như không thấy (P1).
- **Khảo sát học viên** (`python evidence/survey/analyze.py`, n = 17 phiếu hợp lệ / 20 phiếu thu):
  - Ôn đầu buổi của TA / giảng viên **trúng đúng** chỗ mình hiểu nhầm: 3/17 (18%) · trúng một phần, còn chỗ mơ hồ: 11/17 (65%) · chưa trúng: 2/17 (12%) · ít để ý: 1/17.
  - Mang chỗ mơ hồ từ bài ôn pre-class lên lớp ≥3 lần trong 1 tháng qua: 14/17 (82%), trung vị 3 lần.
  - Lần gần nhất xảy ra trong 2 tuần qua: 12/17 (71%).
  - Lần gần nhất xử lý: hỏi trợ giảng AI / ChatGPT bên ngoài 7/17 (41%) · xem đáp án rồi bấm qua 6/17 (35%) · hỏi bạn / Discord 3/17 (18%) · bỏ qua đợi lên lớp 1/17.
  - Mất ≥5 phút để gỡ chỗ hiểu nhầm: 14/17 (82%).
  - Câu tự do: 8/17 (47%) nêu lý do chưa / ít gõ ô tự giải thích (tốn thời gian 5 · không biết diễn đạt khi đang mơ hồ 3 · không có phản hồi 2 · thích hỏi trực tiếp 1) · 4/17 (24%) không thấy bất tiện.

Phỏng vấn nhiều vai thì đếm theo từng vai, không cộng chung.

| | Vai | Gặp pain? | Số lần / 1 tháng qua | Lần gần nhất mất | Đang xoay xở bằng |
|---|---|---|---|---|---|
| P1 | lab coach | Một phần (không biết trước lớp hiểu sai chỗ nào; chỉ thấy đúng / sai) | không nhớ | gần như không tốn | không nhớ |
| P2 | lab coach | Một phần (10–30 phút rà thủ công; nhưng đọc hết câu tự viết nhanh) | nhiều buổi (không nhớ số) | 10–30 phút | rà Discord / chat / bài ôn |
| P3 | lab coach | Phần lớn không (đã nắm qua Discord; đọc hết câu tự viết nhanh) | không nhớ | không nhớ | câu hỏi trên Discord |

## 3. ≥5 trích dẫn hoặc ví dụ nguyên văn (có nguồn, bỏ tên)

1. "khi chọn sai mình thường chỉ thấy báo đáp án đúng mà chưa được giải thích rõ vì sao lựa chọn của mình lại sai" — khảo sát S05
2. "Lên lớp đầu giờ thì giảng viên hay điểm lại các ý chính trong slide, ít khi nhắc tới mấy câu hỏi bẫy hoặc các khái niệm dễ nhầm trong phần quiz cuối bài." — khảo sát S07
3. "mình phải để dồn đến lúc lên lớp nghe giảng viên/TA chữa mới hiểu" — khảo sát S18
4. "Mình chưa gõ vào ô "tự giải thích" bao giờ vì bản thân đang hiểu mơ hồ nên không biết diễn đạt thế nào cho đúng." — khảo sát S10
5. "không rõ gõ vào có AI hay TA chấm/phản hồi không" — khảo sát S19
6. Ví dụ data: `Day05 · ai_product_canvas` 12/15 lượt sai lần đầu, trong khi cả ngày Day05 là 55/180 — bài ôn chỉ cho biết sai, không cho biết hiểu nhầm thế nào — `data/class_stats.json`
7. *(ngược chiều)* "Ch thấy bất tiện" — khảo sát S03 (4/17 phiếu không thấy bất tiện)

## 4. Các nguồn có khớp nhau không

- **Khớp:** data (bài ôn chỉ ghi đúng / sai, 399/1.968 lượt sai) · khảo sát (chỉ 3/17 học viên nói ôn đầu buổi trúng đúng chỗ hiểu nhầm) · phỏng vấn (3/3 lab coach không biết trước lớp hiểu sai chỗ nào, chỉ thấy đúng / sai) → **người dạy không biết học viên hiểu sai kiểu gì trước buổi**.
- **Khớp theo hướng ngược giả thuyết:** data (ô tự giải thích chỉ 20 lượt) · khảo sát (8/17 học viên ngại gõ ô tự giải thích) · phỏng vấn (2/3 lab coach đọc hết câu tự viết nhanh, không cần gom) → **hiện học viên viết quá ít, nên chưa có gì để gom**; nút thắt nằm ở chỗ học viên không viết, chưa phải ở chỗ TA không kịp đọc.
- **Lệch:** học viên thấy ôn đầu buổi hiếm khi trúng (3/17), nhưng 0/3 lab coach kể được buổi cụ thể ôn không trúng, P3 nói đã nắm qua Discord → hai phía nhìn khác nhau; có thể người dạy không thấy mình ôn trật vì không có tín hiệu nào báo lại.

## 5. Kết luận

Giả thuyết 3 (`evidence/hypothesis.md`): **phải đổi**.
- **Đúng:** người dạy không biết trước học viên hiểu sai kiểu gì (data + khảo sát + 3/3 phỏng vấn); học viên mang chỗ mơ hồ lên lớp thường xuyên (14/17).
- **Sai:** "TA không kịp đọc câu trả lời tự do nên cần AI gom" — 2/3 lab coach đọc hết nhanh vì học viên viết rất ít.
- **Hệ quả cho giải pháp:** giá trị của việc AI gom nhóm chỉ xuất hiện khi **có đủ câu trả lời** (câu hỏi mở bắt buộc, ngắn, 1 câu / bài, ở quy mô cả lớp L3 hơn 700 học viên) — nhóm cần ghi rõ điều kiện này ở §2 / §4 và kiểm bằng lượt thu câu trả lời mở thật.
- **Điều vẫn chưa biết:** học viên có chịu viết 1 câu ngắn nếu bắt buộc / có phản hồi không; TA có dùng bản tóm khi số câu trả lời lên hàng trăm không.

## Lịch hẹn (dùng cho CP2 — chỉ ghi vai và giờ, không tên)

| Vai | Giờ hẹn | Đã xong? |
|---|---|---|
| | | |
