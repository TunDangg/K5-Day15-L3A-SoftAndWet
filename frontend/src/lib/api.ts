// Hợp đồng API của backend Python (codebase/web.py). Mọi lời gọi đi qua /api (dev: Vite proxy sang :8000).

export type Kind = "dung" | "sai" | "bo_trong" | "lac_de" | "chua_xep" | "khac";

export interface Question {
  qid: string;
  cau_hoi: string;
  kc_code: string | null;
  so_cau_tra_loi: number;
  source: "goc" | "import";
  filename?: string;
  imported_at?: number;
}

export interface QuestionsResp {
  ok: true;
  questions: Question[];
  count: number;
  model_provider: string;
  model_name: string;
  max_text: number;
  min_answers: number;
}

export interface ModelInfo { provider: string; name: string | null; fake: boolean }

export interface Health {
  ok: true;
  status: string;
  version: string;
  model: ModelInfo;
  busy: boolean;
  frontend: "dist" | "legacy";
  data: { questions: number; imported: number; drafts: number };
  limits: { max_text: number; min_answers: number };
}

export interface Group {
  kind: Kind; label: string; name: string; x: number; n: number;
  ids: string[]; desc: string; quote: string; one: boolean;
}

export interface ParsedReport {
  kind: "report"; qid: string; cau_hoi: string; n: number;
  notes: string[]; groups: Group[]; after: string[]; limit: string; fixes: string; footer: string;
}
export interface ParsedNotice { kind: "notice"; level: "info" | "warn"; title: string; hint: string; actions: string[] }
export interface ParsedRaw { kind: "raw" }
export type Parsed = ParsedReport | ParsedNotice | ParsedRaw;

export interface Step {
  type: "code" | "tool" | "model" | "note";
  name?: string; title: string; detail?: string;
  latency_s?: number | null; error?: string | null; passed?: boolean;
}

export interface Guardrail { code: string; level: "block" | "warn" | "info"; message: string }

export interface AnalyzeMeta {
  model: ModelInfo; models_called: string[]; elapsed_ms: number;
  model_calls: number; tool_calls: number; tokens_in: number; tokens_out: number;
  check_report: "pass" | "fail" | "skipped";
}

export interface TraceSummary {
  model_calls: number; tool_calls: number; tokens_in: number; tokens_out: number; models: string[]; errors: string[];
}

export interface ErrorInfo { code: string; title: string; hint?: string; detail?: string }

export interface AnalyzeResp {
  ok: boolean;
  status: "report" | "notice" | "raw" | "error";
  qid: string | null;
  question?: (Pick<Question, "qid" | "cau_hoi" | "kc_code" | "so_cau_tra_loi" | "source">) | null;
  result?: { output: string; parsed: Parsed };
  guardrails: Guardrail[];
  meta?: AnalyzeMeta;
  trace?: { summary: TraceSummary; steps: Step[] };
  error?: ErrorInfo;
  soft?: boolean;
}

export interface AnswersResp {
  ok: true; co_cau_hoi: true; question_id: string; cau_hoi: string; kc_code: string | null;
  so_cau_tra_loi: number; cau_tra_loi: { id: string; text: string }[];
}

export interface StatsDay {
  bai_on: { so_hoc_vien: number; so_luot: number; so_sai: number; theo_kc: Record<string, { so_luot: number; so_sai: number }> };
  cau_hoi_video: { so_cau: number; so_cau_ngan_le_20_ky_tu: number; so_cau_khong_bam_bai: number; so_cau_da_cham: number; theo_video: Record<string, number> };
}
export interface StatsResp {
  ok: true; source: string | null; days: string[];
  totals: { so_luot: number; so_sai: number; so_cau_video: number; so_cau_khong_bam_bai: number; so_ngay: number; ti_le_sai: number | null };
  stats: { nguon?: string; ngay: Record<string, StatsDay> };
}

export interface ImportItem {
  qid: string; cau_hoi: string; kc_code: string | null; so_cau_tra_loi: number; so_bo_trong: number; analyze_text: string;
}
export interface ImportResp {
  ok: true; imported: ImportItem[];
  warnings: { code: string; message: string; qid?: string }[];
  next: { qid: string; analyze_text: string };
}

