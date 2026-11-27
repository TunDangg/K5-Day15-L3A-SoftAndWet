# Đào data — cách đếm và kết quả

> Điền ở guide bước 1.2. Ôn lại: ngày 2, ngày 6 · lab ngày 2, lab ngày 6.
> Không đào data thì xoá file này. Script / công thức đếm để trong repo (vd `evidence/count.py` hoặc ghi công thức Sheets ngay dưới), người khác chạy lại phải ra cùng số.
> Repo chỉ chứa số đã tổng hợp và vài dòng ví dụ — không chép lại nguyên file data.

## 1. Cách đếm — viết TRƯỚC khi chạy

- **Data dùng:** `data/preclass/answers.csv` và `data/preclass/chat.csv` (nhật ký thật đã ẩn danh do BTC cấp, từ 05/11 đến 25/11/2026; không commit file gốc, chỉ commit số đã tổng hợp tại `data/class_stats.json`).
- **Đếm gì · trên tập nào · lọc gì:**
  1. **Bài ôn cuối ngày:** lọc `answers.csv` với `nguon = pre_post_post`, `lan_thu = 1`, `was_correct ∈ {True, False}`; gán ngày học (`Day01–Day13`) từ `lesson_id` (`program-dayNN:...`); đếm số học viên (`hv`), tổng lượt, tổng lượt sai và số lượt / số sai theo từng ý kiến thức (`kc_code`).
  2. **Câu hỏi dưới video:** lọc `chat.csv` với `channel = video_question`, gán ngày từ cột `transcript` (`DayNN/...`); đếm tổng số câu, câu ngắn `do_dai_cau_hoi <= 20`, và nối với `answers.csv` (`nguon = chat`, `trang_thai_cham = da_cham`, `ref = chat.id`, `rubric_bam_bai != ""`) để đếm câu `rubric_bam_bai = 0` (không bám bài).
  3. **Ngưỡng báo cáo theo ý kiến thức:** chỉ xếp hạng các ngày có `≥ 5` học viên làm bài ôn và các ý kiến thức có `≥ 10` lượt trả lời.
- **Mẫu số là gì:**
  - Tỉ lệ sai bài ôn chung: `N = 1.968` lượt trả lời lần đầu hợp lệ (`pre_post_post`, `lan_thu = 1`).
  - Tỉ lệ sai từng ý kiến thức: `N = so_luot` của đúng `kc_code` đó trong ngày (chỉ xét ý có `N ≥ 10`).
  - Tỉ lệ câu hỏi ngắn dưới video: `N = 1.108` câu `channel = video_question`.
  - Tỉ lệ câu hỏi không bám bài: `N = 1.075` câu `video_question` đã được chấm (`trang_thai_cham = da_cham`).
  - Tỉ lệ ngày dữ liệu ít: `N = 13` ngày học (`Day01–Day13`).
- **Script / công thức:** `python data/build_class_stats.py <đường-dẫn-tới>/data/preclass` → sinh `data/class_stats.json`.

## 2. Đọc trước, đếm sau

Đã đọc cấu trúc cột của `answers.csv` và `chat.csv` trên 13 ngày học (`Day01–Day13`) khi tổng hợp `data/class_stats.json`. Các *kiểu* hành vi thấy được:
- Ở các ngày có đủ học viên làm bài ôn (`Day01–Day08`, 8–41 học viên/ngày), mỗi ngày đều nổi lên 1–2 ý kiến thức có tỉ lệ sai cao vượt trội so với mặt bằng chung ~20% của cả bài.
- Từ `Day09–Day13`, số học viên làm bài ôn giảm mạnh xuống còn `2–4` người/ngày — nếu không chặn ngưỡng tối thiểu, tỉ lệ sai theo từng ý dễ gây hiểu nhầm và có nguy cơ suy ngược ra cá nhân.
- Câu hỏi dưới video (`1.108` câu) phân tán ở 4–7 video mỗi ngày, gồm cả câu rất ngắn (`≤ 20` ký tự) và câu không bám bài (`rubric_bam_bai = 0`).

## 3. Kết quả

| Đếm gì | x / N | % | Ghi chú |
|---|---|---|---|
| Tổng lượt sai lần đầu bài ôn cuối ngày (`Day01–Day13`) | `399 / 1.968` | `20,3%` | `pre_post_post`, `lan_thu = 1` |
| Số ngày đủ ý `≥ 10` lượt có ít nhất 1 ý sai `≥ 34%` | `7 / 7` | `100,0%` | `Day01–Day05`, `Day07`, `Day08` |
| Số ngày dữ liệu quá ít (`< 5` học viên làm bài ôn) | `5 / 13` | `38,5%` | `Day09–Day13` (`2–4` học viên/ngày) |
| Số ngày không đủ điều kiện xếp hạng theo ý (`< 5` HV hoặc mọi ý `< 10` lượt) | `6 / 13` | `46,2%` | `Day06` (`8` HV nhưng mọi ý `< 10` lượt) và `Day09–Day13` |
| Câu hỏi dưới video dài `≤ 20` ký tự | `183 / 1.108` | `16,5%` | `channel = video_question` |
| Câu hỏi dưới video đã chấm nhưng không bám bài (`rubric_bam_bai = 0`) | `244 / 1.075` | `22,7%` | `nguon = chat`, `trang_thai_cham = da_cham` |

