import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type ModelInfo, type Question } from "./lib/api";
import { useRoute } from "./lib/router";
import { Header } from "./components/Header";
import { ToastProvider } from "./components/Toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Workspace } from "./pages/Workspace";
import { Dashboard } from "./pages/Dashboard";
import { ImportPage } from "./pages/ImportPage";

export default function App() {
  const { route, params } = useRoute();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [qError, setQError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [limits, setLimits] = useState({ minAnswers: 5, maxText: 500 });

  const loadQuestions = useCallback(() => {
    api.questions().then((r) => {
      setQuestions(r.questions);
      setLimits({ minAnswers: r.min_answers, maxText: r.max_text });
      setQError(null);
    }).catch((e: ApiError) => setQError(`${e.info.title}${e.info.hint ? " — " + e.info.hint : ""}`));
  }, []);

  useEffect(() => {
    loadQuestions();
    api.health().then((h) => setModel(h?.model ?? null)).catch(() => setModel(null));
  }, [loadQuestions]);

  useEffect(() => {
    document.title = { workspace: "Phân tích TA", dashboard: "Tổng quan lớp", import: "Nhập dữ liệu lớp" }[route] + " · Trợ lý Phân tích Câu trả lời Mở";
  }, [route]);

  return (
    <ToastProvider>
      <a href="#main" className="sr-only z-50 rounded-lg bg-brand px-4 py-2 font-semibold text-on-brand focus:not-sr-only focus:fixed focus:top-3 focus:left-4">Bỏ qua tới nội dung</a>
      <Header route={route} model={model} />
      <div id="main">
       <ErrorBoundary resetKey={route}>
        {route === "workspace" && <Workspace questions={questions} qError={qError} minAnswers={limits.minAnswers} maxText={limits.maxText} params={params} />}
        {route === "dashboard" && <Dashboard questions={questions} />}
        {route === "import" && <ImportPage minAnswers={limits.minAnswers} onImported={loadQuestions} />}
       </ErrorBoundary>
      </div>
    </ToastProvider>
  );
}
