import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Clock, Download, FileText, History, Lock, MessageSquare, Pencil, RotateCcw, Save, Trash2 } from "lucide-react";
import { api, ApiError, type DraftSummary } from "../lib/api";
import { copyText, DISCORD_LIMIT, downloadFile, stamp, toDiscord, toMarkdown } from "../lib/draft";
import { useToast } from "./Toast";

/** Trình chỉnh sửa bản nháp TA: soạn (lưu / copy Discord / tải .md) + lịch sử bản nháp đã lưu (SQLite cục bộ). */
export function DraftEditor({ qid, question, generated, groups, model, initialManual = null, onManualChange }: {
  qid: string; question: string; generated: string; groups: unknown[]; model?: string;
  /** Bản TA đã sửa tay của lượt chat này (khôi phục sau F5 / đổi tab); null = theo các thẻ. */
  initialManual?: string | null; onManualChange?: (manual: string | null) => void;
}) {
  const toast = useToast();
  const uid = useId();
  const [tab, setTab] = useState<"edit" | "history">("edit");
  const [manual, setManualState] = useState<string | null>(initialManual);   // null = theo các thẻ; chuỗi = TA đã sửa tay
  const setManual = useCallback((m: string | null) => { setManualState(m); onManualChange?.(m); }, [onManualChange]);
  const prevQid = useRef(qid);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);     // chống bấm đúp "Lưu bản nháp" trong cùng 1 nhịp
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<DraftSummary[] | null>(null);
  const [histErr, setHistErr] = useState<string | null>(null);
  const text = manual ?? generated;
  const discord = toDiscord(text);

  const loadHistory = useCallback(() => {
    setHistErr(null);
    api.drafts(qid).then((r) => setHistory(r.drafts)).catch((e: ApiError) => setHistErr(e.info.title));
  }, [qid]);
  useEffect(() => {                    // chỉ reset khi ĐỔI câu hỏi, không reset lúc mới mở (giữ bản sửa tay đã lưu)
    if (prevQid.current === qid) return;
    prevQid.current = qid;
    setHistory(null); setManual(null); setTitle("");
  }, [qid, setManual]);
  useEffect(() => { if (tab === "history") loadHistory(); }, [tab, loadHistory]);

  const save = async () => {
    if (savingRef.current || !text.trim()) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const r = await api.saveDraft({ qid, text, title: title.trim() || undefined, groups, source: "ta" });
      toast(`Đã lưu bản nháp #${r.draft.id} (chỉ lưu trên máy này)`);
      setHistory(null);
    } catch (e) {
      toast((e as ApiError).info?.title ?? "Không lưu được", "warn");
    } finally { savingRef.current = false; setSaving(false); }
  };
  const copyDiscord = async () => {
    if (await copyText(discord)) {
      setCopied(true);
      toast(discord.length > DISCORD_LIMIT ? `Đã sao chép — dài ${discord.length} ký tự, Discord giới hạn ${DISCORD_LIMIT}` : "Đã sao chép định dạng Discord — TA tự dán, hệ thống không gửi",
        discord.length > DISCORD_LIMIT ? "warn" : "ok");
      window.setTimeout(() => setCopied(false), 2000);
    } else toast("Không sao chép được — chọn chữ trong ô bản nháp", "warn");
  };
  const download = () => {
    downloadFile(`nhap-${qid}-${stamp()}.md`, toMarkdown(text, { qid, question, model }));
    toast("Đã tải file .md");
  };
  const restore = async (id: number) => {
    try {
      const r = await api.draft(id);
      setManual(r.draft.text);
      setTitle(r.draft.title ?? "");
      setTab("edit");
      toast(`Đã mở lại bản nháp #${id} — thay đổi trên các thẻ sẽ không ghi đè`);
    } catch (e) { toast((e as ApiError).info?.title ?? "Không mở được", "warn"); }
  };
  const remove = async (id: number) => {
    if (!window.confirm(`Xoá bản nháp #${id}? Không hoàn tác được.`)) return;
    try { await api.deleteDraft(id); toast(`Đã xoá bản nháp #${id}`); loadHistory(); }
    catch (e) { toast((e as ApiError).info?.title ?? "Không xoá được", "warn"); }
  };

  return (
    <section className="card min-w-0 animate-fade-up" aria-labelledby={`${uid}-h`}>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
        <h3 id={`${uid}-h`} className="flex items-center gap-2 text-[15px] font-semibold"><FileText className="size-4" aria-hidden />Bản nháp cho TA</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-off-soft px-2.5 py-0.5 text-xs font-semibold text-ink-2"><Lock className="size-3" aria-hidden />Lưu cục bộ · không tự gửi</span>
        <div role="tablist" aria-label="Bản nháp" className="ml-auto flex gap-1 rounded-lg bg-surface-2 p-0.5 ring-1 ring-line">
          {([["edit", "Soạn", FileText], ["history", "Lịch sử đã lưu", History]] as const).map(([k, label, Icon]) => (
            <button key={k} role="tab" type="button" aria-selected={tab === k} aria-controls={`${uid}-${k}`} data-tab={k} onClick={() => setTab(k)}
              className={`inline-flex h-7.5 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium ${tab === k ? "bg-surface text-brand-ink shadow-card" : "text-ink-2 hover:text-ink"}`}>
              <Icon className="size-3.5" aria-hidden />{label}
            </button>
          ))}
        </div>
      </div>

      <div id={`${uid}-edit`} data-panel="edit" role="tabpanel" hidden={tab !== "edit"}>
        {manual !== null && (
          <div className="flex flex-wrap items-center gap-2 border-b border-warn-line bg-warn-soft px-5 py-2 text-[13px] text-warn-ink">
            <Pencil className="size-3.5" aria-hidden />Bạn đang sửa tay bản nháp — thay đổi trên các thẻ sẽ không ghi đè ô này.
            <button type="button" className="btn btn-sm ml-auto" onClick={() => setManual(null)}><RotateCcw className="size-3.5" aria-hidden />Tạo lại từ các thẻ</button>
          </div>
        )}
        <textarea value={text} onChange={(e) => setManual(e.target.value)} spellCheck={false} aria-label="Bản nháp dạng chữ, có thể sửa trực tiếp"
          className="block min-h-[280px] w-full resize-y bg-surface px-5 py-4 font-mono text-[14px] leading-relaxed outline-none focus:ring-2 focus:ring-brand focus:ring-inset" />
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
          <label className="flex min-w-[200px] flex-1 items-center gap-2">
            <span className="sr-only">Tên bản nháp (tuỳ chọn)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Tên bản nháp (tuỳ chọn), vd: Recap Q01 buổi 5"
              className="field h-9 w-full px-3 text-sm" />
          </label>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving || !text.trim()}>
            {saving ? <span className="spinner" /> : <Save className="size-4" aria-hidden />}Lưu bản nháp
          </button>
          <button type="button" className={`btn ${copied ? "border-ok bg-ok text-white hover:bg-ok" : ""}`} onClick={copyDiscord}
            title="Sao chép theo định dạng Markdown của Discord. Hệ thống không gửi — TA tự dán.">
            {copied ? <Check className="size-4" aria-hidden /> : <MessageSquare className="size-4" aria-hidden />}{copied ? "Đã sao chép ✓" : "Copy chuẩn Discord"}
          </button>
          <button type="button" className="btn" onClick={download}><Download className="size-4" aria-hidden />Tải file .md</button>
          <span className={`w-full text-right font-mono text-xs ${discord.length > DISCORD_LIMIT ? "text-warn-ink" : "text-ink-3"}`}>
            Discord: {discord.length}/{DISCORD_LIMIT} ký tự{discord.length > DISCORD_LIMIT ? " — quá giới hạn 1 tin, nên rút gọn hoặc chia 2 tin" : ""}
          </span>
        </div>
      </div>

      <div id={`${uid}-history`} data-panel="history" role="tabpanel" hidden={tab !== "history"} className="p-5">
        {histErr && <p className="text-sm text-bad-ink">{histErr}</p>}
        {!history && !histErr && <div className="grid gap-2">{[0, 1].map((i) => <div key={i} className="skeleton h-16 animate-shimmer rounded-xl border border-line" />)}</div>}
        {history && !history.length && (
          <p className="flex items-center gap-2 text-sm text-ink-3"><History className="size-4" aria-hidden />Chưa có bản nháp nào cho {qid}. Bấm “Lưu bản nháp” ở tab Soạn.</p>
        )}
        {history && history.length > 0 && (
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
            {history.map((d) => (
              <li key={d.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="font-mono text-ink-3">#{d.id}</span>{d.title || "Bản nháp không tên"}
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-ink-3"><Clock className="size-3" aria-hidden />{d.created_at ? new Date(d.created_at * 1000).toLocaleString("vi-VN") : "—"} · {d.chars} ký tự</span>
                  </div>
                  {d.preview && <p className="mt-0.5 line-clamp-2 font-mono text-xs break-all text-ink-3">{d.preview.replace(/\n/g, " ⏎ ")}</p>}
                </div>
                <button type="button" className="btn btn-sm" onClick={() => restore(d.id)}><RotateCcw className="size-3.5" aria-hidden />Mở lại</button>
                <button type="button" className="btn btn-sm btn-ghost text-bad-ink" onClick={() => remove(d.id)} aria-label={`Xoá bản nháp #${d.id}`}><Trash2 className="size-3.5" aria-hidden /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
