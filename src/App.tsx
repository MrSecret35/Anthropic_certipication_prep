import { Component, Suspense, lazy, type ReactNode } from "react";
import { Route, Routes, Link } from "react-router-dom";
import { AppProvider } from "./hooks/useApp";
import Shell from "./components/Shell";
const Certifications = lazy(() => import("./pages/Certifications"));
const Dashboard = lazy(() =>
  import("./pages/Certifications").then((m) => ({ default: m.Dashboard })),
);
const Study = lazy(() => import("./pages/Study"));
const Lesson = lazy(() =>
  import("./pages/Study").then((m) => ({ default: m.LessonPage })),
);
const Setup = lazy(() => import("./pages/Setup"));
const Session = lazy(() => import("./pages/Session"));
const Results = lazy(() => import("./pages/Results"));
const Progress = lazy(() => import("./pages/Progress"));
const Settings = lazy(() => import("./pages/Settings"));
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="page error-page">
        <h1>Something interrupted this page.</h1>
        <p>Qualcosa ha interrotto questa pagina.</p>
        <p>
          Reload to reopen your saved workspace. Ricarica per riaprire lo spazio
          salvato.
        </p>
        <button className="button" onClick={() => window.location.reload()}>
          Reload / Ricarica
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Suspense
          fallback={
            <div className="loading-state" role="status">
              Fieldnotes…
            </div>
          }
        >
          <Routes>
            <Route element={<Shell />}>
              <Route index element={<Certifications />} />
              <Route path="certification/:id" element={<Dashboard />} />
              <Route path="study" element={<Study />} />
              <Route path="study/:id" element={<Lesson />} />
              <Route path="practice" element={<Setup key="practice" />} />
              <Route path="exam" element={<Setup key="exam" exam />} />
              <Route path="session" element={<Session />} />
              <Route path="results/:id" element={<Results />} />
              <Route path="progress" element={<Progress />} />
              <Route path="settings" element={<Settings />} />
              <Route
                path="*"
                element={
                  <div className="page">
                    <h1>404</h1>
                    <Link className="button" to="/">
                      Fieldnotes →
                    </Link>
                  </div>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </AppProvider>
    </ErrorBoundary>
  );
}
