import { useEffect, useId, useRef, useState } from "react";
import { ArrowRightLeft, Eye, Pencil, Quote, X } from "lucide-react";
import { KIND_LABEL, quoteHere, type EditGroup } from "../lib/draft";

export function GroupCard({ g, n, all, answers, edited, open, onOpen, onRename, onMove, focusChip }: {
  g: EditGroup; n: number; all: EditGroup[]; answers: Record<string, string> | null; edited: boolean;
  open: string | null; onOpen: (aid: string | null) => void; onRename: (name: string) => void;
  onMove: (aid: string, toKey: string) => void; focusChip: string | null;
}) {
  const uid = useId();      // id riêng mỗi thẻ: nhiều lượt chat cùng hiện không trùng id
  const [editing, setEditing] = useState(false);
  const [drop, setDrop] = useState(false);
  const nameBtn = useRef<HTMLButtonElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const x = g.ids.length, kind = KIND_LABEL[g.kind] || g.label;
  const others = all.filter((o) => o.key !== g.key);
  const [target, setTarget] = useState(others[0]?.key ?? "");
  useEffect(() => { if (!others.some((o) => o.key === target)) setTarget(others[0]?.key ?? ""); }, [others, target]);
  useEffect(() => { if (focusChip) chipRefs.current[focusChip]?.focus(); }, [focusChip]);
  const hasQuote = !!g.quote && x > 0 && quoteHere(g, answers);

  return (
    <article role="listitem" aria-label={`${kind}: ${g.name}, ${x} trên ${n}`}
      onDragOver={(e) => { e.preventDefault(); setDrop(true); }} onDragLeave={() => setDrop(false)}
      onDrop={(e) => { e.preventDefault(); setDrop(false); const aid = e.dataTransfer.getData("text/plain"); if (/^A\d+$/.test(aid)) onMove(aid, g.key); }}
      className={`k-${g.kind} relative grid gap-3 rounded-2xl border bg-surface py-4 pr-5 pl-6 shadow-card transition-shadow before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl before:bg-[var(--k)] hover:shadow-pop
        ${drop ? "border-brand ring-3 ring-brand-soft" : edited ? "border-todo-line" : "border-line"}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="rounded-md bg-[var(--k-soft)] px-2 py-0.5 text-xs font-bold whitespace-nowrap text-[var(--k-ink)] ring-1 ring-[var(--k-line)] ring-inset">{kind}</span>
          {editing ? (
            <RenameInput initial={g.name} onDone={(v) => { setEditing(false); if (v !== null) onRename(v); requestAnimationFrame(() => nameBtn.current?.focus()); }} />
          ) : (
            <button ref={nameBtn} type="button" onClick={() => setEditing(true)} title="Bấm để đổi tên" aria-label={`Đổi tên nhóm: ${g.name}`}
              className="group -ml-0.5 inline-flex min-w-0 cursor-text items-center gap-1.5 rounded-[7px] border border-transparent px-1.5 text-left text-lg leading-snug font-semibold tracking-tight hover:border-line-strong">
              <span>{g.name}</span><Pencil className="size-3.5 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
            </button>
          )}
          {x === 1 && <span className="rounded-full bg-off-soft px-2 text-xs font-semibold text-ink-2">chỉ 1 câu</span>}
          {edited && <span className="rounded-full bg-todo-soft px-2 text-xs font-semibold text-todo-ink ring-1 ring-todo-line ring-inset">đã chỉnh</span>}
        </div>
        <div className="text-right leading-none" aria-hidden>
          <b className="block font-mono text-[28px] font-bold tracking-tighter text-[var(--k-ink)]">{x}/{n}</b>
          <span className="text-xs text-ink-3">{n ? Math.round((x / n) * 100) : 0}% lớp</span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-off-soft" aria-hidden>
        <span className="block h-full rounded-full bg-[var(--k)] transition-[width] duration-300" style={{ width: `${n ? (x / n) * 100 : 0}%` }} />
      </div>
      {g.desc && <p className="text-[15px] text-ink-2">{g.desc}</p>}
      {hasQuote ? (
        <blockquote className="relative rounded-xl border border-line bg-surface-2 py-3 pr-4 pl-11 text-[15.5px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
          <Quote className="absolute top-3.5 left-3.5 size-4.5 text-[var(--k)]" aria-hidden />{g.quote}
        </blockquote>
      ) : g.quote && x > 0 ? (
        <p className="text-[15px] text-ink-2">(Câu trích của AI thuộc câu đã chuyển sang nhóm khác — bấm mã câu để đọc nguyên văn.)</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-0.5 text-[12.5px] text-ink-3">Câu trả lời</span>
        {!x && <span className="text-[13.5px] text-ink-3 italic">Nhóm trống — sẽ không có trong bản nháp.</span>}
        {g.ids.map((aid) => {
          const isOpen = open === aid, moved = !g.aiIds.includes(aid);
          return (
            <button key={aid} ref={(el) => { chipRefs.current[aid] = el; }} type="button" draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", aid); e.dataTransfer.effectAllowed = "move"; }}
              onClick={() => onOpen(isOpen ? null : aid)} aria-expanded={isOpen} aria-controls={isOpen ? `${uid}-detail` : undefined}
              aria-label={`Câu ${aid}${moved ? " (TA đã chuyển vào)" : ""} — xem nguyên văn`}
              className={`inline-flex h-7.5 min-w-[46px] items-center justify-center gap-1 rounded-lg border px-2 font-mono text-[13px] font-semibold transition-colors
                ${isOpen ? "border-brand bg-brand text-on-brand" : moved ? "border-dashed border-todo bg-surface hover:bg-brand-soft" : "border-line-strong bg-surface hover:border-brand hover:bg-brand-soft hover:text-brand-ink"}`}>
              {moved && !isOpen && <span className="size-1.5 rounded-full bg-todo" aria-hidden />}{aid}
            </button>
          );
        })}
      </div>
      {open && g.ids.includes(open) && (
        <div id={`${uid}-detail`} role="region" aria-label={`Nguyên văn câu ${open}`} className="grid animate-fade-up gap-3 rounded-xl border border-line-strong bg-surface-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-3"><Eye className="size-3.5" aria-hidden />Nguyên văn {open} · dữ liệu học viên, hiện dạng chữ</span>
            <button type="button" onClick={() => onOpen(null)} aria-label="Đóng (Esc)" title="Đóng (Esc)" className="grid size-7.5 place-items-center rounded-lg text-ink-3 hover:bg-surface"><X className="size-4" /></button>
          </div>
          <p className="text-base whitespace-pre-wrap [overflow-wrap:anywhere]">{answers ? (answers[open] ?? "(không thấy câu này)") || "(bỏ trống)" : "Đang tải…"}</p>
          {others.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={`${uid}-mv`} className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-2"><ArrowRightLeft className="size-3.5" aria-hidden />Chuyển sang nhóm…</label>
              <select id={`${uid}-mv`} value={target} onChange={(e) => setTarget(e.target.value)} className="field h-8.5 max-w-full px-2 text-sm">
                {others.map((o) => <option key={o.key} value={o.key}>{KIND_LABEL[o.kind] || "Nhóm"} · {o.name}</option>)}
              </select>
              <button type="button" className="btn btn-sm" onClick={() => target && onMove(open, target)} aria-label={`Chuyển ${open} sang nhóm đã chọn`}>Chuyển</button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function RenameInput({ initial, onDone }: { initial: string; onDone: (v: string | null) => void }) {
  const [v, setV] = useState(initial);
  const done = useRef(false);
  const finish = (save: boolean) => {
    if (done.current) return;
    done.current = true;
    const t = v.replace(/\s+/g, " ").trim();
    onDone(save && t ? t : null);
  };
  return (
    <input autoFocus value={v} maxLength={120} onChange={(e) => setV(e.target.value)} onFocus={(e) => e.target.select()}
      onKeyDown={(e) => {
        if (e.nativeEvent.isComposing) return;
        if (e.key === "Enter") { e.preventDefault(); finish(true); }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(false); }
      }}
      onBlur={() => finish(true)} aria-label="Tên nhóm mới — Enter để lưu, Esc để huỷ"
      className="min-w-[min(340px,100%)] flex-1 rounded-[7px] border border-brand bg-surface px-2 text-lg font-semibold ring-3 ring-brand-soft outline-none" />
  );
}