export interface DraftSummary {
  id: number; qid: string; title: string | null; source: "ta" | "ai"; created_at: number; chars: number; preview?: string;
}
export interface DraftFull extends DraftSummary { text: string; groups: unknown[] | null }

export class ApiError extends Error {
  status: number;
  info: ErrorInfo;
  body: unknown;
  constructor(status: number, info: ErrorInfo, body: unknown) {
    super(info.title);
    this.status = status;
    this.info = info;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError(0, { code: "network", title: "Không kết nối được tới backend",
      hint: "Kiểm tra lệnh python codebase/web.py còn chạy không." }, null);
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(res.status, { code: "bad_response", title: "Máy chủ trả dữ liệu không phải JSON", hint: "HTTP " + res.status }, null);
  }
  if (!res.ok) {
    const e = isObj(body) && isObj(body.error) ? body.error : {};
    const info: ErrorInfo = { code: str(e.code, "http_" + res.status), title: str(e.title, "Lỗi HTTP " + res.status),
      hint: str(e.hint) || undefined, detail: str(e.detail) || undefined };
    throw new ApiError(res.status, info, path === "/api/analyze" ? normAnalyze(body) : body);
  }
  return body as T;
}


// ---------- Chuẩn hoá: mọi dữ liệu từ API đi qua đây trước khi tới component, để null / undefined / sai kiểu
// không bao giờ làm vỡ giao diện (thiếu trường → giá trị mặc định an toàn).
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const str = (x: unknown, d = ""): string => (typeof x === "string" ? x : typeof x === "number" ? String(x) : d);
const num = (x: unknown, d = 0): number => (typeof x === "number" && Number.isFinite(x) ? x : d);
const arr = <T = unknown>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);
const strs = (x: unknown): string[] => arr(x).filter((v): v is string => typeof v === "string");
const KINDS: Kind[] = ["dung", "sai", "bo_trong", "lac_de", "chua_xep", "khac"];

export function normQuestion(x: unknown): Question | null {
  if (!isObj(x) || !str(x.qid)) return null;
  return { qid: str(x.qid), cau_hoi: str(x.cau_hoi, "(không có nội dung câu hỏi)"), kc_code: str(x.kc_code) || null,
    so_cau_tra_loi: num(x.so_cau_tra_loi), source: x.source === "import" ? "import" : "goc",
    filename: str(x.filename) || undefined, imported_at: num(x.imported_at) || undefined };
}

function normParsed(x: unknown): Parsed {
  if (!isObj(x)) return { kind: "raw" };
  if (x.kind === "notice") {
    return { kind: "notice", level: x.level === "warn" ? "warn" : "info", title: str(x.title, "Thông báo"), hint: str(x.hint), actions: strs(x.actions) };
  }
  if (x.kind !== "report") return { kind: "raw" };
  const n = num(x.n);
  const groups: Group[] = arr(x.groups).filter(isObj).map((g) => {
    const ids = strs(g.ids);
    return { kind: KINDS.includes(g.kind as Kind) ? (g.kind as Kind) : "khac", label: str(g.label, "Nhóm"), name: str(g.name, "Nhóm chưa đặt tên"),
      x: num(g.x, ids.length), n: num(g.n, n), ids, desc: str(g.desc), quote: str(g.quote), one: !!g.one };
  }).filter((g) => g.ids.length);
  if (!groups.length || n <= 0 || !str(x.qid)) return { kind: "raw" };   // báo cáo thiếu phần cốt lõi → hiện nguyên văn
  return { kind: "report", qid: str(x.qid), cau_hoi: str(x.cau_hoi), n, notes: strs(x.notes), groups, after: strs(x.after),
    limit: str(x.limit), fixes: str(x.fixes), footer: str(x.footer) };
}

