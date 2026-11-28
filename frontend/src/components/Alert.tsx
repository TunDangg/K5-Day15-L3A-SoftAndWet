import type { ReactNode } from "react";
import { AlertTriangle, CircleAlert, Info, ArrowRight } from "lucide-react";

const TONE = {
  warn: { box: "border-warn-line bg-warn-soft", icon: "bg-warn text-white", title: "text-warn-ink", Icon: AlertTriangle },
  bad: { box: "border-bad-line bg-bad-soft", icon: "bg-bad text-white", title: "text-bad-ink", Icon: CircleAlert },
  info: { box: "border-brand-line bg-brand-soft", icon: "bg-brand text-on-brand", title: "text-brand-ink", Icon: Info },
};

/** Chữ có `đoạn code` → <code>, vẫn render bằng text (React tự escape). */
export function WithCode({ text }: { text: string }) {
  return <>{text.split(/`([^`\n]+)`/).map((p, i) =>
    i % 2 ? <code key={i} className="rounded border border-line bg-surface px-1 font-mono text-[0.9em]">{p}</code> : <span key={i}>{p}</span>)}</>;
}

export function Alert({ tone, title, message, next, children, role }: {
  tone: keyof typeof TONE; title: string; message?: string; next?: string; children?: ReactNode; role?: "alert" | "status";
}) {
  const t = TONE[tone];
  return (
    <section role={role ?? (tone === "bad" ? "alert" : "status")} className={`grid animate-fade-up gap-x-4 gap-y-2 rounded-2xl border p-5 sm:grid-cols-[auto_1fr] ${t.box}`}>
      <span className={`grid size-10 place-items-center rounded-xl sm:row-span-4 ${t.icon}`}><t.Icon className="size-5" aria-hidden /></span>
      <h2 className={`text-lg leading-snug font-semibold ${t.title}`}>{title}</h2>
      {message && <p className="whitespace-pre-wrap [overflow-wrap:anywhere]"><WithCode text={message} /></p>}
      {next && <p className="flex items-start gap-1.5 text-sm text-ink-2"><ArrowRight className="mt-1 size-3.5 shrink-0" aria-hidden />{next}</p>}
      {children}
    </section>
  );
}
