import type { Certification, Domain, Localized } from "../src/types";
export const pair = <T>(en: T, it: T): Localized<T> => ({ en, it });
const host =
  "https://everpath-course-content.s3-accelerate.amazonaws.com/instructor/6nizmqk8tpzpfjvt6qmmav7rh/public/";
const guide = (stamp: string, role: string, level: string) =>
  `${host}${stamp}/Claude+Certified+${role}+%E2%80%93+${level}+Exam+Guide.pdf`;
const domain = (
  prefix: string,
  n: number,
  en: string,
  it: string,
  weight: number,
  objectives: [string, string][],
): Domain => ({
  id: `${prefix}-d${n}`,
  title: pair(en, it),
  weight,
  objectives: pair(
    objectives.map((o) => o[0]),
    objectives.map((o) => o[1]),
  ),
});
export const certifications: Certification[] = [
  {
    id: "associate-foundations",
    code: "CCAO-F",
    role: pair("Associate", "Associate"),
    level: pair("Foundations", "Foundations"),
    description: pair(
      "Use Claude with confidence. Turn everyday work into thoughtful, reliable workflows.",
      "Usa Claude con consapevolezza. Trasforma il lavoro quotidiano in processi affidabili.",
    ),
    coverage: "expanding",
    guideUrl: guide("1783542847", "Associate", "Foundations"),
    guideVersion: "1.0 · July 2026",
    verifiedAt: "2026-11-08",
    exam: { questionCount: 60, durationMinutes: 120 },
    domains: [
      domain(
        "af",
        1,
        "Prompting and Task Execution",
        "Prompting ed esecuzione delle attività",
        14,
        [
          [
            "Create effective prompts; decompose complex tasks; iterate and adapt prompts.",
            "Scrivere prompt efficaci, scomporre attività complesse e migliorare le istruzioni.",
          ],
        ],
      ),
      domain(
        "af",
        2,
        "Output Evaluation and Validation",
        "Valutazione e verifica degli output",
        21,
        [
          [
            "Evaluate accuracy, completeness and bias; verify claims; refine for the audience.",
            "Valutare accuratezza, completezza e bias; verificare le affermazioni e adattare i risultati.",
          ],
        ],
      ),
      domain(
        "af",
        3,
        "Product and Model Selection",
        "Scelta del prodotto e del modello",
        12,
        [
          [
            "Choose features and models by cost, speed and quality; manage context limitations.",
            "Scegliere funzionalità e modelli in base a costo, velocità e qualità; gestire il contesto.",
          ],
        ],
      ),
      domain(
        "af",
        4,
        "Workflow Integration and Solution Design",
        "Integrazione nei processi e progettazione",
        16,
        [
          [
            "Analyze use cases, redesign workflows, communicate value and limitations.",
            "Analizzare i casi d’uso, riprogettare i processi e comunicare valore e limiti.",
          ],
        ],
      ),
      domain(
        "af",
        5,
        "Configuration and Knowledge Management",
        "Configurazione e gestione della conoscenza",
        12,
        [
          [
            "Configure Projects, maintain instructions, knowledge sources and connectors.",
            "Configurare Projects e mantenere istruzioni, fonti e connettori aggiornati.",
          ],
        ],
      ),
      domain(
        "af",
        6,
        "Governance, Risk, and Responsible Use",
        "Governance, rischi e uso responsabile",
        15,
        [
          [
            "Identify appropriate use cases; apply organizational policies, privacy and ethical judgment.",
            "Individuare usi appropriati e applicare policy aziendali, privacy e criteri etici.",
          ],
        ],
      ),
      domain(
        "af",
        7,
        "Troubleshooting and Optimization",
        "Diagnosi dei problemi e ottimizzazione",
        10,
        [
          [
            "Diagnose poor outputs, adjust based on feedback and improve efficiency.",
            "Diagnosticare risultati insufficienti, usare il feedback e migliorare l’efficienza.",
          ],
        ],
      ),
    ],
  },
  {
    id: "developer-foundations",
    code: "CCDV-F",
    role: pair("Developer", "Developer"),
    level: pair("Foundations", "Foundations"),
    description: pair(
      "Build dependable applications with the Claude API, tools, and effective engineering practices.",
      "Crea applicazioni affidabili con le API di Claude, gli strumenti e buone pratiche di sviluppo.",
    ),
    coverage: "starter",
    guideUrl: guide("1783542875", "Developer", "Foundations"),
    guideVersion: "1.0 · July 2026",
    verifiedAt: "2026-11-08",
    exam: { questionCount: 53, durationMinutes: 120 },
    domains: [
      domain("df", 1, "Agents and Workflows", "Agenti e workflow", 14.7, [
        [
          "Choose agent patterns and implement bounded workflows.",
          "Scegliere pattern agentici e implementare workflow controllati.",
        ],
      ]),
      domain(
        "df",
        2,
        "Applications and Integration",
        "Applicazioni e integrazione",
        33.1,
        [
          [
            "Implement Claude API interactions and robust application boundaries.",
            "Implementare interazioni con le API e confini applicativi robusti.",
          ],
        ],
      ),
      domain("df", 3, "Claude Code", "Claude Code", 3.1, [
        [
          "Configure and operate Claude Code.",
          "Configurare e utilizzare Claude Code.",
        ],
      ]),
      domain(
        "df",
        4,
        "Eval, Testing, and Debugging",
        "Valutazione, test e debugging",
        2.6,
        [
          [
            "Identify failures and select recovery strategies.",
            "Individuare i guasti e scegliere strategie di recupero.",
          ],
        ],
      ),
      domain(
        "df",
        5,
        "Model Selection and Optimization",
        "Scelta del modello e ottimizzazione",
        16.8,
        [
          [
            "Balance quality, latency, cost and token budgets.",
            "Bilanciare qualità, latenza, costi e budget di token.",
          ],
        ],
      ),
      domain(
        "df",
        6,
        "Prompt and Context Engineering",
        "Prompt e context engineering",
        11,
        [
          [
            "Design instructions, manage context and validate output.",
            "Progettare istruzioni, gestire il contesto e validare gli output.",
          ],
        ],
      ),
      domain("df", 7, "Security and Safety", "Sicurezza e protezione", 8.1, [
        [
          "Enforce least privilege and protect secrets and data.",
          "Applicare il minimo privilegio e proteggere segreti e dati.",
        ],
      ]),
      domain("df", 8, "Tools and MCPs", "Strumenti e MCP", 10.6, [
        [
          "Implement tools, MCP servers and safe tool dispatch.",
          "Implementare strumenti, server MCP ed esecuzione controllata.",
        ],
      ]),
    ],
  },
  {
    id: "architect-foundations",
    code: "CCAR-F",
    role: pair("Architect", "Architect"),
    level: pair("Foundations", "Foundations"),
    description: pair(
      "Make sound architecture decisions across agents, tools, context, and production reliability.",
      "Progetta soluzioni solide con agenti, strumenti, gestione del contesto e affidabilità.",
    ),
    coverage: "starter",
    guideUrl: guide("1783542750", "Architect", "Foundations"),
    guideVersion: "1.0 · July 2026",
    verifiedAt: "2026-11-08",
    exam: { questionCount: 60, durationMinutes: 120, scenarioBased: true },
    domains: [
      domain(
        "arf",
        1,
        "Agentic Architecture & Orchestration",
        "Architettura agentica e orchestrazione",
        27,
        [
          [
            "Design agentic loops, coordinated delegation and programmatic enforcement.",
            "Progettare cicli agentici, delega coordinata e controlli deterministici.",
          ],
        ],
      ),
      domain(
        "arf",
        2,
        "Tool Design & MCP Integration",
        "Progettazione degli strumenti e integrazione MCP",
        18,
        [
          [
            "Design clear tool boundaries and structured error handling.",
            "Progettare strumenti con confini chiari ed errori strutturati.",
          ],
        ],
      ),
      domain(
        "arf",
        3,
        "Claude Code Configuration & Workflows",
        "Configurazione e workflow di Claude Code",
        20,
        [
          [
            "Configure team instructions and development workflows.",
            "Configurare istruzioni condivise e processi di sviluppo.",
          ],
        ],
      ),
      domain(
        "arf",
        4,
        "Prompt Engineering & Structured Output",
        "Prompt engineering e output strutturato",
        20,
        [
          [
            "Design schemas, examples and semantic validation.",
            "Progettare schemi, esempi e validazione semantica.",
          ],
        ],
      ),
      domain(
        "arf",
        5,
        "Context Management & Reliability",
        "Gestione del contesto e affidabilità",
        15,
        [
          [
            "Preserve provenance, recover from failures and manage context.",
            "Preservare le fonti, gestire i guasti e il contesto.",
          ],
        ],
      ),
    ],
  },
  {
    id: "architect-professional",
    code: "CCAR-P",
    role: pair("Architect", "Architect"),
    level: pair("Professional", "Professional"),
    description: pair(
      "Connect technical choices to business requirements, evaluation, and responsible delivery.",
      "Collega le scelte tecniche ai requisiti aziendali, alla valutazione e al rilascio responsabile.",
    ),
    coverage: "starter",
    guideUrl: guide("1783542810", "Architect", "Professional"),
    guideVersion: "1.0 · July 2026",
    verifiedAt: "2026-11-08",
    exam: { questionCount: 63, durationMinutes: 120 },
    domains: [
      domain(
        "arp",
        1,
        "Solution Design & Architecture",
        "Progettazione e architettura della soluzione",
        17,
        [
          [
            "Translate business requirements into appropriate architectures.",
            "Tradurre i requisiti aziendali in architetture adeguate.",
          ],
        ],
      ),
      domain(
        "arp",
        2,
        "Claude Models, Prompting & Context Engineering",
        "Modelli Claude, prompting e gestione del contesto",
        13,
        [
          [
            "Choose models and design prompts and context strategies.",
            "Scegliere modelli e progettare strategie di prompt e contesto.",
          ],
        ],
      ),
      domain("arp", 3, "Integration", "Integrazione", 19, [
        [
          "Design retrieval, integration boundaries and observability.",
          "Progettare retrieval, confini di integrazione e osservabilità.",
        ],
      ]),
      domain(
        "arp",
        4,
        "Evaluation, Testing & Optimization",
        "Valutazione, test e ottimizzazione",
        16,
        [
          [
            "Define evaluation datasets, metrics and feedback loops.",
            "Definire dataset di valutazione, metriche e cicli di feedback.",
          ],
        ],
      ),
      domain(
        "arp",
        5,
        "Governance, Safety & Risk Management",
        "Governance, sicurezza e gestione del rischio",
        14,
        [
          [
            "Apply guardrails and human review aligned to risk.",
            "Applicare controlli e revisione umana in base al rischio.",
          ],
        ],
      ),
      domain(
        "arp",
        6,
        "Stakeholder Communication & Lifecycle Management",
        "Comunicazione e gestione del ciclo di vita",
        14,
        [
          [
            "Communicate tradeoffs and support the delivery lifecycle.",
            "Comunicare i compromessi e supportare il ciclo di rilascio.",
          ],
        ],
      ),
      domain(
        "arp",
        7,
        "Developer Productivity & Operational Enablement",
        "Produttività degli sviluppatori e supporto operativo",
        7,
        [
          [
            "Enable teams and support production operations.",
            "Supportare i team e l’operatività in produzione.",
          ],
        ],
      ),
    ],
  },
];
