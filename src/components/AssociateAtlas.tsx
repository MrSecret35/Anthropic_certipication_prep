import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { certifications, modules } from "../../content";
import { useApp } from "../hooks/useApp";

const associate = certifications.find((cert) => cert.code === "CCAO-F")!;
const width = 520;
const height = 248;
const elevations = [178, 113, 157, 73, 125, 54, 104];
const points = associate.domains.map((_, index) => ({
  x: 46 + (index * 428) / Math.max(1, associate.domains.length - 1),
  y: elevations[index % elevations.length],
}));

export function AssociateAtlas() {
  const { t, text } = useApp();
  const [selected, setSelected] = useState(0);
  const domain = associate.domains[selected];
  const lesson = modules.find((module) => module.domainId === domain.id);

  return (
    <figure className="atlas-plate">
      <figcaption className="atlas-caption">
        <div>
          <span>{t("Domain chart", "Carta dei domini")}</span>
          <small id="atlas-map-guide">
            {t(
              "Select a point to explore its domain.",
              "Seleziona un punto per esplorare il dominio.",
            )}
          </small>
        </div>
        <span>{associate.code}</span>
      </figcaption>
      <div
        className="atlas-map"
        role="group"
        aria-describedby="atlas-map-guide"
        aria-label={t(
          "Choose an Associate exam domain",
          "Scegli un dominio dell’esame Associate",
        )}
      >
        <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
          <defs>
            <pattern
              id="atlas-coordinate-grid"
              width="26"
              height="26"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M26 0H0V26"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            className="atlas-gridlines"
            width={width}
            height={height}
            fill="url(#atlas-coordinate-grid)"
          />
          <g className="atlas-contours" fill="none">
            <path d="M-15 89C32 112 82 76 85 41S113 4 153 1M-8 106C48 123 99 89 103 52S137 6 177 5M-7 126C72 131 117 93 124 58S156 12 204 8M-9 147C75 150 136 115 146 71S180 24 232 18M-13 172C78 169 157 137 170 88S202 40 260 31" />
            <path d="M253 258C278 217 323 205 378 217S454 209 479 179S509 153 536 151M275 262C300 227 337 225 380 234S467 224 494 193S515 172 535 173M305 265C331 242 352 243 392 250S476 239 506 209S525 196 539 196M219 258C250 209 308 187 373 199S439 190 462 165S504 131 534 132" />
          </g>
          <path
            className="atlas-route-halo"
            d={points
              .map(({ x, y }, i) => `${i ? "L" : "M"}${x},${y}`)
              .join(" ")}
          />
          <path
            className="atlas-route"
            d={points
              .map(({ x, y }, i) => `${i ? "L" : "M"}${x},${y}`)
              .join(" ")}
          />
        </svg>
        {associate.domains.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="atlas-waypoint"
            style={{
              left: `${(points[index].x / width) * 100}%`,
              top: `${(points[index].y / height) * 100}%`,
            }}
            aria-label={`${index + 1}. ${text(item.title)} (${item.weight}%)`}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
      <div className="atlas-legend">
        <div className="atlas-domain" aria-live="polite">
          <strong>{text(domain.title)}</strong>
          <span>
            {domain.weight}% {t("of the blueprint", "del programma d’esame")}
          </span>
        </div>
        <Link
          className="atlas-lesson-link"
          to={lesson ? `/study/${lesson.id}` : `/certification/${associate.id}`}
        >
          {lesson
            ? t("Open lesson", "Apri lezione")
            : t("Explore path", "Esplora percorso")}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </figure>
  );
}
