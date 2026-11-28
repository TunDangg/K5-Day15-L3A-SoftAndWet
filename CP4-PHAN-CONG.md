# Phân công CP4 · nộp 14:30 Thứ Bảy 28/11 · demo 14:30–16:00

> Lát cắt: **Track A · A1**: câu hỏi mở cuối bài pre-class → AI gom câu trả lời của cả lớp thành nhóm cách hiểu cho TA / lab coach trước buổi.
> **Không được sửa:** chuẩn "đạt" (`spec.md` §7), `eval/metric_spec.yaml`, câu thử đã có (chỉ thêm), kết quả `eval/run-1.csv`.
> *(Chia lại 10:25: Quỳnh Anh làm toàn bộ slide; Đăng nhận hồ sơ đánh giá, spec §7–§10, ai-usage, người dùng thử.)* Mỗi người **chỉ sửa vùng của mình** (bảng dưới) → không xung đột, không ai chờ ai. Xong việc nào tick `[x]`, `git pull origin main` → push → merge PR ngay.

## CP4 cần nộp (README → Checkpoint) · ai chịu trách nhiệm

| # | Cần nộp | Hiện tại (10:05) | Ai |
|---|---|---|---|
| 1 | Phòng demo + link repo | Phòng H210 · Zone 4 | Đăng |
| 2 | Tích 7 hạng mục bắt buộc (`01-challenge-brief`) | 1, 3, 4, 5 (một phần) có · 2 có bảng impact · 6, 7 chưa | Đăng tích lúc 14:00 |
| 3 | Kết quả lượt 1 → lượt 2 | Lượt 1: 8/14 (57%) · lượt 2 chưa | **Huy** chạy + chấm · Đăng viết hồ sơ, §7 · Quỳnh Anh slide 5 |
| 4 | Chi phí / task thành công ở kịch bản cơ sở + tên model | Chưa (`personas.yaml` còn số ví dụ) | **Trọng** tính · Đăng viết §8 · Quỳnh Anh slide 6 |
| 5 | `demo-slides.pdf` ở gốc repo + link video demo dự phòng | Chưa | **Quỳnh Anh** (toàn bộ slide + PDF) · **Trọng** (video) |
| 6 | Phần chưa xong (khai thật) | — | Đăng |

## Ai làm gì (cân lại: mỗi người ~4 giờ việc)

| Người | Phần lõi (chỉ người này làm được) | Giao ra |
|---|---|---|
| **Huy** | Chọn nhóm lỗi → sửa prompt → **lượt 2** (22 câu) → chấm `pass` → `eval/report.md` (≥3 lỗi, đã sửa gì, lỗi còn lại) | Số lượt 2 trước 12:00 · `report.md` trước 12:45 |
| **Trọng** | Persona TA + giá → **mô phỏng ≥50 phiên** → `cost/cost-estimate.md` → **quay video dự phòng** | Số chi phí trước 12:15 · `cost-estimate.md` trước 13:00 · video trước 13:00 |
| **Quỳnh Anh** | **Toàn bộ slide 8 trang** (Google Slides) → **xuất `demo-slides.pdf`** | PDF 13:45 |
| **Đăng** | Web → `eval/README.md` (hồ sơ đánh giá) → `spec.md` §7 kết quả, §8, §9, §10 → `docs/ai-usage.md`, `AGENTS.md` → *(bonus)* **người dùng thử** → nộp form | Form CP4 14:15 |

## Vùng sửa của từng người (không ai sửa vùng người khác)

| Người | File được sửa |
|---|---|
| **Huy** | `codebase/agent.py` (chỉ chỗ sửa nhắm nhóm lỗi đã chọn) · `eval/run-2.csv`, `traces/run-2.jsonl`, `eval/report.md`, `eval/benchmark.csv` (chỉ thêm) |
| **Trọng** | `cost/*` |
| **Quỳnh Anh** | `slides/*` · bản Google Slides · `demo-slides.pdf` · `evidence/*` · `spec.md` §1, §2 (nếu cần chỉnh) |
| **Đăng** | `codebase/web.py`, `codebase/web_static/`, `frontend/*` · `README.md` · `eval/README.md` · `validation/log.md` · `docs/ai-usage.md` · `AGENTS.md` (mục "Quy ước của nhóm") · `spec.md` §0, §7 (chỉ dòng kết quả), §8, §9, §10 |
| **Mỗi người** | `reflection/<ten-khong-dau>.md` của chính mình (hạn 23:59) |

