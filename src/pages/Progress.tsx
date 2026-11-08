import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  ListChecks,
} from "lucide-react";
import { certifications, modules, questions } from "../../content";
import { useApp } from "../hooks/useApp";
import { scoreAttempt } from "../lib/engine";
import { Empty, PageHeading, ProgressBar } from "../components/ui";
import {
  ReviewRecommendations,
  PerformanceTable,
} from "../components/Analytics";
export default function ProgressPage() {
  const { t, text, progress, cert } = useApp();
  const history = progress.attempts.filter(
    (a) => a.certificationId === cert.id,
  );
  const exams = history.filter((a) => a.kind === "exam");
  const recent = history.at(-1);
  const completed = modules.filter(
    (m) =>
      m.certificationId === cert.id &&
      (progress.completed[m.id]?.quick || progress.completed[m.id]?.deep),
  ).length;
  const published = modules.filter((m) => m.certificationId === cert.id).length;
  return (
    <div className="page">
      <PageHeading
        eyebrow={t("PROGRESS WITH PURPOSE", "PROGRESSI CON UNO SCOPO")}
        title={t(
          "See what’s taking shape.",
          "Guarda cosa sta prendendo forma.",
        )}
        description={t(
          "A record of your learning, and a clear place to go next. All saved on this device.",
          "Il percorso fatto e una direzione chiara. Tutto salvato su questo dispositivo.",
        )}
        action={
          <Link className="button secondary" to="/settings">
            {t("Back up progress", "Salva una copia")}
            <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="progress-cert-label">
        <span className="badge">{cert.code}</span>
        <h2>
          Claude Certified {text(cert.role)} — {text(cert.level)}
        </h2>
      </div>
      <div className="progress-stat-grid">
        <article>
          <BookOpen size={21} />
          <strong>
            {completed}
            <span> / {published}</span>
          </strong>
          <p>
            {t("Published modules completed", "Moduli pubblicati completati")}
          </p>
          <small>
            {t("Self-reported completion", "Completamento dichiarato da te")}
          </small>
        </article>
        <article>
          <ListChecks size={21} />
          <strong>{history.length}</strong>
          <p>
            {t(
              "Completed practice & exam sessions",
              "Sessioni di pratica ed esame concluse",
            )}
          </p>
          <small>
            {history.reduce((n, a) => n + a.questionIds.length, 0)}{" "}
            {t("question responses recorded", "risposte registrate")}
          </small>
        </article>
        <article>
          <ChartNoAxesCombined size={21} />
          <strong>
            {recent ? scoreAttempt(recent, questions).percentage + "%" : "—"}
          </strong>
          <p>{t("Most recent practice score", "Punteggio più recente")}</p>
          <small>
            {recent
              ? t(
                  `${recent.questionIds.length} questions · not an official score`,
                  `${recent.questionIds.length} domande · punteggio non ufficiale`,
                )
              : t(
                  "Your first session starts the picture",
                  "La prima sessione darà un primo quadro",
                )}
          </small>
        </article>
      </div>
      {!history.length ? (
        <Empty
          icon={<ChartNoAxesCombined size={30} />}
          title={t(
            "Your learning story starts here.",
            "La tua storia di studio inizia qui.",
          )}
        >
          <p>
            {t(
              "No scores to interpret yet. Study a module, then try a short practice to discover your next review.",
              "Nessun punteggio da interpretare. Studia un modulo e prova una breve esercitazione per scoprire cosa ripassare.",
            )}
          </p>
          <Link className="button" to={`/practice?cert=${cert.id}`}>
            {t("Start a practice session", "Avvia un’esercitazione")}
            <ArrowRight size={16} />
          </Link>
        </Empty>
      ) : (
        <>
          <ReviewRecommendations attempts={history} cert={cert} />
          <section className="performance-section">
            <div className="section-heading">
              <h2>{t("Performance by domain", "Risultati per dominio")}</h2>
              <span className="small muted">
                {t(
                  "All completed sessions · repeated questions count again",
                  "Tutte le sessioni · le domande ripetute contano di nuovo",
                )}
              </span>
            </div>
            <PerformanceTable attempts={history} cert={cert} />
          </section>
          <section className="history-section">
            <div className="section-heading">
              <h2>{t("Your session history", "Cronologia delle sessioni")}</h2>
              <span className="small muted">
                {exams.length} {t("exam simulations", "simulazioni d’esame")}
              </span>
            </div>
            {[...history].reverse().map((a) => {
              const score = scoreAttempt(a, questions);
              return (
                <Link
                  className="history-row"
                  to={`/results/${a.id}`}
                  key={a.id}
                >
                  <div>
                    <strong>
                      {a.kind === "exam"
                        ? a.mode === "full"
                          ? t("Full exam", "Esame completo")
                          : t("Custom exam", "Esame personalizzato")
                        : t("Practice session", "Esercitazione")}
                    </strong>
                    <span>
                      {new Intl.DateTimeFormat(progress.settings.language, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(a.submittedAt!)}{" "}
                      · {a.questionIds.length} {t("questions", "domande")}
                    </span>
                  </div>
                  <ProgressBar
                    value={score.percentage}
                    label={t("Practice score", "Punteggio di pratica")}
                  />
                  <strong>{score.percentage}%</strong>
                  <ArrowRight size={17} />
                </Link>
              );
            })}
          </section>
        </>
      )}
      <section className="all-path-progress">
        <div className="section-heading">
          <h2>{t("Across your paths", "Tutti i tuoi percorsi")}</h2>
        </div>
        {certifications.map((c) => {
          const list = modules.filter((m) => m.certificationId === c.id);
          const done = list.filter(
            (m) =>
              progress.completed[m.id]?.quick || progress.completed[m.id]?.deep,
          ).length;
          return (
            <Link
              key={c.id}
              className="path-progress-row"
              to={`/certification/${c.id}`}
            >
              <span className="cert-code">{c.code}</span>
              <strong>
                {text(c.role)} · {text(c.level)}
              </strong>
              <span>
                {done} / {list.length} {t("modules", "moduli")}
              </span>
              <ArrowRight size={16} />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
