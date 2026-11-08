import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Upload, Trash2, ShieldCheck } from "lucide-react";
import { certifications, modules, questions } from "../../content";
import { useApp } from "../hooks/useApp";
import { parseProgress } from "../lib/storage";
import { Modal, PageHeading, SourceLink } from "../components/ui";
import type { Progress } from "../types";
export default function Settings() {
  const [search] = useSearchParams();
  useEffect(() => {
    if (search.get("section") === "sources")
      document.getElementById("sources")?.scrollIntoView();
  }, [search]);
  const { t, text, progress, update, replace, reset } = useApp();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState<Progress | null>(null);
  const [resetting, setResetting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  function exportData() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fieldnotes-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setError(false);
    setMessage(
      t(
        "Backup downloaded. Keep it somewhere you can find it.",
        "Copia scaricata. Conservala in un posto sicuro.",
      ),
    );
  }
  async function importFile(file: File) {
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("size");
      setPending(parseProgress(JSON.parse(await file.text())));
      setMessage("");
    } catch {
      setError(true);
      setMessage(
        t(
          "This file is not a valid Fieldnotes progress backup, or it exceeds 2 MB. Your existing progress is unchanged.",
          "Il file non è una copia Fieldnotes valida o supera 2 MB. I progressi attuali restano invariati.",
        ),
      );
    }
    if (fileRef.current) fileRef.current.value = "";
  }
  return (
    <div className="page settings-page">
      <PageHeading
        eyebrow={t("MAKE IT YOURS", "COME PIACE A TE")}
        title={t(
          "Your space, your settings.",
          "Il tuo spazio, le tue preferenze.",
        )}
        description={t(
          "Choose how you study, keep a backup, and see where the content comes from.",
          "Scegli come studiare, conserva una copia e scopri le fonti.",
        )}
      />
      <section className="settings-section">
        <div>
          <h2>{t("Your preferences", "Le tue preferenze")}</h2>
          <p>
            {t(
              "Changes apply immediately and stay on this device.",
              "Le modifiche sono immediate e restano su questo dispositivo.",
            )}
          </p>
        </div>
        <div className="settings-fields">
          <label>
            {t("Study language", "Lingua di studio")}
            <select
              id="study-language"
              value={progress.settings.language}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  settings: {
                    ...p.settings,
                    language: e.target.value as "en" | "it",
                  },
                }))
              }
            >
              <option value="en">English</option>
              <option value="it">Italiano</option>
            </select>
            <small>
              {t(
                "Lessons and practice follow this choice. Exams stay in English until submitted.",
                "Lezioni e pratica seguono questa scelta. Gli esami restano in inglese fino alla consegna.",
              )}
            </small>
          </label>
          <label>
            {t("Appearance", "Aspetto")}
            <select
              id="appearance"
              value={progress.settings.theme}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  settings: {
                    ...p.settings,
                    theme: e.target.value as "light" | "dark",
                  },
                }))
              }
            >
              <option value="light">
                {t("Light · atlas paper", "Chiaro · carta d’atlante")}
              </option>
              <option value="dark">
                {t("Dark · blue ink", "Scuro · inchiostro blu")}
              </option>
            </select>
          </label>
        </div>
      </section>
      <section className="settings-section">
        <div>
          <h2>{t("Your progress belongs to you", "I progressi sono tuoi")}</h2>
          <p>
            {t(
              "No accounts or cloud sync. Export a JSON backup to move your progress between browsers or devices.",
              "Nessun account o sincronizzazione cloud. Esporta JSON per trasferire i progressi tra browser o dispositivi.",
            )}
          </p>
        </div>
        <div className="settings-fields">
          <div className="data-summary">
            <ShieldCheck size={24} />
            <div>
              <strong>
                {progress.attempts.length}{" "}
                {t("saved sessions", "sessioni salvate")}
              </strong>
              <p>
                {
                  Object.values(progress.completed).filter(
                    (c) => c.quick || c.deep,
                  ).length
                }{" "}
                {t("modules marked complete", "moduli segnati come completati")}
              </p>
            </div>
          </div>
          <div className="button-row">
            <button className="button secondary" onClick={exportData}>
              <Download size={16} />
              {t("Export progress", "Esporta progressi")}
            </button>
            <button
              className="button secondary"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={16} />
              {t("Import backup", "Importa una copia")}
            </button>
            <input
              className="sr-only"
              type="file"
              accept=".json,application/json"
              ref={fileRef}
              onChange={(e) => {
                if (e.target.files?.[0]) void importFile(e.target.files[0]);
              }}
              aria-label={t("Import progress file", "Importa file progressi")}
            />
          </div>
          <p className="small muted">
            {t(
              "Import replaces current progress after confirmation. An active exam keeps its original deadline. The most recent 500 sessions are retained.",
              "L’importazione sostituisce i progressi dopo conferma. Un esame attivo conserva la scadenza. Sono mantenute le ultime 500 sessioni.",
            )}
          </p>
          {message && (
            <p
              className={error ? "error-message" : "success-message"}
              role="status"
            >
              {message}
            </p>
          )}
        </div>
      </section>
      <section id="sources" className="settings-section sources-section">
        <div>
          <h2>{t("Sources & transparency", "Fonti e trasparenza")}</h2>
          <p>
            {t(
              "Original educational material, checked against official documentation. No proprietary course text or exam dumps.",
              "Materiale didattico originale verificato su documentazione ufficiale. Nessun testo di corsi riservati o copia d’esame.",
            )}
          </p>
        </div>
        <div className="settings-fields">
          <div className="disclaimer">
            <strong>
              {t("Independent and unofficial", "Indipendente e non ufficiale")}
            </strong>
            <p>
              {t(
                "This is an independent, unofficial study tool. It is not affiliated with or endorsed by Anthropic. Claude and Anthropic are trademarks of their respective owners.",
                "Strumento di studio indipendente e non ufficiale. Non è affiliato né approvato da Anthropic. Claude e Anthropic sono marchi dei rispettivi titolari.",
              )}
            </p>
            <p>
              {t(
                "All practice questions are original, not leaked or authentic exam items. Simulations approximate exam conditions. Practice percentages are not official scaled scores and never indicate an official pass or fail.",
                "Le domande sono originali, non autentiche né trapelate dagli esami. Le simulazioni approssimano le condizioni. Le percentuali non sono punteggi ufficiali e non indicano superamento o bocciatura.",
              )}
            </p>
          </div>
          <h3>{t("Official exam guides", "Guide ufficiali")}</h3>
          {certifications.map((c) => (
            <div key={c.id} className="guide-source">
              <SourceLink href={c.guideUrl}>
                {c.code} — {text(c.role)} {text(c.level)}
              </SourceLink>
              <small>
                {t(
                  "v1.0 · July 2026 · checked 8 Nov 2026",
                  "v1.0 · Luglio 2026 · verifica 8 nov 2026",
                )}
              </small>
            </div>
          ))}
          <SourceLink href="https://anthropic-partners.skilljar.com/page/partner-certifications">
            {t("Anthropic Partner Academy", "Anthropic Partner Academy")}
          </SourceLink>
          <SourceLink href="https://anthropic-partners.skilljar.com/page/faq-certifications">
            {t("Official certification FAQ", "FAQ ufficiali")}
          </SourceLink>
          <h3>{t("Current content scope", "Copertura attuale")}</h3>
          <p>
            {t(
              `${modules.length} bilingual modules and ${questions.length} original bilingual questions. Associate covers all seven domains and has a full-length practice exam. Developer and Architect paths offer shorter custom sessions on their published topics.`,
              `${modules.length} moduli bilingui e ${questions.length} domande originali bilingui. Associate copre tutti i sette domini e offre una simulazione completa. Developer e Architect offrono sessioni brevi personalizzate sugli argomenti pubblicati.`,
            )}
          </p>
          <p>
            {t(
              "“Verified” means source-checked in this project, not reviewed or endorsed by Anthropic. Short lessons include exercises; displayed reading times reflect actual text length. Always verify current certification requirements with the official guides.",
              "“Verificata” significa controllata sulle fonti nel progetto, non approvata da Anthropic. Le lezioni includono esercizi; i tempi di lettura riflettono la lunghezza effettiva. Verifica sempre i requisiti attuali sulle guide ufficiali.",
            )}
          </p>
          <SourceLink href="https://platform.claude.com/docs/">
            {t(
              "Claude Platform documentation",
              "Documentazione Claude Platform",
            )}
          </SourceLink>
          <SourceLink href="https://support.claude.com/">
            {t("Claude Help Center", "Centro assistenza Claude")}
          </SourceLink>
        </div>
      </section>
      <section className="settings-section reset-section">
        <div>
          <h2>{t("A fresh start", "Un nuovo inizio")}</h2>
          <p>
            {t(
              "Reset lessons, sessions, and preferences on this device. Export a backup first if you want to keep a copy.",
              "Azzera lezioni, sessioni e preferenze sul dispositivo. Esporta prima una copia se vuoi conservarle.",
            )}
          </p>
        </div>
        <div>
          <button
            className="button danger-outline"
            onClick={() => setResetting(true)}
          >
            <Trash2 size={16} />
            {t("Reset all progress", "Azzera tutti i progressi")}
          </button>
        </div>
      </section>
      {pending && (
        <Modal
          title={t("Replace your saved progress?", "Sostituire i progressi?")}
          confirmLabel={t("Import this backup", "Importa questa copia")}
          onCancel={() => setPending(null)}
          onConfirm={() => {
            replace(pending);
            setPending(null);
            setError(false);
            setMessage(t("Backup imported successfully.", "Copia importata."));
          }}
        >
          <p>
            {t(
              `This backup has ${pending.attempts.length} completed sessions and ${Object.values(pending.completed).filter((c) => c.quick || c.deep).length} completed modules. Importing replaces your current data.`,
              `Questa copia contiene ${pending.attempts.length} sessioni e ${Object.values(pending.completed).filter((c) => c.quick || c.deep).length} moduli completati. L’importazione sostituisce i dati attuali.`,
            )}
          </p>
          {pending.active && (
            <p>
              {t(
                "It also includes an unfinished session. Expired exams are finalized automatically.",
                "Include anche una sessione incompleta. Gli esami scaduti vengono consegnati automaticamente.",
              )}
            </p>
          )}
        </Modal>
      )}
      {resetting && (
        <Modal
          danger
          title={t(
            "Reset everything on this device?",
            "Azzerare tutto su questo dispositivo?",
          )}
          confirmLabel={t("Reset progress", "Azzera progressi")}
          onCancel={() => setResetting(false)}
          onConfirm={reset}
        >
          <p>
            {t(
              "This removes lesson completion, session history, the active session, and your settings. You can restore a previously exported backup.",
              "Rimuove completamenti, cronologia, sessione attiva e preferenze. Puoi ripristinare una copia esportata in precedenza.",
            )}
          </p>
        </Modal>
      )}
    </div>
  );
}
