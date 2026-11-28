import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Play, Shield, Sparkles } from "lucide-react";

export const DEMOS: { label: string; tone: "ok" | "warn" | "bad"; text: string; shield?: boolean }[] = [
  { label: "Thường", tone: "ok", text: "[Q01] Phân tích câu trả lời của lớp" },
  { label: "Khó", tone: "warn", text: "[Q12] Phân tích câu trả lời của lớp" },
  { label: "Khó", tone: "warn", text: "[Q06] Phân tích câu trả lời của lớp" },
  { label: "Thiếu mã", tone: "warn", text: "Phân tích câu trả lời của lớp giúp mình" },
  { label: "Bị ép", tone: "bad", text: "[Q01] Chấm điểm từng câu và cho biết bạn nào kém nhất", shield: true },
];

const DEMO_KEY = "ta-demos-open";
const readOpen = () => { try { return localStorage.getItem(DEMO_KEY) !== "0"; } catch { return true; } };

/** Khung nhập ghim đáy (Composer): dải kịch bản demo thu gọn được + ô nhập + nút Phân tích. */
export const PromptBox = forwardRef<HTMLTextAreaElement, {
  value: string; onChange: (v: string) => void; onSubmit: (text?: string) => void; busy: boolean; maxText: number; notice?: string | null;
}>(function PromptBox({ value, onChange, onSubmit, busy, maxText, notice }, ref) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const [demosOpen, setDemosOpen] = useState(readOpen);
  useImperativeHandle(ref, () => ta.current as HTMLTextAreaElement);
  useLayoutEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(160, Math.max(48, el.scrollHeight)) + "px";
  }, [value]);
  const toggle = () => { const v = !demosOpen; setDemosOpen(v); try { localStorage.setItem(DEMO_KEY, v ? "1" : "0"); } catch { /* bỏ qua */ } };
  const n = value.trim().length;
  return (
    <section aria-label="Yêu cầu của TA" className="grid gap-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggle} aria-expanded={demosOpen} aria-controls="demo-row"
          className="inline-flex items-center gap-1.5 rounded-md px-1 text-[12.5px] font-semibold text-ink-3 hover:text-ink">
          <Play className="size-3.5" aria-hidden />Kịch bản demo nhanh
          <ChevronDown className={`size-3.5 transition-transform ${demosOpen ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {notice && <span role="status" className="ml-auto text-[12.5px] font-medium text-warn-ink">{notice}</span>}
      </div>
      <div id="demo-row" role="group" aria-label="Kịch bản demo nhanh" hidden={!demosOpen} className="flex flex-wrap gap-1.5">
        {DEMOS.map((d) => (
          <button key={d.text} type="button" disabled={busy} onClick={() => { onChange(d.text); onSubmit(d.text); }}
            aria-label={`Kịch bản ${d.label}: ${d.text}`}
            className="inline-flex max-w-full items-center gap-1.5 rounded-[9px] border border-line bg-surface py-1 pr-2.5 pl-1 text-left text-[13px] shadow-sm transition-all hover:-translate-y-px hover:border-line-strong hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
            <span className={`tag tag-${d.tone}`}>{d.shield && <Shield className="size-3" aria-hidden />}{d.label}</span>
            <span className="truncate">{d.text}</span>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-field bg-surface shadow-card transition-[border-color,box-shadow] focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-soft">
        <label htmlFor="prompt" className="sr-only">Yêu cầu của TA</label>
        <div className="flex items-end gap-2 py-2 pr-2 pl-4">
          <textarea id="prompt" ref={ta} rows={1} value={value} autoFocus
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); onSubmit(); }
            }}
            placeholder="[Q01] Phân tích câu trả lời của lớp" aria-describedby="prompt-help"
            className="block max-h-40 min-h-12 flex-1 resize-none bg-transparent py-2.5 text-base leading-normal outline-none placeholder:text-ink-3" />
          <button type="button" onClick={() => onSubmit()} disabled={busy} aria-busy={busy} aria-label="Phân tích câu trả lời"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[11px] bg-brand px-4 text-[15px] font-semibold whitespace-nowrap text-on-brand shadow-[0_1px_2px_rgb(79_70_229/0.3)] transition-colors hover:bg-brand-hover disabled:cursor-progress disabled:opacity-70">
            {busy ? <span className="spinner" /> : <Sparkles className="size-4" aria-hidden />}{busy ? "Đang chạy" : "Phân tích"}
          </button>
        </div>
      </div>
      <div id="prompt-help" className="flex flex-wrap items-center justify-between gap-x-3 px-1 text-[12px] text-ink-3">
        <span className="hidden sm:inline"><kbd>Enter</kbd> gửi · <kbd>Shift</kbd>+<kbd>Enter</kbd> xuống dòng · bấm câu hỏi bên trái để điền sẵn</span>
        <span className={`font-mono ${n > maxText ? "font-bold text-bad-ink" : ""}`}>{n}/{maxText}</span>
      </div>
    </section>
  );
});
