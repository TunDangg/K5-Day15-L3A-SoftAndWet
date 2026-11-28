# Phân công CP3 · nộp 10:00 Thứ Bảy 28/11 *(chia lại 01:35 — mỗi người làm một mạch, không chờ nhau; Đăng nhận thêm web demo)*

> Lát cắt: **Track A · A1**: câu hỏi mở cuối bài pre-class → AI gom câu trả lời của cả lớp thành nhóm cách hiểu cho TA / lab coach trước buổi.
> **Không được sửa:** chuẩn "đạt" (`spec.md` §7), `eval/metric_spec.yaml`, đáp án các câu thử đã có. Câu thử **chỉ được thêm**.
> Xong việc nào thì tick `[x]`, `git pull origin main` rồi push và merge PR **ngay** (đừng để nhánh tách xa `main`).

## Nguyên tắc để không ai phải chờ ai

1. **Mỗi người ôm trọn một chuỗi** từ đầu đến cuối, tự ghi kết quả vào đúng file nộp — không chuyển tay giữa chừng.
2. **Key nhóm dùng chung:** Trọng nối model xong thì **gửi riêng** cho từng người cách tạo `.env` (nhắn riêng, **không** dán lên Discord chung, **không** commit). Ai cũng tự chạy được model thật trên máy mình.
3. **Giờ chốt cứng:** đến giờ mà phần nối vào chưa có thì **làm tiếp với cái đang có**, ghi rõ phần thiếu — không ngồi chờ.
4. **Ai sửa file nào** (mỗi người một vùng riêng → git tự gộp, không xung đột):
   - `spec.md`: **Đăng** §0 · **Quỳnh Anh** §1, §2 · **Trọng** §6 · **Huy** dòng kết quả §7 (không đụng dòng chuẩn "đạt") · **§10 chỉ Đăng thêm dòng** lúc 09:30 — người khác nhắn Đăng 1–2 dòng "đã đổi gì, vì sao", **không tự sửa §10**
   - `codebase/agent.py`, `codebase/ai.py`: chỉ **Trọng** · `codebase/web.py` + `README.md`: chỉ **Đăng**
   - `eval/`, `data/open_answers.json`, `data/DATA_CARD.md`: chỉ **Huy** · `evidence/`: chỉ **Quỳnh Anh**
   - Luôn `git pull origin main` ngay trước khi sửa `spec.md`.
5. **Không gọi model thật cùng lúc với lượt eval của Huy (08:15–08:45)** để tránh lỗi 429.

## Giờ chốt cứng

| Giờ | Chốt gì | Nếu chưa có |
|---|---|---|
| **08:00** | Trọng đã push sửa `agent.py` + prompt lên `main` | Huy vẫn chạy eval bằng `agent.py` đang có trên `main` |
| **08:15** | Huy **đóng băng** bộ câu thử, bắt đầu `python run.py eval` | Chạy với số câu đang có; câu thật đến sau để dành cho lượt 2 (CP4) |
| **09:00** | Huy điền dòng kết quả lượt 1 vào `spec.md` §7 + `eval/README.md` mục 5 | Ghi "lượt 1 đang chạy / chấm dở x câu" — khai ở mục "phần chưa xong" |
| **09:15** | Trọng dán **link video** vào đầu file này (mục "Link nộp") | Đăng khai "video đang upload" khi nộp |
| **09:30** | Mọi người push + merge xong | Phần chưa merge không tính, khai thật |
| **09:45** | Đăng nộp form CP3 | — |

## Link nộp (ai có thì điền thẳng vào đây)

- Video 30 giây (Trọng): __
- Run ID lượt 1 + x/N (Huy): run-1@20261128-005348 · 8/14 (57%)
- `evidence/summary.md`: https://github.com/TunDangg/K5-Day15-L3A-SoftAndWet/blob/main/evidence/summary.md
- `spec.md`: https://github.com/TunDangg/K5-Day15-L3A-SoftAndWet/blob/main/spec.md

## Nguyễn Đức Trọng · model thật → sửa code → video *(một mạch, không chờ ai)*

- [ ] **Tối nay:** tạo `.env` theo `docs/connect-model.md` → `python run.py` hỏi `[Q01] Phân tích câu trả lời của lớp` → `python run.py eval --try`, thấy `tokens_in > 0`
- [ ] **Tối nay:** nhắn **riêng** cho Huy, Đăng, Quỳnh Anh cách tạo `.env` (không dán key lên kênh chung, không commit)
- [ ] Sửa `SYSTEM` prompt + 3 chỗ trong `codebase/agent.py`:
  1. Bỏ dấu ngoặc kép khỏi `ghi_chu` của model trước khi đưa vào báo cáo (nếu không, `check_report` chặn cả báo cáo → rủi ro trượt B13, B14)
  2. Câu TA gõ có "chấm điểm / xếp hạng / kém nhất / giỏi nhất" → code tự thêm 1 câu từ chối cố định (B13)
  3. `loai` lạ từ model → gán `chua_xep` thay vì `sai`
  - và theo lỗi chấm thử (`eval/cham-thu-cp2.md`): câu trích chép nguyên văn; câu chèn chỉ dẫn → nhóm lạc đề
