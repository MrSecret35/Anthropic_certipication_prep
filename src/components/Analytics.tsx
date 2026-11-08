import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ListChecks } from "lucide-react";
import { modules, questions } from "../../content";
import { useApp } from "../hooks/useApp";
import { breakdown, recommendations } from "../lib/engine";
import type { Attempt, Certification } from "../types";
import { ProgressBar } from "./ui";
export function ReviewRecommendations({
  attempts,
  cert,
}: {
  attempts: Attempt[];
  cert: Certification;
}) {
  const { t, text } = useApp();
  const recs = recommendations(attempts, questions, modules, cert);
  return (
    <section className="recommendations">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {t("TURN MISTAKES INTO MOMENTUM", "DAI ERRORI AL PROSSIMO PASSO")}
          </span>
          <h2>{t("Your recommended review", "Il ripasso consigliato")}</h2>
        </div>
      </div>
      {!recs.length ? (
        <div className="success-note">
          <BookOpen size={20} />
          <p>
            {attempts.length
              ? t(
                  "No missed topics in these attempts. Try unseen questions to broaden the evidence.",
                  "Nessun tema sbagliato in questi tentativi. Prova nuove domande per ampliare le prove.",
                )
              : t(
                  "Complete a session to build a review plan from your answers.",
                  "Completa una sessione per creare un piano dalle tue risposte.",
                )}
          </p>
        </div>
      ) : (
        <div className="recommendation-list">
          {recs.map((r, i) => (
            <article className="recommendation" key={r.id}>
              <div className="recommendation-number">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="recommendation-body">
                <span className="badge">
                  {r.unique < 3
                    ? t(
                        "Explore further · small sample",
                        "Approfondisci · campione ridotto",
                      )
                    : r.priority > 0.25
                      ? t("Prioritize review", "Priorità di ripasso")
                      : t("Worth a refresher", "Utile un ripasso")}
                </span>
                <h3>{text(r.module.title)}</h3>
                <p className="small muted">{text(r.domain.title)}</p>
                <p>
                  {t(
                    `${r.missed} missed out of ${r.total} responses (${r.unique} unique questions) · ${r.accuracy}% accuracy.`,
                    `${r.missed} errori su ${r.total} risposte (${r.unique} domande distinte) · ${r.accuracy}% di accuratezza.`,
                  )}{" "}
                  {r.unique < 3
                    ? t(
                        "Too few answers to infer a stable weakness. Use this as a place to explore.",
                        "Troppo poche risposte per individuare una debolezza stabile. Usalo come spunto.",
                      )
                    : t(
                        "Recent errors and unanswered questions make this a useful next review.",
                        "Errori e risposte mancanti recenti rendono utile questo ripasso.",
                      )}
                </p>
                <div className="review-actions">
                  <Link to={`/study/${r.id}?mode=quick`}>
                    <BookOpen size={14} />
                    {t("Quick Study", "Studio rapido")}
                  </Link>
                  <Link to={`/study/${r.id}?mode=deep`}>
                    {t("Deep Study", "Approfondimento")}
                    <ArrowRight size={14} />
                  </Link>
                  <Link to={`/practice?cert=${cert.id}&module=${r.id}`}>
                    <ListChecks size={14} />
                    {t("Retest this topic", "Riprova questo tema")}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="small muted recommendation-method">
        {t(
          "Ranked using smoothed error rates, sample size, difficulty, unanswered items, and official domain weights across up to five recent sessions. Practice guidance, not an official readiness assessment.",
          "Ordine basato su tassi d’errore normalizzati, campione, difficoltà, mancate risposte e pesi ufficiali nelle ultime cinque sessioni. Indicazioni di studio, non valutazioni ufficiali.",
        )}
      </p>
    </section>
  );
}
export function PerformanceTable({
  attempts,
  cert,
  dimension = "domainIds",
}: {
  attempts: Attempt[];
  cert: Certification;
  dimension?: "domainIds" | "moduleIds" | "difficulty";
}) {
  const { t, text } = useApp();
  const rows = breakdown(attempts, questions, dimension);
  const allRows =
    dimension === "domainIds"
      ? cert.domains.map(
          (d) =>
            rows.find((r) => r.id === d.id) ?? {
              id: d.id,
              correct: 0,
              total: 0,
              accuracy: 0,
            },
        )
      : rows;
  const name = (id: string) =>
    dimension === "domainIds"
      ? text(cert.domains.find((d) => d.id === id)!.title)
      : dimension === "moduleIds"
        ? text(modules.find((m) => m.id === id)!.title)
        : ({
            easy: t("Easy", "Facile"),
            medium: t("Medium", "Media"),
            hard: t("Hard", "Difficile"),
          }[id] ?? id);
  return (
    <div className="table-scroll">
      <table className="performance-table">
        <thead>
          <tr>
            <th>
              {dimension === "domainIds"
                ? t("Domain", "Dominio")
                : dimension === "moduleIds"
                  ? t("Module", "Modulo")
                  : t("Difficulty", "Difficoltà")}
            </th>
            <th>{t("Correct / total", "Corrette / totale")}</th>
            <th>{t("Accuracy", "Accuratezza")}</th>
          </tr>
        </thead>
        <tbody>
          {allRows.map((r) => (
            <tr key={r.id}>
              <th scope="row">{name(r.id)}</th>
              <td>
                {r.correct} / {r.total}
              </td>
              <td>
                {r.total ? (
                  <div className="accuracy-cell">
                    <ProgressBar value={r.accuracy} label={name(r.id)} />
                    <strong>{r.accuracy}%</strong>
                  </div>
                ) : (
                  <span className="muted small">
                    {t("No data", "Nessun dato")}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