- **§10 chỉ Đăng thêm dòng** lúc 14:00. Người khác nhắn Đăng 1–2 dòng "đã đổi gì, vì sao".
- **Slide: Quỳnh Anh làm toàn bộ 8 trang.** Người khác không sửa slide; số liệu cho slide lấy từ các file repo (`eval/README.md`, `eval/report.md`, `cost/cost-estimate.md`) và mục "Số liệu nộp" ở giờ chốt.

## Lịch dùng model thật (tránh lỗi 429 — chỉ một người gọi model trong mỗi khung)

| Giờ | Ai được gọi model thật | Người khác làm gì (không gọi model) |
|---|---|---|
| 10:15–11:30 | **Huy** thử prompt (`eval --try`) rồi chạy **lượt 2** (`eval`, 22 câu) | Trọng điền persona, giá · Đăng làm web (model giả) · Quỳnh Anh làm slide 1–4 |
| 11:30–12:15 | **Trọng** chạy `python run.py simulate` (≥50 phiên) | Huy chấm `pass` · Đăng làm web, `eval/README.md` phần tĩnh |
| 12:15–12:45 | **Trọng** quay video demo dự phòng (web bản trên `main`) | Huy viết `report.md` · Đăng viết `eval/README.md` · Quỳnh Anh chụp màn hình web cho trang 4 |
| 12:45–13:30 | **Đăng** cho 2–3 người dùng thử web | Trọng viết `cost-estimate.md` · Quỳnh Anh làm slide 5–8 |
| 13:45–14:00 | **Đăng** thử lại web lần cuối (`[Q01]` + `[Q12]`) | Mọi người push + merge |

> **Chỉ dùng `python run.py eval --try` khi thử** (ghi ra `run-try.csv`). Chạy `eval` đầy đủ sẽ tạo `run-2.csv` — **chỉ Huy chạy, đúng một lần** cho lượt 2. Lỡ chạy thừa thì không xoá, ghi lý do vào `eval/report.md`.

## Giờ chốt cứng

| Giờ | Chốt | Nếu chưa có |
|---|---|---|
| **11:00** | Huy merge bản sửa prompt lên `main` | Lượt 2 chạy với `agent.py` đang có, ghi "chưa kịp cải tiến" |
| **12:00** | Huy dán số lượt 2 (x/N, theo type) vào "Số liệu nộp" | Đăng / Quỳnh Anh viết với lượt 1, chèn số lượt 2 khi có |
| **12:00** | Đăng merge web chạy ổn lên `main` | Trọng quay video bằng `python run.py`; trang 4 dùng ảnh dòng lệnh |
| **12:15** | Trọng dán chi phí / task thành công (kịch bản cơ sở + model) vào "Số liệu nộp" | Quỳnh Anh / Đăng viết khung trang 6 / §8, chèn số khi có |
| **12:45** | Huy push `eval/report.md` · Đăng xong `eval/README.md` | Lấy "lỗi chính" từ report lượt 1 |
| **13:00** | Trọng push `cost/cost-estimate.md` + dán link video | Đăng khai "video đang upload" |
| **13:40** | Mọi trang slide xong | Trang thiếu ghi "đang hoàn thiện" |
| **13:45** | Quỳnh Anh xuất `demo-slides.pdf` vào gốc repo, push | Đăng xuất PDF từ bản Google Slides hiện có |
| **14:00** | Mọi người push + merge · Đăng ghi §10, `python run.py check` | Phần chưa merge không tính, khai thật |
| **14:15** | Đăng nộp form CP4 | — |

## Số liệu nộp (ai có thì điền thẳng vào đây)

