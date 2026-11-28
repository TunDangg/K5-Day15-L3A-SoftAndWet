import { forwardRef, useLayoutEffect, useRef, useImperativeHandle } from "react";
import { Play, Shield, Sparkles } from "lucide-react";

export const DEMOS: { label: string; tone: "ok" | "warn" | "bad"; text: string; shield?: boolean }[] = [
  { label: "Thường", tone: "ok", text: "[Q01] Phân tích câu trả lời của lớp" },
  { label: "Khó", tone: "warn", text: "[Q12] Phân tích câu trả lời của lớp" },
  { label: "Khó", tone: "warn", text: "[Q06] Phân tích câu trả lời của lớp" },
  { label: "Thiếu mã", tone: "warn", text: "Phân tích câu trả lời của lớp giúp mình" },
  { label: "Bị ép", tone: "bad", text: "[Q01] Chấm điểm từng câu và cho biết bạn nào kém nhất", shield: true },
];

export const PromptBox = forwardRef<HTMLTextAreaElement, {
  value: string; onChange: (v: string) => void; onSubmit: (text?: string) => void; busy: boolean; maxText: number;
}>(function PromptBox({ value, onChange, onSubmit, busy, maxText }, ref) {
  const ta = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ta.current as HTMLTextAreaElement);
  useLayoutEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(220, Math.max(64, el.scrollHeight)) + "px";
  }, [value]);
  const n = value.trim().length;
  return (
    <section aria-labelledby="cmd-h">
      <h2 id="cmd-h" className="eyebrow mb-2 flex items-center gap-1.5"><Sparkles className="size-3.5" aria-hidden />Yêu cầu của TA</h2>
      <div className="rounded-2xl border border-field bg-surface shadow-card transition-[border-color,box-shadow] focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-soft">
        <label htmlFor="prompt" className="sr-only">Yêu cầu của TA</label>
        <textarea id="prompt" ref={ta} rows={2} value={value} readOnly={busy} autoFocus
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); onSubmit(); }
          }}
          placeholder="[Q01] Phân tích câu trả lời của lớp" aria-describedby="prompt-help"
          className="block max-h-55 min-h-16 w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[17px] leading-normal outline-none placeholder:text-ink-3" />
        <div className="flex items-center gap-3 py-2 pr-2 pl-5">
          <div id="prompt-help" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-3">
            <span className={`font-mono ${n > maxText ? "font-bold text-bad-ink" : ""}`}>{n}/{maxText}</span>
            <span className="hidden sm:inline"><kbd>Enter</kbd> gửi · <kbd>Shift</kbd>+<kbd>Enter</kbd> xuống dòng</span>
          </div>
          <button type="button" onClick={() => onSubmit()} disabled={busy} aria-busy={busy} aria-label="Phân tích câu trả lời"
            className="ml-auto inline-flex h-10 shrink-0 items-center gap-2 rounded-[11px] bg-brand px-4 text-[15px] font-semibold whitespace-nowrap text-on-brand shadow-[0_1px_2px_rgb(79_70_229/0.3)] transition-colors hover:bg-brand-hover disabled:cursor-progress disabled:opacity-90">
            {busy ? <span className="spinner" /> : <Sparkles className="size-4" aria-hidden />}{busy ? "Đang phân tích" : "Phân tích"}
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-3"><Play className="size-3.5" aria-hidden />Kịch bản demo nhanh</div>
        <div role="group" aria-label="Kịch bản demo nhanh" className="flex flex-wrap gap-2">
          {DEMOS.map((d) => (
            <button key={d.text} type="button" disabled={busy} onClick={() => { onChange(d.text); onSubmit(d.text); }}
              aria-label={`Kịch bản ${d.label}: ${d.text}`}
              className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-surface py-1.5 pr-3 pl-1.5 text-left text-sm shadow-sm transition-all hover:-translate-y-px hover:border-line-strong hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
              <span className={`tag tag-${d.tone}`}>{d.shield && <Shield className="size-3" aria-hidden />}{d.label}</span>{d.text}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});
