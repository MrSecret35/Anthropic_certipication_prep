export type Language = "en" | "it";
export type Localized<T = string> = Record<Language, T>;
export type Difficulty = "easy" | "medium" | "hard";
export interface Domain {
  id: string;
  title: Localized;
  weight: number;
  objectives: Localized<string[]>;
}
export interface Certification {
  id: string;
  code: string;
  role: Localized;
  level: Localized;
  description: Localized;
  domains: Domain[];
  exam: {
    questionCount: number;
    durationMinutes: number;
    scenarioBased?: boolean;
  };
  guideUrl: string;
  guideVersion: string;
  verifiedAt: string;
  coverage: "starter" | "expanding";
}
export interface LessonSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
  code?: string;
}
export interface Lesson {
  introduction: string;
  sections: LessonSection[];
  takeaways: string[];
  exercise: { prompt: string; answer: string };
}
export interface StudyModule {
  id: string;
  certificationId: string;
  domainId: string;
  title: Localized;
  description: Localized;
  objectives: { id: string; text: Localized }[];
  quick: Localized<Lesson>;
  deep: Localized<Lesson>;
  terminology: Localized<{ term: string; definition: string }[]>;
  examples: Localized<{ title: string; text: string }[]>;
  reviewQuestionIds: string[];
  references: { title: string; url: string }[];
  verifiedAt: string;
}
export interface Question {
  id: string;
  certificationId: string;
  type: "single" | "multiple";
  question: Localized;
  options: { id: string; text: Localized; explanation: Localized }[];
  correctAnswers: string[];
  difficulty: Difficulty;
  domainIds: string[];
  moduleIds: string[];
  objectiveIds: string[];
  keywords: string[];
  explanation: Localized;
  references: string[];
  verified: boolean;
  /** Reviewed scenario item eligible for a full-length mock. */
  fullExam?: boolean;
  verifiedAt: string;
}
export interface Attempt {
  id: string;
  certificationId: string;
  kind: "practice" | "exam";
  mode: "practice" | "custom" | "full";
  seed: number;
  questionIds: string[];
  optionOrder: Record<string, string[]>;
  answers: Record<string, string[]>;
  checked: string[];
  flags: string[];
  index: number;
  startedAt: number;
  deadline: number | null;
  submittedAt: number | null;
  expired: boolean;
}
export interface Progress {
  schemaVersion: 1;
  settings: {
    language: Language;
    theme: "light" | "dark";
    certificationId: string;
  };
  opened: Record<string, number>;
  completed: Record<string, { quick?: number; deep?: number }>;
  attempts: Attempt[];
  active: Attempt | null;
}
