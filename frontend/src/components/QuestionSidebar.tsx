import { forwardRef, useMemo, useState } from "react";
import { AlertTriangle, FileUp, Plus, Search, Users } from "lucide-react";
import type { Question } from "../lib/api";
import { fold } from "../lib/draft";
import { navigate } from "../lib/router";

export const QuestionSidebar = forwardRef<HTMLInputElement, {
  questions: Question[] | null; error: string | null; activeQid: string | null; minAnswers: number; onPick: (qid: string) => void;
}>(function QuestionSidebar({ questions, error, activeQid, minAnswers, onPick }, searchRef) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const k = fold(q.trim());
    return (questions ?? []).filter((x) => !k || [x.qid, x.cau_hoi, x.kc_code].some((v) => fold(v).includes(k)));
  }, [questions, q]);
  return (
    <aside aria-labelledby="bank-h"
      className="flex flex-col gap-3 border-line bg-surface px-4 py-5 *:shrink-0 lg:sticky lg:top-15 lg:h-[calc(100vh-60px)] lg:overflow-y-auto lg:border-r">
      <div className="flex items-baseline justify-between px-1">
        <h2 id="bank-h" className="eyebrow">Ngân hàng câu hỏi</h2>
        <span className="text-xs text-ink-3">{questions ? (shown.length === questions.length ? `${questions.length} câu` : `${shown.length}/${questions.length}`) : ""}</span>
      </div>
      <button type="button" className="btn btn-primary w-full justify-center" onClick={() => navigate("import")}>
        <Plus className="size-4" aria-hidden /> Nhập câu hỏi mới
      </button>
      <label className="relative block">
        <span className="sr-only">Tìm câu hỏi theo mã hoặc từ khoá</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
        <input ref={searchRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
          onKeyDown={(e) => { if (e.key === "Escape" && q) { e.stopPropagation(); setQ(""); } }}
          placeholder="Tìm mã (Q01) hoặc từ khoá…" className="field h-9.5 w-full pr-9 pl-9 text-sm" />
        <kbd className="absolute top-1/2 right-2.5 -translate-y-1/2" aria-hidden>/</kbd>
      </label>
      {error && <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad-ink">{error}</p>}
      {!questions && !error && <div className="grid gap-2">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-20 animate-shimmer rounded-xl border border-line" />)}</div>}
      <ul className="grid gap-2">
        {shown.map((x) => {
          const low = x.so_cau_tra_loi < minAnswers, on = x.qid === activeQid;
          return (
            <li key={x.qid}>
              <button type="button" onClick={() => onPick(x.qid)} aria-current={on ? "true" : undefined}
                aria-label={`Chọn ${x.qid}: ${x.cau_hoi}, ${x.so_cau_tra_loi} câu trả lời${low ? ", ít dữ liệu" : ""}`}
                className={`grid w-full gap-2 rounded-xl border p-3 text-left transition-all hover:-translate-y-px hover:shadow-card ${on ? "border-brand bg-brand-soft ring-1 ring-brand" : "border-line bg-surface hover:border-line-strong"}`}>
                <span className="line-clamp-2 text-sm leading-snug"><span className={`code-badge mr-1.5 ${on ? "bg-surface" : ""}`}>{x.qid}</span>{x.cau_hoi}</span>
                <span className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${low ? "bg-warn-soft text-warn-ink ring-1 ring-warn-line ring-inset" : "bg-off-soft text-ink-2"}`}>
                    {low ? <AlertTriangle className="size-3" aria-hidden /> : <Users className="size-3" aria-hidden />}
                    {low ? `${x.so_cau_tra_loi} câu · ít dữ liệu` : `${x.so_cau_tra_loi} câu trả lời`}
                  </span>
                  {x.source === "import" && <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-todo-ink"><FileUp className="size-3" aria-hidden />import</span>}
                </span>
              </button>
            </li>
          );
        })}
        {questions && !shown.length && <li className="px-1 py-3 text-sm text-ink-3">Không thấy câu hỏi khớp “{q.trim()}”.</li>}
      </ul>
    </aside>
  );
});