- Lượt 1: run-1@20261128-005348 · 8/14 (57%) · gemini-3.5-flash-lite
- Lượt 2 (Huy): run-2@20261128-104820 · gemini-3.5-flash-lite · **18/22 (82%)** · thuong 3/5 · kho 8/10 · tu_choi 7/7 · **chỉ 14 câu cũ: 10/14 (71%)**, lượt 1 là 8/14 (57%) · *(pass Huy xác nhận 28/11)*
- Chi phí / task thành công, kịch bản cơ sở + model (Trọng): **$0,0017 ≈ 44 ₫** (`gemini-3.5-flash-lite`) · $0,0032 ≈ 81 ₫ (`gemini-3.8-flash`) · cơ sở 30 TA: $0,60 / tháng ≈ 512 ₫ / TA / tháng *(chép từ `cost/cost-estimate.md`)*
- Bảng 3 kịch bản × 2 model (Trọng): xem `cost/cost-estimate.md`
- Link video demo dự phòng (Trọng): __
- `demo-slides.pdf` (Quỳnh Anh): https://github.com/TunDangg/K5-Day15-L3A-SoftAndWet/blob/main/demo-slides.pdf

## Nguyễn Văn Huy · lượt 2 *(một mạch: đọc lỗi → sửa → chạy → chấm → báo cáo)*