export function normAnalyze(x: unknown): AnalyzeResp {
  const o = isObj(x) ? x : {};
  const res = isObj(o.result) ? o.result : null;
  const meta = isObj(o.meta) ? o.meta : null;
  const model = meta && isObj(meta.model) ? meta.model : {};
  const trace = isObj(o.trace) ? o.trace : null;
  const sum = trace && isObj(trace.summary) ? trace.summary : {};
  const err = isObj(o.error) ? o.error : null;
  const status = ["report", "notice", "raw", "error"].includes(o.status as string) ? (o.status as AnalyzeResp["status"]) : res ? "raw" : "error";
  return {
    ok: o.ok === true, status, qid: str(o.qid) || null,
    question: normQuestion(o.question),
    result: res ? { output: str(res.output), parsed: normParsed(res.parsed) } : undefined,
    guardrails: arr(o.guardrails).filter(isObj).map((g) => ({ code: str(g.code, "guardrail"),
      level: g.level === "block" || g.level === "warn" ? g.level : "info", message: str(g.message) })) as Guardrail[],
    meta: meta ? { model: { provider: str(model.provider), name: str(model.name) || null, fake: !!model.fake }, models_called: strs(meta.models_called),
      elapsed_ms: num(meta.elapsed_ms), model_calls: num(meta.model_calls), tool_calls: num(meta.tool_calls),
      tokens_in: num(meta.tokens_in), tokens_out: num(meta.tokens_out),
      check_report: meta.check_report === "pass" || meta.check_report === "fail" ? meta.check_report : "skipped" } : undefined,
    trace: trace ? {
      summary: { model_calls: num(sum.model_calls), tool_calls: num(sum.tool_calls), tokens_in: num(sum.tokens_in), tokens_out: num(sum.tokens_out),
        models: strs(sum.models), errors: strs(sum.errors) },
      steps: arr(trace.steps).filter(isObj).map((st) => ({ type: (["code", "tool", "model", "note"].includes(st.type as string) ? st.type : "note") as Step["type"],
        name: str(st.name) || undefined, title: str(st.title, "Bước"), detail: str(st.detail) || undefined,
        latency_s: typeof st.latency_s === "number" ? st.latency_s : null, error: str(st.error) || null, passed: !!st.passed })),
    } : undefined,
    error: err ? { code: str(err.code, "error"), title: str(err.title, "Có lỗi xảy ra"), hint: str(err.hint) || undefined, detail: str(err.detail) || undefined } : undefined,
    soft: o.soft === true,
  };
}

export function normStats(x: unknown): StatsResp {
  const o = isObj(x) ? x : {};
  const t = isObj(o.totals) ? o.totals : {};
  const st = isObj(o.stats) ? o.stats : {};
  const ngayIn = isObj(st.ngay) ? st.ngay : {};
  const ngay: Record<string, StatsDay> = {};
  for (const [day, v] of Object.entries(ngayIn)) {
    const d = isObj(v) ? v : {}, b = isObj(d.bai_on) ? d.bai_on : {}, c = isObj(d.cau_hoi_video) ? d.cau_hoi_video : {};
    const kc: Record<string, { so_luot: number; so_sai: number }> = {};
    for (const [k, kv] of Object.entries(isObj(b.theo_kc) ? b.theo_kc : {})) {
      const r = isObj(kv) ? kv : {};
      kc[k] = { so_luot: num(r.so_luot), so_sai: num(r.so_sai) };
    }
    const vids: Record<string, number> = {};
    for (const [k, n] of Object.entries(isObj(c.theo_video) ? c.theo_video : {})) vids[k] = num(n);
    ngay[day] = { bai_on: { so_hoc_vien: num(b.so_hoc_vien), so_luot: num(b.so_luot), so_sai: num(b.so_sai), theo_kc: kc },
      cau_hoi_video: { so_cau: num(c.so_cau), so_cau_ngan_le_20_ky_tu: num(c.so_cau_ngan_le_20_ky_tu), so_cau_khong_bam_bai: num(c.so_cau_khong_bam_bai),
        so_cau_da_cham: num(c.so_cau_da_cham), theo_video: vids } };
  }
  const days = strs(o.days).filter((d) => d in ngay);
  return { ok: true, source: str(o.source) || null, days: days.length ? days : Object.keys(ngay).sort(),
    totals: { so_luot: num(t.so_luot), so_sai: num(t.so_sai), so_cau_video: num(t.so_cau_video), so_cau_khong_bam_bai: num(t.so_cau_khong_bam_bai),
      so_ngay: num(t.so_ngay, Object.keys(ngay).length), ti_le_sai: typeof t.ti_le_sai === "number" ? t.ti_le_sai : null },
    stats: { nguon: str(st.nguon) || undefined, ngay } };
}

