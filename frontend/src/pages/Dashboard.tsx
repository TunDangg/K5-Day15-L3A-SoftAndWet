import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, BarChart3, BookOpen, CalendarDays, CircleHelp, FileQuestion, Info, MessageSquareText, Target } from "lucide-react";
import { api, ApiError, type Question, type StatsResp } from "../lib/api";
import { navigate } from "../lib/router";

const SMALL = 10;     // dưới 10 lượt: mẫu nhỏ, không kết luận
const pct = (x: number | null | undefined) => (x == null ? "—" : `${Math.round(x * 100)}%`);
const fmt = (n: number) => n.toLocaleString("vi-VN");
const rateTone = (r: number) => (r >= 0.4 ? "bg-bad" : r >= 0.25 ? "bg-warn" : "bg-ok");

interface KcRow { kc: string; luot: number; sai: number; rate: number; days: string[]; q?: Question }

export function Dashboard({ questions }: { questions: Question[] | null }) {
  const [data, setData] = useState<StatsResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { api.stats().then(setData).catch((e: ApiError) => setErr(`${e.info.title}${e.info.hint ? " — " + e.info.hint : ""}`)); }, []);

  const { kcs, perDay } = useMemo(() => {
    const map = new Map<string, KcRow>();
    const perDay: { day: string; luot: number; sai: number; video: number; offTopic: number; hv: number }[] = [];
    if (data) {
      for (const day of data.days) {
        const d = data.stats.ngay[day];
        if (!d) continue;
        perDay.push({ day, luot: d.bai_on.so_luot, sai: d.bai_on.so_sai, video: d.cau_hoi_video.so_cau, offTopic: d.cau_hoi_video.so_cau_khong_bam_bai, hv: d.bai_on.so_hoc_vien });
        for (const [kc, v] of Object.entries(d.bai_on.theo_kc)) {
          const r = map.get(kc) ?? { kc, luot: 0, sai: 0, rate: 0, days: [] };
          r.luot += v.so_luot; r.sai += v.so_sai; r.days.push(day);
          map.set(kc, r);
        }
      }
    }
    const byKc = new Map((questions ?? []).filter((q) => q.kc_code).map((q) => [q.kc_code as string, q]));
    const kcs = [...map.values()].map((r) => ({ ...r, rate: r.luot ? r.sai / r.luot : 0, q: byKc.get(r.kc) }));
    return { kcs, perDay };
  }, [data, questions]);

  // Đủ mẫu (≥SMALL lượt) xếp trước theo tỉ lệ sai; mẫu nhỏ xếp sau để 2/2 = 100% không đứng đầu gây hiểu nhầm.
  const linked = kcs.filter((r) => r.q).sort((a, b) => Number(a.luot < SMALL) - Number(b.luot < SMALL) || b.rate - a.rate || b.luot - a.luot);
  const linkedQids = new Set(linked.map((r) => r.q!.qid));
  const unlinkedQuestions = (questions ?? []).filter((q) => !linkedQids.has(q.qid));
  const priority = linked.filter((r) => r.luot >= SMALL && r.rate >= 0.25);
  const hardKcs = kcs.filter((r) => !r.q && r.luot >= SMALL).sort((a, b) => b.rate - a.rate).slice(0, 8);
  const maxLuot = Math.max(1, ...perDay.map((d) => d.luot));

  if (err) return <Page><div className="card p-6 text-bad-ink" role="alert">{err}</div></Page>;
  if (!data) return <Page><div className="grid gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28 animate-shimmer rounded-2xl border border-line" />)}</div></Page>;
  const t = data.totals;

  return (
    <Page>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan lớp</h1>
          <p className="text-sm text-ink-3">Bài ôn cuối ngày + câu hỏi dưới video · {t.so_ngay} ngày học{data.days.length ? ` (${data.days[0]}–${data.days[data.days.length - 1]})` : ""}</p>
        </div>
        <p className="flex max-w-xl items-start gap-1.5 text-xs text-ink-3"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />Nguồn: {data.source ?? "data/class_stats.json"}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Chỉ số chính">
        <Kpi icon={FileQuestion} label="Câu hỏi mở" value={fmt(questions?.length ?? 0)}
          sub={`${(questions ?? []).filter((q) => q.source === "import").length} câu TA import`} />
        <Kpi icon={BookOpen} label="Lượt trả lời bài ôn" value={fmt(t.so_luot)} sub={`${fmt(t.so_sai)} lượt sai`} />
        <Kpi icon={Target} label="Tỉ lệ sai chung" value={pct(t.ti_le_sai)} sub="lần làm đầu tiên" tone={t.ti_le_sai != null && t.ti_le_sai >= 0.25 ? "warn" : "ok"} />
        <Kpi icon={MessageSquareText} label="Câu hỏi dưới video" value={fmt(t.so_cau_video)} sub={`${fmt(t.so_cau_khong_bam_bai)} câu không bám bài`} />
      </section>

      <section className="card" aria-labelledby="prio-h">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <h2 id="prio-h" className="flex items-center gap-2 text-[15px] font-semibold"><AlertTriangle className="size-4 text-warn" aria-hidden />Câu hỏi mở nên ưu tiên recap</h2>
          <span className="text-[13px] text-ink-3">Xếp theo tỉ lệ sai bài ôn của kiến thức (kc) tương ứng · bấm để phân tích câu trả lời mở</span>
          <span className="ml-auto rounded-full bg-warn-soft px-2.5 py-0.5 text-xs font-semibold text-warn-ink ring-1 ring-warn-line ring-inset">{priority.length} câu ≥25% sai, ≥{SMALL} lượt</span>
        </div>
        <ul className="divide-y divide-line">
          {linked.map((r) => {
            const small = r.luot < SMALL;
            return (
              <li key={r.kc}>
                <button type="button" onClick={() => navigate("workspace", { q: r.q!.qid })}
                  aria-label={`Phân tích ${r.q!.qid}: ${r.q!.cau_hoi}. Tỉ lệ sai ${pct(r.rate)} trên ${r.luot} lượt`}
                  className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 px-5 py-3.5 text-left transition-colors hover:bg-surface-2 md:grid-cols-[auto_minmax(0,1fr)_220px_auto]">
                  <span className="code-badge">{r.q!.qid}</span>
                  <span className="min-w-0">
                    <span className="line-clamp-1 text-[15px] font-medium">{r.q!.cau_hoi}</span>
                    <span className="block truncate font-mono text-xs text-ink-3">{r.kc} · {r.q!.so_cau_tra_loi} câu trả lời mở</span>
                  </span>
                  <span className="col-span-3 col-start-2 flex items-center gap-2 md:col-span-1 md:col-start-3">
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-off-soft"><span className={`block h-full rounded-full ${small ? "bg-line-strong" : rateTone(r.rate)}`} style={{ width: `${Math.max(3, r.rate * 100)}%` }} /></span>
                    <span className="w-24 text-right font-mono text-[13px]"><b className={small ? "text-ink-3" : r.rate >= 0.4 ? "text-bad-ink" : r.rate >= 0.25 ? "text-warn-ink" : "text-ok-ink"}>{pct(r.rate)}</b> <span className="text-ink-3">{r.sai}/{r.luot}</span></span>
                  </span>
                  <span className="col-start-3 row-start-1 flex items-center gap-1 justify-self-end text-[13px] font-medium text-brand-ink md:col-start-4">
                    {small && <span className="rounded-full bg-off-soft px-2 text-[11px] font-semibold text-ink-3" title={`Dưới ${SMALL} lượt — chưa đủ để kết luận`}>mẫu nhỏ</span>}
                    <span className="hidden sm:inline">Phân tích</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
          {unlinkedQuestions.map((q) => (
            <li key={q.qid}>
              <button type="button" onClick={() => navigate("workspace", { q: q.qid })}
                className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-2">
                <span className="code-badge">{q.qid}</span>
                <span className="min-w-0"><span className="line-clamp-1 text-[15px] font-medium">{q.cau_hoi}</span>
                  <span className="block text-xs text-ink-3">{q.source === "import" ? "TA import" : "chưa có kc"} · chưa có số liệu bài ôn để so sánh</span></span>
                <ArrowRight className="size-4 text-brand-ink" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="card" aria-labelledby="days-h">
          <h2 id="days-h" className="flex items-center gap-2 border-b border-line px-5 py-4 text-[15px] font-semibold"><CalendarDays className="size-4" aria-hidden />Theo ngày học</h2>
          <div className="grid gap-2 p-5">
            <div className="grid grid-cols-[56px_1fr_120px] gap-3 text-[11.5px] font-semibold tracking-wide text-ink-3 uppercase"><span>Ngày</span><span>Lượt bài ôn · phần sai</span><span className="text-right">Sai · học viên</span></div>
            {perDay.map((d) => {
              const r = d.luot ? d.sai / d.luot : 0;
              return (
                <div key={d.day} className="grid grid-cols-[56px_1fr_120px] items-center gap-3 text-sm" title={`${d.day}: ${d.luot} lượt, ${d.sai} sai, ${d.hv} học viên, ${d.video} câu hỏi video`}>
                  <span className="font-mono text-[13px] text-ink-2">{d.day.replace("Day", "D")}</span>
                  <span className="relative h-5 overflow-hidden rounded-md bg-off-soft">
                    <span className="absolute inset-y-0 left-0 rounded-md bg-brand-line" style={{ width: `${(d.luot / maxLuot) * 100}%` }} />
                    <span className={`absolute inset-y-0 left-0 rounded-md ${rateTone(r)}`} style={{ width: `${(d.sai / maxLuot) * 100}%` }} />
                    <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[11.5px] font-semibold text-ink">{d.luot}</span>
                  </span>
                  <span className="text-right font-mono text-[13px]"><b>{pct(r)}</b> <span className="text-ink-3">· {d.hv} HV</span></span>
                </div>
              );
            })}
            <p className="mt-2 flex items-center gap-3 text-xs text-ink-3">
              <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-sm bg-brand-line" />lượt trả lời</span>
              <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-sm bg-warn" />phần sai (màu theo tỉ lệ)</span>
            </p>
          </div>
        </section>

        <section className="card" aria-labelledby="kc-h">
          <h2 id="kc-h" className="flex items-center gap-2 border-b border-line px-5 py-4 text-[15px] font-semibold"><BarChart3 className="size-4" aria-hidden />Kiến thức sai nhiều — chưa có câu hỏi mở</h2>
          <ul className="grid gap-2.5 p-5">
            {hardKcs.map((r) => (
              <li key={r.kc} className="grid gap-1" title={`${r.sai}/${r.luot} lượt sai · ${r.days.join(", ")}`}>
                <div className="flex items-baseline justify-between gap-2"><span className="truncate font-mono text-[12.5px]">{r.kc}</span>
                  <span className="shrink-0 font-mono text-[12.5px]"><b>{pct(r.rate)}</b> <span className="text-ink-3">{r.sai}/{r.luot}</span></span></div>
                <span className="h-1.5 overflow-hidden rounded-full bg-off-soft"><span className={`block h-full rounded-full ${rateTone(r.rate)}`} style={{ width: `${r.rate * 100}%` }} /></span>
              </li>
            ))}
            <li className="mt-1 flex items-start gap-1.5 text-xs text-ink-3"><CircleHelp className="mt-0.5 size-3.5 shrink-0" aria-hidden />Chỉ hiện kc có ≥{SMALL} lượt. Muốn phân tích câu trả lời mở cho kiến thức này: tạo câu hỏi ở màn “Nhập dữ liệu lớp”.</li>
          </ul>
        </section>
      </div>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto grid max-w-[1200px] gap-5 px-4 py-6 md:px-8 md:py-8">{children}</main>;
}

function Kpi({ icon: Icon, label, value, sub, tone }: { icon: typeof Info; label: string; value: string; sub: string; tone?: "ok" | "warn" }) {
  return (
    <div className="card grid animate-fade-up gap-1 p-5">
      <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-ink-3 uppercase"><Icon className="size-3.5" aria-hidden />{label}</span>
      <span className={`text-3xl font-bold tracking-tight ${tone === "warn" ? "text-warn-ink" : tone === "ok" ? "text-ok-ink" : ""}`}>{value}</span>
      <span className="text-[13px] text-ink-3">{sub}</span>
    </div>
  );
}
