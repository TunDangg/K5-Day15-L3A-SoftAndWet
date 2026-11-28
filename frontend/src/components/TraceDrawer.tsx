import { useId, useState } from "react";
import { Check, ChevronDown, Code2, Cpu, Info, ListTree } from "lucide-react";
import type { AnalyzeResp } from "../lib/api";

const ICON = { code: Code2, tool: Check, model: Cpu, note: Info } as const;
const DOT = { code: "bg-off-soft text-ink-3", tool: "bg-ok-soft text-ok-ink", model: "bg-brand-soft text-brand-ink", note: "bg-warn-soft text-warn-ink" } as const;
const TAG = { code: "code", tool: "công cụ", model: "model", note: "ghi chú" } as const;

export function TraceDrawer({ data, defaultOpen = false }: { data: AnalyzeResp; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  const steps = data.trace?.steps ?? [];
  const s = data.trace?.summary;
  const m = data.meta;
  const stats: [string, string | number][] = [
    ["Gọi model", s?.model_calls ?? 0], ["Gọi công cụ", s?.tool_calls ?? 0], ["Token vào", s?.tokens_in ?? 0], ["Token ra", s?.tokens_out ?? 0],
    ["Thời gian", m ? (m.elapsed_ms / 1000).toFixed(2) + "s" : "—"], ["check_report", m?.check_report ?? "—"], ["Lỗi", s?.errors.length ?? 0],
  ];
  return (
    <section className="card" aria-label="Chi tiết kỹ thuật">
      <div className="p-2">
        <button type="button" className="btn btn-ghost" aria-expanded={open} aria-controls={`${uid}-trace`} onClick={() => setOpen(!open)}>
          <ListTree className="size-4" aria-hidden /> Xem Trace & Kiểm chứng Code
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>
      <div id={`${uid}-trace`} data-trace-panel hidden={!open} className="grid gap-4 border-t border-line p-5">
        <div className="flex flex-wrap gap-2">
          {stats.map(([k, v]) => <span key={k} className="rounded-full bg-off-soft px-2.5 py-0.5 text-[12.5px] text-ink-2">{k}: <b className="font-mono font-semibold text-ink">{v}</b></span>)}
        </div>
        {data.guardrails.length > 0 && (
          <div className="grid gap-1.5">
            <h4 className="eyebrow">Guardrail code đã áp</h4>
            <ul className="flex flex-wrap gap-1.5">
              {data.guardrails.map((g) => (
                <li key={g.code} title={g.message} className={`tag ${g.level === "block" ? "tag-bad" : g.level === "warn" ? "tag-warn" : "tag-ok"} font-mono`}>{g.code}</li>
              ))}
            </ul>
          </div>
        )}
        {steps.length > 0 && (
          <div className="grid gap-1.5">
            <h4 className="eyebrow">Các bước hệ thống đã làm</h4>
            <ol className="grid">
              {steps.map((st, i) => {
                const Icon = ICON[st.type] ?? Info;
                return (
                  <li key={i} className="relative grid grid-cols-[20px_1fr_auto] gap-x-3 gap-y-0.5 py-2 before:absolute before:top-7 before:-bottom-2 before:left-[9px] before:w-0.5 before:bg-line last:before:hidden">
                    <span className={`relative z-10 mt-0.5 grid size-5 place-items-center rounded-full ${DOT[st.type] ?? DOT.note}`}><Icon className="size-[11px]" aria-hidden /></span>
                    <span className="text-sm font-semibold"><em className="mr-1.5 font-mono text-[11px] font-semibold text-ink-3 uppercase not-italic">{TAG[st.type] ?? st.type}</em>{st.title}</span>
                    <span className="font-mono text-xs text-ink-3">{st.latency_s != null ? st.latency_s + "s" : ""}</span>
                    {st.detail && <span className="col-span-2 col-start-2 text-[13px] [overflow-wrap:anywhere] text-ink-2">{st.detail}</span>}
                    {st.error && <span className="col-span-2 col-start-2 text-[13px] text-bad-ink">lỗi: {st.error}</span>}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        {data.result && (
          <div className="grid gap-1.5">
            <h4 className="eyebrow">Output gốc — nguyên văn từ answer()</h4>
            <pre className="max-h-90 overflow-auto rounded-xl border border-line bg-surface-2 px-4 py-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] text-ink-2">{data.result.output}</pre>
          </div>
        )}
      </div>
    </section>
  );
}
