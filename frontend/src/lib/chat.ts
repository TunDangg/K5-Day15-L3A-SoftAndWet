// Phiên hội thoại tab "Phân tích TA": mỗi lượt = 1 lần gọi POST /api/analyze (hợp đồng API không đổi).
// Lưu localStorage để đổi tab / F5 không mất lịch sử. Chỉ nằm trên trình duyệt của TA, không gửi đi đâu.
import { normAnalyze, type AnalyzeResp, type ErrorInfo } from "./api";
import type { TurnEdits } from "../components/ReportView";

export interface Turn {
  id: string;
  text: string;                  // yêu cầu TA đã gửi
  at: number;                    // thời điểm gửi (ms)
  status: "done" | "error" | "cancelled";
  data?: AnalyzeResp;            // phản hồi (cả khi lỗi 502 có trace)
  err?: ErrorInfo;
  soft?: boolean;
  edits?: TurnEdits;             // đổi tên nhóm / chuyển câu / bản nháp sửa tay — riêng từng lượt
  collapsed?: boolean;
}

const KEY = "ta-chat-v1";
const MAX_TURNS = 30;

export const newId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function loadTurns(): Turn[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((t) => t && typeof t.id === "string" && typeof t.text === "string").map((t) => ({
      id: t.id, text: t.text, at: typeof t.at === "number" ? t.at : Date.now(),
      status: t.status === "error" || t.status === "cancelled" ? t.status : "done",
      data: t.data ? normAnalyze(t.data) : undefined,            // dữ liệu cũ / hỏng đi qua chuẩn hoá như dữ liệu API
      err: t.err && typeof t.err.title === "string" ? t.err : undefined,
      soft: !!t.soft, edits: t.edits && Array.isArray(t.edits.groups) ? t.edits : undefined, collapsed: !!t.collapsed,
    })).slice(-MAX_TURNS);
  } catch {
    return [];
  }
}

export function saveTurns(turns: Turn[]) {
  let keep = turns.slice(-MAX_TURNS);
  while (keep.length) {
    try {
      localStorage.setItem(KEY, JSON.stringify(keep));
      return;
    } catch {
      keep = keep.slice(Math.ceil(keep.length / 4));          // đầy bộ nhớ → bỏ bớt lượt cũ nhất rồi thử lại
    }
  }
  try { localStorage.removeItem(KEY); } catch { /* trình duyệt chặn storage: chỉ giữ trong phiên */ }
}

export const timeHM = (ms: number) => new Date(ms).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
