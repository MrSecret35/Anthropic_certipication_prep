import moduleData from "./modules.json";
import questionData from "./questions.json";
import scenarioData from "./questions-scenarios.json";
import type { StudyModule, Question } from "../src/types";
export { certifications } from "./certifications";
export const modules = moduleData as StudyModule[];
export const questions = [...questionData, ...scenarioData] as Question[];
export const moduleById = Object.fromEntries(modules.map((m) => [m.id, m]));
export const questionById = Object.fromEntries(questions.map((q) => [q.id, q]));