- [ ] Thử lại `python run.py eval --try` → push + merge **trước 08:00**; gửi Đăng 2–3 dòng "đã sửa gì, vì sao" để ghi §10
- [ ] **`spec.md` §6** bốn đường đi, đúng theo code `agent.py` (suôn sẻ · không chắc: thiếu mã câu hỏi → hỏi lại · không có căn cứ: không có câu hỏi / <5 câu → dừng · người dùng sửa: TA đổi tên nhóm, chuyển câu · ngoài phạm vi: đòi chấm điểm → từ chối · đặc thù: câu chèn chỉ dẫn, kết luận gõ sẵn)
- [ ] **Quay video 30 giây** (sau 08:45, khi Huy chạy eval xong, hoặc trước 08:15): gõ `[Q01]` → AI thật trả bản nháp có nhóm, `x/N`, câu trích, dòng "Nháp"; thấy rõ `model:` không phải `fake`
- [ ] Đăng YouTube "Không công khai" / Drive "Bất kỳ ai có đường liên kết", mở thử bằng cửa sổ ẩn danh → **dán link vào mục "Link nộp" trước 09:15**

## Nguyễn Văn Huy · câu trả lời thật → câu thử → lượt 1 → kết quả *(một mạch, không chờ ai)*

- [ ] **Ngay tối nay:** tự đăng 1–2 câu hỏi mở lên Discord / form ẩn danh (vd Q01 "Khi nào nên dùng workflow cố định thay vì agent?", Q05 "Trong tool calling, ai thực sự chạy công cụ?"), ghi rõ "nhóm dùng câu trả lời ẩn danh để thử sản phẩm, không ghi tên", xin ≥5–8 câu trả lời / câu hỏi
- [x] Chấm cột **Huy** trong `eval/cham-thu-cp2.md` (chấm riêng, không xem cột Quỳnh Anh; Quỳnh Anh chấm cột của mình bất cứ lúc nào — không cần ngồi cùng)
- [x] **Sáng:** đưa câu trả lời thật vào `data/open_answers.json` thành câu hỏi mới (`Q13`, `Q14`…): bỏ tên / mã, id `A1…`, gắn `nhan_tay`; ghi dataset mới vào `data/DATA_CARD.md` (nhãn **thật**, người gắn nhãn: Huy, người kiểm: *chưa* — Quỳnh Anh kiểm sau nếu kịp)
- [x] **Thêm** câu thử lên 20–24 câu, mục tiêu **≥7 câu nguồn `nguoi_dung`** (mỗi bộ câu trả lời thật làm 2–3 câu: phân tích · đòi chấm điểm cá nhân · kết luận gõ sẵn); không sửa B01–B14 → `python run.py check`
- [x] Ghi vào `eval/report.md` **trước khi chấm**: cách đọc "câu trích" thống nhất (tên câu hỏi trong ngoặc kép không tính là câu trích)
- [x] **08:15 đóng băng** → `python run.py eval` → điền cột `pass` theo `metric_spec.yaml` → `python run.py score eval/run-1.csv`
- [x] **Trước 09:00:** điền `eval/README.md` mục 5 (run ID, model, x/N) + dòng kết quả `spec.md` §7 (`git pull origin main` trước, **không đụng dòng chuẩn "đạt"**) + mục "Link nộp" ở trên; tóm lỗi chính vào `eval/report.md`
- [ ] Push + merge trước 09:30

## Phạm Quỳnh Anh · bằng chứng *(một mạch, không chờ ai)*

- [ ] **Tối nay:** xin thêm ≥3 phiếu khảo sát hợp lệ (form cũ, nhắn lại trên Discord) để đạt ≥20 phiếu hợp lệ
- [ ] Chấm cột **Quỳnh Anh** trong `eval/cham-thu-cp2.md` (chấm riêng); nếu cột Huy đã có thì điền dòng "Kết quả hai người chấm" + chép sang `eval/README.md` mục 3
- [ ] Điền `TV_` (ai hỏi / ai ghi) ở dòng đầu `evidence/interviews/P1.md`, `P2.md`, `P3.md`; điền bảng "Lịch hẹn" cuối `evidence/summary.md` (3 dòng lab coach · chiều 27/11 · đã xong)
- [ ] `evidence/data-mining.md`: ghi rõ script nào là nguồn chính (`data/build_class_stats.py` hay `evidence/count.py`), kiểm hai script ra cùng số
- [ ] **Sáng (trước 08:45):** xuất lại CSV khảo sát → bỏ cột giờ gửi như `evidence/survey/results.csv` (mã `S21…` nối tiếp) → `python evidence/survey/analyze.py` (nếu phiếu mới cần loại thì thêm vào `LOAI` kèm lý do) → cập nhật số ở `evidence/summary.md` mục 1–2 · không có phiếu mới thì giữ 17/20
- [ ] *(nếu Huy đã push `Q13`…)* kiểm nhãn tay câu trả lời thật, ghi tên vào `data/DATA_CARD.md` — không có thì bỏ qua
- [ ] **`spec.md` §1** (người dùng, việc cần làm, pain, bằng chứng — tóm từ `evidence/summary.md`) và **§2** (bảng impact ≥3 hướng: câu hỏi mở cho TA · báo cáo số đúng / sai · trợ giảng câu hỏi ngắn — hướng đã loại, giữ lý do; ghi **điều kiện**: giá trị chỉ có khi đủ câu trả lời, vì 2/3 lab coach đọc hết nhanh do học viên viết ít; số không có nguồn ghi *(tự ước tính)*; số lần / tháng cho persona §8)
- [ ] Gửi Đăng 1–2 dòng "đã đổi gì trong `evidence/` và `spec.md` §1–§2" để ghi §10 · push + merge trước 09:30

