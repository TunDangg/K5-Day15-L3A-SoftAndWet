# Tự rà trước người dùng thử + kịch bản phiên thật

> **Đây KHÔNG phải kết quả người dùng thử.** Phần B là coding agent (Claude Code) đóng vai TA, gọi API web với **model giả** (28/11) để tìm chỗ vấp trước khi cho người thật dùng. Không có người thật, không có trích dẫn. Kết quả người dùng thử thật chỉ ghi ở `validation/log.md`.

## A. Kịch bản phiên thật (Đăng dùng, ~10 phút / người, model thật, web trên `main`)

Chuẩn bị: `python codebase/web.py` (đã có `.env` model thật) · mở `http://127.0.0.1:8000` · mở sẵn `validation/log.md` để ghi **ngay trong lúc quan sát** · không giải thích giao diện trước.

| Nhịp | Nói gì (đọc gần nguyên văn) | Ghi gì |
|---|---|---|
| 1. Làm quen (1') | "Mình đang thử một công cụ, không phải thử bạn. Bạn cứ nói to điều đang nghĩ." | Vai người thử (TA / lab coach / học viên đóng vai TA) |
| 2. Bối cảnh (2') | "Lần gần nhất bạn chuẩn bị đầu buổi, bạn làm gì để biết lớp đang hiểu sai chỗ nào?" | Cách làm hiện tại, mất bao lâu |
| 3. Giao việc (1') | "Tối nay bạn chuẩn bị buổi mai. Dùng cái này để biết lớp hiểu sai gì ở Q01, rồi chọn điều sẽ nói 5 phút đầu buổi." | — (không nhắc nút nào) |
| 4. Im lặng quan sát (4') | Không gợi ý. Bí > 60 giây thì hỏi "bạn đang tìm gì?" | Bấm gì đầu tiên · chỗ do dự · có mở câu trích / id để đối chiếu không · có sửa nhóm không · có tin số `x/N` không |
| 4b. Việc khó (nếu còn giờ) | "Giờ thử Q12" (câu có học viên chèn chỉ dẫn) | Có nhận ra câu chèn nằm ở "Lạc đề" không |
| 5. Hỏi sau (2') | "Chỗ nào khó hiểu nhất?" · "Bạn có dám dùng kết quả này trước lớp không, vì sao?" · "Mai không được dùng nữa: rất tiếc / hơi tiếc / không sao?" | Trích **nguyên văn** câu trả lời |

Mỗi người 1 dòng ở `log.md` (vai · việc giao · quan sát · trích nguyên văn · mức nghiêm trọng). Toàn lời khen thì giao thêm việc 4b.

## B. Agent tự rà bằng model giả — chỗ cần để ý khi quan sát người thật

| # | Thử gì (đóng vai TA) | Thấy gì | Nên để ý ở phiên thật | Mức (tự đánh giá) |
|---|---|---|---|---|
| 1 | Gõ kiểu tự nhiên: `q01 lớp hiểu sai gì`, `Q1 phân tích giúp`, câu tiếng Anh có `Q05` | Đều nhận đúng mã, ra báo cáo | Người thật có gõ mã câu hỏi không, hay bấm câu hỏi ở cột trái | thấp |
| 2 | Gõ hai mã `[Q01] và [Q02]` | Hỏi lại muốn phân tích câu nào, không tự chọn | TA có thấy phiền khi phải làm từng câu không | thấp |
| 3 | `[Q01] tóm tắt 3 ý để mở đầu buổi học 5 phút` | Vẫn ra báo cáo phân nhóm như thường, không có "3 ý mở đầu" | Việc TA thật cần là **nói gì đầu buổi**; báo cáo nhóm có đủ để TA tự rút ra không, hay TA hỏi thêm | vừa |
| 4 | `[Q13]` (câu trả lời thật) | Câu trích bị cắt giữa câu ("…Trong trường hợp này, các bước"), không có dấu "…" | TA có hiểu nhầm câu trích là nguyên câu của học viên không | vừa |
| 5 | Nhập CSV có cột họ tên, email, SĐT, mã `L1234`, 1 câu trống | Bỏ cột `ho_ten`, `email`; ẩn 1 SĐT, 1 mã học viên; báo "1 bỏ trống"; tạo `Q101` phân tích được ngay | TA có đọc cảnh báo "đã bỏ cột / đã ẩn" không | thấp |
| 6 | Lưu bản nháp đã sửa | Lưu được, có trong lịch sử | TA có tìm thấy nút lưu / lịch sử không | thấp |
| 7 | Chất lượng gom nhóm | **Không đánh giá được**: model giả xếp mọi câu vào "Chưa xếp nhóm" | Phải dùng model thật ở phiên người dùng thử | — |

Giới hạn: agent đọc output API và mã giao diện, không nhìn màn hình, không thay được hành vi người thật (bấm gì đầu tiên, do dự ở đâu, có tin hay không).
