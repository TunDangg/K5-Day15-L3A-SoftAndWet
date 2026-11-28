# Reflection — Nguyễn Văn Huy

> Làm ở guide bước 5.3. Mỗi người một file: chép file này thành `reflection/<ten-khong-dau>.md` (viết thường, không dấu). Hạn: **23:59 Thứ Bảy 28/11**. Mỗi câu 3–6 dòng.

1. **Vai trò + phần mình làm (trỏ tới file / commit):**
   Mình phụ trách metric và đánh giá. CP2: viết 4 metric trong `eval/metric_spec.yaml` (commit `e4475cf`, `c029ded`), `eval/README.md` mục 1–4, và cùng Quỳnh Anh chấm thử 5 output trong `eval/cham-thu-cp2.md` (khớp 5/5).
   CP3: chạy lượt 1 (`eval/run-1.csv`, 8/14), đưa câu trả lời thật Q13–Q14 vào `data/open_answers.json` và thêm 8 câu thử `nguoi_dung` B15–B22 (commit `9e03eb6`, gồm cả kết quả chấm thử).
   CP4: chọn nhóm lỗi "tách một kiểu hiểu sai thành nhiều nhóm", sửa `SYSTEM` prompt trong `codebase/agent.py`, chạy lượt 2 (`eval/run-2.csv`, 18/22) và viết `eval/report.md` (commit `c9c5773`). Cuối cùng chụp ảnh web thật cho slide 4 (commit `dd725da`).

2. **AI hỗ trợ mình thế nào (việc gì, công cụ gì, chỗ nào phải sửa lại output AI):**
   Mình dùng Claude Code trong VS Code để viết nháp metric, `report.md`, chạy `eval` / `score`, gợi ý cột `pass`, sửa prompt và chụp màn hình web. Mình đọc lại và xác nhận cột `pass` của cả hai lượt trước khi tính điểm.
   Những chỗ phải sửa lại: bản metric đầu tiên AI viết theo lát cắt cũ nên phải viết lại khi nhóm đổi lát cắt; AI từng chấm B05 là đạt rồi tự kiểm lại thì thấy A5 bị tách nhóm, phải sửa thành trượt; quy ước đọc "câu trích" AI ghi khác với quy ước nhóm đã chốt nên phải sửa cho khớp.
   Lần sửa prompt đầu tiên làm B03 gộp sai theo chủ đề, phải thử lại lần hai mới đúng. Khi nhóm thiếu dữ liệu thật, AI không đồng ý bịa số liệu, nên mình phải đi thu câu trả lời thật.

3. **Một câu thử trượt của nhóm và mình học được gì từ nó:**
   B04 (`[Q04] Phân tích câu trả lời của lớp`) vẫn trượt ở lượt 2: A2 và A6 cùng tin "hai cách tính chi phí như nhau" nhưng bị tách, còn A6 lại bị gộp với A4 vì cùng nói về chi phí. Điều lạ là B14 dùng cùng dữ liệu Q04 nhưng lần đó model gộp đúng.
   Mình học được hai điều. Một: sửa prompt chỉ cải thiện được một phần (nhóm lỗi này 0/4 → 2/4), và model không ổn định giữa các lần chạy, nên một lần chạy đạt chưa chứng minh là đã sửa xong.
   Hai: phải so trên cùng bộ câu. Tổng lượt 2 là 82% trên 22 câu, nhưng trên đúng 14 câu cũ chỉ là 71%, vẫn dưới chuẩn 80%. Nếu chỉ báo 82% thì sẽ hiểu sai mức tiến bộ thật.
