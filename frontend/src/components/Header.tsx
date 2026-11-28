import { BarChart3, Layers, ShieldCheck, Sparkles, Upload } from "lucide-react";
import type { ModelInfo } from "../lib/api";
import { navigate, PATHS, type Route } from "../lib/router";

const NAV: { route: Route; label: string; icon: typeof Sparkles }[] = [
  { route: "workspace", label: "Phân tích TA", icon: Sparkles },
  { route: "dashboard", label: "Tổng quan lớp", icon: BarChart3 },
  { route: "import", label: "Nhập dữ liệu lớp", icon: Upload },
];

export function Header({ route, model }: { route: Route; model: ModelInfo | null }) {
  const real = model && !model.fake;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md backdrop-saturate-150">
      <div className="flex h-15 items-center gap-4 px-4 md:px-6">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("workspace"); }} className="flex min-w-0 items-center gap-3 rounded-lg">
          <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-[0_2px_6px_-1px_rgb(79_70_229/0.45)]">
            <Layers className="size-[18px]" aria-hidden />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-[15px] leading-tight font-semibold tracking-tight">Trợ lý Phân tích Câu trả lời Mở</span>
            <span className="block text-[13px] leading-tight text-ink-3">Bản nháp hỗ trợ TA</span>
          </span>
        </a>

        <nav aria-label="Màn hình" className="mx-auto flex items-center gap-1 rounded-xl border border-line bg-surface-2 p-1">
          {NAV.map(({ route: r, label, icon: Icon }) => {
            const on = r === route;
            return (
              <a key={r} href={PATHS[r]} aria-current={on ? "page" : undefined}
                onClick={(e) => { e.preventDefault(); navigate(r); }}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium whitespace-nowrap transition-colors md:px-3 ${on ? "bg-surface text-brand-ink shadow-card ring-1 ring-line" : "text-ink-2 hover:bg-surface hover:text-ink"}`}>
                <Icon className="size-4" aria-hidden />
                <span className="hidden md:inline">{label}</span>
                <span className="sr-only md:hidden">{label}</span>
              </a>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span tabIndex={0} title="Kết quả chỉ là bản nháp cho TA đọc và sửa. Hệ thống không gửi lớp, không đăng Discord, không gửi email."
            className="hidden h-7.5 items-center gap-1.5 rounded-full border border-ok-line bg-ok-soft px-3 text-[13px] font-medium text-ok-ink lg:inline-flex">
            <ShieldCheck className="size-4" aria-hidden /> Chế độ bản nháp · Không tự gửi
          </span>
          <span tabIndex={0} title={model ? (real ? `Đang gọi model AI thật · ${model.provider} · ${model.name}` : "Model giả — chưa gọi AI thật") : "Đang kết nối backend…"}
            className="inline-flex h-7.5 max-w-[180px] items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[12.5px] font-medium">
            <span className={`size-2 shrink-0 rounded-full ${real ? "animate-pulse bg-ok" : model ? "bg-ink-3" : "bg-warn"}`} aria-hidden />
            <span className="truncate font-mono">{model ? (real ? model.name ?? model.provider : "model: fake") : "…"}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
