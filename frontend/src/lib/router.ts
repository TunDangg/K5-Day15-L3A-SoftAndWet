import { useEffect, useState } from "react";

// Router tối giản bằng History API (backend đã hỗ trợ SPA routing: mọi đường dẫn không phải /api → index.html).
export type Route = "workspace" | "dashboard" | "import";
export const PATHS: Record<Route, string> = { workspace: "/", dashboard: "/dashboard", import: "/import" };

function current(): { route: Route; params: URLSearchParams } {
  const p = window.location.pathname.replace(/\/+$/, "") || "/";
  const route: Route = p === "/dashboard" ? "dashboard" : p === "/import" ? "import" : "workspace";
  return { route, params: new URLSearchParams(window.location.search) };
}

export function navigate(route: Route, params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  window.history.pushState({}, "", PATHS[route] + qs);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0 });
}

export function useRoute() {
  const [state, setState] = useState(current);
  useEffect(() => {
    const on = () => setState(current());
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  return state;
}
