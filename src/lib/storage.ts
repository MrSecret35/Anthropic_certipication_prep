import { certifications, modules, questionById } from "../../content";
import type { Attempt, Progress } from "../types";
export const STORAGE_KEY = "fieldnotes-progress-v1";
export const emptyProgress = (): Progress => ({
  schemaVersion: 1,
  settings: {
    language: "en",
    theme: "light",
    certificationId: certifications[0].id,
  },
  opened: {},
  completed: {},
  attempts: [],
  active: null,
});
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const timestamp = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v > 0;
export function validAttempt(
  value: unknown,
  completed: boolean,
): value is Attempt {
  if (!object(value)) return false;
  const a = value;
  if (
    typeof a.id !== "string" ||
    !certifications.some((c) => c.id === a.certificationId) ||
    !["practice", "exam"].includes(a.kind as string) ||
    !["practice", "custom", "full"].includes(a.mode as string) ||
    typeof a.seed !== "number" ||
    !Number.isFinite(a.seed)
  )
    return false;
  if (
    !Array.isArray(a.questionIds) ||
    !a.questionIds.length ||
    a.questionIds.length > 200 ||
    a.questionIds.some(
      (id) =>
        typeof id !== "string" ||
        questionById[id]?.certificationId !== a.certificationId,
    ) ||
    new Set(a.questionIds).size !== a.questionIds.length
  )
    return false;
  const ids = a.questionIds as string[];
  if (
    !object(a.optionOrder) ||
    !object(a.answers) ||
    !Array.isArray(a.flags) ||
    !Array.isArray(a.checked) ||
    [...a.flags, ...a.checked].some((id) => !ids.includes(id as string))
  )
    return false;
  for (const id of ids) {
    const order = a.optionOrder[id];
    if (
      !Array.isArray(order) ||
      order.length !== 4 ||
      new Set(order).size !== 4 ||
      order.some((o) => !questionById[id].options.some((opt) => opt.id === o))
    )
      return false;
  }
  for (const [id, ans] of Object.entries(a.answers)) {
    if (
      !ids.includes(id) ||
      !Array.isArray(ans) ||
      new Set(ans).size !== ans.length ||
      ans.some((o) => !questionById[id].options.some((opt) => opt.id === o)) ||
      (questionById[id].type === "single" && ans.length > 1)
    )
      return false;
  }
  if (
    !Number.isInteger(a.index) ||
    (a.index as number) < 0 ||
    (a.index as number) >= ids.length ||
    !timestamp(a.startedAt) ||
    typeof a.expired !== "boolean"
  )
    return false;
  if (
    a.deadline !== null &&
    (!timestamp(a.deadline) || a.deadline < a.startedAt)
  )
    return false;
  if (
    completed
      ? !timestamp(a.submittedAt) || a.submittedAt < a.startedAt
      : a.submittedAt !== null
  )
    return false;
  return true;
}
export function parseProgress(input: unknown): Progress {
  if (
    !object(input) ||
    input.schemaVersion !== 1 ||
    !object(input.settings) ||
    !object(input.opened) ||
    !object(input.completed) ||
    !Array.isArray(input.attempts) ||
    input.attempts.length > 500
  )
    throw new Error("Invalid progress format");
  const s = input.settings;
  if (
    !["en", "it"].includes(s.language as string) ||
    !["light", "dark"].includes(s.theme as string) ||
    !certifications.some((c) => c.id === s.certificationId)
  )
    throw new Error("Invalid settings");
  const moduleIds = new Set(modules.map((m) => m.id));
  for (const [id, v] of Object.entries(input.opened))
    if (!moduleIds.has(id) || !timestamp(v))
      throw new Error("Invalid module activity");
  for (const [id, v] of Object.entries(input.completed))
    if (
      !moduleIds.has(id) ||
      !object(v) ||
      Object.entries(v).some(
        ([k, t]) => !["quick", "deep"].includes(k) || !timestamp(t),
      )
    )
      throw new Error("Invalid lesson completion");
  if (
    input.attempts.some((a) => !validAttempt(a, true)) ||
    (input.active !== null && !validAttempt(input.active, false))
  )
    throw new Error("Invalid attempt");
  const ids = input.attempts.map((a) => a.id);
  if (
    new Set(ids).size !== ids.length ||
    (input.active && ids.includes((input.active as Attempt).id))
  )
    throw new Error("Duplicate attempt");
  // Return only known top-level fields; never render imported HTML.
  return {
    schemaVersion: 1,
    settings: s as Progress["settings"],
    opened: input.opened as Progress["opened"],
    completed: input.completed as Progress["completed"],
    attempts: input.attempts as Attempt[],
    active: input.active as Attempt | null,
  };
}
export function loadProgress(): { progress: Progress; warning: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return {
      progress: raw ? parseProgress(JSON.parse(raw)) : emptyProgress(),
      warning: false,
    };
  } catch {
    return { progress: emptyProgress(), warning: true };
  }
}
