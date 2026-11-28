// Đọc thử file trước khi import — CHỈ để xem trước. Backend (web_store.py) mới là nơi kiểm thật và quyết định.
import { fold } from "./draft";

export const TEXT_COLS = ["text", "answer", "cau_tra_loi", "tra_loi", "noi_dung", "response", "cau_tl"];
export const QUESTION_COLS = ["cau_hoi", "question", "de_bai", "cau_hoi_mo"];
export const KC_COLS = ["kc_code", "kc"];

export const normHeader = (h: string) => fold(h).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

/** CSV có ngoặc kép, xuống dòng trong ô; tự đoán dấu phân cách , ; hoặc tab theo dòng đầu. */
export function parseCSV(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const first = src.split(/\r?\n/, 1)[0] ?? "";
  const counts = [",", ";", "\t"].map((d) => [d, first.split(d).length] as const).sort((a, b) => b[1] - a[1]);
  const delim = counts[0][1] > 1 ? counts[0][0] : ",";
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

export interface Preview {
  format: "csv" | "json";
  headers: string[];
  rows: string[][];
  textCol: number | null;
  questionCol: number | null;
  kcCol: number | null;
  dropped: string[];
  questions: { cau_hoi: string; count: number; blank: number }[];
  total: number;
  problems: string[];
}

export function previewCSV(text: string, fallbackQuestion: string): Preview {
  const all = parseCSV(text);
  const problems: string[] = [];
  if (all.length < 2) problems.push("CSV cần một dòng tiêu đề và ít nhất một dòng câu trả lời.");
  const headers = all[0] ?? [];
  const norm = headers.map(normHeader);
  const find = (names: string[]) => { const i = norm.findIndex((h) => names.includes(h)); return i < 0 ? null : i; };
  const textCol = find(TEXT_COLS), questionCol = find(QUESTION_COLS), kcCol = find(KC_COLS);
  if (textCol === null) problems.push(`Thiếu cột câu trả lời — đặt tên cột là một trong: ${TEXT_COLS.join(", ")}.`);
  const dropped = headers.filter((h, i) => h.trim() && i !== textCol && i !== questionCol && i !== kcCol);
  const rows = all.slice(1);
  const qmap = new Map<string, { count: number; blank: number }>();
  rows.forEach((r) => {
    const q = (questionCol !== null ? (r[questionCol] ?? "").trim() : "") || fallbackQuestion.trim();
    const key = q || "(chưa có câu hỏi)";
    const e = qmap.get(key) ?? { count: 0, blank: 0 };
    e.count++;
    if (textCol !== null && !(r[textCol] ?? "").trim()) e.blank++;
    qmap.set(key, e);
  });
  if (questionCol === null && !fallbackQuestion.trim() && rows.length) problems.push("File không có cột câu hỏi — điền ô “Câu hỏi” bên dưới.");
  return { format: "csv", headers, rows, textCol, questionCol, kcCol, dropped,
    questions: [...qmap].map(([cau_hoi, v]) => ({ cau_hoi, ...v })), total: rows.length, problems };
}

export function previewJSON(text: string, fallbackQuestion: string): Preview {
  const problems: string[] = [];
  let obj: unknown;
  try { obj = JSON.parse(text); } catch (e) {
    return { format: "json", headers: [], rows: [], textCol: null, questionCol: null, kcCol: null, dropped: [], questions: [], total: 0,
      problems: ["JSON không hợp lệ: " + (e as Error).message] };
  }
  type Item = { cau_hoi?: unknown; question?: unknown; cau_tra_loi?: unknown; answers?: unknown };
  let items: Item[] = [];
  const o = obj as Record<string, unknown>;
  if (o && typeof o === "object" && !Array.isArray(o) && o.cau_hoi && typeof o.cau_hoi === "object") items = Object.values(o.cau_hoi as object) as Item[];
  else if (o && !Array.isArray(o) && Array.isArray(o.questions)) items = o.questions as Item[];
  else if (Array.isArray(obj) && obj.every((x) => typeof x === "string")) items = [{ cau_hoi: fallbackQuestion, cau_tra_loi: obj }];
  else if (Array.isArray(obj)) items = obj as Item[];
  else if (o && typeof o === "object") items = [o as Item];
  const rows: string[][] = [];
  const questions = items.map((it, i) => {
    const raw = (it.cau_tra_loi ?? it.answers) as unknown;
    const q = String(it.cau_hoi ?? it.question ?? fallbackQuestion ?? "").trim() || "(chưa có câu hỏi)";
    if (!Array.isArray(raw)) { problems.push(`Mục ${i + 1}: thiếu danh sách "cau_tra_loi".`); return { cau_hoi: q, count: 0, blank: 0 }; }
    let blank = 0;
    raw.forEach((a) => {
      const t = typeof a === "object" && a ? String((a as { text?: unknown }).text ?? "") : String(a ?? "");
      if (!t.trim()) blank++;
      rows.push([q, t]);
    });
    return { cau_hoi: q, count: raw.length, blank };
  });
  if (questions.some((q) => q.cau_hoi === "(chưa có câu hỏi)")) problems.push("Có mục chưa có câu hỏi — điền ô “Câu hỏi” bên dưới.");
  return { format: "json", headers: ["cau_hoi", "cau_tra_loi"], rows, textCol: 1, questionCol: 0, kcCol: null, dropped: [],
    questions, total: rows.length, problems };
}

export const SAMPLE_CSV =
  "cau_hoi,cau_tra_loi\n" +
  '"Vì sao cần đặt guardrail cho chatbot hỗ trợ học viên?","Để chặn câu trả lời sai lệch hoặc nguy hiểm trước khi tới người dùng"\n' +
  '"Vì sao cần đặt guardrail cho chatbot hỗ trợ học viên?","guardrail là để model trả lời nhanh hơn"\n' +
  '"Vì sao cần đặt guardrail cho chatbot hỗ trợ học viên?","giới hạn phạm vi: chỉ trả lời trong nội dung khoá học, từ chối việc ngoài phạm vi"\n' +
  '"Vì sao cần đặt guardrail cho chatbot hỗ trợ học viên?","em chưa xem bài này"\n' +
  '"Vì sao cần đặt guardrail cho chatbot hỗ trợ học viên?","để tiết kiệm token"\n' +
  '"Vì sao cần đặt guardrail cho chatbot hỗ trợ học viên?","kiểm tra đầu vào và đầu ra, ví dụ lọc thông tin cá nhân"\n' +
  '"Vì sao cần đặt guardrail cho chatbot hỗ trợ học viên?",""\n';
