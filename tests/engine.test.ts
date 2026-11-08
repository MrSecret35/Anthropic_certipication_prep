import { afterEach, describe, expect, it, vi } from "vitest";
import { certifications, modules, questions } from "../content";
import {
  allocations,
  breakdown,
  createAttempt,
  createFullAttempt,
  filterQuestions,
  finishAttempt,
  fullExamIssues,
  isCorrect,
  recommendations,
  responseStatus,
  scoreAttempt,
  selectQuestions,
} from "../src/lib/engine";
import { emptyProgress, loadProgress, parseProgress } from "../src/lib/storage";
import { validateContent } from "../src/lib/validation";
const cert = certifications[0],
  bank = questions.filter((q) => q.certificationId === cert.id);
const attempt = () =>
  createAttempt(cert, bank, "exam", "custom", 42, 20, 100000);
describe("scoring", () => {
  it("requires exactly every correct option, regardless of order", () => {
    const q = questions.find((q) => q.type === "multiple")!;
    expect(isCorrect(q, [...q.correctAnswers].reverse())).toBe(true);
    expect(isCorrect(q, q.correctAnswers.slice(0, 1))).toBe(false);
    expect(isCorrect(q, [...q.correctAnswers, "z"])).toBe(false);
    expect(isCorrect(q, [])).toBe(false);
  });
  it("marks a partial multiple response as incomplete and gives no partial credit", () => {
    const q = questions.find((q) => q.type === "multiple")!;
    expect(responseStatus(q)).toBe("unanswered");
    expect(responseStatus(q, q.correctAnswers.slice(0, 1))).toBe("incomplete");
    expect(responseStatus(q, q.correctAnswers)).toBe("answered");
    const a = createAttempt(cert, [q], "exam", "custom", 4, 1, 100000);
    a.answers[q.id] = q.correctAnswers.slice(0, 1);
    expect(scoreAttempt(finishAttempt(a, 110000), questions)).toMatchObject({
      correct: 0,
      incorrect: 1,
      unanswered: 0,
    });
  });
  it("separates incorrect and unanswered while counting both against accuracy", () => {
    const a = attempt();
    a.answers[bank[0].id] = bank[0].correctAnswers;
    a.answers[bank[1].id] = ["d"];
    const result = scoreAttempt(finishAttempt(a, 160000), questions);
    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(1);
    expect(result.unanswered).toBe(bank.length - 2);
    expect(result.timeSeconds).toBe(60);
    expect(result.percentage).toBe(Math.round(100 / bank.length));
  });
  it("caps elapsed time at the absolute deadline on expiry", () => {
    const a = attempt();
    const done = finishAttempt(a, a.deadline! + 500000, true);
    expect(done.submittedAt).toBe(a.deadline);
    expect(done.expired).toBe(true);
    expect(scoreAttempt(done, questions).timeSeconds).toBe(1200);
  });
  it("attributes missed and unanswered questions to all linked modules and domains", () => {
    const a = finishAttempt(attempt(), 160000);
    const b = breakdown([a], questions, "domainIds");
    expect(b.reduce((n, r) => n + r.total, 0)).toBe(bank.length);
    expect(b.every((r) => r.correct === 0)).toBe(true);
  });
});
describe("selection and snapshots", () => {
  it("produces a reproducible unique selection and never pads an insufficient bank", () => {
    const first = selectQuestions(bank, 10, cert, 123, []);
    expect(selectQuestions(bank, 10, cert, 123, []).map((q) => q.id)).toEqual(
      first.map((q) => q.id),
    );
    expect(new Set(first.map((q) => q.id)).size).toBe(10);
    expect(selectQuestions(bank, 100, cert, 1, [])).toHaveLength(bank.length);
    expect(selectQuestions([], 10, cert, 1, [])).toEqual([]);
  });
  it("uses largest-remainder quotas that total the requested count", () => {
    const quota = allocations(60, cert);
    expect(Object.values(quota).reduce((a, b) => a + b, 0)).toBe(60);
    expect(quota["af-d2"]).toBe(13);
  });
  it("respects available domain quotas for an ordinary custom session", () => {
    const selected = selectQuestions(bank, 10, cert, 56, []);
    const quotas = allocations(10, cert);
    for (const [id, n] of Object.entries(quotas))
      expect(selected.filter((q) => q.domainIds[0] === id)).toHaveLength(n);
  });
  it("filters difficulty, multiple modules, domains, unseen, and latest incorrect history", () => {
    const a = finishAttempt(attempt(), 160000);
    a.answers[bank[0].id] = bank[0].correctAnswers;
    expect(
      filterQuestions(questions, cert.id, { history: "incorrect" }, [a]).some(
        (q) => q.id === bank[0].id,
      ),
    ).toBe(false);
    expect(
      filterQuestions(questions, cert.id, { history: "unseen" }, [a]),
    ).toHaveLength(0);
    expect(
      filterQuestions(
        questions,
        cert.id,
        { moduleIds: ["af-prompting", "af-evaluation"], difficulty: "easy" },
        [],
      ),
    ).toHaveLength(2);
    expect(
      filterQuestions(questions, cert.id, { domainIds: ["af-d7"] }, []).every(
        (q) => q.domainIds.includes("af-d7"),
      ),
    ).toBe(true);
  });
  it("shuffles options without changing correct IDs and preserves snapshot over JSON round trip", () => {
    const a = attempt();
    for (const q of bank) {
      expect(new Set(a.optionOrder[q.id])).toEqual(
        new Set(q.options.map((o) => o.id)),
      );
    }
    const p = emptyProgress();
    p.active = a;
    const parsed = parseProgress(JSON.parse(JSON.stringify(p)));
    expect(parsed.active).toEqual(a);
  });
  it("prevents full exam availability when count or domain coverage is insufficient", () => {
    const missingDomain = questions.filter((q) => q.domainIds[0] !== "af-d1");
    const issues = fullExamIssues(cert, missingDomain);
    expect(issues.available).toBeGreaterThan(issues.required);
    expect(issues.missingDomains.map((d) => d.id)).toContain("af-d1");
    expect(createFullAttempt(cert, missingDomain, 10, [])).toBeNull();
    expect(createFullAttempt(certifications[1], questions, 10, [])).toBeNull();
    expect(
      fullExamIssues(certifications[2], questions).scenarioUnsupported,
    ).toBe(true);
  });
});
describe("Associate full mock", () => {
  it("builds a 60-item, 120-minute form with exact quotas and no starter items", () => {
    expect(fullExamIssues(cert, questions).available).toBeGreaterThan(60);
    const expected = [8, 13, 7, 10, 7, 9, 6];
    const byId = new Map(bank.map((q) => [q.id, q]));
    for (const seed of [1, 42, 999, 4294967295]) {
      const mock = createFullAttempt(cert, questions, seed, [], 100000)!;
      const form = mock.questionIds.map((id) => byId.get(id)!);
      expect(new Set(mock.questionIds).size).toBe(60);
      expect(form.every((q) => q.fullExam && q.verified)).toBe(true);
      expect(form.some((q) => q.type === "multiple")).toBe(true);
      expect(
        cert.domains.map(
          (d) => form.filter((q) => q.domainIds[0] === d.id).length,
        ),
      ).toEqual(expected);
      expect(mock.mode).toBe("full");
      expect(mock.deadline! - mock.startedAt).toBe(120 * 60 * 1000);
    }
  });
  it("repeats a seed deterministically and favors every unseen item on the next mock", () => {
    const first = createFullAttempt(cert, questions, 101, [], 100000)!;
    expect(createFullAttempt(cert, questions, 101, [], 100000)).toEqual(first);
    const unseen = fullExamIssues(cert, questions).pool.filter(
      (q) => !first.questionIds.includes(q.id),
    );
    const second = createFullAttempt(
      cert,
      questions,
      102,
      [finishAttempt(first, 101000)],
      110000,
    )!;
    expect(unseen.length).toBeGreaterThan(0);
    expect(unseen.every((q) => second.questionIds.includes(q.id))).toBe(true);
  });
  it("preserves the full exam clock, option order, answers and flags across storage reload", () => {
    const mock = createFullAttempt(cert, questions, 42, [], 100000)!;
    const id = mock.questionIds[4];
    mock.index = 4;
    mock.answers[id] = [mock.optionOrder[id][0]];
    mock.flags = [id];
    const restored = parseProgress(
      JSON.parse(JSON.stringify({ ...emptyProgress(), active: mock })),
    ).active!;
    expect(restored).toEqual(mock);
    const done = finishAttempt(restored, restored.deadline! + 7500);
    expect(done.expired).toBe(true);
    expect(scoreAttempt(done, questions).timeSeconds).toBe(7200);
  });
});
describe("recommendations", () => {
  it("links actual missed items to actionable modules and does not recommend an all-correct module", () => {
    const a = attempt();
    for (const q of bank.filter((q) => q.moduleIds.includes("af-prompting")))
      a.answers[q.id] = q.correctAnswers;
    const recs = recommendations(
      [finishAttempt(a, 160000)],
      questions,
      modules,
      cert,
    );
    expect(recs.some((r) => r.id === "af-prompting")).toBe(false);
    expect(recs.every((r) => r.missed > 0 && !!r.module && !!r.domain)).toBe(
      true,
    );
  });
  it("does not let a larger sample dominate solely because of count", () => {
    const one = bank.find((q) => q.moduleIds.includes("af-prompting"))!;
    const all = bank.filter((q) => q.moduleIds.includes("af-evaluation"));
    const a = createAttempt(
      cert,
      [one, ...all],
      "exam",
      "custom",
      1,
      null,
      100000,
    );
    a.answers[all[0].id] = all[0].correctAnswers;
    a.answers[all[1].id] = all[1].correctAnswers;
    a.answers[all[2].id] = all[2].correctAnswers;
    const recs = recommendations(
      [finishAttempt(a, 160000)],
      questions,
      modules,
      cert,
    );
    expect(recs.find((r) => r.id === one.moduleIds[0])?.total).toBe(1);
    expect(recs.every((r) => Number.isFinite(r.priority))).toBe(true);
  });
});
describe("content and data integrity", () => {
  it("validates every bilingual lesson, question, answer, objective, and domain reference", () =>
    expect(validateContent(certifications, modules, questions)).toEqual([]));
  it("rejects duplicate IDs, invalid answer sets, missing translations, and broken references", () => {
    const broken = structuredClone(questions);
    broken.push({ ...broken[0] });
    broken[1].correctAnswers = ["unknown"];
    broken[2].question.it = "";
    broken[3].moduleIds = ["missing"];
    expect(
      validateContent(certifications, modules, broken).length,
    ).toBeGreaterThanOrEqual(4);
  });
  it("round-trips all progress fields, including a completed attempt", () => {
    const p = emptyProgress();
    p.attempts = [finishAttempt(attempt(), 160000)];
    p.opened[modules[0].id] = 100000;
    p.completed[modules[0].id] = { quick: 120000 };
    expect(parseProgress(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
  it("rejects malformed imports without mutating current progress", () => {
    const p = emptyProgress();
    const before = JSON.stringify(p);
    expect(() => parseProgress({ schemaVersion: 2 })).toThrow();
    expect(() =>
      parseProgress({
        ...p,
        active: { ...attempt(), questionIds: ["missing"] },
      }),
    ).toThrow();
    expect(() =>
      parseProgress({ ...p, settings: { ...p.settings, language: "fr" } }),
    ).toThrow();
    expect(() =>
      parseProgress({ ...p, completed: { unknown: { quick: 1 } } }),
    ).toThrow();
    expect(JSON.stringify(p)).toBe(before);
  });
  it("rejects duplicated questions, invalid option ordering, and invalid stored answer IDs", () => {
    const p = emptyProgress();
    const a = attempt();
    expect(() =>
      parseProgress({
        ...p,
        active: { ...a, questionIds: [bank[0].id, bank[0].id] },
      }),
    ).toThrow();
    const badOrder = structuredClone(a);
    badOrder.optionOrder[bank[0].id] = ["a", "a", "c", "d"];
    expect(() => parseProgress({ ...p, active: badOrder })).toThrow();
    const badAnswer = structuredClone(a);
    badAnswer.answers[bank[0].id] = ["z"];
    expect(() => parseProgress({ ...p, active: badAnswer })).toThrow();
  });
});

describe("browser storage recovery", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("recovers from malformed JSON without crashing", () => {
    vi.stubGlobal("localStorage", { getItem: () => "{broken" });
    expect(loadProgress()).toEqual({
      progress: emptyProgress(),
      warning: true,
    });
  });
  it("continues with a warning when browser storage access is denied", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("denied");
      },
    });
    expect(loadProgress().warning).toBe(true);
  });
  it("starts clean without a warning when no data exists", () => {
    vi.stubGlobal("localStorage", { getItem: () => null });
    expect(loadProgress()).toEqual({
      progress: emptyProgress(),
      warning: false,
    });
  });
});
