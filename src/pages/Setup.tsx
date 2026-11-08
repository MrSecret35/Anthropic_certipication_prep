import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Timer,
  ListChecks,
  Check,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { certifications, modules, questions } from "../../content";
import { useApp } from "../hooks/useApp";
import {
  createAttempt,
  createFullAttempt,
  filterQuestions,
  fullExamIssues,
  selectQuestions,
  type Filters,
} from "../lib/engine";
import { Notice, PageHeading } from "../components/ui";
import type { Difficulty } from "../types";
export default function Setup({ exam = false }: { exam?: boolean }) {
  const { t, text, progress, cert, start, update } = useApp();
  const [search, setSearch] = useSearchParams();
  const c = certifications.find((c) => c.id === search.get("cert")) ?? cert;
  const full = fullExamIssues(c, questions);
  const [mode, setMode] = useState<"custom" | "full">(
    exam && full.ready ? "full" : "custom",
  );
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedModules, setModules] = useState<string[]>(
    search.get("module") ? [search.get("module")!] : [],
  );
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [history, setHistory] = useState<Filters["history"]>(
    search.get("history") === "incorrect" ? "incorrect" : "all",
  );
  const [count, setCount] = useState(10);
  const [minutes, setMinutes] = useState(20);
  const [timed, setTimed] = useState(true);
  const [mix, setMix] = useState<"balanced" | "easy" | "hard">("balanced");
  const filtered =
    exam && mode === "full"
      ? full.pool
      : filterQuestions(
          questions,
          c.id,
          {
            domainIds: domains,
            moduleIds: selectedModules,
            difficulty,
            history: exam ? "all" : history,
          },
          progress.attempts,
        );
  const fullReady = full.ready;
  const requested = exam && mode === "full" ? c.exam.questionCount : count;
  const available = Math.min(requested, filtered.length);
  const canStart =
    !progress.active &&
    available > 0 &&
    !(exam && mode === "full" && !fullReady);
  function changeCert(id: string) {
    setSearch({ cert: id });
    setDomains([]);
    setModules([]);
    setDifficulty("all");
    setHistory("all");
    const next = certifications.find((item) => item.id === id);
    setMode(
      exam && next && fullExamIssues(next, questions).ready ? "full" : "custom",
    );
    update((p) => ({ ...p, settings: { ...p.settings, certificationId: id } }));
  }
  function launch() {
    if (!canStart) return;
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    if (exam && mode === "full") {
      const attempt = createFullAttempt(c, questions, seed, progress.attempts);
      if (attempt) start(attempt);
      return;
    }
    const chosen = selectQuestions(
      filtered,
      available,
      c,
      seed,
      progress.attempts,
      mix,
    );
    start(
      createAttempt(
        c,
        chosen,
        exam ? "exam" : "practice",
        exam ? "custom" : "practice",
        seed,
        exam && timed ? minutes : null,
      ),
    );
  }
  return (
    <div className="page setup-page">
      <PageHeading
        eyebrow={
          exam
            ? t("A FOCUSED REHEARSAL", "UNA PROVA CONCENTRATA")
            : t("LEARNING BY DOING", "IMPARARE FACENDO")
        }
        title={
          exam
            ? t("Make practice feel real.", "Rendi concreta la preparazione.")
            : t("A question. A little clarity.", "Una domanda. Più chiarezza.")
        }
        description={
          exam
            ? t(
                "Test your understanding under a little pressure, then turn the results into your next step.",
                "Verifica ciò che sai con un po’ di pressione, poi usa i risultati per il prossimo passo.",
              )
            : t(
                "Choose your focus. Get useful feedback. Revisit exactly what you need.",
                "Scegli su cosa concentrarti. Ricevi feedback e ripassa ciò che serve.",
              )
        }
      />
      <div className="setup-layout">
        <section className="setup-form">
          <label className="field-label" htmlFor="setup-cert">
            {t("Certification", "Certificazione")}
          </label>
          <select
            id="setup-cert"
            value={c.id}
            onChange={(e) => changeCert(e.target.value)}
          >
            {certifications.map((c) => (
              <option key={c.id} value={c.id}>
                Claude Certified {text(c.role)} — {text(c.level)}
              </option>
            ))}
          </select>
          {exam && (
            <>
              <div className="field-label">
                {t("Your exam mode", "Modalità d’esame")}
              </div>
              <div className="mode-options">
                <button
                  className={mode === "custom" ? "selected" : ""}
                  onClick={() => setMode("custom")}
                  aria-pressed={mode === "custom"}
                >
                  <ListChecks size={20} />
                  <strong>{t("Custom Exam", "Esame personalizzato")}</strong>
                  <span>
                    {t("Your focus, your pace", "Obiettivi e ritmo tuoi")}
                  </span>
                </button>
                <button
                  className={mode === "full" ? "selected" : ""}
                  onClick={() => setMode("full")}
                  aria-pressed={mode === "full"}
                >
                  <ShieldCheck size={20} />
                  <strong>{t("Full Exam", "Esame completo")}</strong>
                  <span>
                    {c.exam.questionCount} {t("questions", "domande")} ·{" "}
                    {c.exam.durationMinutes} min
                  </span>
                </button>
              </div>
            </>
          )}
          {(!exam || mode === "custom") && (
            <>
              <fieldset className="filter-fieldset">
                <legend>{t("Focus domains", "Domini da ripassare")}</legend>
                <p className="small muted">
                  {t(
                    "Leave unselected to include all available domains.",
                    "Non selezionare nulla per includere tutti i domini disponibili.",
                  )}
                </p>
                <div className="domain-checks">
                  {c.domains.map((d) => (
                    <label key={d.id}>
                      <input
                        type="checkbox"
                        checked={domains.includes(d.id)}
                        onChange={() =>
                          setDomains((v) =>
                            v.includes(d.id)
                              ? v.filter((id) => id !== d.id)
                              : [...v, d.id],
                          )
                        }
                      />
                      <span>{text(d.title)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="filter-fieldset">
                <legend>{t("Modules", "Moduli")}</legend>
                <div className="module-checks">
                  {modules
                    .filter((m) => m.certificationId === c.id)
                    .map((m) => (
                      <label key={m.id}>
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(m.id)}
                          onChange={() =>
                            setModules((v) =>
                              v.includes(m.id)
                                ? v.filter((id) => id !== m.id)
                                : [...v, m.id],
                            )
                          }
                        />
                        {text(m.title)}
                      </label>
                    ))}
                </div>
              </fieldset>
              <div className="form-row">
                <label>
                  {t("Difficulty", "Difficoltà")}
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(e.target.value as Difficulty | "all")
                    }
                  >
                    <option value="all">
                      {t("All difficulties", "Tutte le difficoltà")}
                    </option>
                    <option value="easy">{t("Easy", "Facile")}</option>
                    <option value="medium">{t("Medium", "Media")}</option>
                    <option value="hard">{t("Hard", "Difficile")}</option>
                  </select>
                </label>
                <label>
                  {t("Question count", "Numero di domande")}
                  <select
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  >
                    {(exam ? [10, 20, 30, 60] : [5, 10, 20, 30]).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {!exam && (
                <label className="field-label">
                  {t("Question history", "Cronologia domande")}
                  <select
                    value={history}
                    onChange={(e) =>
                      setHistory(e.target.value as Filters["history"])
                    }
                  >
                    <option value="all">
                      {t(
                        "All questions · prefer unseen",
                        "Tutte · priorità alle nuove",
                      )}
                    </option>
                    <option value="incorrect">
                      {t(
                        "Previously incorrect or unanswered only",
                        "Solo errori o risposte mancanti",
                      )}
                    </option>
                    <option value="unseen">
                      {t("Never attempted", "Mai tentate")}
                    </option>
                  </select>
                </label>
              )}
              {exam && (
                <>
                  <label className="field-label">
                    {t("Difficulty mix", "Distribuzione della difficoltà")}
                    <select
                      value={mix}
                      onChange={(e) => setMix(e.target.value as typeof mix)}
                    >
                      <option value="balanced">
                        {t(
                          "Balanced · 25% easy / 50% medium / 25% hard target",
                          "Bilanciata · obiettivo 25% facile / 50% media / 25% difficile",
                        )}
                      </option>
                      <option value="easy">
                        {t(
                          "Fundamentals · prefer easier questions",
                          "Basi · preferenza per domande facili",
                        )}
                      </option>
                      <option value="hard">
                        {t(
                          "Challenge · prefer harder questions",
                          "Sfida · preferenza per domande difficili",
                        )}
                      </option>
                    </select>
                  </label>
                  <div className="timer-settings">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={timed}
                        onChange={(e) => setTimed(e.target.checked)}
                      />
                      {t("Time limit", "Limite di tempo")}
                    </label>
                    {timed && (
                      <label className="minutes-input">
                        <input
                          type="number"
                          min={1}
                          max={240}
                          value={minutes}
                          onChange={(e) =>
                            setMinutes(
                              Math.min(
                                240,
                                Math.max(1, Number(e.target.value)),
                              ),
                            )
                          }
                        />
                        <span>{t("minutes", "minuti")}</span>
                      </label>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          {exam && mode === "full" && !fullReady && (
            <Notice>
              <strong>
                {t(
                  "Full-length simulation is not available yet.",
                  "La simulazione completa non è ancora disponibile.",
                )}
              </strong>
              <p>
                {t(
                  `There are ${full.available} items approved for a full mock; ${full.required} are required with coverage across every domain. The practice bank is available in Custom Exam.`,
                  `Ci sono ${full.available} quesiti idonei alla simulazione completa; ne servono ${full.required} con copertura di tutti i domini. Puoi usare la banca di pratica nell’esame personalizzato.`,
                )}
              </p>
              {c.exam.scenarioBased && (
                <p>
                  {t(
                    "The official format also uses four linked scenarios drawn from six. Linked scenario simulation is not implemented in this starter release.",
                    "Il formato ufficiale usa anche quattro scenari collegati scelti tra sei. Questa versione iniziale non implementa gruppi di domande per scenario.",
                  )}
                </p>
              )}
            </Notice>
          )}
          {exam && mode === "full" && fullReady && (
            <section className="full-exam-brief">
              <h2>{t("What to expect", "Come funziona la prova")}</h2>
              <p>
                {t(
                  "The timer starts as soon as you begin and keeps running on refresh. You can skip questions, change answers, and flag them for review. The workspace stays in exam mode until you submit or time expires.",
                  "Il timer parte all’avvio e continua anche se ricarichi la pagina. Puoi saltare domande, cambiare risposte e contrassegnarle per il ripasso. L’app resta nella prova fino alla consegna o alla scadenza.",
                )}
              </p>
              <div className="table-scroll">
                <table className="performance-table">
                  <caption>
                    {t(
                      "Blueprint for this mock",
                      "Distribuzione dei quesiti nella simulazione",
                    )}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">{t("Domain", "Dominio")}</th>
                      <th scope="col">{t("Weight", "Peso")}</th>
                      <th scope="col">{t("Items", "Quesiti")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.domains.map((d) => (
                      <tr key={d.id}>
                        <th scope="row">{text(d.title)}</th>
                        <td>{d.weight}%</td>
                        <td>{full.quotas[d.id]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </section>
        <aside className="session-summary">
          <span className="summary-icon">
            {exam ? <Timer size={25} /> : <BookOpen size={25} />}
          </span>
          <span className="eyebrow">
            {t("YOUR SESSION", "LA TUA SESSIONE")}
          </span>
          <h2>
            {exam
              ? mode === "full"
                ? t("Full Exam", "Esame completo")
                : t("Custom Exam", "Esame personalizzato")
              : t("Focused practice", "Pratica mirata")}
          </h2>
          <p>
            {c.code} · {text(c.role)}
          </p>
          <dl>
            <div>
              <dt>{t("Questions available", "Domande disponibili")}</dt>
              <dd>{filtered.length}</dd>
            </div>
            <div>
              <dt>{t("Session length", "Lunghezza sessione")}</dt>
              <dd>{exam && mode === "full" ? requested : available}</dd>
            </div>
            <div>
              <dt>{t("Time limit", "Tempo limite")}</dt>
              <dd>
                {exam
                  ? mode === "full"
                    ? `${c.exam.durationMinutes} min`
                    : timed
                      ? `${minutes} min`
                      : t("Untimed", "Senza limite")
                  : t("At your pace", "Al tuo ritmo")}
              </dd>
            </div>
            <div>
              <dt>{t("Questions in", "Lingua domande")}</dt>
              <dd>
                {exam
                  ? "English"
                  : progress.settings.language === "en"
                    ? "English"
                    : "Italiano"}
              </dd>
            </div>
          </dl>
          <ul className="session-instructions">
            <li>
              <Check size={15} />
              {t(
                "Single and multiple-response questions",
                "Risposta singola e multipla",
              )}
            </li>
            <li>
              <Check size={15} />
              {exam
                ? t(
                    "Review explanations after submission",
                    "Spiegazioni dopo la consegna",
                  )
                : t(
                    "Explanations after each answer",
                    "Spiegazioni dopo ogni risposta",
                  )}
            </li>
            <li>
              <Check size={15} />
              {t(
                "Progress saved on this device",
                "Progressi salvati sul dispositivo",
              )}
            </li>
          </ul>
          {available < requested && !(exam && mode === "full") && (
            <p className="bank-warning">
              {t(
                `You requested ${requested}; ${available} match your filters. Start a shorter session with unique questions.`,
                `Hai richiesto ${requested} domande; ${available} corrispondono ai filtri. Avvia una sessione più breve senza duplicati.`,
              )}
            </p>
          )}
          {filtered.length === 0 && (
            <p className="bank-warning">
              {t(
                "No questions match. Broaden your filters or complete a first practice session.",
                "Nessuna domanda corrisponde. Amplia i filtri o completa una prima esercitazione.",
              )}
            </p>
          )}
          {progress.active ? (
            <Link className="button" to="/session">
              {t("Resume saved session", "Riprendi sessione salvata")}
              <ArrowRight size={16} />
            </Link>
          ) : (
            <button disabled={!canStart} className="button" onClick={launch}>
              {exam && mode === "full" && !fullReady
                ? t("Full exam unavailable", "Esame completo non disponibile")
                : exam
                  ? t(
                      `Start ${available}-question exam`,
                      `Avvia esame da ${available} domande`,
                    )
                  : t(
                      `Practice ${available} questions`,
                      `Esercitati su ${available} domande`,
                    )}
              <ArrowRight size={16} />
            </button>
          )}
          <p className="summary-footnote">
            {exam
              ? t(
                  "Original practice questions. Raw scores are not official scaled scores. Timer continues on refresh and between pages.",
                  "Domande originali. Il punteggio grezzo non è quello ufficiale. Il tempo continua dopo aggiornamenti e durante la navigazione.",
                )
              : t(
                  "Every answer includes feedback and a direct link back to the lesson.",
                  "Ogni risposta include feedback e un collegamento alla lezione.",
                )}
          </p>
        </aside>
      </div>
    </div>
  );
}
