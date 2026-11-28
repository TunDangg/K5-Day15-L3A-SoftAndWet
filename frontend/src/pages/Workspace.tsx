import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Code2, LayoutGrid, Lock, Pencil, RotateCcw, Sparkles } from "lucide-react";
import { api, ApiError, type AnalyzeResp, type ErrorInfo, type Question } from "../lib/api";
import { QuestionSidebar } from "../components/QuestionSidebar";
import { PromptBox } from "../components/PromptBox";
import { finalStates, Stepper, type StepState } from "../components/Stepper";
import { ReportView } from "../components/ReportView";
import { Alert } from "../components/Alert";
import { TraceDrawer } from "../components/TraceDrawer";

type Phase =
  | { kind: "idle" }
  | { kind: "loading"; qid: string | null; finished: { states: StepState[]; subs: (string | null)[] } | null }
  | { kind: "done"; data: AnalyzeResp; id: number }
  | { kind: "error"; err: ErrorInfo; soft: boolean; data: AnalyzeResp | null };

const qidOf = (t: string) => { const m = /\b[Qq]\s?(\d{1,3})\b/.exec(t); return m ? "Q" + String(parseInt(m[1], 10)).padStart(2, "0") : null; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Workspace({ questions, qError, minAnswers, maxText, params }: {
  questions: Question[] | null; qError: string | null; minAnswers: number; maxText: number; params: URLSearchParams;
}) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const busy = phase.kind === "loading";
  const lastText = useRef("");
  const prompt = useRef<HTMLTextAreaElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const runId = useRef(0);
  const inflight = useRef(false);      // khoá đồng bộ: state "loading" chưa kịp cập nhật giữa 2 lần bấm liên tiếp

  const run = useCallback(async (override?: string) => {
    if (inflight.current) return;
    const t = (override ?? text).trim();
    if (!t) { setPhase({ kind: "error", soft: true, data: null, err: { code: "empty", title: "Chưa có yêu cầu", hint: "Gõ yêu cầu, ví dụ [Q01] Phân tích câu trả lời của lớp, hoặc chọn câu hỏi bên trái." } }); return; }
    if (t.length > maxText) { setPhase({ kind: "error", soft: true, data: null, err: { code: "too_long", title: `Yêu cầu quá dài (${t.length} ký tự)`, hint: `Giới hạn ${maxText} ký tự. Chỉ cần mã câu hỏi và một câu ngắn.` } }); return; }
    lastText.current = t;
    inflight.current = true;
    const id = ++runId.current, t0 = Date.now();
    setPhase({ kind: "loading", qid: qidOf(t), finished: null });
    let data: AnalyzeResp | null = null, err: ApiError | null = null;
    try { data = await api.analyze(t); }
    catch (e) {
      err = e instanceof ApiError ? e : new ApiError(0, { code: "client", title: "Có lỗi khi gọi máy chủ", hint: String((e as Error)?.message ?? e) }, null);
      data = err.body && typeof err.body === "object" && "guardrails" in (err.body as object) ? (err.body as AnalyzeResp) : null;
    }
    finally { inflight.current = false; }
    if (id !== runId.current) return;
    setPhase((ph) => ph.kind === "loading" ? { ...ph, finished: finalStates(data) } : ph);
    await sleep(Math.min(450, Math.max(0, 700 - (Date.now() - t0)) + 250));       // cho người xem thấy bước cuối hoàn tất
    if (id !== runId.current) return;
    if (err) setPhase({ kind: "error", err: err.info, soft: !!(data && data.soft), data: data && data.trace ? data : null });
    else if (data) setPhase({ kind: "done", data, id });
  }, [text, maxText]);

  const pick = useCallback((qid: string) => {
    setText(`[${qid}] Phân tích câu trả lời của lớp`);
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

  const activeQid = qidOf(text);
  return (
    <div className="grid min-h-[calc(100vh-60px)] lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="order-2 border-t border-line lg:order-1 lg:border-t-0">
        <QuestionSidebar ref={search} questions={questions} error={qError} activeQid={activeQid} minAnswers={minAnswers} onPick={pick} />
      </div>
      <main className="order-1 min-w-0 px-4 py-6 md:px-8 md:py-8 lg:order-2">
        <div className="mx-auto grid max-w-[1000px] gap-5">
          <PromptBox ref={prompt} value={text} onChange={setText} onSubmit={run} busy={busy} maxText={maxText} />
          <div aria-live="polite" className="grid gap-5">
            {phase.kind === "idle" && <Empty />}
            {phase.kind === "loading" && <Stepper key={runId.current} qid={phase.qid} finished={phase.finished} />}
            {phase.kind === "done" && <Result key={phase.id} data={phase.data} questions={questions ?? []} pick={pick} />}
            {phase.kind === "error" && (
              <>
                <Alert tone={phase.soft ? "warn" : "bad"} title={phase.err.title} message={phase.soft ? undefined : phase.err.hint}
                  next={phase.soft ? phase.err.hint : `Mã lỗi: ${phase.err.code}${phase.err.detail ? " · " + phase.err.detail : ""} · không có gì được gửi đi.`}>
                  {!phase.soft && lastText.current && (
                    <div><button type="button" className="btn btn-primary" onClick={() => run(lastText.current)}><RotateCcw className="size-4" aria-hidden />Thử lại</button></div>
                  )}
                </Alert>
                {phase.data && <TraceDrawer data={phase.data} />}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Result({ data, questions, pick }: { data: AnalyzeResp; questions: Question[]; pick: (q: string) => void }) {
  const p = data.result?.parsed;
  if (p?.kind === "report") return <ReportView data={data} questions={questions} />;
  if (!data.result) return <Alert tone="warn" title="Máy chủ không trả kết quả phân tích" next="Thử bấm Phân tích lại." />;
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
      <h3 id="empty-h" className="flex items-center gap-2 border-b border-line px-5 py-4 text-[15px] font-semibold"><LayoutGrid className="size-4" aria-hidden />Chọn một câu hỏi bên trái hoặc bấm một kịch bản demo để bắt đầu</h3>
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
        <p className="flex items-center gap-2 text-[13.5px] text-ink-2"><Lock className="size-4 text-ok" aria-hidden />Không có gì được gửi đi: không gửi lớp, không Discord, không email. Bản nháp chỉ lưu trên máy này.</p>
      </div>
    </section>
  );
}
