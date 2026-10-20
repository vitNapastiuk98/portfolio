# Engineering showcase verification

Verified locally on 20 October 2026. No deployment, package publication, commit or push was performed.

## Automated checks

- `npm run lint`: passed, including article metadata validation.
- `npm test`: 81 Angular/Vitest tests across 25 files and 11 Node content tests passed.
- `SITE_URL=https://vit-napastiuk.web.app npm run build`: passed; 28 static routes prerendered.
- `npm run verify:dist`: passed; 38 required outputs, two full blog articles, four original project pages and eight educational study pages verified. The verifier also checks the six professional pages for their narrative and diagram output.
- Targeted Prettier check on the added content, components and styles: passed.
- `git diff --check`: passed.
- Full `npm run format:check`: reports eight untouched files: README.md, content/blog/angular-signals-vs-rxjs.md, src/app/animations/hero-motion.directive.ts, src/app/animations/reveal.directive.ts, src/app/app.config.ts, src/generated/blog-posts.generated.ts, src/generated/site-config.generated.ts and tsconfig.json. These were not reformatted as part of this change. Generated files must be updated through their generator.

## Browser checks

Executed in Chrome against the local Angular development server:

- All six professional routes loaded directly with the expected title, narrative sections, code and SVG diagrams.
- All six pages reflowed at 320 CSS pixels without document-level horizontal overflow. Code, tables and diagrams retain their own scroll regions.
- Homepage checked at actual CSS widths 320, 354, 768, 1120, 1374 and 1920 pixels: six professional cards present and no document-level horizontal overflow.
- Inspected screenshots of the loaded 3D scene at desktop, tablet and phone widths. The initial split-layout integration was subsequently removed at the user’s request. The original full-width hero, camera framing and motion are restored, with subdued background colors and a rose signal material matching the site accent.
- Featured-card navigation moved focus to the destination H1.
- Native dialog: opening focused Keep editing; Tab moved to Confirm example; Escape closed the modal and restored focus to Review change.
- AI example: selecting Current month and reviewing, then changing to Previous month removed the stale confirmation. Reviewing and confirming Previous month produced the matching local status.
- Direct navigation to `/projects` and all four original `/work/...` detail URLs retained their headings and content.
- Existing educational routes remained available; workflow article fragment navigation and diagram rendering were inspected.

## Preservation

SHA-256 comparison against the task-start snapshot confirmed all 17 protected source/content files unchanged, including Expertise, Experience, footer/contact, profile and project data, educational study data and existing blog content. The later request to restore the original hero superseded the earlier editorial hero layout. Other protected content remains unchanged. The live site was inspected and is behind the local implementation.

## Limits

- No VoiceOver, NVDA, automated axe scan, visual regression baseline or production-device performance measurement was performed. Keyboard checks above are specific Chrome checks, not a conformance claim.
- Reduced-motion/static fallback behavior has automated component coverage; no separate operating-system reduced-motion session was run during final browser validation.
- Professional code and diagrams are original illustrative explanations. Proposed recovery policies, synchronization rules and vision validation improvements are not represented as verified production implementations. CAF remains supporting context without invented technical details.
- Firebase deployment was not performed. Static output validation passed; production hosting refresh behavior was not re-tested after these unpublished changes.
