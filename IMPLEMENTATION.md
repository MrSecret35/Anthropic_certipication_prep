# Initial release plan

- [x] Typed content, official blueprint metadata, bilingual content
- [x] Responsive app shell and certification dashboards
- [x] Quick/deep lessons and manual completion
- [x] Validated original questions and filtered practice
- [x] Seeded exams, persistence, timer, review and exact scoring
- [x] Analytics, deterministic recommendations and data portability
- [x] Tests, production build, documentation and Pages workflow

Associate has 97 items, including 74 source-checked scenario items eligible for its 60-item full mock. The other three paths have nine items each and remain starter tracks. Full exams are gated on official count, domain allocations and required format.

## Verification and release scope

24 automated checks pass, including corrupt/blocked storage recovery. Content validation and the TypeScript/production build pass. Browser QA exercised Italian lessons and manual completion, multiple-response feedback, module recommendations, persisted exam navigation/answers/flags across refresh, one-minute automatic expiry, post-submit translation, and JSON backup export/import. Full exam regression tests cover quotas, deterministic selection, unseen item preference, incomplete responses, snapshot restore and expiry. The full mock was also checked in the production preview on desktop and mobile, including resume after reload, the question map, submission and Italian review. GitHub Pages deployment requires the repository to use GitHub Actions as its Pages source. Original content targets and linked Architect scenarios remain expansion work.
