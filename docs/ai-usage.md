# Khai báo dùng AI

README của nhóm có mục "Dùng AI vào việc gì" (2–3 dòng, bắt buộc). Ghi chi tiết vào bảng dưới đây.

> Luật của đề: dùng AI để làm bài thoải mái, nhưng **ai không giải thích được phần có tên mình thì phần đó nhận 0 điểm**. Khai thiếu không bị trừ; giấu mới bị.

| Việc | Công cụ AI | AI làm gì | Người kiểm/sửa gì | Ai phụ trách |
|---|---|---|---|---|
| Code bản chạy thử — luồng `agent.py`, `tools.py`, `ai.py` | __ *(Trọng điền)* | __ | __ | Nguyễn Đức Trọng |
| Code web demo — `codebase/web.py`, `web_store.py`, `frontend/`, `tests/`, `Dockerfile` | Claude Code | Soạn nháp backend API, giao diện React, 35 test, phân loại lỗi model (429 / 503 / timeout) | Đăng đọc diff, chạy 35 test + gọi thử `[Q01]`, `[Q12]`, `[Q06]`, câu lạ bằng model giả; web chỉ gọi `answer()`, không sửa `agent.py` | Trần Tuấn Đăng |
| Prompt / thiết kế lời gọi mô hình | __ *(Trọng, Huy điền)* | __ | Kiểm bằng bộ câu thử: lượt 1 8/14, lượt 2 __ | Nguyễn Đức Trọng (CP3) · Nguyễn Văn Huy (lượt 2) |
| Đào data (viết script đếm, gợi ý nhãn) | __ *(Quỳnh Anh điền)* | __ | Kiểm tay __ dòng, khớp __ | Phạm Quỳnh Anh |
| Rà câu hỏi phỏng vấn / khảo sát | __ *(Quỳnh Anh điền)* | Chỉ rà câu dẫn dắt | __ | Phạm Quỳnh Anh |
| Viết câu thử (benchmark) | __ *(Huy, Quỳnh Anh điền)* | __ | Mỗi câu thử có `source`; câu thử AI viết được ghi rõ. Quỳnh Anh duyệt 14 câu B01–B14; B15–B22 dựng từ câu trả lời thật Q13–Q14 | Phạm Quỳnh Anh · Nguyễn Văn Huy |
| Sinh data `synthetic` (Q01–Q09, Q12 trong `data/open_answers.json`) | __ *(người viết điền)* | __ | Quỳnh Anh rà 63/63 nhãn tay (19:15 27/11) | __ |
| Chấm cột `pass` bằng LLM (nếu có) | Không dùng | — | Cột `pass` do người chấm theo `metric_spec.yaml`. Riêng chấm thử CP2: Claude soạn **đáp án tham chiếu** (áp dụng định nghĩa metric, kiểm câu trích bằng code) — không thay người chấm; Huy + Quỳnh Anh chấm độc lập khớp 5/5 (`eval/cham-thu-cp2.md`) | Nguyễn Văn Huy |
| Văn bản `spec.md`, file phân công, `eval/README.md`, `AGENTS.md` | Claude Code | Rà và soạn nháp các mục, gom số từ `evidence/`, `data/`, `eval/` | Đăng đọc lại, sửa, chịu trách nhiệm từng dòng; số chỉ chép từ file nguồn, không để AI tạo số hay trích dẫn | Trần Tuấn Đăng |
| Slide | __ *(Quỳnh Anh điền)* | __ | Số trên slide lấy từ `eval/README.md`, `eval/report.md`, `cost/cost-estimate.md` | Phạm Quỳnh Anh |
| Mô phỏng chi phí, video demo | __ *(Trọng điền)* | __ | Số chi phí do `python run.py simulate` tính, không điền tay | Nguyễn Đức Trọng |

**Không dùng AI để:** tạo người được phỏng vấn, trích dẫn, câu trả lời khảo sát; sửa kết quả các lượt đã chạy (`eval/run-*.csv`, `cost/simulate-*.csv`, `traces/`).
