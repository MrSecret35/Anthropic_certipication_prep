import type {
  Attempt,
  Certification,
  Difficulty,
  Question,
  StudyModule,
} from "../types";
export const isCorrect = (q: Question, answer: string[] = []) =>
  answer.length === q.correctAnswers.length &&
  q.correctAnswers.every((id) => answer.includes(id));
export const responseStatus = (q: Question, answer: string[] = []) =>
  !answer.length
    ? "unanswered"
    : answer.length === q.correctAnswers.length
      ? "answered"
      : "incomplete";
export function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let n = value;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(values: T[], rng: () => number) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export interface Filters {
  domainIds?: string[];
  moduleIds?: string[];
  difficulty?: Difficulty | "all";
  history?: "all" | "incorrect" | "unseen";
}
export function lastAnswers(bank: Question[], attempts: Attempt[]) {
  const records: Record<
    string,
    { correct: boolean; at: number; count: number }
  > = {};
  for (const a of [...attempts]
    .filter((a) => a.submittedAt !== null)
    .sort((a, b) => a.submittedAt! - b.submittedAt!))
    for (const id of a.questionIds) {
      const q = bank.find((q) => q.id === id);
      if (q)
        records[id] = {
          correct: isCorrect(q, a.answers[id]),
          at: a.submittedAt!,
          count: (records[id]?.count ?? 0) + 1,
        };
    }
  return records;
}
export function filterQuestions(
  bank: Question[],
  certId: string,
  filters: Filters,
  attempts: Attempt[],
) {
  const last = lastAnswers(bank, attempts);
  return bank.filter(
    (q) =>
      q.verified &&
      q.certificationId === certId &&
      (!filters.domainIds?.length ||
        q.domainIds.some((id) => filters.domainIds!.includes(id))) &&
      (!filters.moduleIds?.length ||
        q.moduleIds.some((id) => filters.moduleIds!.includes(id))) &&
      (!filters.difficulty ||
        filters.difficulty === "all" ||
        q.difficulty === filters.difficulty) &&
      (filters.history !== "incorrect" ||
        (last[q.id] && !last[q.id].correct)) &&
      (filters.history !== "unseen" || !last[q.id]),
  );
}
export function allocations(
  count: number,
  cert: Certification,
  domainIds?: string[],
) {
  const domains = cert.domains.filter(
    (d) => !domainIds?.length || domainIds.includes(d.id),
  );
  const sum = domains.reduce((n, d) => n + d.weight, 0);
  const rows = domains.map((d) => ({
    id: d.id,
    exact: (count * d.weight) / sum,
    count: Math.floor((count * d.weight) / sum),
  }));
  let left = count - rows.reduce((n, r) => n + r.count, 0);
  for (const row of [...rows].sort(
    (a, b) => b.exact - b.count - (a.exact - a.count),
  )) {
    if (left-- > 0) row.count++;
  }
  return Object.fromEntries(rows.map((r) => [r.id, r.count]));
}
export function fullExamIssues(cert: Certification, bank: Question[]) {
  const pool = bank.filter(
    (q) => q.certificationId === cert.id && q.verified && q.fullExam,
  );
  const quotas = allocations(cert.exam.questionCount, cert);
  const missingDomains = cert.domains.filter(
    (d) => pool.filter((q) => q.domainIds[0] === d.id).length < quotas[d.id],
  );
  const scenarioUnsupported = !!cert.exam.scenarioBased;
  return {
    pool,
    quotas,
    available: pool.length,
    required: cert.exam.questionCount,
    missingDomains,
    scenarioUnsupported,
    ready:
      pool.length >= cert.exam.questionCount &&
      !missingDomains.length &&
      !scenarioUnsupported,
  };
}
export function createFullAttempt(
  cert: Certification,
  bank: Question[],
  seed: number,
  attempts: Attempt[],
  now = Date.now(),
): Attempt | null {
  const { ready, pool, quotas } = fullExamIssues(cert, bank);
  if (!ready) return null;
  const rng = random(seed);
  const seen = lastAnswers(pool, attempts);
  // Seed the ties, then choose the least exposed items within each exact quota.
  const selected = cert.domains.flatMap((domain) =>
    shuffle(
      pool.filter((q) => q.domainIds[0] === domain.id),
      rng,
    )
      .sort(
        (a, b) =>
          (seen[a.id]?.count ?? 0) - (seen[b.id]?.count ?? 0) ||
          (seen[a.id]?.at ?? 0) - (seen[b.id]?.at ?? 0),
      )
      .slice(0, quotas[domain.id]),
  );
  return createAttempt(
    cert,
    shuffle(selected, rng),
    "exam",
    "full",
    seed,
    cert.exam.durationMinutes,
    now,
  );
}
export function selectQuestions(
  pool: Question[],
  count: number,
  cert: Certification,
  seed: number,
  attempts: Attempt[],
  mix: "balanced" | "easy" | "hard" = "balanced",
) {
  const rng = random(seed),
    last = lastAnswers(pool, attempts),
    remaining = shuffle(pool, rng),
    selected: Question[] = [];
  const latest = Math.max(
    0,
    ...attempts.map((a) => a.submittedAt ?? a.startedAt),
  );
  const quota = allocations(Math.min(count, pool.length), cert, [
    ...new Set(pool.flatMap((q) => q.domainIds)),
  ]);
  const used: Record<string, number> = {},
    difficultyUsed: Record<string, number> = {};
  const target =
    mix === "easy"
      ? { easy: 0.7, medium: 0.2, hard: 0.1 }
      : mix === "hard"
        ? { easy: 0.1, medium: 0.3, hard: 0.6 }
        : { easy: 0.25, medium: 0.5, hard: 0.25 };
  while (selected.length < Math.min(count, pool.length)) {
    let best = 0,
      bestScore = -Infinity;
    remaining.forEach((q, i) => {
      const deficit =
        (quota[q.domainIds[0]] ?? 0) - (used[q.domainIds[0]] ?? 0);
      const difficultyDeficit =
        target[q.difficulty] * (selected.length + 1) -
        (difficultyUsed[q.difficulty] ?? 0);
      const seen = last[q.id];
      const score =
        deficit * 100 +
        difficultyDeficit * 5 +
        (!seen ? 3 : 1 / (1 + seen.count) + (latest - seen.at) / 1e12) +
        rng() * 0.2;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    const [q] = remaining.splice(best, 1);
    selected.push(q);
    used[q.domainIds[0]] = (used[q.domainIds[0]] ?? 0) + 1;
    difficultyUsed[q.difficulty] = (difficultyUsed[q.difficulty] ?? 0) + 1;
  }
  return selected;
}
export function createAttempt(
  cert: Certification,
  selected: Question[],
  kind: Attempt["kind"],
  mode: Attempt["mode"],
  seed: number,
  minutes: number | null,
  now = Date.now(),
): Attempt {
  const rng = random(seed + 1);
  return {
    id: `${now}-${seed}`,
    certificationId: cert.id,
    kind,
    mode,
    seed,
    questionIds: selected.map((q) => q.id),
    optionOrder: Object.fromEntries(
      selected.map((q) => [
        q.id,
        shuffle(
          q.options.map((o) => o.id),
          rng,
        ),
      ]),
    ),
    answers: {},
    checked: [],
    flags: [],
    index: 0,
    startedAt: now,
    deadline: minutes ? now + minutes * 60000 : null,
    submittedAt: null,
    expired: false,
  };
}
export function finishAttempt(
  a: Attempt,
  now = Date.now(),
  expired = false,
): Attempt {
  return {
    ...a,
    submittedAt: a.deadline ? Math.min(now, a.deadline) : now,
    expired: expired || (a.deadline !== null && now >= a.deadline),
  };
}
export function scoreAttempt(a: Attempt, bank: Question[]) {
  const rows = a.questionIds
    .map((id) => bank.find((q) => q.id === id))
    .filter((q): q is Question => !!q);
  const correct = rows.filter((q) => isCorrect(q, a.answers[q.id])).length;
  const unanswered = rows.filter((q) => !a.answers[q.id]?.length).length;
  return {
    correct,
    unanswered,
    incorrect: rows.length - correct - unanswered,
    total: rows.length,
    percentage: rows.length ? Math.round((correct / rows.length) * 100) : 0,
    timeSeconds: Math.max(
      0,
      Math.round(((a.submittedAt ?? Date.now()) - a.startedAt) / 1000),
    ),
  };
}
export interface Breakdown {
  id: string;
  correct: number;
  total: number;
  accuracy: number;
}
export function breakdown(
  attempts: Attempt[],
  bank: Question[],
  key: "domainIds" | "moduleIds" | "difficulty",
): Breakdown[] {
  const map: Record<string, { correct: number; total: number }> = {};
  for (const a of attempts)
    for (const id of a.questionIds) {
      const q = bank.find((q) => q.id === id);
      if (!q) continue;
      const keys = key === "difficulty" ? [q.difficulty] : q[key];
      for (const k of keys) {
        map[k] ??= { correct: 0, total: 0 };
        map[k].total++;
        if (isCorrect(q, a.answers[id])) map[k].correct++;
      }
    }
  return Object.entries(map).map(([id, row]) => ({
    id,
    ...row,
    accuracy: Math.round((row.correct / row.total) * 100),
  }));
}
export function recommendations(
  attempts: Attempt[],
  bank: Question[],
  modules: StudyModule[],
  cert: Certification,
) {
  const recent = attempts
    .filter((a) => a.certificationId === cert.id && a.submittedAt !== null)
    .slice(-5);
  const rows = breakdown(recent, bank, "moduleIds");
  return rows
    .filter((r) => r.correct < r.total)
    .map((row) => {
      const module = modules.find((m) => m.id === row.id)!;
      const domain = cert.domains.find((d) => d.id === module.domainId)!;
      let weightedMiss = 0,
        weightedTotal = 0;
      const distinct = new Set<string>();
      recent.forEach((a) =>
        a.questionIds.forEach((id) => {
          const q = bank.find((q) => q.id === id);
          if (!q?.moduleIds.includes(row.id)) return;
          distinct.add(id);
          const w = { easy: 1.2, medium: 1, hard: 0.8 }[q.difficulty];
          weightedTotal += w;
          if (!isCorrect(q, a.answers[id]))
            weightedMiss += w * (!a.answers[id]?.length ? 1.1 : 1);
        }),
      );
      // Smoothed error rate prevents a large domain or a single error dominating.
      const priority =
        ((weightedMiss + 1) / (weightedTotal + 3)) *
        (0.75 + domain.weight / 100) *
        Math.min(1, distinct.size / 3);
      return {
        ...row,
        module,
        domain,
        missed: row.total - row.correct,
        unique: distinct.size,
        priority,
      };
    })
    .sort((a, b) => b.priority - a.priority);
}
