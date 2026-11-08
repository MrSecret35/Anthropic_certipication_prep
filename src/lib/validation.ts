import type { Certification, Question, StudyModule } from "../types";
export function validateContent(
  certs: Certification[],
  modules: StudyModule[],
  questions: Question[],
) {
  const errors: string[] = [];
  const unique = (ids: string[], label: string) => {
    if (new Set(ids).size !== ids.length) errors.push(`Duplicate ${label} ID`);
  };
  unique(
    certs.map((c) => c.id),
    "certification",
  );
  unique(
    modules.map((m) => m.id),
    "module",
  );
  unique(
    questions.map((q) => q.id),
    "question",
  );
  const stems = new Set<string>();
  for (const c of certs) {
    unique(
      c.domains.map((d) => d.id),
      "domain",
    );
    if (Math.abs(c.domains.reduce((s, d) => s + d.weight, 0) - 100) > 0.01)
      errors.push(`${c.id}: weights must sum to 100`);
  }
  for (const m of modules) {
    const c = certs.find((c) => c.id === m.certificationId);
    if (!c?.domains.some((d) => d.id === m.domainId))
      errors.push(`${m.id}: invalid domain`);
    for (const lang of ["en", "it"] as const) {
      if (
        !m.title[lang] ||
        !m.quick[lang]?.sections.length ||
        !m.deep[lang]?.sections.length
      )
        errors.push(`${m.id}: missing ${lang} lesson`);
    }
    for (const id of m.reviewQuestionIds)
      if (!questions.some((q) => q.id === id && q.moduleIds.includes(m.id)))
        errors.push(`${m.id}: invalid reverse question link`);
  }
  for (const q of questions) {
    const c = certs.find((c) => c.id === q.certificationId);
    const prefix = q.id + ": ";
    if (q.options.length !== 4) errors.push(prefix + "must have four options");
    unique(
      q.options.map((o) => o.id),
      "option",
    );
    if (
      q.correctAnswers.length !== new Set(q.correctAnswers).size ||
      q.correctAnswers.some((id) => !q.options.some((o) => o.id === id))
    )
      errors.push(prefix + "invalid answer ID");
    if (
      (q.type === "single" && q.correctAnswers.length !== 1) ||
      (q.type === "multiple" && q.correctAnswers.length < 2)
    )
      errors.push(prefix + "invalid correct answer count");
    if (
      !q.moduleIds.length ||
      q.moduleIds.some(
        (id) =>
          !modules.some(
            (m) => m.id === id && m.certificationId === q.certificationId,
          ),
      )
    )
      errors.push(prefix + "invalid module");
    if (
      !q.domainIds.length ||
      q.domainIds.some((id) => !c?.domains.some((d) => d.id === id))
    )
      errors.push(prefix + "invalid domain");
    if (
      !q.objectiveIds.length ||
      q.objectiveIds.some(
        (id) =>
          !modules.some(
            (m) =>
              q.moduleIds.includes(m.id) &&
              m.objectives.some((o) => o.id === id),
          ),
      )
    )
      errors.push(prefix + "invalid objective");
    if (!q.references.length || !q.verifiedAt)
      errors.push(prefix + "missing references");
    if (
      q.fullExam &&
      (!q.verified || q.domainIds.length !== 1 || !q.moduleIds.length)
    )
      errors.push(
        prefix + "full mock requires a verified item with one primary domain",
      );
    for (const lang of ["en", "it"] as const) {
      if (
        !q.question[lang]?.trim() ||
        !q.explanation[lang]?.trim() ||
        q.options.some(
          (o) => !o.text[lang]?.trim() || !o.explanation[lang]?.trim(),
        )
      )
        errors.push(prefix + "empty translation or answer");
      const normalized = q.question[lang]
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, "");
      if (stems.has(normalized)) errors.push(prefix + "duplicate question");
      stems.add(normalized);
    }
  }
  return errors;
}
