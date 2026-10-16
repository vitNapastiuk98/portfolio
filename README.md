# Vitalii Napastiuk — Engineering Portfolio

A static, prerendered Angular portfolio and technical journal. The site runs on Firebase Hosting Classic without a backend, database, Cloud Functions, App Hosting, or paid infrastructure.

## Stack

- Angular 22 with standalone components, Signals, strict TypeScript, Router, SSG, and hydration
- SCSS with locally bundled Syne, Manrope, and IBM Plex Mono fonts
- Three.js for the lazy, visibility-aware hero scene
- GSAP/ScrollTrigger for progressive scroll reveals
- Repository-owned Markdown compiled with Marked, Highlight.js, `sanitize-html`, Gray Matter, and Zod
- Vitest/Angular TestBed plus Node content-pipeline tests
- Firebase Hosting Classic and GitHub Actions

## Project structure

```text
content/blog/                 Markdown articles
scripts/                      Content generation and build verification
src/app/core/                 SEO and application-wide services
src/app/layout/               Header and footer
src/app/shared/               Reusable visual components
src/app/features/             Home, expertise, experience, work, blog, contact
src/app/data/                 Typed profile, experience, and project manifests
src/app/models/               Shared content types
src/app/animations/           Browser-isolated motion behavior
src/generated/                Generated blog and site configuration (committed)
public/                       Static assets, sitemap, RSS, and robots output
```

## Local development

Prerequisites: Node.js 22 and npm 10.

```bash
npm install
npm start
```

`npm start` regenerates the article manifest before starting Angular. Open `http://localhost:4200`.

Useful commands:

```bash
npm run lint
npm test
npm run build
npm run verify:dist
```

The production output is `dist/portfolio/browser`. The build is fully static; no Node server is deployed.

## Site URL and SEO

Local generation uses `productionUrl` from `site.config.json`. Production CI must define the repository variable `SITE_URL`, such as the free Firebase domain or the final custom domain. It generates canonical and Open Graph URLs, `sitemap.xml`, `robots.txt`, RSS links, and BlogPosting JSON-LD URLs.

Never deploy a production build generated with the localhost default. Build explicitly with:

```bash
SITE_URL=https://example.com npm run build
```

## Writing and publishing an article

Create `content/blog/my-article-slug.md`. Filenames must be lowercase kebab-case.

```markdown
---
title: "A precise article title"
description: "A concise description between 20 and 180 characters."
date: "2026-10-14"
tags:
  - Angular
  - TypeScript
published: false
featured: false
---

Article content starts here.
```

The pipeline supports automatic heading anchors and a table of contents, tables, blockquotes, links, images, fenced code, and `NOTE`, `TIP`, or `WARNING` callouts. Highlighting includes TypeScript, JavaScript, Angular/HTML, SCSS, Python, Kotlin, Bash, and JSON.

1. Write with `published: false`; the post is excluded from application data, routes, sitemap, RSS, and public output.
2. Run `npm run content:generate` and `npm test`.
3. Review for originality, correctness, and confidential information.
4. Change `published` to `true`, commit, and push to `main`.
5. CI rebuilds every article route and verifies its static HTML.

Executable HTML and scripts are removed. Generated HTML is sanitized at build time and again by Angular at render time.

## Project publication controls

Projects live in `src/app/data/projects.data.ts`. Supported statuses are `published`, `public-summary-only`, `private`, `in-progress`, and `draft`. Only the first two are rendered.

Before exposing a project, confirm ownership or explicit permission, add verified facts only, avoid private architecture/source/screenshots/internal workflows, then set the appropriate public status and review the built route. This public source snapshot includes only approved projects; the private candidate catalog is excluded.

## Updating professional experience

Edit `src/app/data/profile.data.ts`. Keep commercial descriptions at the responsibility level. Do not add internal product names, confidential implementation details, client data, or unsupported achievements.

## Firebase Hosting Classic

1. Create a Firebase project on the Spark plan.
2. Enable **Hosting**, not App Hosting. No billing-enabled services are required.
3. For local deployment, run `npx firebase login`.
4. Copy `.firebaserc.example` to `.firebaserc` and replace the project ID.
5. Deploy with `SITE_URL=https://your-project-id.web.app npm run deploy`.

`firebase.json` points directly at the prerendered browser output. It has no blanket SPA rewrite, so nested article requests resolve to their generated HTML. Hashed assets use long immutable caching; HTML is always revalidated.

## GitHub Actions

`.github/workflows/deploy.yml` runs install, lint, tests, content generation, the static build, output verification, and deployment on pushes to `main`.

Configure:

- Variable `SITE_URL`: canonical Firebase or custom-domain origin, without a trailing slash
- Variable `FIREBASE_PROJECT_ID`: Firebase project ID
- Secret `FIREBASE_SERVICE_ACCOUNT`: JSON for a narrowly scoped Firebase Hosting deployment service account

GitHub supplies its token automatically. Never commit service-account JSON, Firebase tokens, or environment secrets.

## Custom domain

Connect it in Firebase Console → Hosting → Add custom domain. After DNS verification and TLS provisioning, change `SITE_URL` to the custom origin and redeploy. No application restructuring is needed.

## CV

No CV link is exposed because no verified CV file was supplied. When one is available, place the real PDF in `public/`, add the link, and verify its contents before publishing.
