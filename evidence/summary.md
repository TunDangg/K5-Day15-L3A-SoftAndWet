# Tổng hợp bằng chứng pain

> Điền ở guide bước 1.2, xong trước **CP3 10:00 Thứ Bảy 28/11**. Chấm ở rubric R1.
> Ba nguồn ngang nhau — tối thiểu **≥1 nguồn đạt ngưỡng**. Mạnh nhất: đào data ra insight → hỏi người dùng để kiểm lại (hoặc ngược lại).

## 1. Nguồn đã dùng

| Nguồn | Đạt ngưỡng? | File |
|---|---|---|
| Đào data (x/N, %, cách đếm chạy lại được, ≥5 ví dụ) | ☑ — có x/N và %, cách đếm viết trước, script chạy lại được, 7 ví dụ | `evidence/data-mining.md` · `data/build_class_stats.py` |
| Phỏng vấn (≥3 người ngoài nhóm, đúng người dùng) | ☐ — mới 1/3 (P1 lab coach, ghi chép nhớ lại sau 6 giờ) | `evidence/interviews/P1.md`… |
| Khảo sát (≥20 người ngoài nhóm, đúng người dùng) | ☐ — thu 20 phiếu, **17 hợp lệ** (< 20); người trả lời là **học viên**, người dùng chính là TA | `evidence/survey/` (`questions.md`, `results.csv`, `analyze.py`) |

## 2. Số chính

- **Đào data** (`data/preclass/`, 05–25/11): bài ôn cuối ngày là trắc nghiệm, chỉ ghi đúng / sai — 399/1.968 lượt sai lần đầu (20,3%), không cho biết sai vì hiểu nhầm gì · 7/7 ngày đủ dữ liệu có ít nhất 1 ý kiến thức sai ≥34% · ô tự giải thích chỉ có 20 lượt (`answers.csv`, `nguon = giai_thich`).
- **Phỏng vấn:** 1/3 lab coach *(n nhỏ không ghi %)* · P1: không biết trước lớp hiểu sai chỗ nào; xem được bài ôn nhưng chỉ thấy đúng / sai; không kể được lần cụ thể · số lần / tháng và thời gian: không nhớ · ghi chép nhớ lại sau 6 giờ, không có trích nguyên văn.
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
| P1 | lab coach | Một phần (không biết trước lớp hiểu sai chỗ nào; chỉ thấy đúng / sai) | không nhớ | không nhớ | không nhớ |
| P2 | | | | | |
| P3 | | | | | |

## 3. ≥5 trích dẫn hoặc ví dụ nguyên văn (có nguồn, bỏ tên)

1. "khi chọn sai mình thường chỉ thấy báo đáp án đúng mà chưa được giải thích rõ vì sao lựa chọn của mình lại sai" — khảo sát S05
2. "Lên lớp đầu giờ thì giảng viên hay điểm lại các ý chính trong slide, ít khi nhắc tới mấy câu hỏi bẫy hoặc các khái niệm dễ nhầm trong phần quiz cuối bài." — khảo sát S07
3. "mình phải để dồn đến lúc lên lớp nghe giảng viên/TA chữa mới hiểu" — khảo sát S18
4. "Mình chưa gõ vào ô "tự giải thích" bao giờ vì bản thân đang hiểu mơ hồ nên không biết diễn đạt thế nào cho đúng." — khảo sát S10
5. "không rõ gõ vào có AI hay TA chấm/phản hồi không" — khảo sát S19
6. Ví dụ data: `Day05 · ai_product_canvas` 12/15 lượt sai lần đầu, trong khi cả ngày Day05 là 55/180 — bài ôn chỉ cho biết sai, không cho biết hiểu nhầm thế nào — `data/class_stats.json`
7. *(ngược chiều)* "Ch thấy bất tiện" — khảo sát S03 (4/17 phiếu không thấy bất tiện)

## 4. Các nguồn có khớp nhau không

Data nói bài ôn chỉ ghi đúng / sai (20,3% sai lần đầu) và ô tự giải thích gần như không ai dùng (20 lượt); khảo sát học viên khớp: chỉ 3/17 nói ôn đầu buổi trúng đúng chỗ hiểu nhầm, và 8/17 tự nêu lý do không gõ ô tự giải thích. **Lệch / chưa biết:** khảo sát hỏi học viên, chưa hỏi TA — chưa biết TA có thật sự thiếu thông tin "lớp hiểu sai kiểu gì" hay có nguồn khác (Discord, hỏi tại lớp).

## 5. Kết luận

Giả thuyết 3 ở `evidence/hypothesis.md`: **phải đổi một phần** — phía học viên được ủng hộ (mang chỗ mơ hồ lên lớp thường xuyên, ôn đầu buổi hiếm khi trúng đúng chỗ), nhưng xuất hiện rủi ro cho giải pháp: gần một nửa học viên ngại viết câu trả lời tự do khi đang mơ hồ, tốn thời gian, không có phản hồi. Điều vẫn chưa biết: (1) phía TA — cần phỏng vấn ≥3 TA / lab coach; (2) học viên có chịu viết 1 câu trả lời mở ngắn nếu biết sẽ được TA dùng / có phản hồi hay không — cần thử thu câu trả lời mở thật.

## Lịch hẹn (dùng cho CP2 — chỉ ghi vai và giờ, không tên)

| Vai | Giờ hẹn | Đã xong? |
|---|---|---|
| | | |
