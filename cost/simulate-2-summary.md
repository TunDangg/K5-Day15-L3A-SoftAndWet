# Tóm tắt mô phỏng simulate-2@20261128-123517

Do `python run.py simulate` sinh ra — không sửa tay. Chép bảng sang `cost/cost-estimate.md`.

| Persona | Số phiên mô phỏng | Lượt hỏi / phiên | Token vào / phiên | Token ra / phiên | Gọi model / phiên | Gọi công cụ / phiên |
|---|---:|---:|---:|---:|---:|---:|
| dung_it | 27 | 1 | 1018 | 259 | 0.8 | 1.8 |
| dung_vua | 17 | 2 | 2106 | 459 | 1.6 | 3.5 |
| dung_nhieu | 5 | 3 | 3136 | 591 | 2.4 | 4.8 |

Tỉ lệ đạt dùng để tính: 18/22 (82%) — lượt run-2@20261128-104820

- Tự chọn: lượt run-N mới nhất đã chấm xong, chạy bằng đúng model đang đo (run-2.csv). Muốn dùng lượt khác (vd lượt 2): thêm `--rate-from eval/run-2.csv`.

| Model (giá) | Chi phí / phiên | Chi phí / task thành công | Chi phí / câu hỏi đạt | Chi phí / tháng — thấp (15 người) | Chi phí / tháng — cơ sở (30 người) | Chi phí / tháng — cao (60 người) | Chi phí / người / tháng (cơ sở) |
|---|---:|---:|---:|---:|---:|---:|---:|
| gemini-3.5-flash-lite (vào 0.3 · ra 2.5 $/1M) | $0.0014 (≈ 35 ₫) | $0.0017 (≈ 43 ₫) | $0.0011 (≈ 28 ₫) | $0.2960 (≈ 7.547 ₫) | $0.5919 (≈ 15.095 ₫) | $1.18 (≈ 30.189 ₫) | $0.0197 (≈ 503 ₫) |
| gemini-3.8-flash (vào 0.75 · ra 3.75 $/1M) | $0.0026 (≈ 65 ₫) | $0.0031 (≈ 80 ₫) | $0.0020 (≈ 52 ₫) | $0.5532 (≈ 14.107 ₫) | $1.11 (≈ 28.214 ₫) | $2.21 (≈ 56.429 ₫) | $0.0369 (≈ 940 ₫) |

- Chi phí / task thành công = chi phí / phiên ÷ tỉ lệ đạt. Chi phí / câu hỏi đạt = chi phí / phiên ÷ số lượt hỏi trung bình mỗi phiên (1.6) ÷ tỉ lệ đạt — tỉ lệ đạt đo theo từng câu thử.
- Token đo trên model: gemini-3.5-flash-lite. Giá tính theo từng model trong bảng — model khác bộ tách token thì số token thật có thể lệch; ghi rõ "đo trên model X, tính giá model Y" trong cost/cost-estimate.md.
- Phiên lỗi (không tính vào trung bình): 1/50.
- Tỷ giá: 1 USD = 25.500 ₫ (Tỷ giá tham khảo 11/2026 (tự ước tính)).
