import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Code2, Layers, LayoutGrid, Lock, MessageSquarePlus, Pencil, RotateCcw, Sparkles } from "lucide-react";
import { api, ApiError, type AnalyzeResp, type Question } from "../lib/api";
import { QuestionSidebar } from "../components/QuestionSidebar";
import { PromptBox } from "../components/PromptBox";
import { finalStates, Stepper, type StepState } from "../components/Stepper";
import { ReportView, type TurnEdits } from "../components/ReportView";
import { Alert } from "../components/Alert";
import { TraceDrawer } from "../components/TraceDrawer";
import { loadTurns, newId, saveTurns, timeHM, type Turn } from "../lib/chat";

type Pending = { id: string; text: string; at: number; qid: string | null; finished: { states: StepState[]; subs: (string | null)[] } | null };

const qidOf = (t: string) => { const m = /\b[Qq]\s?(\d{1,3})\b/.exec(t); return m ? "Q" + String(parseInt(m[1], 10)).padStart(2, "0") : null; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Workspace({ questions, qError, minAnswers, maxText, params }: {
  questions: Question[] | null; qError: string | null; minAnswers: number; maxText: number; params: URLSearchParams;
}) {
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>(loadTurns);
  const [pending, setPending] = useState<Pending | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const prompt = useRef<HTMLTextAreaElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const thread = useRef<HTMLDivElement>(null);
  const inflight = useRef(false);            // khoá đồng bộ: 2 lần bấm liên tiếp trước khi React vẽ lại
  const abortRef = useRef<AbortController | null>(null);
  const scrollTo = useRef<string | null>(null);

  useEffect(() => { saveTurns(turns); }, [turns]);

  // Cuộn mượt tới lượt mới: khi gửi (tới bubble đang chạy) và khi có kết quả (tới đầu phản hồi để đọc từ trên xuống)
  useEffect(() => {
    const id = scrollTo.current;
    if (!id) return;
    scrollTo.current = null;
    requestAnimationFrame(() => document.getElementById(`turn-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  });

  const run = useCallback(async (override?: string) => {
    if (inflight.current) { setNotice("Đang chạy một lượt — đợi xong hoặc bấm Huỷ."); return; }
    const t = (override ?? text).trim();
    if (!t) { setNotice("Gõ yêu cầu, vd [Q01] Phân tích câu trả lời của lớp, hoặc bấm câu hỏi bên trái."); prompt.current?.focus(); return; }
    if (t.length > maxText) { setNotice(`Yêu cầu quá dài (${t.length}/${maxText} ký tự) — chỉ cần mã câu hỏi và một câu ngắn.`); return; }
    setNotice(null);
    inflight.current = true;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const id = newId(), at = Date.now();
    setText("");
    setPending({ id, text: t, at, qid: qidOf(t), finished: null });
    scrollTo.current = id;
    let data: AnalyzeResp | null = null, err: ApiError | null = null;
    try { data = await api.analyze(t, ctrl.signal); }
    catch (e) {
      err = e instanceof ApiError ? e : new ApiError(0, { code: "client", title: "Có lỗi khi gọi máy chủ", hint: String((e as Error)?.message ?? e) }, null);
      data = err.body && typeof err.body === "object" && "guardrails" in (err.body as object) ? (err.body as AnalyzeResp) : null;
    }
    if (err?.info.code === "aborted") {
      setTurns((ts) => [...ts, { id, text: t, at, status: "cancelled" }]);
    } else {
      setPending((p) => (p && p.id === id ? { ...p, finished: finalStates(data) } : p));
      await sleep(Math.min(450, Math.max(0, 700 - (Date.now() - at)) + 250));      // cho người xem thấy bước cuối hoàn tất
      const turn: Turn = err
        ? { id, text: t, at, status: "error", err: err.info, soft: !!data?.soft, data: data && data.trace ? data : undefined }
        : { id, text: t, at, status: "done", data: data ?? undefined };
      setTurns((ts) => [...ts, turn]);
    }
    setPending(null);
    scrollTo.current = id;
    abortRef.current = null;
    inflight.current = false;
    requestAnimationFrame(() => prompt.current?.focus({ preventScroll: true }));
  }, [text, maxText]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);
  // hàm ổn định cho các lượt cũ: không đổi theo từng phím gõ → lượt cũ (báo cáo nặng) không bị vẽ lại khi TA đang gõ
  const runRef = useRef(run);
  runRef.current = run;
  const retry = useCallback((t: string) => { runRef.current(t); }, []);

  const newChat = useCallback(() => {
    if (turns.length && !window.confirm(`Xoá ${turns.length} lượt khỏi màn hình để bắt đầu cuộc trò chuyện mới?\nBản nháp đã bấm "Lưu" vẫn còn trong Lịch sử.`)) return;
    abortRef.current?.abort();
    setTurns([]);
    setNotice(null);
    thread.current?.scrollTo({ top: 0 });
    prompt.current?.focus();
  }, [turns.length]);

  const patchTurn = useCallback((id: string, patch: Partial<Turn>) => setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t))), []);

  const pick = useCallback((qid: string) => {
    setText(`[${qid}] Phân tích câu trả lời của lớp`);
    setNotice(null);
    requestAnimationFrame(() => prompt.current?.focus());
  }, []);

  // ?q=Q04 (từ Dashboard) → điền sẵn; &run=1 (từ Import) → chạy luôn
  useEffect(() => {
    const q = params.get("q");
    if (!q) return;
    const t = `[${q}] Phân tích câu trả lời của lớp`;
    setText(t);
    if (params.get("run") === "1") run(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable;
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); search.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);      // rời tab giữa chừng → huỷ lượt đang chạy

  const activeQid = qidOf(text) ?? pending?.qid ?? null;
  const count = turns.length + (pending ? 1 : 0);
  return (
    <div className="grid lg:h-[calc(100vh-60px)] lg:grid-cols-[300px_minmax(0,1fr)] lg:overflow-hidden">
      <div className="order-2 border-t border-line lg:order-1 lg:border-t-0">
        <QuestionSidebar ref={search} questions={questions} error={qError} activeQid={activeQid} minAnswers={minAnswers} onPick={pick} />
      </div>
      <main className="order-1 flex min-h-[calc(100vh-60px)] min-w-0 flex-col lg:order-2 lg:h-full lg:min-h-0">
        <div className="flex items-center gap-3 border-b border-line bg-surface/80 px-4 py-2 backdrop-blur md:px-8">
          <span className="text-[13px] text-ink-3"><b className="font-semibold text-ink-2">{count}</b> lượt trong phiên{pending ? " · đang chạy 1 lượt" : ""}</span>
          <button type="button" className="btn btn-sm ml-auto" onClick={newChat} disabled={!turns.length && !pending}>
            <MessageSquarePlus className="size-3.5" aria-hidden />Cuộc trò chuyện mới
          </button>
        </div>

        <div ref={thread} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8" aria-live="polite" aria-label="Lịch sử hội thoại">
          <div className="mx-auto grid max-w-[1000px] grid-cols-[minmax(0,1fr)] gap-6">
            {!turns.length && !pending && <Empty />}
            {turns.map((t) => (
              <TurnView key={t.id} turn={t} questions={questions ?? []} pick={pick} onRetry={retry} busy={!!pending} onPatch={patchTurn} />
            ))}
            {pending && (
              <div id={`turn-${pending.id}`} className="grid scroll-mt-4 gap-3">
                <UserBubble text={pending.text} at={pending.at} />
                <AssistantShell>
                  <Stepper key={pending.id} qid={pending.qid} finished={pending.finished} onCancel={cancel} compact />
                </AssistantShell>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 border-t border-line bg-bg/95 px-4 pt-3 pb-3 backdrop-blur md:px-8">
          <div className="mx-auto max-w-[1000px]">
            <PromptBox ref={prompt} value={text} onChange={(v) => { setText(v); if (notice) setNotice(null); }} onSubmit={run} busy={!!pending} maxText={maxText} notice={notice} />
          </div>
        </div>
      </main>
    </div>
  );
}

function UserBubble({ text, at }: { text: string; at: number }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-on-brand shadow-card md:max-w-[70%]">
        <p className="text-[15px] leading-snug whitespace-pre-wrap [overflow-wrap:anywhere]">{text}</p>
        <p className="mt-1 text-right font-mono text-[11px] opacity-75"><time dateTime={new Date(at).toISOString()}>{timeHM(at)}</time></p>
      </div>
    </div>
  );
}

function AssistantShell({ children, header }: { children: React.ReactNode; header?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
      <span className="mt-0.5 grid size-8 place-items-center rounded-[9px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-card" aria-hidden>
        <Layers className="size-4" />
      </span>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">{header}{children}</div>
    </div>
  );
}

/** Một lượt hội thoại. memo + key=turn.id: chỉnh sửa ở lượt này không render lại / không đụng state lượt khác. */
const TurnView = memo(function TurnView({ turn, questions, pick, onRetry, busy, onPatch }: {
  turn: Turn; questions: Question[]; pick: (q: string) => void; onRetry: (t: string) => void; busy: boolean;
  onPatch: (id: string, patch: Partial<Turn>) => void;
}) {
  const onEdits = useCallback((e: TurnEdits) => onPatch(turn.id, { edits: e }), [onPatch, turn.id]);
  const p = turn.data?.result?.parsed;
  const summary = turn.status === "cancelled" ? "Đã huỷ"
    : turn.status === "error" ? `Lỗi: ${turn.err?.title ?? "không rõ"}`
    : p?.kind === "report" ? `${p.qid} · ${p.groups.length} nhóm · ${p.n} câu trả lời` : p?.kind === "notice" ? p.title : "Kết quả";
  const header = turn.status !== "cancelled" && (
    <div className="flex items-center gap-2 text-[12.5px] text-ink-3">
      <span className="font-semibold text-ink-2">Trợ lý</span>
      {turn.collapsed && <span className="truncate">· {summary}</span>}
      <button type="button" onClick={() => onPatch(turn.id, { collapsed: !turn.collapsed })} aria-expanded={!turn.collapsed}
        className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium hover:bg-off-soft hover:text-ink">
        {turn.collapsed ? <><ChevronDown className="size-3.5" aria-hidden />Mở rộng</> : <><ChevronUp className="size-3.5" aria-hidden />Thu gọn</>}
      </button>
    </div>
  );
  return (
    <div id={`turn-${turn.id}`} className="grid scroll-mt-4 gap-3">
      <UserBubble text={turn.text} at={turn.at} />
      <AssistantShell header={header}>
        {turn.status === "cancelled" ? (
          <p className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-line-strong px-4 py-3 text-sm text-ink-3">
            Đã huỷ lượt này. Máy chủ có thể vẫn đang chạy nốt — nếu lượt sau báo “đang bận”, đợi vài giây rồi thử lại.
            <button type="button" className="btn btn-sm ml-auto" disabled={busy} onClick={() => onRetry(turn.text)}><RotateCcw className="size-3.5" aria-hidden />Gửi lại</button>
          </p>
        ) : turn.collapsed ? null : turn.status === "error" ? (
          <>
            <Alert tone={turn.soft ? "warn" : "bad"} title={turn.err?.title ?? "Có lỗi khi phân tích"} message={turn.soft ? undefined : turn.err?.hint}
              next={turn.soft ? turn.err?.hint : `Mã lỗi: ${turn.err?.code ?? "?"}${turn.err?.detail ? " · " + turn.err.detail : ""} · không có gì được gửi đi.`}>
              {!turn.soft && <div><button type="button" className="btn btn-primary" disabled={busy} onClick={() => onRetry(turn.text)}><RotateCcw className="size-4" aria-hidden />Thử lại</button></div>}
            </Alert>
            {turn.data && <TraceDrawer data={turn.data} />}
          </>
        ) : turn.data ? (
          <Result data={turn.data} questions={questions} pick={pick} saved={turn.edits} onEdits={onEdits} />
        ) : (
          <Alert tone="warn" title="Máy chủ không trả kết quả phân tích" next="Thử gửi lại." />
        )}
      </AssistantShell>
    </div>
  );
});

function Result({ data, questions, pick, saved, onEdits }: {
  data: AnalyzeResp; questions: Question[]; pick: (q: string) => void; saved?: TurnEdits; onEdits: (e: TurnEdits) => void;
}) {
  const p = data.result?.parsed;
  if (p?.kind === "report") return <ReportView data={data} questions={questions} saved={saved} onEdits={onEdits} />;
  if (!data.result) return <Alert tone="warn" title="Máy chủ không trả kết quả phân tích" next="Thử gửi lại." />;
  if (p?.kind === "notice") {
    return (
      <>
        <Alert tone="warn" title={p.title} message={data.result.output} next={p.hint}>
          {p.actions.length > 0 && (
            <div role="group" aria-label="Câu hỏi có thể phân tích" className="mt-1 flex flex-wrap gap-1.5">
              {p.actions.map((q) => {
                const info = questions.find((x) => x.qid === q);
                return <button key={q} type="button" title={info?.cau_hoi} onClick={() => pick(q)}
                  className="h-7.5 rounded-lg border border-line-strong bg-surface px-2.5 font-mono text-[13px] font-semibold text-brand-ink hover:border-brand hover:bg-brand-soft">{q}</button>;
              })}
            </div>
          )}
        </Alert>
        <TraceDrawer data={data} />
      </>
    );
  }
  return (
    <>
      <Alert tone="warn" title="Không tách được kết quả — hiện nguyên văn" next="Nội dung đầy đủ ở phần Trace bên dưới (Output gốc)." />
      <TraceDrawer data={data} defaultOpen />
    </>
  );
}

function Empty() {
  const steps = [
    { Icon: Sparkles, tone: "bg-brand-soft text-brand-ink", t: "AI gom nhóm cách hiểu", s: "Model xếp mỗi câu trả lời vào đúng một nhóm: hiểu đúng, từng kiểu hiểu sai, bỏ trống, lạc đề." },
    { Icon: Code2, tone: "bg-ok-soft text-ok-ink", t: "Code tự đếm x/N & kiểm trích dẫn", s: "Số đếm do code tính từ danh sách id. check_report kiểm câu trích nguyên văn, id thật, không sót câu." },
    { Icon: Pencil, tone: "bg-warn-soft text-warn-ink", t: "TA duyệt & sửa bản nháp", s: "Đổi tên nhóm, chuyển câu sang nhóm khác, lưu bản nháp rồi tự quyết định nói gì với lớp." },
  ];
  return (
    <section className="card animate-fade-up" aria-labelledby="empty-h">
      <h3 id="empty-h" className="flex items-center gap-2 border-b border-line px-5 py-4 text-[15px] font-semibold"><LayoutGrid className="size-4" aria-hidden />Chọn một câu hỏi bên trái hoặc bấm một kịch bản demo bên dưới để bắt đầu</h3>
      <div className="grid gap-5 p-5">
        <ol className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {steps.map(({ Icon, tone, t, s }, i) => (
            <li key={t} className="contents">
              <div className="grid content-start gap-2 rounded-xl border border-line bg-surface-2 p-4">
                <span className={`grid size-9 place-items-center rounded-[10px] ${tone}`}><Icon className="size-4.5" aria-hidden /></span>
                <span className="font-mono text-[11.5px] font-semibold text-ink-3">BƯỚC {i + 1}</span>
                <b className="text-[15px] leading-snug font-semibold">{t}</b>
                <span className="text-[13.5px] leading-snug text-ink-2">{s}</span>
              </div>
              {i < 2 && <span className="grid place-items-center text-ink-3 max-md:rotate-90" aria-hidden><ArrowRight className="size-4" /></span>}
            </li>
          ))}
        </ol>
        <p className="flex items-center gap-2 text-[13.5px] text-ink-2"><Lock className="size-4 text-ok" aria-hidden />Không có gì được gửi đi: không gửi lớp, không Discord, không email. Lịch sử chat và bản nháp chỉ lưu trên máy này.</p>
      </div>
    </section>
  );
}
