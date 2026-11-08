import { Check, X } from "lucide-react";
import type { Question, Language } from "../types";
import { useApp } from "../hooks/useApp";
export function QuestionCard({
  question: q,
  answer,
  order,
  onChange,
  language,
  review = false,
  number,
}: {
  question: Question;
  answer: string[];
  order: string[];
  onChange: (ids: string[]) => void;
  language: Language;
  review?: boolean;
  number?: number;
}) {
  const { t } = useApp();
  return (
    <fieldset className="question-fieldset" disabled={review}>
      <legend>
        {number !== undefined && (
          <span className="question-prefix">
            {t("QUESTION", "DOMANDA")} {String(number).padStart(2, "0")}
          </span>
        )}
        <span className="question-stem" lang={language}>
          {q.question[language]}
        </span>
      </legend>
      <p className="question-instruction">
        {q.type === "multiple"
          ? t(
              `Select ${q.correctAnswers.length} answers. All correct answers are required.`,
              `Seleziona ${q.correctAnswers.length} risposte. Servono tutte quelle corrette.`,
            )
          : t("Select one answer.", "Seleziona una risposta.")}
      </p>
      <div className="answer-options">
        {order.map((id, i) => {
          const option = q.options.find((o) => o.id === id)!;
          const selected = answer.includes(id);
          const correct = q.correctAnswers.includes(id);
          return (
            <label
              key={id}
              className={`answer-option ${selected ? "selected" : ""} ${review && correct ? "correct" : ""} ${review && selected && !correct ? "wrong" : ""}`}
            >
              <input
                type={q.type === "single" ? "radio" : "checkbox"}
                name={`question-${q.id}`}
                checked={selected}
                disabled={
                  q.type === "multiple" &&
                  !selected &&
                  answer.length >= q.correctAnswers.length
                }
                onChange={() =>
                  onChange(
                    q.type === "single"
                      ? [id]
                      : selected
                        ? answer.filter((a) => a !== id)
                        : [...answer, id],
                  )
                }
              />
              <span className="answer-letter">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="answer-text" lang={language}>
                {option.text[language]}
                {review && (
                  <span className="option-explanation">
                    {option.explanation[language]}
                  </span>
                )}
              </span>
              {review && correct ? (
                <Check
                  size={19}
                  aria-label={t("Correct option", "Opzione corretta")}
                />
              ) : review && selected ? (
                <X
                  size={19}
                  aria-label={t("Incorrect choice", "Scelta errata")}
                />
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