**Top 1 ý kiến thức sai cao nhất tại 7 ngày đủ dữ liệu (`≥ 5` học viên, ý `≥ 10` lượt):**

| Ngày | Học viên | Chung cả ngày | Ý sai nhiều nhất (top-1) | Sai / lượt (%) |
|---|---|---|---|---|
| `Day01` | 41 | `71/439` (`16,2%`) | `chatbot_is_app_around_model` | `16/41` (`39,0%`) |
| `Day02` | 25 | `43/263` (`16,3%`) | `complete_ai_problem_statement` · `select_rule_workflow_agent_level` | `8/23` (`34,8%`) |
| `Day03` | 24 | `52/230` (`22,6%`) | `agentic_fit_scoring_decision` | `12/20` (`60,0%`) |
| `Day04` | 27 | `50/316` (`15,8%`) | `cot_task_fit` | `11/27` (`40,7%`) |
| `Day05` | 15 | `55/180` (`30,6%`) | `ai_product_canvas` | `12/15` (`80,0%`) |
| `Day07` | 11 | `26/123` (`21,1%`) | `tool_definition_context_cost` | `6/10` (`60,0%`) |
| `Day08` | 14 | `20/137` (`14,6%`) | `multi_agent_token_cost` | `4/10` (`40,0%`) |

## 4. ≥5 ví dụ cụ thể (mã dòng / mã đã ẩn danh, không đoán ai là ai)

1. **`Day05 · ai_product_canvas` (`data/class_stats.json`):** `12/15` lượt sai lần đầu (`80,0%`), trong khi trung bình cả ngày Day05 là `55/180` (`30,6%`, 15 học viên).
2. **`Day03 · agentic_fit_scoring_decision` (`data/class_stats.json`):** `12/20` (`60,0%`) và `react_reasoning_acting_pattern`: `9/18` (`50,0%`), cao hơn hẳn mức trung bình Day03 là `52/230` (`22,6%`, 24 học viên).
3. **`Day07 · tool_definition_context_cost` (`data/class_stats.json`):** `6/10` (`60,0%`) và `skill_progressive_disclosure`: `5/10` (`50,0%`), so với trung bình Day07 là `26/123` (`21,1%`, 11 học viên).
4. **`Day04 · cot_task_fit` (`data/class_stats.json`):** `11/27` (`40,7%`) và `system_prompt_contract`: `9/27` (`33,3%`), so với trung bình Day04 là `50/316` (`15,8%`, 27 học viên).
5. **`Day01 · chatbot_is_app_around_model` (`data/class_stats.json`):** `16/41` (`39,0%`), gấp hơn 2,4 lần mức trung bình Day01 là `71/439` (`16,2%`, 41 học viên).
6. **`Day06` (bẫy không đủ lượt/ý, `data/class_stats.json`):** Có `8` học viên với `41/93` lượt sai (`44,1%`), nhưng mọi ý kiến thức đều chỉ có `7–8` lượt (`< 10`) → không đủ mẫu để xếp hạng theo từng ý.
7. **`Day13` (bẫy ít người, `data/class_stats.json`):** Chỉ có `2` học viên làm bài ôn (`10/19` lượt sai, `52,6%`) → nếu không chặn ngưỡng `< 5` học viên, báo cáo dễ kết luận nhầm là "lớp kẹt nặng" và dễ suy ngược ra cá nhân.

## 5. Giới hạn của data

- Dữ liệu `answers.csv` và `chat.csv` **không phân tách L3A / L3B**, và chỉ ghi nhận những học viên có làm bài ôn (`Day09–Day13` chỉ có 2–4 học viên/ngày).
- Data cho biết **lớp sai ở đâu**, nhưng **không cho biết TA / lab coach có thực sự thiếu thông tin này trước buổi học hay không**, họ đang tốn bao nhiêu thời gian chuẩn bị đầu buổi, và vì sao học viên sai.
- **→ Kiểm lại bằng phỏng vấn:** phỏng vấn ≥3 TA / lab coach tại lớp (`evidence/interviews/P1.md`–`P3.md`) về lần gần nhất chuẩn bị đầu buổi học.
