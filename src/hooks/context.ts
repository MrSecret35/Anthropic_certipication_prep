import { createContext } from "react";
import type { Certification, Attempt, Localized, Progress } from "../types";
export interface AppContextValue {
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  replace: (p: Progress) => void;
  t: (en: string, it: string) => string;
  text: <T>(value: Localized<T>) => T;
  cert: Certification;
  warning: string;
  setWarning: (s: string) => void;
  finish: (expired?: boolean) => void;
  start: (a: Attempt) => void;
  reset: () => void;
}
export const AppContext = createContext<AppContextValue | null>(null);
