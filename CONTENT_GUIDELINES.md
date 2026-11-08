# Content contribution process

## Authoritative sources

Use current Anthropic guides for official exam format, counts, weights, domains, and objectives. Use Claude Platform documentation, Claude Help Center, and Anthropic engineering publications for product and technical principles. Find the guide on the certification’s [Partner Academy page](https://anthropic-partners.skilljar.com/page/partner-certifications). The public FAQ may revise logistics separately from older PDFs; avoid adding scheduling/price claims unless necessary and reverified.

Store a source URL and ISO verification date for changing facts. Version 1.0 July 2026 blueprints were checked on 2026-11-08 against four public documents on Anthropic’s course-content host. Only their metadata and summarized objective structure are represented here. Do not distribute the PDFs or reproduce their example questions.

## New certification

Add a `Certification` to `content/certifications.ts` with a stable slug, code, localized name/description, domain IDs, official weights and objective summaries, count, duration, guide URL/version, and verification date. Preserve published IDs; removing or changing IDs requires a progress-data migration. Keep facts unverified in a draft branch until primary evidence is available. Do not expose guessed official settings as verified. Domain weights must sum to 100.

Publish at least one real bilingual module and original validated questions before enabling a new path. The current registry assumes a published path has a study entry point. If a path has no finished content, keep it out of the active registry rather than adding empty placeholders. Set `coverage: 'starter'` until coverage expands, and update the scope documentation and localized coverage labels when adding a path.

## Modules

Use the `StudyModule` and `Lesson` types in `src/types/index.ts`. Add the object to `content/modules.json`. Each module needs:

- A globally unique ID, certification ID, and valid official domain ID.
- Localized title and description, stable objective IDs with EN/IT text.
- Separate authored Quick and Deep lessons covering the same objectives. Deep adds mechanisms, tradeoffs, failure cases, and a walkthrough, rather than simply repeating Quick.
- Introduction, structured sections, paragraphs and optional comparison tables/code, takeaways, and a concrete reflection with a worked discussion.
- Terms with definitions, a fictional practical example, review question IDs, reference links, and last checked date.

Keep reading time honest; the UI calculates it from words. Expand guided exercises toward the requested 10–15/30–45 minute session lengths through useful tasks, not filler or inflated time claims. Include concrete inputs so exercises can be completed without an AI API. Opening a lesson must never imply mastery.

Italian should be idiomatic technical Italian. Preserve terms such as RAG, grounding, and tool use where appropriate, then explain them. Translate the full lesson, examples, exercise, options, and feedback. Do not translate just headings or UI labels. Official document titles can retain their original names.

## Questions

Add introductory `Question` objects to `content/questions.json`, and case-based items to `content/questions-scenarios.json`:

- Stable unique ID, correct certification, single/multiple type, difficulty.
- Original scenario, four plausible localized options, and a rationale for each.
- One correct ID for single response; at least two for multiple response. State the number to choose through the question UI. Do not encode answer order as correctness.
- General explanation, official domain IDs, related module IDs and objective IDs, keywords, source URLs, verification date and status.
- Matching `reviewQuestionIds` entries in related modules.

Distractors should represent plausible misconceptions, not jokes or obviously unrelated products. Vary answer positions when reviewing presentation; the session engine shuffles options. Multi-response items are scored by exact set. Do not claim these questions are real, leaked, or guaranteed to match official difficulty.

`verified: true` means the correct answer and all distractor rationales have been checked against the listed primary references. It is a project status, not Anthropic endorsement or a claim of independent human SME review. Keep unresolved questions `verified: false`; selection excludes them. Independent subject-matter and Italian-language review is encouraged before broader publication.

Set `fullExam: true` only for source-checked scenario questions with a single primary domain. A mock item should ask for a decision under a specific constraint, give enough facts to resolve it, and use alternatives that would be reasonable under different facts. Check that the stated constraint rules out every distractor and that the Italian version preserves the same decision. Keep basic definition checks and near-duplicates out of the full-mock pool. The eligibility flag is a project editorial decision, not an official difficulty rating.

## Review checklist

- Verify current primary sources and date.
- Check technical answer uniqueness and all distractor explanations.
- Check schema references and reverse module links.
- Compare EN/IT meaning and technical nuance.
- Check duplicates, including near-duplicate paraphrases manually.
- Run `npm run validate`, `npm test`, `npm run build`.
- Update README counts and coverage notices when content changes.

The validator enforces exact duplicate stems and structural integrity. It cannot prove technical accuracy, detect all semantic duplicates, or replace editorial review. Full exams remain gated until official count and per-domain allocations can be met. Architect Foundations also requires implementation and validation of linked scenario selection.
