import type { Group, Kind, ParsedReport } from "./api";

export const KIND_LABEL: Record<Kind, string> = {
  dung: "Hiểu đúng", sai: "Hiểu sai", bo_trong: "Bỏ trống / không biết", lac_de: "Lạc đề", chua_xep: "Chưa xếp", khac: "Nhóm",
};
export const RANK_PREFIX = "Không chấm điểm hay xếp hạng";
export const DISCORD_LIMIT = 2000;

/** Nhóm đang chỉnh trên màn hình (G9). aiIds = id gốc AI xếp, để đánh dấu câu TA chuyển vào. */
export interface EditGroup {
  key: string; kind: Kind; label: string; name: string; desc: string; quote: string; ids: string[]; aiIds: string[];
}

export const toEditGroups = (groups: Group[]): EditGroup[] =>
  groups.map((g, i) => ({ key: "g" + i, kind: g.kind, label: g.label, name: g.name, desc: g.desc, quote: g.quote,
    ids: [...g.ids], aiIds: [...g.ids] }));

export const idNum = (a: string) => parseInt(a.replace(/\D/g, ""), 10) || 0;
export const squash = (t: string | undefined) => (t ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
export const fold = (s: string | null | undefined) =>
  (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

/** Câu trích còn thuộc nhóm không (TA có thể đã chuyển câu nguồn đi). Chưa tải nguyên văn thì coi như còn. */
export function quoteHere(g: EditGroup, answers: Record<string, string> | null): boolean {
  const q = squash(g.quote);
  if (!q) return false;
  if (!answers) return true;
  return g.ids.some((a) => squash(answers[a]).includes(q));
}

export function fullName(g: EditGroup): string {
  const lab = KIND_LABEL[g.kind] || g.label || "Nhóm";
  return g.name.toLowerCase().startsWith(lab.toLowerCase()) ? g.name : `${lab}: ${g.name}`;
}

export const isEdited = (groups: EditGroup[], original: EditGroup[]) => JSON.stringify(groups) !== JSON.stringify(original);
export function cardEdited(g: EditGroup, original: EditGroup[]) {
  const o = original.find((x) => x.key === g.key);
  return !o || o.name !== g.name || o.ids.join() !== g.ids.join();
}

/** Bản nháp chữ — cùng định dạng agent._render, theo bản TA đã chỉnh. */
export function draftText(p: ParsedReport, groups: EditGroup[], answers: Record<string, string> | null, edited: boolean): string {
  const N = p.n;
  const L: string[] = [`Nháp — ${p.qid}: ${p.cau_hoi} · ${N} câu trả lời`];
  if (p.notes.length) L.push("", ...p.notes);
  L.push("");
  let k = 0;
  for (const g of groups) {
    if (!g.ids.length) continue;
    k++;
    L.push(`${k}. ${fullName(g)} — ${g.ids.length}/${N} (${g.ids.join(", ")})${g.ids.length === 1 ? " — chỉ 1 câu" : ""}`);
    if (g.desc) L.push("   " + g.desc);
    if (g.quote && quoteHere(g, answers)) L.push(`   "${g.quote}"`);
  }
  if (p.after.length) L.push("", ...p.after);
  L.push("");
  if (p.limit) L.push(p.limit);
  if (p.fixes) L.push(p.fixes);
  if (edited) L.push("TA đã chỉnh trên màn hình (tên nhóm / chuyển câu); số đếm theo bản TA chỉnh.");
  if (p.footer) L.push(p.footer);
  return L.join("\n");
}

const GROUP_LINE = /^(\d+)\.\s+(.*?)\s+—\s+(\d+\/\d+)\s+\(([^)]*)\)(.*)$/;

/** Chuyển bản nháp chữ (kể cả đã sửa tay) sang Markdown Discord. Chỉ để TA dán — hệ thống không tự gửi. */
export function toDiscord(text: string): string {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const t = line.trim();
    if (!t) { out.push(""); continue; }
    if (/^Nháp — Q\d+:/.test(t) && !out.length) { out.push(`**${t.replace(/\*/g, "\\*")}**`); continue; }
    const m = GROUP_LINE.exec(t);
    if (m) { out.push(`**${m[1]}. ${m[2]}** — \`${m[3]}\` (${m[4]})${m[5]}`); continue; }
    if (/^".*"$/.test(t)) { out.push(`> ${t.slice(1, -1)}`); continue; }
    if (/^ {2,}/.test(line)) { out.push(`  ${t}`); continue; }
    if (/^(Giới hạn|Code đã sửa bản của AI|Nháp — chờ TA duyệt|TA đã chỉnh)/.test(t)) { out.push(`-# ${t}`); continue; }
    out.push(t);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Markdown để tải về (.md). */
export function toMarkdown(text: string, meta: { qid: string; question: string; model?: string }): string {
  const body = text.split("\n").map((raw) => {
    const t = raw.trim();
    if (/^Nháp — Q\d+:/.test(t)) return "";
    const m = GROUP_LINE.exec(t);
    if (m) return `### ${m[1]}. ${m[2]} — ${m[3]}\n\nCâu: ${m[4].split(",").map((s) => "`" + s.trim() + "`").join(", ")}${m[5] ? " " + m[5].replace(/^ — /, "· ") : ""}\n`;
    if (/^".*"$/.test(t)) return `> ${t.slice(1, -1)}\n`;
    if (/^ {2,}/.test(raw)) return t + "\n";
    return t;
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const now = new Date().toLocaleString("vi-VN");
  return `# Nháp — ${meta.qid}: ${meta.question}\n\n_Bản nháp chờ TA duyệt · xuất lúc ${now}${meta.model ? " · model " + meta.model : ""}. Không tự gửi cho lớp._\n\n${body}\n`;
}

export function downloadFile(name: string, content: string, type = "text/markdown;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(t: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(t); return true; }
  } catch { /* rơi xuống cách cũ */ }
  const ta = document.createElement("textarea");
  ta.value = t;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  ta.remove();
  return ok;
}

export const stamp = () => {
  const d = new Date(), p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
};
