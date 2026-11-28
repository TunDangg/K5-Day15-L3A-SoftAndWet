import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Sparkles } from "lucide-react";

/** Không bao giờ để trắng màn hình: lỗi render ở một màn hình chỉ thay màn hình đó bằng thẻ lỗi có nút khôi phục. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Ghi lại để nhóm gỡ lỗi; không hiện stack trace cho TA.
    console.warn("[ErrorBoundary]", error.message, info.componentStack?.split("\n").slice(0, 4).join("\n"));
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });   // đổi màn hình → thử lại
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="mx-auto grid max-w-[720px] px-4 py-10">
        <section role="alert" className="grid gap-3 rounded-2xl border border-bad-line bg-bad-soft p-6">
          <span className="grid size-10 place-items-center rounded-xl bg-bad text-white"><AlertTriangle className="size-5" aria-hidden /></span>
          <h1 className="text-lg font-semibold text-bad-ink">Màn hình này gặp lỗi hiển thị</h1>
          <p className="text-sm text-ink-2">Dữ liệu trả về có dạng không mong đợi nên giao diện dừng lại để không hiện sai. Không có gì bị mất hay gửi đi — bản nháp đã lưu vẫn còn.</p>
          <p className="rounded-lg bg-surface px-3 py-2 font-mono text-xs break-words text-ink-3">{this.state.error.message || "Lỗi không rõ"}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => this.setState({ error: null })}><RotateCcw className="size-4" aria-hidden />Thử hiển thị lại</button>
            <button type="button" className="btn" onClick={() => { window.location.href = "/"; }}><Sparkles className="size-4" aria-hidden />Về màn Phân tích</button>
          </div>
        </section>
      </main>
    );
  }
}
