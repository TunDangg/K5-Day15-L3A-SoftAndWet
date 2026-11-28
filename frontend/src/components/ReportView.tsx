import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, FileText, Hash, Info, LayoutGrid, Lock, Pencil, RotateCcw, Shield, ShieldCheck, Users } from "lucide-react";
import { api, type AnalyzeResp, type ParsedReport, type Question } from "../lib/api";
import { cardEdited, draftText, isEdited, KIND_LABEL, RANK_PREFIX, toEditGroups, type EditGroup, idNum } from "../lib/draft";
import { GroupCard } from "./GroupCard";
import { DraftEditor } from "./DraftEditor";
import { TraceDrawer } from "./TraceDrawer";
import { useToast } from "./Toast";

const answersCache: Record<string, Record<string, string>> = {};

const GUARD_TITLE: Record<string, string> = {
  rank_refusal: "Guardrail: không chấm điểm, không xếp hạng học viên",
  injection_isolated: "Guardrail: cô lập câu trả lời chứa chỉ dẫn chèn",
};

export function ReportView({ data, questions }: { data: AnalyzeResp; questions: Question[] }) {
  const toast = useToast();
  const p = data.result!.parsed as ParsedReport;
  const N = p.n;
  const original = useMemo(() => toEditGroups(p.groups), [p]);
  const [groups, setGroups] = useState<EditGroup[]>(original);
  const [open, setOpen] = useState<{ key: string; aid: string } | null>(null);
  const [focus, setFocus] = useState<{ key: string; aid: string } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string> | null>(answersCache[p.qid] ?? null);

  useEffect(() => {
    if (answersCache[p.qid]) return;
    api.answers(p.qid).then((a) => {
      const m: Record<string, string> = {};
      a.cau_tra_loi.forEach((x) => { m[x.id] = x.text; });
      answersCache[p.qid] = m;
      setAnswers(m);
    }).catch(() => {});
  }, [p.qid]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && !e.isComposing) { setFocus(open); setOpen(null); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const move = useCallback((aid: string, toKey: string) => {
    setGroups((gs) => {
      const from = gs.find((g) => g.ids.includes(aid)), to = gs.find((g) => g.key === toKey);
      if (!from || !to || from === to) return gs;
      toast(`Đã chuyển ${aid} sang “${to.name}”`);
      return gs.map((g) => g === from ? { ...g, ids: g.ids.filter((i) => i !== aid) }
        : g === to ? { ...g, ids: [...g.ids, aid].sort((a, b) => idNum(a) - idNum(b)) } : g);
    });
    setOpen(null);
    setFocus({ key: toKey, aid });
  }, [toast]);

  const edited = isEdited(groups, original);
  const live = groups.filter((g) => g.ids.length);
  const rank = p.notes.filter((t) => t.startsWith(RANK_PREFIX));
  const otherNotes = p.notes.filter((t) => !t.startsWith(RANK_PREFIX));
  const m = data.meta;
  const q = questions.find((x) => x.qid === p.qid);
  const blocks = data.guardrails.filter((g) => g.level === "block");
  const generated = draftText(p, groups, answers, edited);
  const facts: [string, string][] = [
    ...otherNotes.map((t) => ["Ghi chú của AI", t] as [string, string]),
    ...p.after.map((t) => ["Nhận xét", t] as [string, string]),
    ...(p.limit ? [["Giới hạn", p.limit.replace(/^Giới hạn:\s*/, "")] as [string, string]] : []),
    ...(p.fixes ? [["Code đã sửa bản của AI", p.fixes.replace(/^Code đã sửa bản của AI:\s*/, "")] as [string, string]] : []),
  ];

  return (
    <div className="grid gap-5">
      <section className="grid animate-fade-up gap-3" aria-label="Bản nháp">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand bg-brand-soft px-2.5 py-0.5 text-xs font-bold tracking-wider text-brand-ink uppercase"><FileText className="size-3.5" aria-hidden />Nháp — chờ TA duyệt</span>
          {edited && <span className="inline-flex items-center gap-1.5 rounded-full border border-todo-line bg-todo-soft px-2.5 py-0.5 text-xs font-semibold text-todo-ink"><Pencil className="size-3" aria-hidden />TA đã chỉnh</span>}
          {data.question?.source === "import" && <span className="rounded-full bg-off-soft px-2.5 py-0.5 text-xs font-semibold text-ink-2">dữ liệu TA import</span>}
        </div>
        <h2 className="text-2xl leading-tight font-bold tracking-tight">{p.cau_hoi}</h2>
      </section>

      <section className="card animate-fade-up overflow-hidden" aria-label="Chỉ số nhanh">
       <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
        <Metric icon={Hash} k="Câu hỏi" v={<span className="font-mono">{p.qid}</span>} sub={q?.kc_code ?? ""} />
        <Metric icon={Users} k="Câu trả lời" v={N} sub="đã nộp" />
        <Metric icon={LayoutGrid} k="Nhóm cách hiểu" v={live.length} sub={`${live.filter((g) => g.kind === "sai").length} kiểu hiểu sai`} />
        <Metric icon={m?.check_report === "pass" ? ShieldCheck : AlertTriangle} k="Kiểm chứng code"
          v={<span className={`flex items-center gap-1.5 text-lg ${m?.check_report === "pass" ? "text-ok-ink" : "text-warn-ink"}`}>
            {m?.check_report === "pass" ? <ShieldCheck className="size-5" aria-hidden /> : <AlertTriangle className="size-5" aria-hidden />}{m?.check_report === "pass" ? "Đạt" : "Chưa kiểm"}</span>}
          sub="check_report · x/N & trích dẫn" />
        <Metric icon={Clock} k="Thời gian" v={<span className="font-mono">{((m?.elapsed_ms ?? 0) / 1000).toFixed(1)}s</span>}
          sub={`${m?.tokens_in ?? 0} → ${m?.tokens_out ?? 0} token · ${m?.models_called[0] ?? "—"}`} />
       </div>
      </section>

      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-off-soft" role="img"
        aria-label={"Phân bố: " + live.map((g) => `${KIND_LABEL[g.kind]} ${g.ids.length}/${N}`).join(", ")}>
        {live.map((g) => <span key={g.key} title={`${KIND_LABEL[g.kind]} · ${g.name} · ${g.ids.length}/${N}`} className={`k-${g.kind} block h-full bg-[var(--k)] transition-[width] duration-300`} style={{ width: `${(g.ids.length / N) * 100}%` }} />)}
      </div>

      {blocks.map((g) => (
        <section key={g.code} role="note" className="flex animate-fade-up items-start gap-3 rounded-2xl border border-bad-line bg-bad-soft px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-bad text-white"><Shield className="size-4.5" aria-hidden /></span>
          <div>
            <b className="block text-[15px] text-bad-ink">{GUARD_TITLE[g.code] ?? "Guardrail"}</b>
            <p className="mt-0.5 text-[15px]">{g.code === "rank_refusal" && rank.length ? rank.join(" ") : g.message}</p>
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-base font-semibold">Nhóm cách hiểu</h3>
        <span className="mr-auto flex items-center gap-1.5 text-[13px] text-ink-3"><Pencil className="size-3.5" aria-hidden />Bấm tên nhóm để đổi · bấm mã câu để đọc nguyên văn và chuyển nhóm (hoặc kéo thả)</span>
        <button type="button" className="btn" disabled={!edited} onClick={() => { setGroups(original); setOpen(null); toast("Đã hoàn tác về bản AI"); }}>
          <RotateCcw className="size-4" aria-hidden />Hoàn tác về bản AI
        </button>
      </div>
      <div role="list" aria-label="Các nhóm cách hiểu" className="grid gap-3">
        {groups.map((g) => (
          <GroupCard key={g.key} g={g} n={N} all={groups} answers={answers} edited={cardEdited(g, original)}
            open={open?.key === g.key ? open.aid : null}
            onOpen={(aid) => { setOpen(aid ? { key: g.key, aid } : null); if (!aid && open) setFocus(open); }}
            onRename={(name) => setGroups((gs) => gs.map((x) => x.key === g.key ? { ...x, name } : x))}
            onMove={move} focusChip={focus?.key === g.key ? focus.aid : null} />
        ))}
      </div>

      <section className="card animate-fade-up" aria-labelledby="facts-h">
        <h3 id="facts-h" className="flex items-center gap-2 border-b border-line px-5 py-3 text-[15px] font-semibold"><Info className="size-4" aria-hidden />Làm tốt đến đâu</h3>
        <div className="p-5">
          <dl className="grid gap-x-5 gap-y-2 text-[14.5px] sm:grid-cols-[max-content_1fr]">
            {facts.map(([k, v], i) => <div key={i} className="contents"><dt className="font-semibold text-ink-3">{k}</dt><dd className="mb-2 sm:mb-0">{v}</dd></div>)}
          </dl>
          {p.footer && <p className="mt-3 flex items-center gap-1.5 text-[13px] text-ink-3"><Lock className="size-3.5" aria-hidden />{p.footer}</p>}
        </div>
      </section>

      <DraftEditor qid={p.qid} question={p.cau_hoi} generated={generated} model={m?.models_called[0]}
        groups={groups.filter((g) => g.ids.length).map((g) => ({ kind: g.kind, name: g.name, ids: g.ids }))} />

      <TraceDrawer data={data} />
    </div>
  );
}

function Metric({ icon: Icon, k, v, sub }: { icon: typeof Hash; k: string; v: React.ReactNode; sub: string }) {
  return (
    <div className="grid min-w-0 gap-0.5 bg-surface px-5 py-4">
      <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink-3 uppercase"><Icon className="size-3.5" aria-hidden />{k}</span>
      <span className="flex min-w-0 items-center text-[22px] leading-tight font-bold tracking-tight">{v}</span>
      {sub && <span className="truncate text-[12.5px] text-ink-3" title={sub}>{sub}</span>}
    </div>
  );
}
