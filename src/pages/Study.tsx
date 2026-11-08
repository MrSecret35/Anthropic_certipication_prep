import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  ListChecks,
  ArrowDown,
  Lightbulb,
} from "lucide-react";
import { certifications, modules } from "../../content";
import { useApp } from "../hooks/useApp";
import {
  PageHeading,
  ProgressBar,
  SourceLink,
  TextLink,
} from "../components/ui";
export default function Study() {
  const { t, text, cert, progress } = useApp();
  const [search] = useSearchParams();
  const c = certifications.find((c) => c.id === search.get("cert")) ?? cert;
  const list = modules.filter((m) => m.certificationId === c.id);
  const completed = list.filter(
    (m) => progress.completed[m.id]?.quick || progress.completed[m.id]?.deep,
  ).length;
  return (
    <div className="page">
      <PageHeading
        eyebrow={c.code + " · " + t("THE STUDY ROOM", "LO SPAZIO STUDIO")}
        title={t("Make room for understanding.", "Fai spazio alla conoscenza.")}
        description={t(
          "A quick refresher or a closer look. Start with the way you learn best.",
          "Un ripasso rapido o uno sguardo più attento. Scegli come imparare meglio.",
        )}
      />
      <div className="study-intro">
        <div>
          <h2>
            Claude Certified {text(c.role)} — {text(c.level)}
          </h2>
          <p>
            {completed} / {list.length}{" "}
            {t("published modules completed", "moduli pubblicati completati")}
          </p>
        </div>
        <ProgressBar
          value={Math.round((completed / list.length) * 100)}
          label={t("Module completion", "Completamento moduli")}
        />
      </div>
      <div className="study-list">
        {list.map((m, i) => (
          <article className="study-module" key={m.id}>
            <div className="study-module-index">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <span className="eyebrow">
                {text(c.domains.find((d) => d.id === m.domainId)!.title)}
              </span>
              <h2>{text(m.title)}</h2>
              <p>{text(m.description)}</p>
              <div className="button-row">
                <Link
                  className="button secondary small-button"
                  to={`/study/${m.id}?mode=quick`}
                >
                  <Clock3 size={15} />
                  {t("Quick Study", "Studio rapido")}
                  {progress.completed[m.id]?.quick && <Check size={15} />}
                </Link>
                <Link className="text-link" to={`/study/${m.id}?mode=deep`}>
                  {t("Deep Study", "Approfondimento")}
                  {progress.completed[m.id]?.deep ? (
                    <Check size={15} />
                  ) : (
                    <ArrowRight size={15} />
                  )}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      {c.coverage === "starter" && (
        <p className="muted content-note">
          {t(
            "One starter module is published for this path. Other domains have verified objectives but no lesson yet.",
            "Un modulo iniziale è pubblicato per questo percorso. Gli altri domini hanno obiettivi verificati ma non ancora lezioni.",
          )}
        </p>
      )}
    </div>
  );
}
export function LessonPage() {
  const { id } = useParams();
  const module = modules.find((m) => m.id === id);
  return module ? (
    <LessonContent key={id} id={id!} />
  ) : (
    <div className="page">
      <h1>404</h1>
      <TextLink to="/study">Study</TextLink>
    </div>
  );
}
function LessonContent({ id }: { id: string }) {
  const { t, text, progress, update } = useApp();
  const m = modules.find((m) => m.id === id)!;
  const c = certifications.find((c) => c.id === m.certificationId)!;
  const [search, setSearch] = useSearchParams();
  const mode = search.get("mode") === "deep" ? "deep" : "quick";
  const lesson = text(m[mode]);
  const [revealed, setRevealed] = useState(false);
  const [response, setResponse] = useState("");
  useEffect(() => {
    update((p) => ({
      ...p,
      opened: { ...p.opened, [id]: Date.now() },
      settings: { ...p.settings, certificationId: m.certificationId },
    }));
  }, [id]);
  useEffect(() => {
    setRevealed(false);
  }, [mode]);
  const done = !!progress.completed[id]?.[mode];
  const words = lesson.sections.reduce(
    (n, s) => n + s.paragraphs.join(" ").split(/\s+/).length,
    0,
  );
  const minutes = Math.max(1, Math.ceil(words / 180));
  return (
    <div className="page lesson-page">
      <Link className="breadcrumb" to={`/certification/${c.id}`}>
        <ArrowLeft size={14} />
        {c.code} / {t("Study", "Studio")}
      </Link>
      <PageHeading
        eyebrow={text(c.domains.find((d) => d.id === m.domainId)!.title)}
        title={text(m.title)}
        description={text(m.description)}
      />
      <div className="lesson-toolbar">
        <div
          className="segmented"
          role="group"
          aria-label={t("Study mode", "Modalità di studio")}
        >
          <button
            className={mode === "quick" ? "selected" : ""}
            onClick={() => setSearch({ mode: "quick" })}
          >
            <Clock3 size={16} />
            {t("Quick Study", "Studio rapido")}
          </button>
          <button
            className={mode === "deep" ? "selected" : ""}
            onClick={() => setSearch({ mode: "deep" })}
          >
            <BookOpen size={16} />
            {t("Deep Study", "Approfondimento")}
          </button>
        </div>
        <span className="reading-time">
          <Clock3 size={14} />
          {minutes} {t("min read + exercise", "min lettura + esercizio")}
        </span>
      </div>
      <div className="lesson-layout">
        <article className="lesson-article">
          <div className="objectives-box">
            <span className="eyebrow">
              {t("WHAT YOU’LL LEARN", "COSA IMPARERAI")}
            </span>
            <ul>
              {m.objectives.map((o) => (
                <li key={o.id}>
                  <Check size={16} />
                  {text(o.text)}
                </li>
              ))}
            </ul>
          </div>
          {lesson.sections.map((s, i) => (
            <section
              id={`section-${i}`}
              className="lesson-section"
              key={s.title}
            >
              <h2>{s.title}</h2>
              {s.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {s.table && (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        {s.table.headers.map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((r, n) => (
                        <tr key={n}>
                          {r.map((v, j) => (
                            <td key={j}>{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
          <section className="example-box">
            <Lightbulb size={21} />
            <div>
              <span className="eyebrow">
                {t("IN PRACTICE", "NELLA PRATICA")}
              </span>
              {text(m.examples).map((e) => (
                <div key={e.title}>
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="lesson-section">
            <h2>{t("The terms to know", "I termini da conoscere")}</h2>
            <dl className="terminology">
              {text(m.terminology).map((term) => (
                <div key={term.term}>
                  <dt>{term.term}</dt>
                  <dd>{term.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="knowledge-check" id="exercise">
            <span className="eyebrow">
              {t("PAUSE & APPLY", "FERMATI E APPLICA")}
            </span>
            <h2>
              {t("Check your understanding", "Verifica ciò che hai appreso")}
            </h2>
            <p>{lesson.exercise.prompt}</p>
            <label className="sr-only" htmlFor="reflection">
              {t("Your response", "La tua risposta")}
            </label>
            <textarea
              id="reflection"
              rows={4}
              placeholder={t(
                "Think it through in your own words…",
                "Ragiona con parole tue…",
              )}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
            <button
              className="button secondary"
              aria-expanded={revealed}
              onClick={() => setRevealed(!revealed)}
            >
              {revealed
                ? t("Hide discussion", "Nascondi il confronto")
                : t("Compare your thinking", "Confronta il ragionamento")}
              <ArrowDown size={15} />
            </button>
            {revealed && (
              <div className="exercise-answer">
                <h3>{t("A useful way to reason", "Un ragionamento utile")}</h3>
                <p>{lesson.exercise.answer}</p>
                <p className="small muted">
                  {t(
                    "This reflection is for you. It is not automatically graded or saved.",
                    "Questa riflessione è per te. Non viene valutata o salvata automaticamente.",
                  )}
                </p>
              </div>
            )}
          </section>
          <section className="lesson-section takeaways">
            <h2>{t("Take it with you", "Da ricordare")}</h2>
            <ul>
              {lesson.takeaways.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <div className="lesson-completion">
            <div>
              <h3>
                {done
                  ? t("Marked complete", "Segnato come completato")
                  : t(
                      "Ready to put it into practice?",
                      "Pronto a mettere in pratica?",
                    )}
              </h3>
              <p>
                {t(
                  "Completion is your choice. Practice helps you check what stuck.",
                  "Il completamento lo decidi tu. La pratica verifica cosa è rimasto.",
                )}
              </p>
            </div>
            <button
              className={`button ${done ? "secondary" : ""}`}
              onClick={() =>
                update((p) => {
                  const completion = { ...p.completed[id] };
                  if (completion[mode]) delete completion[mode];
                  else completion[mode] = Date.now();
                  return {
                    ...p,
                    completed: { ...p.completed, [id]: completion },
                  };
                })
              }
            >
              <Check size={16} />
              {done
                ? t("Undo completion", "Annulla completamento")
                : t("Mark complete", "Segna completato")}
            </button>
          </div>
          <Link
            className="button practice-lesson"
            to={`/practice?cert=${m.certificationId}&module=${m.id}`}
          >
            <ListChecks size={17} />
            {t("Practice this module", "Esercitati su questo modulo")}
            <ArrowRight size={16} />
          </Link>
          <div className="lesson-sources">
            <h3>{t("Read the source", "Leggi le fonti")}</h3>
            {m.references.map((r) => (
              <SourceLink key={r.url} href={r.url}>
                {r.title}
              </SourceLink>
            ))}
            <SourceLink href={c.guideUrl}>
              {t("Official exam objectives", "Obiettivi ufficiali dell’esame")}
            </SourceLink>
            <p>
              {t(
                "Last checked 8 November 2026. Original educational explanations.",
                "Ultima verifica: 8 novembre 2026. Spiegazioni didattiche originali.",
              )}
            </p>
          </div>
        </article>
        <aside className="lesson-outline">
          <span className="eyebrow">
            {t("IN THIS LESSON", "IN QUESTA LEZIONE")}
          </span>
          {lesson.sections.map((s, i) => (
            <a
              key={i}
              href={`#section-${i}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(`section-${i}`)
                  ?.scrollIntoView({
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "auto"
                      : "smooth",
                  });
              }}
            >
              {s.title}
            </a>
          ))}
          <a
            href="#exercise"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("exercise")
                ?.scrollIntoView({
                  behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches
                    ? "auto"
                    : "smooth",
                });
            }}
          >
            {t("Check your understanding", "Verifica ciò che sai")}
          </a>
          <div className="margin-note">
            {t(
              "Understanding grows when you stop to try. Take your time with the exercise.",
              "La conoscenza cresce quando provi. Dedica tempo all’esercizio.",
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