export function normDraft(x: unknown): DraftSummary | null {
  if (!isObj(x) || typeof x.id !== "number") return null;
  return { id: x.id, qid: str(x.qid, "?"), title: str(x.title) || null, source: x.source === "ai" ? "ai" : "ta",
    created_at: num(x.created_at), chars: num(x.chars), preview: str(x.preview) || undefined };
}

const json = (data: unknown): RequestInit => ({
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
});

export const api = {
  health: () => request<Health>("/api/health"),
  questions: async () => {
    const r = await request<Partial<QuestionsResp>>("/api/questions");
    return { ...r, questions: arr(r.questions).map(normQuestion).filter((q): q is Question => !!q),
      min_answers: num(r.min_answers, 5), max_text: num(r.max_text, 500) } as QuestionsResp;
  },
  answers: async (qid: string) => {
    const r = await request<Partial<AnswersResp>>("/api/answers?qid=" + encodeURIComponent(qid));
    return { ...r, cau_tra_loi: arr(r.cau_tra_loi).filter(isObj).map((a) => ({ id: str(a.id), text: str(a.text) })) } as AnswersResp;
  },
  analyze: async (text: string) => normAnalyze(await request<unknown>("/api/analyze", json({ text }))),
  stats: async () => normStats(await request<unknown>("/api/stats")),
  importFile: (file: File, fields: { cau_hoi?: string; kc_code?: string }) => {
    const fd = new FormData();
    fd.append("file", file);
    if (fields.cau_hoi) fd.append("cau_hoi", fields.cau_hoi);
    if (fields.kc_code) fd.append("kc_code", fields.kc_code);
    return request<ImportResp>("/api/import", { method: "POST", body: fd }).then((r) => ({
      ...r, imported: arr(r.imported).filter(isObj).map((i) => ({ qid: str(i.qid), cau_hoi: str(i.cau_hoi), kc_code: str(i.kc_code) || null,
        so_cau_tra_loi: num(i.so_cau_tra_loi), so_bo_trong: num(i.so_bo_trong), analyze_text: str(i.analyze_text) })).filter((i) => i.qid),
      warnings: arr(r.warnings).filter(isObj).map((w) => ({ code: str(w.code), message: str(w.message), qid: str(w.qid) || undefined })),
    }) as ImportResp);
  },
  drafts: async (qid?: string) => {
    const r = await request<{ drafts?: unknown }>("/api/drafts" + (qid ? "?qid=" + encodeURIComponent(qid) : ""));
    const drafts = arr(r.drafts).map(normDraft).filter((d): d is DraftSummary => !!d);
    return { ok: true as const, drafts, count: drafts.length };
  },
  draft: async (id: number) => {
    const r = await request<{ draft?: unknown }>("/api/drafts/" + id);
    const d = normDraft(r.draft);
    if (!d) throw new ApiError(500, { code: "bad_response", title: "Bản nháp trả về không hợp lệ" }, r);
    const raw = r.draft as Record<string, unknown>;
    return { ok: true as const, draft: { ...d, text: str(raw.text), groups: Array.isArray(raw.groups) ? raw.groups : null } as DraftFull };
  },
  saveDraft: (d: { qid: string; text: string; title?: string; groups?: unknown[]; source?: "ta" | "ai" }) =>
    request<{ ok: true; draft: DraftSummary }>("/api/drafts", json(d)),
  deleteDraft: (id: number) => request<{ ok: true; deleted: number }>("/api/drafts/" + id, { method: "DELETE" }),
};
