# Phân công CP3 · nộp 10:00 Thứ Bảy 28/11

> Lát cắt: **Track A · A1**: câu hỏi mở cuối bài pre-class → AI gom câu trả lời của cả lớp thành nhóm cách hiểu cho TA / lab coach trước buổi.
> **Không được sửa:** chuẩn "đạt" (`spec.md` §7), `eval/metric_spec.yaml`, đáp án các câu thử đã có. Câu thử **chỉ được thêm**.
> **Mọi thay đổi sau CP2 ghi 1 dòng vào `spec.md` §10.** Xong việc nào thì tick `[x]` rồi push.

## CP3 cần nộp (README → Checkpoint)

| # | Cần nộp | Tình trạng lúc 00:40 | Ai chốt |
|---|---|---|---|
| 1 | Bằng chứng đạt ngưỡng ≥1 nguồn + ≥5 trích dẫn / ví dụ · link `evidence/summary.md` | Đào data **đạt** · khảo sát 17/20 phiếu hợp lệ (chưa đạt) · phỏng vấn 1/3 · `summary.md` đã có 7 trích dẫn / ví dụ | Quỳnh Anh |
| 2 | 20–30 câu thử, ≥5 `kho`, ≥2 `tu_choi` | 14 câu · **0/14 từ nguồn thật** (cần ≥1/3) | Quỳnh Anh + Huy |
| 3 | Video 30 giây: bản chạy thử gọi **AI thật** | Chưa nối model (chưa có `.env`) | Trọng + Đăng |
| 4 | Kết quả lượt 1 (x/N câu đạt) + run ID | Chưa chạy | Huy |
| 5 | `spec.md` §0–§7 đầy đủ | §3, §4, §5, §7 có · §0, §1, §2, §6 trống · §7 thiếu dòng kết quả | Đăng |
| 6 | Phần chưa xong (khai thật) | — | Đăng |

## Mốc nội bộ

| Giờ | Việc | Ai |
|---|---|---|
| **Tối nay, trước khi ngủ** | Nối model thật · nhắn hẹn P2, P3 · đăng câu hỏi mở lên Discord để thu câu trả lời thật · xin thêm ≥3 phiếu khảo sát | Trọng · Quỳnh Anh |
| 07:00–08:15 | Phỏng vấn P2, P3 · đưa câu trả lời thật vào data · thêm câu thử lên 20–24 | Quỳnh Anh + Huy |
| 07:00–08:15 | Sửa prompt theo lỗi chấm thử · `eval --try` có token > 0 | Trọng |
| 08:15–09:00 | `python run.py eval` → chấm `pass` → `python run.py score` | Huy |
| 08:15–09:30 | Quay video 30 giây · điền `spec.md` §0, §1, §2, §6, kết quả §7 | Đăng (+ Trọng chạy máy) |
| 09:30–09:50 | `python run.py check` · cập nhật `summary.md` · push | Đăng |
| 10:00 | Đội trưởng nộp CP3 (mã `2A202603618`) | Đăng |

## Nguyễn Đức Trọng · nối model, bản chạy thử

- [ ] **Tối nay:** tạo `.env` theo `docs/connect-model.md` (`.env` **không commit**) → `python run.py` hỏi `[Q01] Phân tích câu trả lời của lớp` → `python run.py eval --try`, thấy `tokens_in > 0` là xong
- [ ] Sửa `SYSTEM` prompt theo lỗi chấm thử (`eval/cham-thu-cp2.md`): **không đặt tên câu hỏi trong ngoặc kép**; câu trích phải chép **nguyên văn** (lỗi O2 thiếu chữ "thời tiết"); câu chèn chỉ dẫn trong câu trả lời của học viên xếp vào nhóm lạc đề (lỗi O4)
- [ ] Ghi các thay đổi prompt vào `spec.md` §10
- [ ] Cùng Đăng quay video: gõ `[Q01]` → AI thật trả bản nháp có nhóm, số `x/N`, câu trích

## Phạm Quỳnh Anh · bằng chứng, câu trả lời thật

- [ ] **Tối nay:** nhắn hẹn 2 TA / lab coach (mẫu bên dưới), ghi vai + giờ vào bảng "Lịch hẹn" cuối `evidence/summary.md`
- [ ] **Tối nay:** đăng 1–2 câu hỏi mở (vd Q01, Q05 trong `data/open_answers.json`) lên Discord / form ẩn danh, ghi rõ "nhóm dùng câu trả lời ẩn danh để thử sản phẩm", xin ≥5–8 câu trả lời / câu hỏi
- [ ] Xin thêm ≥3 phiếu khảo sát hợp lệ (để đạt ≥20) → xuất lại CSV, gửi Đăng chạy lại `evidence/survey/analyze.py`
- [ ] **Sáng:** phỏng vấn P2, P3, 10–15 phút / người, **ghi ngay trong lúc hỏi**, chép `evidence/interviews/TEMPLATE.md` thành `P2.md`, `P3.md`; ghi ≥1 câu nguyên văn + các con số
- [ ] Điền vào `P1.md` ai hỏi / ai ghi (`TV_`)
- [ ] Cập nhật `evidence/summary.md` mục 2–5 với P2, P3; mục 5 ghi kết luận đúng như kết quả (ngược giả thuyết vẫn đủ điểm)

