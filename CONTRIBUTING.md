# Contributing

Keep this project static, free, accessible, and easy to maintain. Do not add API keys, authentication, a backend, tracking, or paid runtime services to the initial release.

1. Fork and create a descriptive branch.
2. Install with `npm ci` using Node 22.12+.
3. Make a focused change and explain the user problem it solves.
4. For content, follow [CONTENT_GUIDELINES.md](CONTENT_GUIDELINES.md).
5. Run `npm run validate`, `npm test`, and `npm run build`.
6. For UI changes, check a desktop and narrow mobile viewport, keyboard navigation, both themes, and Italian text expansion.
7. Open a pull request with the change, relevant sources, verification date, checks performed, and any coverage limitation.

Use the existing types and small reusable components. Add meaningful regression tests for scoring, selection, timing, import validation, or recommendation defects. Do not add tests that only repeat implementation details or increase dependencies without a clear benefit.

Never contribute exam dumps, recalled exam items, copied course text, proprietary documents, personal information, credentials, or confidential examples. Scenarios should be fictional. Submit corrections with a primary-source link and explain precisely which claim or answer changes.

Contributions to original code and educational content are licensed under MIT. Keep third-party notices where required. Anthropic is not responsible for this project.
