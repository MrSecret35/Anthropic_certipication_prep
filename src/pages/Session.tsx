import { useEffect, useState } from "react";
import type { Attempt } from "../types";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  Timer,
  Check,
  X,
  Send,
  BookOpen,
} from "lucide-react";
import { certifications, moduleById, questionById } from "../../content";
import { useApp } from "../hooks/useApp";
import { isCorrect, responseStatus } from "../lib/engine";
import { QuestionCard } from "../components/QuestionCard";
import { Modal, ProgressBar, TextLink } from "../components/ui";
export default function Session() {
  const { progress, t, text, update, finish } = useApp();
  const a = progress.active;
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(false);
  const [navigatorFilter, setNavigatorFilter] = useState<
    "all" | "open" | "flagged"
  >("all");
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const checkedId = a?.questionIds[a.index];
  const isChecked = !!(checkedId && a?.checked.includes(checkedId));
  useEffect(() => {
    if (a?.kind === "practice" && isChecked)
      document.getElementById("answer-feedback")?.focus();
  }, [isChecked, checkedId, a?.kind]);
  if (!a)
    return (
      <div className="page">
        <h1>{t("No active session", "Nessuna sessione attiva")}</h1>
        <TextLink to="/practice">
          {t("Start practicing", "Inizia a esercitarti")}
        </TextLink>
      </div>
    );
  const q = questionById[a.questionIds[a.index]];
  const answer = a.answers[q.id] ?? [];
  const exam = a.kind === "exam";
  const full = a.mode === "full";
  const checked = a.checked.includes(q.id);
  const correct = isCorrect(q, answer);
  const seconds = a.deadline
    ? Math.max(0, Math.ceil((a.deadline - now) / 1000))
    : null;
  const c = certifications.find((c) => c.id === a.certificationId)!;
  const entries = a.questionIds.map((id, index) => ({
    id,
    index,
    status: responseStatus(questionById[id], a.answers[id]),
    flagged: a.flags.includes(id),
  }));
  const answered = entries.filter(
    (entry) => entry.status === "answered",
  ).length;
  const incomplete = entries.filter(
    (entry) => entry.status === "incomplete",
  ).length;
  const unanswered = a.questionIds.length - answered - incomplete;
  const visibleEntries = entries.filter(
    (entry) =>
      navigatorFilter === "all" ||
      (navigatorFilter === "open" && entry.status !== "answered") ||
      (navigatorFilter === "flagged" && entry.flagged),
  );
  const language = exam ? "en" : progress.settings.language;
  const mutate = (fn: (value: Attempt) => Attempt) =>
    update((p) =>
      p.active?.id === a.id &&
      (p.active.deadline === null || Date.now() < p.active.deadline)
        ? { ...p, active: fn(p.active) }
        : p,
    );
  function move(index: number) {
    mutate((v) => ({ ...v, index }));
    document.getElementById("question-top")?.focus();
  }
  function check() {
    if (
      answer.length &&
      (!q.correctAnswers ||
        q.type === "single" ||
        answer.length === q.correctAnswers.length)
    )
      mutate((v) => ({ ...v, checked: [...new Set([...v.checked, q.id])] }));
  }
  return (
    <div className={`page session-page ${exam ? "strict-exam" : ""}`}>
      <div className="session-page-top">
        <div>
          <span className="eyebrow">
            {c.code} ·{" "}
            {full
              ? t("FULL PRACTICE EXAM", "SIMULAZIONE COMPLETA")
              : exam
                ? t("EXAM SIMULATOR", "SIMULATORE")
                : t("PRACTICE", "ESERCITAZIONE")}
          </span>
          <h1>
            {full
              ? t("Full practice exam", "Simulazione completa")
              : exam
                ? t("One question at a time.", "Una domanda alla volta.")
                : t("Give it some thought.", "Prenditi un momento.")}
          </h1>
        </div>
        <div
          className={`timer ${seconds !== null && seconds < 60 ? "timer-urgent" : ""}`}
          aria-label={t("Time remaining", "Tempo rimasto")}
        >
          <Timer size={19} />
          <span>
            {seconds === null
              ? t("Untimed", "Senza limite")
              : `${Math.floor(seconds / 60)
                  .toString()
                  .padStart(
                    2,
                    "0",
                  )}:${(seconds % 60).toString().padStart(2, "0")}`}
          </span>
        </div>
      </div>
      {seconds !== null && seconds <= 60 && (
        <span className="sr-only" role="status">
          {t(
            "One minute or less remaining. The exam submits automatically when time expires.",
            "Resta meno di un minuto. La consegna è automatica alla scadenza.",
          )}
        </span>
      )}
      <div className="session-progress">
        <span>
          {a.index + 1} / {a.questionIds.length}
        </span>
        <ProgressBar
          value={((exam ? answered : a.index + 1) / a.questionIds.length) * 100}
          label={
            exam
              ? t("Complete answers", "Risposte complete")
              : t("Question position", "Posizione domanda")
          }
        />
        <span>
          {answered} {t("answered", "risposte")}
        </span>
        {exam && (
          <button
            className="text-button map-jump"
            onClick={() => document.getElementById("question-map")?.focus()}
          >
            {t("Question map", "Mappa domande")}
          </button>
        )}
      </div>
      <div className="exam-layout">
        <section className="question-panel" id="question-top" tabIndex={-1}>
          <div className="question-meta">
            <span className="badge">
              {exam
                ? t("English · exam mode", "Inglese · modalità esame")
                : t("Learning mode", "Modalità apprendimento")}
            </span>
            <button
              className={`flag-button ${a.flags.includes(q.id) ? "flagged" : ""}`}
              aria-pressed={a.flags.includes(q.id)}
              onClick={() =>
                mutate((v) => ({
                  ...v,
                  flags: v.flags.includes(q.id)
                    ? v.flags.filter((id) => id !== q.id)
                    : [...v.flags, q.id],
                }))
              }
            >
              <Flag size={16} />
              {a.flags.includes(q.id)
                ? t("Flagged", "Segnalata")
                : t("Flag for review", "Segnala per revisione")}
            </button>
          </div>
          <QuestionCard
            question={q}
            number={a.index + 1}
            answer={answer}
            order={a.optionOrder[q.id]}
            language={language}
            review={!exam && checked}
            onChange={(ids) =>
              mutate((v) => ({ ...v, answers: { ...v.answers, [q.id]: ids } }))
            }
          />
          {exam && answer.length > 0 && (
            <button
              className="text-button clear-answer"
              onClick={() =>
                mutate((v) => ({
                  ...v,
                  answers: { ...v.answers, [q.id]: [] },
                }))
              }
            >
              {t("Clear answer", "Cancella risposta")}
            </button>
          )}
          {!exam && checked && (
            <div
              id="answer-feedback"
              tabIndex={-1}
              className={`answer-feedback ${correct ? "feedback-correct" : "feedback-review"}`}
              role="status"
            >
              <div className="feedback-title">
                {correct ? <Check size={20} /> : <X size={20} />}
                <h3>
                  {correct
                    ? t("That’s right. Here’s why.", "Esatto. Ecco perché.")
                    : t(
                        "A useful moment to revisit.",
                        "Un punto utile da rivedere.",
                      )}
                </h3>
              </div>
              <p>{q.explanation[language]}</p>
              <span className="small-label">
                {t("CONNECT IT TO THE LESSON", "COLLEGALO ALLA LEZIONE")}
              </span>
              {q.moduleIds.map((id) => (
                <Link className="feedback-module" key={id} to={`/study/${id}`}>
                  <BookOpen size={16} />
                  {text(moduleById[id].title)}
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          )}
          <div className="question-actions">
            <button
              className="button secondary"
              disabled={a.index === 0}
              onClick={() => move(a.index - 1)}
            >
              <ArrowLeft size={16} />
              {t("Previous", "Precedente")}
            </button>
            <div className="button-row">
              {!exam && !checked && (
                <button
                  className="button"
                  disabled={
                    !answer.length ||
                    (q.type === "multiple" &&
                      answer.length !== q.correctAnswers.length)
                  }
                  onClick={check}
                >
                  {t("Check answer", "Verifica risposta")}
                  <Check size={16} />
                </button>
              )}
              {(exam || checked) &&
                (a.index < a.questionIds.length - 1 ? (
                  <button className="button" onClick={() => move(a.index + 1)}>
                    {t("Next question", "Domanda successiva")}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    className="button"
                    onClick={() => (exam ? setConfirm(true) : finish())}
                  >
                    {exam
                      ? t("Review & submit", "Rivedi e consegna")
                      : t("See my results", "Vedi i risultati")}
                    <ArrowRight size={16} />
                  </button>
                ))}
            </div>
          </div>
        </section>
        <aside className="question-navigator" id="question-map" tabIndex={-1}>
          <h2>{t("Your questions", "Le tue domande")}</h2>
          {exam && (
            <div
              className="navigator-filters"
              role="group"
              aria-label={t("Filter questions", "Filtra domande")}
            >
              {(
                [
                  ["all", t("All", "Tutte"), a.questionIds.length],
                  [
                    "open",
                    t("To answer", "Da completare"),
                    unanswered + incomplete,
                  ],
                  ["flagged", t("Flagged", "Segnalate"), a.flags.length],
                ] as const
              ).map(([id, label, count]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={navigatorFilter === id}
                  onClick={() => setNavigatorFilter(id)}
                >
                  {label} <span>{count}</span>
                </button>
              ))}
            </div>
          )}
          <div className="question-grid">
            {visibleEntries.map(({ id, index: i, status, flagged }) => (
              <button
                aria-label={`${t("Question", "Domanda")} ${i + 1}, ${status === "answered" ? t("answered", "risposta data") : status === "incomplete" ? t("incomplete", "incompleta") : t("unanswered", "senza risposta")}${flagged ? t(", flagged", ", segnalata") : ""}`}
                aria-current={i === a.index ? "step" : undefined}
                className={`${i === a.index ? "current" : ""} ${status} ${flagged ? "flagged" : ""}`}
                key={id}
                onClick={() => move(i)}
              >
                {i + 1}
                {flagged && <Flag size={8} />}
              </button>
            ))}
          </div>
          {!visibleEntries.length && (
            <p className="small muted">
              {t(
                "No questions in this filter.",
                "Nessuna domanda in questo filtro.",
              )}
            </p>
          )}
          <div className="navigator-legend">
            <span>
              <i className="legend-answered" />
              {t("Answered", "Risposta data")}
            </span>
            <span>
              <i />
              {t("Unanswered", "Senza risposta")}
            </span>
            {incomplete > 0 && (
              <span>
                <i className="legend-incomplete" />
                {t("Incomplete", "Incompleta")}
              </span>
            )}
            <span>
              <Flag size={12} />
              {t("Flagged", "Segnalata")}
            </span>
          </div>
          {exam && (
            <button
              className="button secondary submit-button"
              onClick={() => setConfirm(true)}
            >
              <Send size={16} />
              {t("Submit exam", "Consegna esame")}
            </button>
          )}
          {!exam && (
            <button className="text-button" onClick={() => setConfirm(true)}>
              {t("Finish practice now", "Termina esercitazione")}
            </button>
          )}
          <p className="small muted">
            {exam
              ? t(
                  "Answers can be changed until submission. Explanations appear afterwards.",
                  "Puoi cambiare risposte fino alla consegna. Le spiegazioni appaiono dopo.",
                )
              : t(
                  "Checked answers stay locked so feedback cannot change the recorded result.",
                  "Le risposte verificate restano bloccate per preservare il risultato.",
                )}
          </p>
        </aside>
      </div>
      {confirm && (
        <Modal
          title={
            exam
              ? t("Ready to submit?", "Pronto a consegnare?")
              : t("Finish this practice?", "Terminare l’esercitazione?")
          }
          confirmLabel={
            exam
              ? t("Submit exam", "Consegna esame")
              : t("See results", "Vedi risultati")
          }
          onCancel={() => setConfirm(false)}
          onConfirm={() => finish()}
        >
          <p>
            {t(
              `${answered} complete · ${unanswered} unanswered · ${incomplete} incomplete · ${a.flags.length} flagged.`,
              `${answered} complete · ${unanswered} senza risposta · ${incomplete} incomplete · ${a.flags.length} segnalate.`,
            )}
          </p>
          <p>
            {t(
              "Unanswered and incomplete items earn no credit. After submission you can review every answer, but you can’t change them.",
              "Le domande senza risposta o incomplete valgono zero. Dopo la consegna puoi rivedere ogni risposta, ma non modificarla.",
            )}
          </p>
        </Modal>
      )}
    </div>
  );
}