## Trần Tuấn Đăng · `spec.md` §0 → web demo → nộp *(một mạch, không chờ ai)*

> Web **không phải phần chấm của CP3** (CP3 chấm bản chạy thử gọi AI thật — Trọng quay video bằng `python run.py`). Web phục vụ **demo CP4 lúc 14:30**: giám khảo gõ câu lạ tại chỗ, 1 câu thường + 1 câu khó. Làm song song vì các phần CP3 khác đã có người ôm trọn.

**Tối nay**
- [ ] `spec.md` §0: luồng hiện tại 3–5 bước (học viên làm bài ôn trắc nghiệm → chỉ thấy đúng / sai → hỏi AI / bạn hoặc bấm qua → TA / lab coach ôn đầu buổi theo slide, không biết trước lớp hiểu sai gì), ảnh chụp từ tài khoản mình (che thông tin)
- [ ] `spec.md` §10: điền "Phân công có tên" (theo file này), "Dùng AI vào việc gì"
- [ ] **Web demo bản 1, chế độ model giả** (chưa có `.env` hoặc `MODEL_PROVIDER=fake` → không tốn quota, không ảnh hưởng ai):
  - `codebase/web.py`: chỉ thư viện chuẩn (`http.server`), chạy `python codebase/web.py` → mở `http://localhost:8000`
  - Gọi thẳng `answer()` trong `agent.py` — **không viết lại logic, không sửa `agent.py`** (Trọng đang sửa); gọi `tracing.begin("web")` / `tracing.end()` như `codebase/app.py`
  - Ô nhập yêu cầu (vd `[Q01] Phân tích câu trả lời của lớp`) + danh sách câu hỏi đang có (`tools.available_questions()`) để bấm nhanh
  - Hiện bản **Nháp**: tách dòng nhóm bằng `tools.GROUP_LINE` (định dạng `check_report` bắt buộc — Trọng sửa gì cũng phải giữ); mỗi nhóm 1 thẻ (tên · `x/N` · câu trích); bấm id `A1…` xem nguyên câu trả lời (`tools.get_answers()`); tách không được thì hiện nguyên văn output
  - Nhãn "Nháp — chờ TA duyệt", **không có nút gửi**; hiện dòng `model: …` để thấy đang chạy model thật hay giả
  - **Không sửa `run.py`** (khung — `AGENTS.md`); thêm 2 dòng cách chạy web vào `README.md`
  - Commit riêng, PR riêng, merge sớm
- [ ] Tạo `.env` theo tin nhắn riêng của Trọng (không commit)

**Sáng (07:00 → 10:00)**
- [ ] `git pull origin main` → thử web với `agent.py` mới của Trọng (sau 08:00), vẫn chế độ model giả
- [ ] **Không gọi model thật 08:15–08:45** (Huy chạy eval). Sau 08:45: thử web bằng model thật với 1 câu thường (`[Q01]`) + 1 câu khó (`[Q12]` câu chèn chỉ dẫn, hoặc `[Q06]` <5 câu) + 1 câu lạ
- [ ] **09:30:** `git pull origin main` → thêm các dòng §10 cho mọi thay đổi sau CP2 (theo tin nhắn Trọng, Huy, Quỳnh Anh + `git log`) → `python run.py check`
- [ ] **09:45:** mở repo + link video (mục "Link nộp") bằng cửa sổ ẩn danh → nộp form CP3 (mã `2A202603618`), khai thật phần chưa xong

**Sau CP3 (10:00 → 14:30) — chuẩn bị demo CP4**
- [ ] *(nếu kịp)* TA chuyển 1 câu sang nhóm khác trên trang (G9 ở §4) — chỉ đổi trên màn hình, không ghi đi đâu
- [ ] Thử lại 1 câu thường + 1 câu khó + 1 câu lạ bằng model thật
- [ ] **Trước 14:00:** quay video demo dự phòng trên bản web (thao tác thật, AI thật), mở thử bằng cửa sổ ẩn danh
- [ ] Ghi 1 dòng §10 cho web
