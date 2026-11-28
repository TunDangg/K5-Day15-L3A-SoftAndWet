import { useEffect, useState } from "react";
import { Check, Database, Minus, ShieldCheck, Sparkles, X } from "lucide-react";
import type { AnalyzeResp } from "../lib/api";

export type StepState = "pending" | "active" | "done" | "skip" | "fail";
const STEPS = [
  { Icon: Database, title: "Đọc câu trả lời của lớp", sub: "get_answers · đã bỏ nhãn tay" },
  { Icon: Sparkles, title: "AI gom nhóm cách hiểu", sub: "Gọi model · có thể mất 5–30 giây" },
  { Icon: ShieldCheck, title: "Code đếm x/N & kiểm trích dẫn", sub: "check_report · chặn bản chưa đạt" },
];
const LABEL: Record<StepState, string> = { pending: "Chờ", active: "Đang chạy", done: "Xong", skip: "Bỏ qua", fail: "Lỗi" };

/** Trạng thái cuối của 3 bước, đọc từ trace thật (bước nào backend không chạy → "bỏ qua", không giả vờ đã xong). */
export function finalStates(d: AnalyzeResp | null): { states: StepState[]; subs: (string | null)[] } {
  const st = d?.trace?.steps ?? [];
  const has = (n: string) => st.some((s) => s.name === n || s.title.includes(n));
  const model = st.some((s) => s.type === "model"), modelErr = st.some((s) => s.type === "model" && s.error);
  const gotA = has("get_answers"), check = has("check_report");
  return {
    states: [gotA ? "done" : "skip", modelErr || (d && !d.ok && model) ? "fail" : model ? "done" : "skip", check ? "done" : "skip"],
    subs: [gotA ? null : "Dừng sớm: chưa có mã câu hỏi hợp lệ", model ? null : "Không gọi model", check ? null : "Không có báo cáo để kiểm"],
  };
}

export function Stepper({ qid, finished }: { qid: string | null; finished: { states: StepState[]; subs: (string | null)[] } | null }) {
  const [t0] = useState(() => Date.now());
  const [now, setNow] = useState(t0);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (finished) return;
    const iv = window.setInterval(() => setNow(Date.now()), 100);
    const to = window.setTimeout(() => setPhase(1), 450);
    return () => { window.clearInterval(iv); window.clearTimeout(to); };
  }, [finished]);
  const states: StepState[] = finished ? finished.states : phase === 0 ? ["active", "pending", "pending"] : ["done", "active", "pending"];
  return (
    <div className="grid gap-4" aria-live="polite">
      <section className="card animate-fade-up p-5" role="status" aria-label="Đang phân tích">
        <div className="mb-4 flex items-center justify-between gap-3">
          <b className="flex items-center gap-2 text-base">Đang chạy pipeline {qid && <>cho <span className="code-badge">{qid}</span></>}</b>
          <span className="font-mono text-[13px] text-ink-3">{((now - t0) / 1000).toFixed(1)}s</span>
        </div>
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map(({ Icon, title, sub }, i) => {
            const s = states[i];
            return (
              <li key={title} className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${s === "active" ? "border-brand bg-brand-soft" : "border-line bg-surface-2"} ${s === "skip" ? "opacity-70" : ""}`}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-all ${
                  s === "done" ? "border-ok bg-ok text-white" : s === "fail" ? "border-bad bg-bad text-white"
                  : s === "active" ? "animate-ring border-brand bg-surface text-brand" : s === "skip" ? "border-dashed border-line-strong text-ink-3" : "border-line-strong bg-surface text-ink-3"}`}>
                  {s === "done" ? <Check className="size-3.5" /> : s === "fail" ? <X className="size-3.5" /> : s === "skip" ? <Minus className="size-3.5" />
                    : s === "active" ? <span className="spinner size-3.5" /> : <Icon className="size-3.5" />}
                </span>
                <span className="min-w-0">
                  <span className={`block font-mono text-[11px] font-semibold tracking-wide uppercase ${s === "done" ? "text-ok-ink" : s === "active" ? "text-brand-ink" : s === "fail" ? "text-bad-ink" : "text-ink-3"}`}>{LABEL[s]}</span>
                  <b className="block text-sm leading-snug font-semibold">{title}</b>
                  <small className="mt-0.5 block text-[12.5px] leading-snug text-ink-3">{finished?.subs[i] ?? sub}</small>
                </span>
              </li>
            );
          })}
        </ol>
      </section>
      <div className="grid gap-3" aria-hidden>
        {[92, 92, 92].map((h, i) => <div key={i} className="skeleton animate-shimmer rounded-2xl border border-line" style={{ height: h, opacity: 1 - i * 0.25 }} />)}
      </div>
    </div>
  );
}
