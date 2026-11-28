import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check } from "lucide-react";

type Toast = { id: number; msg: string; tone: "ok" | "warn" };
const Ctx = createContext<(msg: string, tone?: "ok" | "warn") => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = useCallback((msg: string, tone: "ok" | "warn" = "ok") => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), msg, tone });
    timer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div role="status" aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[60] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-pop transition-all duration-200 ${toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
        {toast?.tone === "warn" ? <AlertTriangle className="size-4 text-warn" aria-hidden /> : <Check className="size-4 text-ok" aria-hidden />}
        <span>{toast?.msg}</span>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