**Tin nhắn hẹn:**
> Chào anh/chị, nhóm em (SoftAndWet, L3A) đang tìm hiểu cách TA / lab coach chuẩn bị phần mở đầu buổi học. Anh/chị cho em hỏi 10 phút về lần gần nhất anh/chị chuẩn bị đầu buổi được không ạ? Em không giới thiệu sản phẩm gì cả, chỉ hỏi chuyện đã xảy ra. Em cảm ơn!

**5 câu hỏi** (hỏi chuyện đã xảy ra, không hỏi "có muốn không"):
1. Lần gần nhất anh/chị chuẩn bị phần mở đầu một buổi là khi nào? Kể lại anh/chị đã làm gì.
2. Lúc đó anh/chị dựa vào đâu để biết lớp đang hiểu sai chỗ nào?
3. Có lần nào ôn xong mà lớp vẫn hỏi lại đúng chỗ đó không? Kể lần gần nhất.
4. Trong 1 tháng qua chuyện đó xảy ra khoảng mấy lần? Mỗi lần mất bao lâu?
5. Anh/chị có xem kết quả bài ôn hay câu học viên tự viết trên pre-class không? Xem ở đâu, mất bao lâu, dùng làm gì?

## Nguyễn Văn Huy · câu thử, lượt 1

- [ ] **Sáng sớm:** cùng Quỳnh Anh điền 10 ô chấm thử trong `eval/cham-thu-cp2.md` (mỗi người chấm riêng, rồi mới so với bảng code tham chiếu), ghi kết quả vào `eval/README.md` mục 3
- [ ] Đưa câu trả lời thật vào `data/open_answers.json` dạng câu hỏi mới (`Q13`, `Q14`…): bỏ tên / mã, id `A1…`, gắn `nhan_tay`; người thứ hai kiểm nhãn
- [ ] **Thêm** câu thử lên 20–24 câu, **≥7 câu nguồn `nguoi_dung`** (mỗi bộ câu trả lời thật làm được 2–3 câu: phân tích · đòi chấm điểm cá nhân · kết luận gõ sẵn); không sửa câu B01–B14
- [ ] `python run.py check` hết cảnh báo
- [ ] `python run.py eval` → `eval/run-1.csv` + `traces/run-1.jsonl` → điền cột `pass` theo `metric_spec.yaml` → `python run.py score eval/run-1.csv`
- [ ] Ghi run ID, model, x/N vào `eval/README.md` mục 5; tóm lỗi chính vào `eval/report.md`; thống nhất cách đọc "câu trích" (tên câu hỏi trong ngoặc kép) và ghi vào `eval/report.md` **trước** khi chấm

## Trần Tuấn Đăng · `spec.md`, video, nộp

- [ ] `spec.md` §0: luồng hiện tại 3–5 bước (học viên làm bài ôn → thấy đúng / sai → …; TA ôn đầu buổi), kèm ảnh chụp từ tài khoản mình (che thông tin)
- [ ] §1: người dùng, việc cần làm, pain, bằng chứng (lấy từ `evidence/summary.md`)
- [ ] §2: bảng impact ≥3 hướng (câu hỏi mở cho TA · báo cáo số đúng / sai · trợ giảng câu hỏi ngắn — hướng đã loại, giữ lý do); số có nguồn hoặc ghi *(tự ước tính)*
- [ ] §6: bốn đường đi (suôn sẻ · không chắc · không có căn cứ · người dùng sửa · ngoài phạm vi · đặc thù)
- [ ] §7: dòng kết quả lượt 1 (x/N, %, run ID) — **không đụng dòng chuẩn "đạt"**
- [ ] §10: điền "Phân công có tên", "Dùng AI vào việc gì"
- [ ] Quay video 30 giây, YouTube "Không công khai" / Drive "Bất kỳ ai có đường liên kết", mở thử bằng cửa sổ ẩn danh
- [ ] Chạy lại `python evidence/survey/analyze.py` nếu có phiếu mới
- [ ] Push cuối, nộp form CP3, khai thật phần chưa xong
