import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const output = path.join(root, 'dist/portfolio/browser');
const manifestSource = await fs.readFile(
  path.join(root, 'src/generated/blog-posts.generated.ts'),
  'utf8',
);
const slugs = [...manifestSource.matchAll(/"slug": "([^"]+)"/g)].map((match) => match[1]);
const sitemap = await fs.readFile(path.join(root, 'public/sitemap.xml'), 'utf8');
const projectSlugs = [...sitemap.matchAll(/<loc>[^<]+\/work\/([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
const expected = [
  'engineering/index.html',
  'engineering/web-performance/index.html',
  'performance-lab/index.html',
  'performance-lab/results.json',
  'performance-lab/README.md',
  'performance-lab/fonts/manrope-latin-wght-normal.woff2',
  'performance-lab/fonts/syne-latin-wght-normal.woff2',
  'performance-lab/fonts/ibm-plex-mono-latin-400-normal.woff2',
  'engineering/reactive-consistency/index.html',
  'engineering/resilient-real-time-sessions/index.html',
  'engineering/ai-interface-state/index.html',
  'engineering/opencv-anchored-annotations/index.html',
  'index.html',
  'expertise/index.html',
  'experience/index.html',
  'work/index.html',
  'blog/index.html',
  'contact/index.html',
  'sitemap.xml',
  'rss.xml',
  'robots.txt',
  'og-default.png',
];

for (const slug of slugs) expected.push(`blog/${slug}/index.html`);
for (const slug of projectSlugs) expected.push(`work/${slug}/index.html`);

for (const relative of expected) {
  await fs.access(path.join(output, relative)).catch(() => {
    throw new Error(`Missing expected build output: ${relative}`);
  });
}

for (const slug of slugs) {
  const html = await fs.readFile(path.join(output, `blog/${slug}/index.html`), 'utf8');
  if (!html.includes('article-body') || html.length < 2_000) {
    throw new Error(`Prerendered article is incomplete: ${slug}`);
  }
}

for (const slug of projectSlugs) {
  const html = await fs.readFile(path.join(output, `work/${slug}/index.html`), 'utf8');
  if (!html.includes('project-study') || html.length < 2_000) {
    throw new Error(`Prerendered project study is incomplete: ${slug}`);
  }
}

const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
for (const url of urls) {
  const html = await fs.readFile(path.join(output, url.pathname, 'index.html'), 'utf8');
  const dom = new JSDOM();
  const document = new dom.window.DOMParser().parseFromString(html, 'text/html');
  assert.equal(document.head.querySelectorAll('title').length, 1, `${url}: one document title`);
  assert.ok(document.title.trim(), `${url}: non-empty title`);
  const canonicals = document.querySelectorAll('link[rel="canonical"]');
  assert.equal(canonicals.length, 1, `${url}: one canonical`);
  assert.equal(new URL(canonicals[0].href).href, url.href, `${url}: canonical matches sitemap`);
  for (const selector of [
    'meta[name="description"]',
    'meta[name="author"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:image:alt"]',
    'meta[name="twitter:card"]',
  ]) {
    assert.equal(document.querySelectorAll(selector).length, 1, `${url}: one ${selector}`);
    assert.ok(document.querySelector(selector).content.trim(), `${url}: non-empty ${selector}`);
  }
  assert.equal(
    document.querySelector('meta[property="og:image"]')?.content,
    `${url.origin}/og-default.png`,
  );
  assert.ok(document.querySelector('meta[name="robots"]')?.content.startsWith('index, follow'));
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    assert.equal(JSON.parse(script.textContent)['@context'], 'https://schema.org');
  }
  if (url.pathname === '/') assert.ok(document.getElementById('profile-schema'));
  if (url.pathname.startsWith('/blog/')) assert.ok(document.getElementById('blog-posting-schema'));
  if (url.pathname.startsWith('/engineering/'))
    assert.ok(document.getElementById('engineering-study-schema'));
  if (url.pathname.startsWith('/work/') || url.pathname.startsWith('/engineering/')) {
    assert.ok(document.querySelectorAll('.study-section').length >= 3, `${url}: project narrative`);
    if (url.pathname.startsWith('/engineering/')) {
      assert.ok(
        document.querySelectorAll('.study-section').length >= 8,
        `${url}: substantial study sections`,
      );
      assert.ok(
        document.querySelectorAll('.study-flow li').length >= 4,
        `${url}: semantic system flow`,
      );
      assert.ok(
        document.querySelectorAll('.study-decisions tbody tr').length >= 3,
        `${url}: decision tradeoffs`,
      );
      assert.ok(
        document.querySelectorAll('.study-checks li').length >= 4,
        `${url}: failure scenarios`,
      );
    }
    for (const link of document.querySelectorAll('.study-nav a')) {
      const target = new URL(link.href, url);
      assert.equal(target.pathname, url.pathname, `${url}: contents stay on the study route`);
      assert.ok(document.getElementById(target.hash.slice(1)), `${url}: contents target exists`);
    }
  }
  dom.window.close();
}
const preview = await fs.readFile(path.join(output, 'og-default.png'));
assert.equal(preview.subarray(1, 4).toString(), 'PNG');
assert.equal(preview.readUInt32BE(16), 1200);
assert.equal(preview.readUInt32BE(20), 630);

console.log(
  `Verified ${expected.length} static output files, ${slugs.length} full article page(s), ${projectSlugs.length} project study page(s), and ${urls.filter((url) => url.pathname.startsWith('/engineering/')).length} engineering study pages.`,
);
