import { useRef, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Download, EyeOff, FileJson, FileSpreadsheet, Lock, RotateCcw, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { api, ApiError, type ImportResp } from "../lib/api";
import { previewCSV, previewJSON, SAMPLE_CSV, TEXT_COLS, type Preview } from "../lib/csv";
import { downloadFile } from "../lib/draft";
import { navigate } from "../lib/router";
import { useToast } from "../components/Toast";

const MAX_BYTES = 2 * 1024 * 1024;
const SHOW_ROWS = 15;

export function ImportPage({ minAnswers, onImported }: { minAnswers: number; onImported: () => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [raw, setRaw] = useState("");
  const [question, setQuestion] = useState("");
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<ImportResp | null>(null);

  const isJson = !!file && (file.name.toLowerCase().endsWith(".json") || /^\s*[[{]/.test(raw));
  const preview: Preview | null = file ? (isJson ? previewJSON(raw, question) : previewCSV(raw, question)) : null;
  const needQuestion = !!preview && preview.questions.some((q) => q.cau_hoi === "(chưa có câu hỏi)");
  const canSubmit = !!preview && !busy && preview.total > 0 && preview.textCol !== null && !needQuestion &&
    !preview.problems.some((p) => !p.includes("Câu hỏi"));

  const accept = async (f: File | undefined) => {
    setErr(null); setDone(null);
    if (!f) return;
    if (!/\.(csv|json|tsv|txt)$/i.test(f.name)) { setErr("Chỉ nhận file .csv hoặc .json."); return; }
    if (f.size > MAX_BYTES) { setErr("File quá lớn (giới hạn 2 MB)."); return; }
    const text = await f.text();
    setFile(f); setRaw(text);
  };
  const reset = () => { setFile(null); setRaw(""); setErr(null); setQuestion(""); if (input.current) input.current.value = ""; };

  const submit = async () => {
    if (!file || busyRef.current) return;
    busyRef.current = true;
    setBusy(true); setErr(null);
    try {
      const r = await api.importFile(file, { cau_hoi: question.trim() || undefined });
      setDone(r);
      onImported();
      toast(`Đã nhập ${r.imported.length} câu hỏi: ${r.imported.map((i) => i.qid).join(", ")}`);
    } catch (e) {
      const a = e as ApiError;
      setErr(a?.info ? `${a.info.title}${a.info.hint ? " — " + a.info.hint : ""}` : "Không nhập được file — thử lại.");
    } finally { busyRef.current = false; setBusy(false); }
  };

  return (
    <main className="mx-auto grid max-w-[1100px] gap-5 px-4 py-6 md:px-8 md:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nhập dữ liệu lớp</h1>
          <p className="text-sm text-ink-3">Tải câu trả lời mở của lớp (.csv hoặc .json) → xem trước → xác nhận → phân tích ngay.</p>
        </div>
        <button type="button" className="btn" onClick={() => { downloadFile("mau-cau-tra-loi.csv", "﻿" + SAMPLE_CSV, "text/csv;charset=utf-8"); toast("Đã tải file mẫu CSV"); }}>
          <Download className="size-4" aria-hidden />Tải file mẫu CSV
        </button>
      </header>

      <section className="flex items-start gap-3 rounded-2xl border border-ok-line bg-ok-soft px-5 py-3.5 text-sm text-ok-ink">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p><b>Riêng tư:</b> chỉ giữ cột câu trả lời (và câu hỏi). Mọi cột khác như họ tên, email bị bỏ, không lưu. Email, số điện thoại, mã học viên trong câu trả lời được ẩn tự động. Dữ liệu lưu trên máy này (<code className="font-mono text-xs">data/runtime/</code>), không gửi đi đâu.</p>
      </section>

      {done ? <Done res={done} minAnswers={minAnswers} onMore={() => { reset(); setDone(null); }} /> : (
        <>
          {!file && (
            <section
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files[0]); }}
              className={`grid place-items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${drag ? "border-brand bg-brand-soft" : "border-line-strong bg-surface"}`}>
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-ink"><UploadCloud className="size-7" aria-hidden /></span>
              <div>
                <p className="text-lg font-semibold">Kéo thả file vào đây</p>
                <p className="text-sm text-ink-3">hoặc</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => input.current?.click()}><FileSpreadsheet className="size-4" aria-hidden />Chọn file .csv / .json</button>
              <input ref={input} type="file" accept=".csv,.json,.tsv,.txt,text/csv,application/json" className="sr-only" aria-label="Chọn file câu trả lời"
                onChange={(e) => accept(e.target.files?.[0])} />
              <p className="max-w-lg text-xs text-ink-3">CSV cần cột câu trả lời tên là một trong: <span className="font-mono">{TEXT_COLS.slice(0, 4).join(", ")}</span>… Cột <span className="font-mono">cau_hoi</span> tuỳ chọn (nhiều câu hỏi trong 1 file được). Tối đa 2 MB, 300 câu trả lời / câu hỏi.</p>
            </section>
          )}

          {err && <p role="alert" className="flex items-start gap-2 rounded-xl border border-bad-line bg-bad-soft px-4 py-3 text-sm text-bad-ink"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />{err}</p>}

          {file && preview && (
            <section className="card animate-fade-up" aria-labelledby="pv-h">
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
                {isJson ? <FileJson className="size-5 text-brand" aria-hidden /> : <FileSpreadsheet className="size-5 text-brand" aria-hidden />}
                <div className="min-w-0">
                  <h2 id="pv-h" className="truncate text-[15px] font-semibold">{file.name}</h2>
                  <p className="text-xs text-ink-3">{(file.size / 1024).toFixed(1)} KB · {preview.format.toUpperCase()} · {preview.total} dòng câu trả lời · {preview.questions.length} câu hỏi</p>
                </div>
                <button type="button" className="btn btn-ghost ml-auto" onClick={reset}><Trash2 className="size-4" aria-hidden />Chọn file khác</button>
              </div>

              <div className="grid gap-4 p-5">
                {preview.problems.filter((p) => !p.includes("Câu hỏi")).map((p) => (
                  <p key={p} className="flex items-start gap-2 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad-ink"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />{p}</p>
                ))}
                {preview.dropped.length > 0 && (
                  <p className="flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn-ink"><EyeOff className="mt-0.5 size-4 shrink-0" aria-hidden />Sẽ bỏ, không lưu các cột: <b>{preview.dropped.join(", ")}</b></p>
                )}
                {(needQuestion || preview.questionCol === null) && (
                  <label className="grid gap-1.5">
                    <span className="text-sm font-semibold">Câu hỏi mở {needQuestion && <span className="text-bad-ink">*</span>}</span>
                    <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} placeholder="Vd: Khi nào nên dùng workflow cố định thay vì agent?" className="field h-10 px-3" />
                    <span className="text-xs text-ink-3">File không có cột câu hỏi — câu này áp cho mọi dòng.</span>
                  </label>
                )}

                <div className="grid gap-2">
                  <h3 className="eyebrow">Sẽ tạo {preview.questions.length} câu hỏi</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {preview.questions.map((q) => (
                      <li key={q.cau_hoi} className="rounded-xl border border-line bg-surface-2 p-3">
                        <p className="line-clamp-2 text-sm font-medium">{q.cau_hoi}</p>
                        <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
                          <span className="rounded-full bg-off-soft px-2 py-0.5 text-ink-2">{q.count} câu trả lời</span>
                          {q.blank > 0 && <span className="rounded-full bg-off-soft px-2 py-0.5 text-ink-2">{q.blank} bỏ trống</span>}
                          {q.count < minAnswers && <span className="tag tag-warn"><AlertTriangle className="size-3" aria-hidden />&lt;{minAnswers} câu — sẽ không phân nhóm</span>}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-2">
                  <h3 className="eyebrow">Xem trước {Math.min(SHOW_ROWS, preview.rows.length)}/{preview.rows.length} dòng</h3>
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-surface-2 text-xs text-ink-3">
                        <tr>
                          <th className="w-12 px-3 py-2 font-semibold">#</th>
                          {preview.headers.map((h, i) => {
                            const used = i === preview.textCol ? "câu trả lời" : i === preview.questionCol ? "câu hỏi" : i === preview.kcCol ? "kc" : null;
                            return <th key={i} className={`px-3 py-2 font-semibold whitespace-nowrap ${used ? "" : "text-ink-3 line-through decoration-ink-3/50"}`}>
                              {h || "(trống)"}{used ? <span className="ml-1.5 rounded bg-brand-soft px-1 text-[10.5px] text-brand-ink no-underline">{used}</span> : <span className="ml-1.5 text-[10.5px] no-underline">bỏ</span>}
                            </th>;
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {preview.rows.slice(0, SHOW_ROWS).map((r, ri) => (
                          <tr key={ri} className="align-top">
                            <td className="px-3 py-2 font-mono text-xs text-ink-3">{ri + 1}</td>
                            {preview.headers.map((_, i) => {
                              const used = i === preview.textCol || i === preview.questionCol || i === preview.kcCol;
                              return <td key={i} className={`max-w-[420px] px-3 py-2 [overflow-wrap:anywhere] ${used ? "" : "text-ink-3/70 blur-[3px] select-none"}`} aria-hidden={!used || undefined}>
                                {(r[i] ?? "") || <span className="text-ink-3 italic">(trống)</span>}
                              </td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-ink-3">Cột bị bỏ được làm mờ. Đây chỉ là xem trước trên trình duyệt — máy chủ kiểm lại và ẩn thông tin cá nhân khi nhập.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">
                <button type="button" className="btn" onClick={reset}>Huỷ</button>
                <button type="button" className="btn btn-primary" disabled={!canSubmit} onClick={submit}>
                  {busy ? <span className="spinner" /> : <CheckCircle2 className="size-4" aria-hidden />}Xác nhận nhập {preview.questions.length} câu hỏi
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function Done({ res, minAnswers, onMore }: { res: ImportResp; minAnswers: number; onMore: () => void }) {
  return (
    <section className="card animate-fade-up" aria-labelledby="done-h">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span className="grid size-9 place-items-center rounded-[10px] bg-ok text-white"><CheckCircle2 className="size-5" aria-hidden /></span>
        <h2 id="done-h" className="text-[15px] font-semibold">Đã nhập {res.imported.length} câu hỏi</h2>
        <button type="button" className="btn btn-ghost ml-auto" onClick={onMore}><RotateCcw className="size-4" aria-hidden />Nhập file khác</button>
      </div>
      <div className="grid gap-3 p-5">
        {res.warnings.map((w, i) => (
          <p key={i} className="flex items-start gap-2 rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn-ink"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />{w.message}</p>
        ))}
        <ul className="grid gap-2">
          {res.imported.map((it) => (
            <li key={it.qid} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
              <span className="code-badge">{it.qid}</span>
              <span className="min-w-0 flex-1"><span className="line-clamp-1 text-sm font-medium">{it.cau_hoi}</span>
                <span className="text-xs text-ink-3">{it.so_cau_tra_loi} câu trả lời{it.so_bo_trong ? ` · ${it.so_bo_trong} bỏ trống` : ""}</span></span>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate("workspace", { q: it.qid, run: "1" })}
                disabled={it.so_cau_tra_loi < minAnswers} title={it.so_cau_tra_loi < minAnswers ? `Dưới ${minAnswers} câu — hệ thống sẽ không phân nhóm` : undefined}>
                <Sparkles className="size-3.5" aria-hidden />Phân tích ngay<ArrowRight className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
