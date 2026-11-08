import { useEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BookOpen,
  Layers3,
  ListChecks,
  Timer,
  ChartNoAxesCombined,
  Settings2,
  Sun,
  Moon,
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { certifications } from "../../content";
import { useApp } from "../hooks/useApp";
const nav = [
  ["/", Layers3, "Certifications", "Certificazioni"],
  ["/study", BookOpen, "Study", "Studio"],
  ["/practice", ListChecks, "Practice", "Esercitazione"],
  ["/exam", Timer, "Exam Simulator", "Simulatore"],
  ["/progress", ChartNoAxesCombined, "My Progress", "I miei progressi"],
  ["/settings", Settings2, "Settings", "Impostazioni"],
] as const;
export default function Shell() {
  const { t, progress, update, cert, warning, setWarning } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0 });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [location.pathname]);
  const english = progress.settings.language === "en";
  const focusedExam = progress.active?.mode === "full";
  if (focusedExam)
    return location.pathname !== "/session" ? (
      <Navigate to="/session" replace />
    ) : (
      <div className="focused-exam">
        {warning === "storage" && (
          <p className="storage-warning" role="status">
            {t(
              "This browser could not save the exam. Keep this tab open until you submit.",
              "Il browser non riesce a salvare l’esame. Tieni aperta questa scheda fino alla consegna.",
            )}
          </p>
        )}
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    );
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document
            .getElementById("main-content")
            ?.focus({ preventScroll: true });
        }}
      >
        {t("Skip to content", "Vai al contenuto")}
      </a>
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <Link to="/" className="brand">
          <span className="brand-mark">
            f<span>n</span>
          </span>
          <span>
            fieldnotes
            <span className="brand-sub">CLAUDE CERTIFICATION PREP</span>
          </span>
        </Link>
        <div className="sidebar-label">
          {t("YOUR WORKSPACE", "IL TUO SPAZIO")}
        </div>
        <nav aria-label={t("Main navigation", "Navigazione principale")}>
          {nav.map(([to, Icon, en, it]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.65} />
              {t(en, it)}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-indicator">
            <span />
            {t("Your progress stays yours", "I tuoi progressi restano tuoi")}
          </div>
          <p>
            {t(
              "Saved on this device. No account needed.",
              "Salvati su questo dispositivo. Nessun account necessario.",
            )}
          </p>
          <a
            href="https://anthropic-partners.skilljar.com/page/partner-certifications"
            target="_blank"
            rel="noreferrer"
          >
            {t("Official certification guides", "Guide ufficiali")}
            <ArrowUpRight size={14} />
          </a>
          <div className="sidebar-foot">
            {t(
              "Independent. Open source. Always free.",
              "Indipendente. Open source. Sempre gratis.",
            )}
          </div>
        </div>
      </aside>
      {menu && (
        <button
          aria-label={t("Close navigation", "Chiudi navigazione")}
          className="menu-overlay"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label={t("Toggle navigation", "Apri navigazione")}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="workspace-name">
            <span className="small-book">
              <BookOpen size={16} />
            </span>
            <span>
              {t(
                "A little progress, every day.",
                "Un passo avanti, ogni giorno.",
              )}
            </span>
          </div>
          <div className="topbar-controls">
            <div className="select-wrap cert-select">
              <select
                aria-label={t("Active certification", "Certificazione attiva")}
                value={cert.id}
                onChange={(e) => {
                  const id = e.target.value;
                  update((p) => ({
                    ...p,
                    settings: { ...p.settings, certificationId: id },
                  }));
                  navigate(`/certification/${id}`);
                }}
              >
                {certifications.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.role.en}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </div>
            <button
              className="language-button"
              aria-label={t("Switch to Italian", "Passa all’inglese")}
              onClick={() =>
                update((p) => ({
                  ...p,
                  settings: { ...p.settings, language: english ? "it" : "en" },
                }))
              }
            >
              <span className={english ? "selected-language" : ""}>EN</span>
              <span className="language-divider">/</span>
              <span className={!english ? "selected-language" : ""}>IT</span>
            </button>
            <button
              className="icon-button"
              aria-label={t("Toggle color theme", "Cambia tema")}
              onClick={() =>
                update((p) => ({
                  ...p,
                  settings: {
                    ...p.settings,
                    theme: p.settings.theme === "light" ? "dark" : "light",
                  },
                }))
              }
            >
              {progress.settings.theme === "light" ? (
                <Moon size={18} />
              ) : (
                <Sun size={18} />
              )}
            </button>
          </div>
        </header>
        {warning && (
          <div className="storage-warning" role="status">
            {warning === "storage"
              ? t(
                  "This browser could not save progress. Export a backup in Settings.",
                  "Il browser non riesce a salvare. Esporta una copia nelle Impostazioni.",
                )
              : t(
                  "Saved data could not be read. A fresh workspace has been opened.",
                  "I dati salvati non erano leggibili. È stato aperto un nuovo spazio.",
                )}
            <button
              onClick={() => setWarning("")}
              aria-label={t("Dismiss", "Chiudi")}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {progress.active && location.pathname !== "/session" && (
          <div className="active-attempt-banner">
            <Timer size={16} />
            {t(
              "An unfinished session is saved. Exam time continues while you browse.",
              "Una sessione è salvata. Il tempo d’esame continua durante la navigazione.",
            )}
            <Link to="/session">
              {t("Resume session", "Riprendi sessione")} →
            </Link>
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="footer">
          <span>
            fieldnotes <span className="footer-dot">·</span>{" "}
            {t("Made for understanding.", "Per capire davvero.")}
          </span>
          <p>
            {t(
              "This is an independent, unofficial study tool. It is not affiliated with or endorsed by Anthropic.",
              "Strumento di studio indipendente e non ufficiale. Non è affiliato né approvato da Anthropic.",
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
