import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Check, Circle, Timer } from "lucide-react";
import {
  certifications,
  moduleById,
  questionById,
  questions,
} from "../../content";
import { useApp } from "../hooks/useApp";
import { isCorrect, scoreAttempt } from "../lib/engine";
import {
  ReviewRecommendations,
  PerformanceTable,
} from "../components/Analytics";
import { QuestionCard } from "../components/QuestionCard";
import { Notice, PageHeading, SourceLink, TextLink } from "../components/ui";
export default function Results() {
  const { id } = useParams();
  const { t, text, progress } = useApp();
  const a = progress.attempts.find((a) => a.id === id);
  const [tab, setTab] = useState<"domainIds" | "moduleIds" | "difficulty">(
    "domainIds",
  );
  const [missedOnly, setMissedOnly] = useState(false);
  const [italian, setItalian] = useState(false);
  if (!a)
    return (
      <div className="page">
        <h1>{t("Attempt not found", "Tentativo non trovato")}</h1>
        <p>
          {t(
            "This result may belong to another browser or an older backup.",
            "Questo risultato può appartenere a un altro browser o a una copia precedente.",
          )}
        </p>
        <TextLink to="/progress">
          {t("View your progress", "Vedi i progressi")}
        </TextLink>
      </div>
    );
  const c = certifications.find((c) => c.id === a.certificationId)!;
  const score = scoreAttempt(a, questions);
  const language =
    a.kind === "exam" ? (italian ? "it" : "en") : progress.settings.language;
  const readiness =
    score.total < 20
      ? t(
          "Early signal · more evidence needed",
          "Primo segnale · servono più prove",
        )
      : score.percentage >= 80
        ? t(
            "Promising · broaden your practice",
            "Promettente · amplia la pratica",
          )
        : t(
            "Keep building · review and retest",
            "Continua a costruire · ripassa e riprova",
          );
  return (
    <div className="page results-page">
      <Link className="breadcrumb" to="/progress">
        {t("My Progress", "I miei progressi")} /{" "}
        {t("Session results", "Risultati sessione")}
      </Link>
      <PageHeading
        eyebrow={
          c.code +
          " · " +
          t("YOUR PRACTICE, IN PERSPECTIVE", "LA PRATICA, IN PROSPETTIVA")
        }
        title={t("Here’s what to build on.", "Ecco da dove ripartire.")}
        description={t(
          "You have a result. More importantly, you have a next step.",
          "Hai un risultato. E soprattutto un prossimo passo.",
        )}
        action={
          <div className="button-row">
            {a.mode === "full" && (
              <Link className="button secondary" to={`/exam?cert=${c.id}`}>
                {t("Start a new mock", "Nuova simulazione")}
              </Link>
            )}
            <Link className="button secondary" to={`/practice?cert=${c.id}`}>
              {t("Practice again", "Esercitati di nuovo")}
            </Link>
            <Link
              className="button secondary"
              to={`/practice?cert=${c.id}&history=incorrect`}
            >
              {t("Review missed questions", "Ripassa gli errori")}
              <ArrowRight size={16} />
            </Link>
          </div>
        }
      />
      {a.expired && (
        <Notice>
          {t(
            "Time expired and your saved answers were submitted automatically.",
            "Il tempo è scaduto e le risposte sono state consegnate automaticamente.",
          )}
        </Notice>
      )}
      <section className="results-overview">
        <div className="score-block">
          <span className="eyebrow">
            {t("PRACTICE SCORE", "PUNTEGGIO DI PRATICA")}
          </span>
          <strong>
            {score.percentage}
            <span>%</span>
          </strong>
          <p>
            {score.correct} / {score.total} {t("correct", "corrette")}
          </p>
        </div>
        <div className="score-context">
          <h2>{readiness}</h2>
          <p>
            {t(
              "Readiness estimate based only on this practice sample. It is not a predicted official score or a pass/fail result.",
              "Stima di preparazione basata solo su questo campione. Non è un punteggio ufficiale previsto né un esito superato/non superato.",
            )}
          </p>
          <div className="score-facts">
            <span>
              <Check size={16} />
              {score.correct} {t("correct", "corrette")}
            </span>
            <span>
              <Circle size={13} />
              {score.incorrect} {t("incorrect", "errate")}
            </span>
            <span>
              <Circle size={13} />
              {score.unanswered} {t("unanswered", "senza risposta")}
            </span>
            <span>
              <Timer size={15} />
              {Math.floor(score.timeSeconds / 60)}m {score.timeSeconds % 60}s
            </span>
          </div>
          <p className="small muted">
            {t(
              "Multiple-response questions require all correct options. No partial credit in this tool. Official exams report scaled scores.",
              "Le risposte multiple richiedono tutte le opzioni corrette. Qui non c’è credito parziale. Gli esami ufficiali usano punteggi scalati.",
            )}
          </p>
        </div>
      </section>
      <ReviewRecommendations attempts={[a]} cert={c} />
      <section className="performance-section">
        <div className="section-heading">
          <h2>{t("A closer look", "Uno sguardo più attento")}</h2>
          <div className="segmented small-segmented">
            {(["domainIds", "moduleIds", "difficulty"] as const).map((key) => (
              <button
                key={key}
                className={tab === key ? "selected" : ""}
                onClick={() => setTab(key)}
              >
                {key === "domainIds"
                  ? t("Domain", "Dominio")
                  : key === "moduleIds"
                    ? t("Module", "Modulo")
                    : t("Difficulty", "Difficoltà")}
              </button>
            ))}
          </div>
        </div>
        <PerformanceTable attempts={[a]} cert={c} dimension={tab} />
      </section>
      <section className="question-review">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {t("UNDERSTAND THE WHY", "CAPIRE IL PERCHÉ")}
            </span>
            <h2>{t("Review your questions", "Rivedi le domande")}</h2>
          </div>
          <div className="review-filter">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={missedOnly}
                onChange={(e) => setMissedOnly(e.target.checked)}
              />
              {t("Missed only", "Solo errori")}
            </label>
            {a.kind === "exam" && (
              <button
                className="button secondary small-button"
                onClick={() => setItalian(!italian)}
              >
                {italian
                  ? t("English review", "Revisione in inglese")
                  : t("Italian translation", "Traduzione italiana")}
              </button>
            )}
          </div>
        </div>
        {a.questionIds
          .filter(
            (id) => !missedOnly || !isCorrect(questionById[id], a.answers[id]),
          )
          .map((id) => {
            const q = questionById[id];
            const right = isCorrect(q, a.answers[id]);
            return (
              <details key={id} className="review-detail">
                <summary>
                  <span
                    className={`review-status ${right ? "status-correct" : ""}`}
                  >
                    {right
                      ? t("Correct", "Corretta")
                      : a.answers[id]?.length
                        ? t("Incorrect", "Errata")
                        : t("Unanswered", "Senza risposta")}
                  </span>
                  <span>{q.question[language]}</span>
                  <span className="details-plus">+</span>
                </summary>
                <div className="review-detail-content">
                  <QuestionCard
                    question={q}
                    answer={a.answers[id] ?? []}
                    order={a.optionOrder[id]}
                    onChange={() => {}}
                    language={language}
                    review
                  />
                  <div className="review-explanation">
                    <h3>{t("Why this answer", "Perché questa risposta")}</h3>
                    <p>{q.explanation[language]}</p>
                    {q.moduleIds.map((id) => (
                      <TextLink key={id} to={`/study/${id}`}>
                        {text(moduleById[id].title)}
                      </TextLink>
                    ))}
                    {q.references.map((ref, i) => (
                      <SourceLink key={ref} href={ref}>
                        {t("Reference", "Fonte")} {i + 1}
                      </SourceLink>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
      </section>
    </div>
  );
}
