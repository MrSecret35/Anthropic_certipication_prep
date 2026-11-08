import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Circle,
  Clock3,
  Timer,
  ListChecks,
  MoveUpRight,
  GraduationCap,
} from "lucide-react";
import { certifications, modules, questions } from "../../content";
import { useApp } from "../hooks/useApp";
import { breakdown, recommendations } from "../lib/engine";
import {
  PageHeading,
  ProgressBar,
  SourceLink,
  TextLink,
  Notice,
} from "../components/ui";
import { AssociateAtlas } from "../components/AssociateAtlas";
export function useCompletion(certId: string) {
  const { progress } = useApp();
  const list = modules.filter((m) => m.certificationId === certId);
  const done = list.filter(
    (m) => progress.completed[m.id]?.quick || progress.completed[m.id]?.deep,
  ).length;
  return {
    done,
    total: list.length,
    percentage: list.length ? Math.round((done / list.length) * 100) : 0,
  };
}
export default function Certifications() {
  const { t, text, progress, update } = useApp();
  const opened = Object.entries(progress.opened).sort((a, b) => b[1] - a[1]);
  const recent = modules.find((m) => m.id === opened[0]?.[0]);
  return (
    <div className="page home-page">
      <section className="atlas-intro" aria-labelledby="atlas-title">
        <div className="atlas-copy">
          <h1 id="atlas-title">{t("Study atlas.", "Atlante di studio.")}</h1>
          <p>
            {t(
              "Prepare for Claude certifications. Choose a path, try the exam, and use your answers to find what to study next.",
              "Preparati alle certificazioni Claude. Scegli un percorso, prova l’esame e usa le tue risposte per capire cosa ripassare.",
            )}
          </p>
          <div className="atlas-actions">
            <Link
              className="button"
              to={
                recent
                  ? `/study/${recent.id}`
                  : "/certification/associate-foundations"
              }
            >
              {recent
                ? t("Resume studying", "Riprendi lo studio")
                : t("Explore Associate", "Esplora Associate")}
              <ArrowRight size={17} />
            </Link>
            <Link
              className="atlas-exam-link"
              to="/exam?cert=associate-foundations"
            >
              {t("Open simulator", "Apri il simulatore")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
          {recent && (
            <p className="atlas-recent">
              {t("Last lesson:", "Ultima lezione:")} {text(recent.title)}
            </p>
          )}
        </div>
        <AssociateAtlas />
      </section>
      <section className="atlas-index" aria-labelledby="atlas-index-title">
        <div className="atlas-index-heading">
          <h2 id="atlas-index-title">
            {t("Certification index", "Indice dei percorsi")}
          </h2>
          <p>
            {t(
              "Four paths · study in English or Italian",
              "Quattro percorsi · studio in italiano e inglese",
            )}
          </p>
        </div>
        {certifications.map((c) => (
          <CertificationRecord
            key={c.id}
            certId={c.id}
            onSelect={() =>
              update((p) => ({
                ...p,
                settings: { ...p.settings, certificationId: c.id },
              }))
            }
          />
        ))}
      </section>
      <section className="learning-loop">
        <div>
          <h2>
            {t(
              "Every answer points you forward.",
              "Ogni risposta indica la strada.",
            )}
          </h2>
          <p>
            {t(
              "A missed question is a starting point. We connect it to the exact lesson to revisit.",
              "Una risposta sbagliata è un punto di partenza. Ti porta alla lezione precisa da rivedere.",
            )}
          </p>
        </div>
        <ol>
          {[
            [BookOpen, "Study", "Studia"],
            [ListChecks, "Practice", "Esercitati"],
            [Timer, "Simulate", "Simula"],
            [MoveUpRight, "Review", "Ripassa"],
          ].map(([Icon, en, it], i) => {
            const I = Icon as typeof BookOpen;
            return (
              <li key={i}>
                <span className="loop-icon">
                  <I size={19} />
                </span>
                <span>
                  <small>0{i + 1}</small>
                  {t(en as string, it as string)}
                </span>
                {i < 3 && <ArrowRight className="loop-arrow" size={15} />}
              </li>
            );
          })}
        </ol>
      </section>
      <div className="transparency-line">
        <GraduationCap size={18} />
        <p>
          {t(
            "Original questions, never exam dumps. Verified blueprints, honest practice scores.",
            "Domande originali, mai copie d’esame. Programmi verificati, punteggi trasparenti.",
          )}{" "}
          <Link to="/settings?section=sources">
            {t("Our sources & approach", "Fonti e metodo")}{" "}
            <ArrowUpRight size={12} />
          </Link>
        </p>
      </div>
    </div>
  );
}
function CertificationRecord({
  certId,
  onSelect,
}: {
  certId: string;
  onSelect: () => void;
}) {
  const { t, text, progress } = useApp();
  const c = certifications.find((c) => c.id === certId)!;
  const completion = useCompletion(c.id);
  const questionCount = questions.filter(
    (q) => q.certificationId === c.id && q.verified,
  ).length;
  const last = Math.max(
    0,
    ...modules
      .filter((m) => m.certificationId === c.id)
      .map((m) => progress.opened[m.id] ?? 0),
    ...progress.attempts
      .filter((a) => a.certificationId === c.id)
      .map((a) => a.submittedAt ?? 0),
  );

  return (
    <article className="atlas-record">
      <span className="atlas-record-code">{c.code}</span>
      <div className="atlas-record-content">
        <h3>
          <Link to={`/certification/${c.id}`} onClick={onSelect}>
            {text(c.role)} <span>· {text(c.level)}</span>
          </Link>
        </h3>
        <p>{text(c.description)}</p>
        <p className="atlas-record-meta">
          {completion.total}{" "}
          {completion.total === 1
            ? t("module", "modulo")
            : t("modules", "moduli")}
          <span aria-hidden="true"> · </span>
          {questionCount} {t("questions", "domande")}
          <span aria-hidden="true"> · </span>
          {c.coverage === "starter"
            ? t("Starter content", "Contenuti iniziali")
            : t("Full mock available", "Simulazione completa")}
        </p>
      </div>
      <div className="atlas-record-progress">
        <span>
          {t("Study progress", "Avanzamento")}{" "}
          <strong>{completion.percentage}%</strong>
        </span>
        <ProgressBar
          value={completion.percentage}
          label={t("Learning completion", "Completamento dello studio")}
        />
        {last > 0 && (
          <span>
            {t("Last activity:", "Ultima attività:")}{" "}
            {new Intl.DateTimeFormat(progress.settings.language, {
              day: "numeric",
              month: "short",
            }).format(last)}
          </span>
        )}
      </div>
      <Link
        className="atlas-record-action"
        to={last ? `/study?cert=${c.id}` : `/certification/${c.id}`}
        onClick={onSelect}
        aria-label={`${last ? t("Continue", "Continua") : t("Explore", "Esplora")} ${text(c.role)} ${text(c.level)}`}
      >
        {last ? t("Continue", "Continua") : t("Explore", "Esplora")}
        <ArrowUpRight size={17} />
      </Link>
    </article>
  );
}
export function Dashboard() {
  const { id } = useParams();
  const { t, progress, update } = useApp();
  const c = certifications.find((c) => c.id === id);
  if (!c)
    return (
      <div className="page">
        <h1>{t("Path not found", "Percorso non trovato")}</h1>
        <TextLink to="/">
          {t("All certifications", "Tutte le certificazioni")}
        </TextLink>
      </div>
    );
  return (
    <DashboardContent
      certId={c.id}
      select={() =>
        update((p) => ({
          ...p,
          settings: { ...p.settings, certificationId: c.id },
        }))
      }
      key={`${c.id}-${progress.settings.language}`}
    />
  );
}
function DashboardContent({
  certId,
  select,
}: {
  certId: string;
  select: () => void;
}) {
  const { t, text, progress } = useApp();
  const c = certifications.find((c) => c.id === certId)!;
  const completion = useCompletion(certId);
  const list = modules.filter((m) => m.certificationId === certId);
  const history = progress.attempts.filter((a) => a.certificationId === certId);
  const recs = recommendations(history, questions, modules, c);
  const stats = breakdown(history, questions, "domainIds");
  const next =
    recs[0]?.module ??
    list.find((m) => !progress.completed[m.id]?.quick) ??
    list[0];
  return (
    <div className="page">
      <Link className="breadcrumb" to="/">
        {t("Certifications", "Certificazioni")} / {c.code}
      </Link>
      <PageHeading
        eyebrow={`CLAUDE CERTIFIED · ${text(c.level).toUpperCase()}`}
        title={text(c.role)}
        description={text(c.description)}
        action={
          <SourceLink href={c.guideUrl}>
            {t("Official exam guide", "Guida ufficiale")}
          </SourceLink>
        }
      />
      <section className="path-summary">
        <div>
          <strong>
            {completion.done}
            <span> / {completion.total}</span>
          </strong>
          <p>
            {t("published modules completed", "moduli pubblicati completati")}
          </p>
        </div>
        <div>
          <strong>
            {questions.filter((q) => q.certificationId === certId).length}
          </strong>
          <p>{t("original practice questions", "domande originali")}</p>
        </div>
        <div>
          <strong>
            {c.exam.durationMinutes}
            <span> min</span>
          </strong>
          <p>{t("official exam duration", "durata ufficiale dell’esame")}</p>
        </div>
        <div>
          <strong>{c.exam.questionCount}</strong>
          <p>{t("official exam questions", "domande dell’esame ufficiale")}</p>
        </div>
      </section>
      {c.coverage === "starter" && (
        <Notice>
          {t(
            "This path has one published starter module. The official blueprint is complete; lessons and questions for the other domains are still to be authored.",
            "Questo percorso ha un modulo iniziale. Il programma ufficiale è completo; lezioni e domande degli altri domini sono ancora da scrivere.",
          )}
        </Notice>
      )}
      <div className="dashboard-layout">
        <div>
          <section className="next-step">
            <span className="eyebrow">
              {t("YOUR NEXT STEP", "IL PROSSIMO PASSO")}
            </span>
            <h2>{text(next.title)}</h2>
            <p>
              {recs.length
                ? t(
                    "Revisit this lesson based on your recent answers. A short review can make the next attempt more useful.",
                    "Rivedi questa lezione in base alle risposte recenti. Un breve ripasso rende più utile il prossimo tentativo.",
                  )
                : t(
                    "Begin with a clear explanation, then check your understanding with a practical exercise.",
                    "Inizia con una spiegazione chiara, poi verifica ciò che hai appreso con un esercizio.",
                  )}
            </p>
            <Link className="button" to={`/study/${next.id}`} onClick={select}>
              {t("Open lesson", "Apri lezione")}
              <ArrowRight size={16} />
            </Link>
          </section>
          <div className="section-heading compact">
            <h2>{t("Your study modules", "I tuoi moduli")}</h2>
            <span className="small-label">
              {list.length} {t("AVAILABLE", "DISPONIBILI")}
            </span>
          </div>
          <div className="module-list">
            {list.map((m, i) => (
              <Link
                className="module-row"
                key={m.id}
                to={`/study/${m.id}`}
                onClick={select}
              >
                <span className="module-number">
                  {progress.completed[m.id]?.quick ||
                  progress.completed[m.id]?.deep ? (
                    <Check size={18} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <div>
                  <h3>{text(m.title)}</h3>
                  <p>{text(m.description)}</p>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
          <div className="activity-options">
            <Link to={`/practice?cert=${c.id}`} onClick={select}>
              <ListChecks size={23} />
              <h3>{t("Build your practice", "Crea l’esercitazione")}</h3>
              <p>
                {t(
                  "Pick a topic. Get immediate feedback.",
                  "Scegli un tema. Ricevi feedback immediato.",
                )}
              </p>
              <ArrowRight size={17} />
            </Link>
            <Link to={`/exam?cert=${c.id}`} onClick={select}>
              <Timer size={23} />
              <h3>{t("Try exam conditions", "Prova le condizioni d’esame")}</h3>
              <p>
                {t(
                  "Timed, focused, and in English.",
                  "Con tempo, concentrazione e in inglese.",
                )}
              </p>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <aside className="domain-panel">
          <div className="section-heading compact">
            <h2>{t("The exam blueprint", "Il programma d’esame")}</h2>
          </div>
          <p className="muted small">
            {t(
              "Official domain weights. Accuracy appears as you practice.",
              "Pesi ufficiali. L’accuratezza appare con la pratica.",
            )}
          </p>
          {c.domains.map((d, i) => {
            const stat = stats.find((s) => s.id === d.id);
            return (
              <div className="domain-row" key={d.id}>
                <div className="domain-heading">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <h3>{text(d.title)}</h3>
                  <strong>{d.weight}%</strong>
                </div>
                <div className="domain-weight-track">
                  <span style={{ width: `${d.weight * 3}%` }} />
                </div>
                <p>
                  {stat
                    ? `${stat.correct}/${stat.total} ${t("correct", "corrette")} · ${stat.accuracy}%`
                    : t("Not practiced yet", "Ancora da esercitare")}
                </p>
                {!list.some((m) => m.domainId === d.id) && (
                  <span className="small muted">
                    {t(
                      "Lesson not yet published",
                      "Lezione non ancora pubblicata",
                    )}
                  </span>
                )}
              </div>
            );
          })}
          <div className="source-note">
            <Circle size={7} fill="currentColor" />
            {t("Guide v1.0 · July 2026", "Guida v1.0 · Luglio 2026")}
            <br />
            {t("Verified 8 Nov 2026", "Verificata l’8 nov 2026")}
            <SourceLink href={c.guideUrl}>
              {t("Check the current guide", "Consulta la guida corrente")}
            </SourceLink>
          </div>
        </aside>
      </div>
      <div className="notice quiet">
        <Clock3 size={17} />
        <span>
          {t(
            "Opening a lesson records activity. Only your explicit completion marks it finished.",
            "Aprire una lezione registra attività. Solo il tuo completamento esplicito la segna come conclusa.",
          )}
        </span>
      </div>
    </div>
  );
}
