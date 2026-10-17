# Engineering articles — verification

Updated 17 October 2026. Engineering Studies and Latest Writing now form one homepage section and one collection, with a single navigation entry. The previous card design is retained. The latest presentation replaces the three featured lab/case-study views with technical articles. Previous interactive accessibility and Angular identity demo components have been removed. The independent browser performance fixture and its measurement evidence remain available.

## Current pages

- `/engineering`: the combined Engineering & Writing collection, including all eight studies and both existing blog articles. The homepage features four studies plus existing writing; legacy `#writing` links target the same combined section.
- `/engineering/angular-dependency-injection`: a separate DI article covering tokens, constructor injection and inject(), provider recipes, REST/GraphQL composition, scopes, constructor values, startup factories, multi providers, dynamic injectors and testing.

- `/engineering/accessibility`: accessible Angular templates, route navigation, Reactive Forms, error recovery, CDK Dialog, focus, Signals and status updates, themes and contrast, and browser-test examples.
- `/engineering/angular-architectures`: NgModules and standalone composition, feature organization, vertical slices, DDD, Clean/hexagonal boundaries, route-scoped DI, adapters, signal-backed facades, migration and testing boundaries.
- `/engineering/web-performance`: browser metrics alongside Angular CSR/SSR/SSG configuration, hydration/event replay, incremental hydration, `@defer`, `NgOptimizedImage`, stable list tracking, computed state and cooperative interaction work.

Each engineering article uses the existing editorial article/study layout with a table of contents, Angular code examples, static explanatory figures and references. Lab controls, scope disclaimers and project-verification panels are absent from these article reading views. Original project studies retain their existing presentation.

Code snippets explain integration patterns; the articles are not three separately packaged demonstration applications. CDK examples describe use in an application with CDK installed; this change introduces no CDK dependency.

## Checks

- `npm run lint`: passed.
- `npm test`: 72 Angular tests in 20 files and 11 Node tests passed. Obsolete interactive-demo tests were removed with their components; article rendering assertions now cover figures, code and absence of lab/status UI.
- Production build: 21 prerendered routes.
- `npm run verify:dist`: 31 outputs, 2 blog articles, 4 project studies and 8 engineering studies verified. Static verification distinguishes article content from the original project-study structure.
- Browser inspection: all three article routes render code and explanatory figures with no document horizontal overflow at the desktop viewport. All three articles also reflow at an observed 320 CSS-pixel viewport without document or figure overflow.
- Existing protected content: the 15 source/content hashes in `preservation-verification.json` remain the preservation reference; 14 protected files still match the baseline exactly. The remaining file, the blog article page, changes only its back-navigation link to the combined collection. Blog bodies, project content, expertise and experience remain unchanged. Contact numbering is adjusted to match the single navigation entry.

## Performance article scope

The performance article now focuses on theory and Angular implementation patterns. Recorded medians, controlled-experiment tables, local benchmark descriptions and performance-lab links have been removed from its content. It explains LCP, INP and CLS, hybrid rendering, hydration, deferral, assets and interaction work without reporting a local practical experiment.

Historical measurement files and the independent browser fixture remain in the repository; they are not presented as part of the article. Rendering examples explain tradeoffs rather than claiming measured improvements.

The combined Engineering & Writing collection and homepage previews retain the previous card styling. The temporary compact-list redesign was reverted.

## Files changed for the article conversion

- The three featured study data files and shared preview copy.
- `study.models.ts`, the shared study body, engineering page/index/section and their relevant assertions.
- New `engineering-article-visual.component.ts` and scoped article styling in `engineering-studies.scss`.
- Static-output verification, plus removal of superseded interactive accessibility and Angular list diagnostic components/tests.

No deployment, package publication, commit or push was performed. Screen-reader sessions, native zoom/forced-color sessions and automated accessibility scans were not executed for the static article conversion.

The combined collection filters were exercised in the browser: 10 entries, 2 entries under Writing, and 10 restored with the All topics button. The DI article and combined homepage were checked at 320 CSS pixels without document or figure overflow.
