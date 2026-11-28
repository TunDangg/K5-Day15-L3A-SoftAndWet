# Chi phí khi dùng thật

## 1. Đầu vào

- **Persona** (`cost/personas.yaml`, tổng `share = 1.0`): 3 kiểu người dùng TA / lab coach:
  - `dung_it` (40%): 4 phiên/tháng × 1 lượt/phiên — chỉ xem các buổi có chủ đề khó (~1 buổi/tuần). Nguồn: lịch khoá + phỏng vấn P1–P3 *(tự ước tính)*.
  - `dung_vua` (40%): 12 phiên/tháng × 2 lượt/phiên — chuẩn bị đều trước buổi (~3 buổi/tuần). Nguồn: phỏng vấn P2 (chuẩn bị nhiều buổi/tháng, 10–30 phút/lần) + *(tự ước tính)*.
  - `dung_nhieu` (20%): 20 phiên/tháng × 3 lượt/phiên — phụ trách nhiều nhóm hoặc rà kỹ 2–3 câu hỏi mở/buổi (~5 buổi/tuần). Nguồn: phỏng vấn P2 + *(tự ước tính)*.
- **Số người dùng thật** 3 kịch bản (TA / lab coach): thấp **15** · cơ sở **30** · cao **60**. Nguồn: cơ sở 30 người *(tự ước tính từ quy mô lớp L3 >700 học viên trong README hackathon, ~1 TA / lab coach phụ trách 20–25 học viên)*; thấp 15 (thí điểm một phần lớp) và cao 60 (mở rộng toàn khoá / nhiều đợt): *(tự ước tính)*. Không dùng `data/training-ops/`.
- **Giá** 2 mức model (USD / 1 triệu token vào / ra, từ `further-reading/model-prices.md`, link https://ai.google.dev/gemini-api/docs/pricing, ngày xem 25/11/2026):
  - `gemini-3.5-flash-lite`: 0,30 / 2,50 USD
  - `gemini-3.8-flash`: 0,75 / 3,75 USD
- **Tỷ giá quy đổi tham khảo:** 1 USD = 25.500 ₫ *(tự ước tính, 11/2026)*.
- **Tỉ lệ đạt** dùng để tính: **18/22 (82%)** — lượt `run-2@20261128-104820` (`eval/run-2.csv`).
- **Đo token trên model `gemini-3.5-flash-lite`, tính giá model `gemini-3.5-flash-lite` và `gemini-3.8-flash`.** Lưu ý: nếu đổi sang model khác bộ tách token (hoặc model có token suy luận), số token thực tế có thể lệch.

## 2. Kết quả mô phỏng

Lượt mô phỏng: `cost/simulate-1.csv` · run ID `[lấy run ID ở đầu file cost/simulate-1-summary.md]` · 50 phiên · seed 42 · phiên lỗi: 0/50.

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| dung_it | 28 | 1 | 1.024 | 260 | 0,8 | 1,8 |
| dung_vua | 17 | 2 | 2.106 | 487 | 1,6 | 3,5 |
| dung_nhieu | 5 | 3 | 3.136 | 590 | 2,4 | 4,8 |

*(Số lần gọi model trung bình nhỏ hơn số lượt hỏi nhờ cổng kiểm bằng code trong `agent.py`: các câu thiếu mã, không có câu hỏi hoặc <5 câu trả lời bị chặn trước khi gọi model, tốn 0 token.)*

| Model (giá $/1M vào · ra) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | / tháng — thấp (15 người) | / tháng — cơ sở (30 người) | / tháng — cao (60 người) | / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gemini-3.5-flash-lite` (0,30 · 2,50) | $0.0014 (≈ 36 ₫) | **$0.0017 (≈ 44 ₫)** | $0.0011 (≈ 28 ₫) | $0.3012 (≈ 7.680 ₫) | **$0.6023 (≈ 15.359 ₫)** | $1.20 (≈ 30.719 ₫) | **$0.0201 (≈ 512 ₫)** |
| `gemini-3.8-flash` (0,75 · 3,75) | $0.0026 (≈ 66 ₫) | **$0.0032 (≈ 81 ₫)** | $0.0021 (≈ 52 ₫) | $0.5611 (≈ 14.307 ₫) | **$1.12 (≈ 28.614 ₫)** | $2.24 (≈ 57.227 ₫) | **$0.0374 (≈ 954 ₫)** |

- **Chi phí / task thành công** = chi phí trung bình mỗi phiên ÷ tỉ lệ đạt lượt 2 (82%) — không coi như đạt 100%.
- **Chi phí / câu hỏi đạt** = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (1,5) ÷ tỉ lệ đạt (82%).
- **Lưu ý quy mô dữ liệu thật:** bộ dữ liệu hiện tại mới có 5–8 câu trả lời / câu hỏi. Khi triển khai ở lớp thật đông học viên hơn (vd 20–50 câu trả lời / câu hỏi), số token vào và ra trên mỗi lượt sẽ tăng tương ứng, kéo chi phí thực tế lên gấp khoảng 3–6 lần so với mức mô phỏng (vẫn dưới ~$0.15 ≈ 3.800 ₫/TA/tháng ở mức cơ sở với `gemini-3.5-flash-lite`).

## 3. So với impact

- **Impact / người / tháng (`spec.md` §2):** `[chép đúng số từ spec.md §2, vd tiết kiệm X phút/TA/tháng]`
- **Chi phí / người / tháng (cơ sở, model `gemini-3.5-flash-lite`):** $0.0201 (≈ 512 ₫/TA/tháng); kể cả khi lớp thật đông câu trả lời gấp 5 lần vẫn chỉ khoảng ~2.500–3.000 ₫/TA/tháng.
- **Kết luận một dòng — đáng làm không:** **Đáng làm về mặt chi phí API** (chỉ ~512 ₫/TA/tháng, kể cả nâng lên `gemini-3.8-flash` cũng dưới 1.000 ₫/TA/tháng, gần như không đáng kể so với thời gian chuẩn bị đầu buổi của TA), với điều kiện lớp phải có đủ học viên chịu viết câu trả lời mở (≥5 câu/buổi) để phân nhóm có giá trị.