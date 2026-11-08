import { ArrowUpRight, Check, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, type ReactNode } from "react";
import { useApp } from "../hooks/useApp";
export function PageHeading({
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {description && <p className="lede">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function Empty({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <AlertCircle size={18} />
      <div>{children}</div>
    </div>
  );
}
export function TextLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ChevronRight size={16} />
    </Link>
  );
}
export function SourceLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight size={14} />
    </a>
  );
}
export function Modal({
  title,
  children,
  onCancel,
  onConfirm,
  confirmLabel,
  danger = false,
}: {
  title: string;
  children: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  danger?: boolean;
}) {
  const { t } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus();
  }, []);
  return (
    <div
      className="modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={ref}
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            const nodes = e.currentTarget.querySelectorAll<HTMLElement>(
              'button, a, input, select, textarea, [tabindex="0"]',
            );
            const first = nodes[0],
              last = nodes[nodes.length - 1];
            if (
              e.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === e.currentTarget)
            ) {
              e.preventDefault();
              last?.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <h2 id="modal-title">{title}</h2>
        <div className="muted">{children}</div>
        <div className="button-row">
          <button className="button secondary" onClick={onCancel}>
            {t("Cancel", "Annulla")}
          </button>
          <button
            className={`button ${danger ? "danger" : ""}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
export function Done({ children }: { children: ReactNode }) {
  return (
    <span className="done">
      <Check size={14} />
      {children}
    </span>
  );
}
