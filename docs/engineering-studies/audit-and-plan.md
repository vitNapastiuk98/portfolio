# Engineering studies: audit and execution plan

## Baseline (17 October 2026)

Angular 22.2, TypeScript 6, standalone routed components, signal/RxJS state, strict templates. Angular application builder emits prerendered static HTML; Firebase serves it without trailing slashes. Existing EngineeringStudy data drives detail routes and prerendering; sitemap currently repeats slugs in a Node generator. Shared StudyBody renders paragraphs, flows, decisions and proposed checks but no source examples or evidence records. Homepage studies are nested inside WorkPreview. Existing browser lab is static HTML, with a Node/Chrome runner, five paired samples and a JSON report; fonts are installed assets. No Angular CDK or browser-test dependency is declared.

Baseline commands passed: npm run lint; npm test (56 Angular tests / 18 files, 8 Node tests); npm run build (18 prerendered routes); npm run verify:dist (28 outputs, 5 engineering studies). Repository-wide formatting had pre-existing unrelated issues from earlier work; touched files will be formatted. Existing uncommitted changes belong to the current portfolio and are preserved. A SHA-256 snapshot in /tmp records protected sources; baseline home/work/study sources are also saved for exact comparison.

## Implementation

1. Extract only the engineering block from WorkPreview into its own EngineeringStudiesSection after Selected Work and before Experience. Feature performance, accessibility and Angular Architectures with short evidence-based descriptions. Add one navigation entry without replacing existing navigation logic. Preserve the four original study records and routes.
2. Extend study data with optional technologies, explicit study type, problem, links, related slugs, accurately dated evidence, code examples and comparison tables. Existing study records continue rendering unchanged. Reuse StudyBody and add specialized standalone demos. Keep all styling scoped to studies/demos.
3. Accessibility: implement a realistic request form, native modal dialog (browser modality and Escape behavior, explicit trigger restoration), asynchronous status, and opaque-color contrast examples embedded in the relevant study chapters. Use WCAG relative luminance. Add focused unit tests and browser keyboard/focus/reflow checks. Record screen-reader environments as untested unless actually exercised.
4. Angular architectures: explain NgModule/standalone composition separately from layers, feature ownership, slices, DDD and Clean/hexagonal dependency direction. Use the same approval workflow, an executable pure policy/use case with a fakeable port, dependency fitness checks, diagrams, state ownership and staged migrations. Label alternative structures as conceptual rather than six compiled applications. No design-system library is shipped.
5. Performance: execute the unchanged existing runner first. Audit instrumentation, preserve original samples, introduce controlled mechanisms without changing checksum work, retain every sample and ranges. Add a focused Angular stable-list-identity diagnostic. Keep custom frame proxy distinct from INP and browser fixture distinct from Angular. Synchronize prose and results only after execution.
6. Integrate all routes, sitemap, SEO, related reading and prerender checks. Run lint/tests/build/dist, actual browser demos and keyboard tests, direct links, narrow/mobile/reduced-motion checks. Compare protected content against the initial snapshot. Save exact evidence and remaining manual screen-reader procedure in docs/engineering-studies/verification.md.

## Constraints and decisions

No deployment, commits, pushes, package publishing, branding changes, framework upgrades or edits to approved sections except extraction/insertion/navigation. Native semantics take precedence over ARIA emulation. No unverified screen-reader, compatibility, performance, conformance or test claims. Independent agents own nonoverlapping demo/data files; integration stays with the primary agent.

## Scope correction from the user

The Angular Design System implementation has been removed. The replacement is /engineering/angular-architectures: a technical design study comparing NgModule/standalone composition, layers, feature ownership, vertical slices, DDD, Clean/hexagonal dependency direction, state ownership, deployment boundaries and incremental migration. Original tested approval-domain/application code supplies a concrete example; alternative application structures are labeled illustrative. No design-system library or package workflow is shipped.

Accessibility is now a narrative study. The form/dialog and contrast examples appear within the errors and perception chapters after their explanation and code, rather than as a large lab before the article.