- [x] Từ `eval/report.md` (lượt 1), chọn **một nhóm lỗi đau nhất với TA** *(chọn nhóm A: tách nhóm, ghi ở `report.md` mục 3)*. Ứng viên: tách một kiểu hiểu sai thành nhiều nhóm (B01, B03, B04, B05) · tạo nhóm hiểu sai khi cả lớp đúng (B08)
- [x] Sửa `SYSTEM` prompt (và nếu cần chỗ nhỏ trong `agent.py`) **nhắm đúng nhóm lỗi đó**; kèm 3 chỗ còn treo từ CP3 nếu chưa ai làm: bỏ ngoặc kép trong `ghi_chu` · câu từ chối cố định khi bị đòi chấm điểm · `loai` lạ → `chua_xep`. **Không** chép ví dụ trong bộ câu thử vào prompt
- [x] Thử bằng `python run.py eval --try` → merge **trước 11:00** *(PR #16 merge 10:57)*
- [x] **11:00–11:30:** `python run.py eval` (đủ 22 câu) → `eval/run-2.csv` + `traces/run-2.jsonl`
- [x] Chấm cột `pass` theo `metric_spec.yaml` (quy ước "câu trích" ở `eval/report.md` mục 0) → `python run.py score eval/run-2.csv` → **dán x/N + theo type vào "Số liệu nộp" trước 12:00**
- [x] `eval/report.md` **trước 12:45**: bảng lượt 1 và lượt 2 so với chuẩn "đạt" · **≥3 lỗi** (input · output · vì sao sai) · đã sửa gì · lỗi còn lại · ghi rõ lượt 1 chạy 14 câu, lượt 2 chạy 22 câu
- [x] Nhắn Đăng dòng §10 · push + merge *(§10 đã có dòng của Huy, commit `2187542`)*

## Nguyễn Đức Trọng · chi phí + video *(một mạch: persona → mô phỏng → bảng → video)*

- [ ] **Trước 11:30 (không gọi model):** `cost/personas.yaml` — xoá mọi số "(ví dụ)":
  - Persona là **TA / lab coach**, ≥3 kiểu: dùng ít · vừa · nhiều — số lần / tháng từ phỏng vấn (P2: chuẩn bị đầu buổi nhiều buổi / tháng, 10–30 phút) hoặc lịch khoá; thiếu thì *(tự ước tính)*
  - `users` 3 kịch bản ở quy mô thật (số TA / lab coach của khoá) — có nguồn hoặc *(tự ước tính)*; **không** dùng `data/training-ops/` làm nguồn (giả lập)
  - `prices` ≥2 mức model từ `further-reading/model-prices.md` (ngày xem 25/11/2026): `gemini-3.5-flash-lite` 0,30 / 2,50 USD mỗi 1 triệu token vào / ra (đang dùng) + một model mạnh hơn (vd `gemini-3.8-flash` 0,75 / 3,75)
  - Đầu vào mô phỏng: `types: [thuong, kho]` hoặc `inputs:` các câu `[Qxx] Phân tích câu trả lời của lớp`
- [ ] **11:30–12:15:** `python run.py simulate` (≥50 phiên) → `cost/simulate-N.csv` → **dán chi phí / task thành công (kịch bản cơ sở + model) vào "Số liệu nộp" trước 12:15** (chưa có lượt 2 thì dùng lượt 1, ghi rõ)
- [ ] **12:15–12:45: quay video demo dự phòng** — `git pull origin main` → `python codebase/web.py` (12:00 chưa có web trên `main` thì dùng `python run.py`). Thao tác thật, AI thật, **thấy rõ tên model**: `[Q01]` → `[Q12]` → `[Q06]` → TA chỉnh nhóm → nhãn "Nháp — chờ TA duyệt" → YouTube "Không công khai" / Drive → mở bằng tab ẩn danh
- [ ] **Trước 13:00:** `cost/cost-estimate.md` (chi phí / phiên · **chi phí / task thành công = chi phí trung bình / phiên ÷ tỉ lệ đạt lượt 2** · bảng 3 kịch bản × 2 model · so với impact / người / tháng ở `spec.md` §2 → 1 dòng kết luận · ghi chú: bộ câu trả lời hiện 5–8 câu / câu hỏi, quy mô thật nhiều hơn → token cao hơn) + dán link video vào "Số liệu nộp"
- [ ] Nhắn Đăng dòng §10 · push + merge

## Phạm Quỳnh Anh · toàn bộ slide *(một mạch: khung → trang 1–4 → trang 5–8 → PDF)*

**10:30–12:45 (không cần ai)**
- [x] **10:30:** tạo bản Google Slides 8 trang theo `slides/outline.md` / guide 5.1. Mỗi trang ≥1 con số / trích dẫn có nguồn / kết quả đo *(đã hoàn thiện `slides/deck.html` giao diện 16:9 sẵn sàng in PDF + `slides/outline.md` đồng bộ)*
- [x] Trang 1 "Người dùng & pain": số từ `evidence/summary.md` (data 399/1.968 sai lần đầu · khảo sát 3/17 nói ôn đầu buổi trúng đúng chỗ hiểu nhầm · 3/3 lab coach không biết trước lớp hiểu sai gì) + 1 trích dẫn (vd khảo sát S07)
- [x] Trang 2 "Vì sao chọn bài này": bảng impact rút gọn từ `spec.md` §2 + hướng bị loại (trợ giảng câu hỏi ngắn, báo cáo số đúng / sai)
- [x] Trang 3 "Giải pháp": lát cắt một câu · sơ đồ `spec.md` §4 · AI tự làm đến đâu, vì sao (AI soạn nháp, TA duyệt; code đếm số và kiểm câu trích)
- [x] Trang 4 "Demo live": 1 câu thường `[Q01]` + 1 câu khó `[Q12]` (câu chèn chỉ dẫn) / `[Q06]` (<5 câu) — đã nhúng trực tiếp preview output thật `B01` từ `run-2@20261128-104820` (chờ chèn thêm link video lúc 13:00)
- [x] **Viết khung** trang 5–8 (tiêu đề + chỗ để số), để chèn số ở giờ chốt

**12:00–13:40 (nhận số ở giờ chốt)**
- [x] **12:45:** trang 5 "Đánh giá thế nào" — từ `eval/README.md` (Đăng) + `eval/report.md` (Huy): dataset · 22 câu (8/22 nguồn thật) · metric · lượt 1 → lượt 2 so với chuẩn "đạt" (`18/22 = 82%` và `10/14 = 71%` trên 14 câu gốc) · lỗi chính · giới hạn (data thật đều "hiểu đúng")
- [ ] **13:00:** trang 6 "Chi phí khi dùng thật" — từ `cost/cost-estimate.md` (Trọng): chi phí / task thành công · 3 kịch bản · so với impact
- [ ] Trang 7 "Kết luận" go / iterate / stop dẫn số trang 1, 5, 6 (gợi ý: có điều kiện — "giá trị chỉ có khi đủ câu trả lời; 2/3 lab coach đọc hết nhanh vì học viên viết ít") · trang 8 "Nếu có thêm 1 tuần" (2–3 việc trỏ về lỗi còn lại / kết quả người dùng thử ở `validation/log.md`)
- [ ] **13:40** slide xong · `slides/outline.md` chép tóm tắt 8 trang (bản chữ trong repo)
- [ ] **13:45:** xuất PDF → `demo-slides.pdf` ở **gốc repo** → push + merge → nhắn Đăng
- [ ] *(nếu có phiếu khảo sát mới)* chạy lại `evidence/survey/analyze.py`, cập nhật `summary.md`
- [ ] Nhắn Đăng dòng §10

## Trần Tuấn Đăng · web → hồ sơ đánh giá → spec → người dùng thử → nộp *(một mạch)*

**10:15–12:00 (không cần ai)**
- [x] Hoàn thiện web (model giả): chạy được 1 câu thường + 1 câu khó + câu lạ không chết; `README.md` ghi cách chạy web → **merge lên `main` trước 12:00**
- [x] `eval/README.md` phần tĩnh (hồ sơ đánh giá một trang): mục 1 dataset (`open_answers.json` Q01–Q12 synthetic + Q13–Q14 thật) · mục 2 bộ câu thử **22 câu** (thuong 5 · kho 10 · tu_choi 7 · 8/22 nguồn người dùng), lưới input, câu kho / tu_choi theo 4 lớp · mục 3 metric + kết quả chấm thử · mục 4 lệnh
- [x] *(Đăng xong phần mình + khung; Trọng, Huy, Quỳnh Anh tự điền dòng `__ (… điền)`)* `docs/ai-usage.md`: điền bảng (AI làm gì · ai kiểm · ai phụ trách) — mỗi người nhắn 1 dòng phần mình; `AGENTS.md` mục "Quy ước của nhóm" (3 dòng còn `__`)
- [x] `spec.md` §9 Rủi ro & an toàn (đã ẩn danh gì · không thu gì · AI không được làm gì kể cả khi bị yêu cầu · ai có thể bị hại và chặn thế nào — từ §4 "chỗ chặn rủi ro")

**12:00–13:40 (nhận số ở giờ chốt, trước đó vẫn có việc)**
- [x] **12:00:** lấy số lượt 2 từ "Số liệu nộp" → `eval/README.md` mục 5 (bảng các lượt) · `spec.md` §7 dòng kết quả (**không đụng dòng chuẩn "đạt"**)
- [x] **12:45:** lấy "lỗi chính" từ `eval/report.md` → `eval/README.md` mục 6 → nhắn Quỳnh Anh "hồ sơ đánh giá xong" (cho trang 5)
- [ ] *(Bonus)* **12:45–13:30 người dùng thử** (model thật, web trên `main`): 2–3 người ngoài nhóm đúng vai (ưu tiên TA / lab coach, hoặc học viên đóng vai TA), 10 phút / người, 5 nhịp guide 4.3: làm quen → bối cảnh ("lần gần nhất chuẩn bị đầu buổi…") → giao việc theo kết quả ("dùng cái này để biết lớp hiểu sai gì ở Q01") → **im lặng quan sát** → hỏi sau (khó hiểu nhất? có tin kết quả không? "mai không được dùng nữa: rất tiếc / hơi tiếc / không sao?")
  - `validation/log.md`: mỗi người 1 dòng (vai · việc giao · quan sát · trích nguyên văn · mức nghiêm trọng) + 4 dòng tổng hợp · ghi **ngay trong lúc quan sát** · nhắn Quỳnh Anh 1–2 ý cho trang 8
- [x] **13:00 → 13:40:** từ `cost/cost-estimate.md` → `spec.md` §8 (persona · chi phí / task thành công · 3 kịch bản · so với impact)

**13:45 → 14:30**
- [ ] **13:45–14:00 (model thật):** thử lại web `[Q01]` + `[Q12]` để chắc demo chạy
- [ ] **14:00:** `git pull origin main` → ghi các dòng §10 (theo tin nhắn + `git log`) → `python run.py check` → mở repo, `demo-slides.pdf`, video bằng tab ẩn danh
- [ ] **14:15:** nộp form CP4 (mã `2A202603618`): phòng H210 · Zone 4 + link repo · tích 7 hạng mục · lượt 1 → lượt 2 · chi phí / task thành công + model · link `demo-slides.pdf` + video · phần chưa xong
- [ ] Demo 2 phút: pain (15s) → `[Q01]` (40s) → `[Q12]` (30s) → câu lạ giám khảo (20s) → TA chỉnh nhóm, "AI không gửi đi đâu" (15s)

## Sau CP4 (đến 23:59)

- [ ] Mỗi người 1 file `reflection/<ten-khong-dau>.md` theo `reflection/TEMPLATE.md` — thiếu thì phần có tên mình 0 điểm
- [ ] Sửa theo góp ý demo → ghi `spec.md` §10 bảng "Sau CP4" (không sửa chuẩn "đạt", câu thử, số bằng chứng, kết quả các lượt đã chạy)
