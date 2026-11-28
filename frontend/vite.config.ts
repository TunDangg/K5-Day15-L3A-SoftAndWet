import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dev: `npm run dev` (http://localhost:5173) — /api chuyển sang backend Python ở 127.0.0.1:8000.
// Build: `npm run build` → dist/, backend tự phục vụ khi chạy `python codebase/web.py`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": { target: "http://127.0.0.1:8000", changeOrigin: false } },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    // CSP của backend là script-src 'self': không cho Vite nhúng script inline.
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
  },
});
