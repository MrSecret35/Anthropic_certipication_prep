import { useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { certifications } from "../../content";
import { finishAttempt } from "../lib/engine";
import { emptyProgress, loadProgress, STORAGE_KEY } from "../lib/storage";
import { AppContext } from "./context";
export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(loadProgress);
  const [progress, setProgress] = useState(loaded.progress);
  const [warning, setWarning] = useState(loaded.warning ? "recovered" : "");
  const navigate = useNavigate();
  const t = (en: string, it: string) =>
    progress.settings.language === "en" ? en : it;
  useEffect(() => {
    document.documentElement.dataset.theme = progress.settings.theme;
    document.documentElement.lang = progress.settings.language;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      setWarning("storage");
    }
  }, [progress]);
  const finish = (expired = false) => {
    const a = progress.active;
    if (!a) return;
    const now = Date.now();
    setProgress((p) =>
      p.active?.id !== a.id
        ? p
        : {
            ...p,
            active: null,
            attempts: [
              ...p.attempts,
              finishAttempt(p.active, now, expired),
            ].slice(-500),
          },
    );
    navigate(`/results/${a.id}`);
  };
  useEffect(() => {
    const check = () => {
      if (progress.active?.deadline && Date.now() >= progress.active.deadline)
        finish(true);
    };
    check();
    const timer = window.setInterval(check, 1000);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", check);
    };
    // Reinstall only when the persisted attempt changes. Deadline is absolute, never decremented in storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.active]);
  return (
    <AppContext.Provider
      value={{
        progress,
        update: (fn) => setProgress(fn),
        replace: setProgress,
        t,
        text: (value) => value[progress.settings.language],
        cert:
          certifications.find(
            (c) => c.id === progress.settings.certificationId,
          ) ?? certifications[0],
        warning,
        setWarning,
        finish,
        start: (a) => {
          setProgress((p) => ({ ...p, active: a }));
          navigate("/session");
        },
        reset: () => {
          setProgress(emptyProgress());
          navigate("/");
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppProvider missing");
  return value;
}
