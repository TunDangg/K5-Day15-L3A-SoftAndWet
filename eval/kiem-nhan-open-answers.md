# Kiểm nhãn tay — `data/open_answers.json` (v1, 63 câu)

> **Đây là bản đọc kiểm của Claude, chỉ để Huy tham khảo.** Không phải kiểm nhãn chính thức. Huy đọc lại và điền cột "Quyết định của Huy". Không sửa `data/open_answers.json` cho đến khi Huy quyết định, vì `expected` của benchmark trỏ tới nhãn cũ.
> Phạm vi: đối chiếu từng câu với mô tả nhóm trong `nhom_nhan_tay`. Không kiểm lại nội dung kỹ thuật ngoài những gì đã ghi trong nhóm.

## 1. Kết quả tổng quan

- 10 câu hỏi, 63 câu trả lời (Q01 8 · Q02 7 · Q03 6 · Q04 7 · Q05 7 · Q06 3 · Q07 7 · Q08 6 · Q09 6 · Q12 6).
- Mọi nhãn đều nằm trong `nhom_nhan_tay` của câu hỏi tương ứng.
- Không có nhãn nào rõ ràng là sai.
- Có 3 câu cần Huy xem thêm (mục 2) và 2 điểm ghi nhận (mục 3).

## 2. Câu cần Huy xem lại

| Câu | Nhãn hiện tại | Lý do nghi ngờ | Ảnh hưởng nếu đổi | Quyết định của Huy |
|---|---|---|---|---|
| Q05 · A5 "model chạy tool trên server của nhà cung cấp" | `sai_model_tu_chay` | Ý là vị trí thực thi, khác với "model tự chạy". Có thể tách thành nhóm sai riêng. | Nhóm `sai_model_tu_chay` còn 2 câu (A2, A4), vẫn đủ ngưỡng ≥2. Cần sửa `expected` B05 nếu đổi. | |
| Q09 · A2 "ti le tai lieu lien quan lay duoc trong top k" | `dung` | Không nêu mẫu số (tổng tài liệu đúng), nên có thể hiểu là precision. | Đổi thành `sai_nham_precision` sẽ làm B09 thành 3 câu precision. Cần sửa `expected` B09. | |
| Q07 · A6 "?" | `bo_trong` | Đúng với `expected` B07 (4/7). Chỉ ghi nhận, không đề xuất đổi. | Đổi nhãn sẽ làm B07 lệch. Không nên đổi. | |

## 3. Điểm ghi nhận (không cần sửa)

- **Không có Q10, Q11.** Mã câu hỏi bỏ qua hai số này. Không sai, nhưng nên ghi một dòng trong `DATA_CARD.md` để người đọc khỏi thắc mắc.
- **Q08 chỉ có một nhóm `dung` (6/6).** Đây là chủ đích: B08 dùng Q08 để kiểm trường hợp cả lớp đúng.
- **Q06 có 3 câu.** Đây là chủ đích: B06 dùng Q06 để kiểm trường hợp quá ít câu.
- **Một số nhóm sai chỉ có 1 câu** (Q03 `sai_noi_nap_du_lieu`, Q04 `sai_chi_token_ra`, Q06 `sai_nham_nguoc`, Q07 `sai_nham_reactjs`). Đây không phải lỗi nhãn. Metric `nhom_khop_nhan_tay` chỉ kiểm nhóm có ≥2 câu.

## 4. Trạng thái

- Ngày đọc: 28/11/2026, do Claude đọc. Chưa có người kiểm thứ hai.
- `DATA_CARD.md` vẫn ghi "người kiểm nhãn: chưa". Khi Huy kiểm xong, cập nhật dòng đó bằng tên người kiểm (không ghi tên học viên) và ngày.
- `data/open_answers.json`: **không đổi**.
