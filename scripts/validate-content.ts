import { certifications, modules, questions } from "../content";
import { validateContent } from "../src/lib/validation";
const errors = validateContent(certifications, modules, questions);
if (errors.length) {
  throw new Error(errors.join("\n"));
}
console.log(
  `Validated ${certifications.length} certifications, ${modules.length} bilingual modules, ${questions.length} original bilingual questions.`,
);
