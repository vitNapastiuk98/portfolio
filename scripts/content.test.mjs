import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRouteEntries,
  filterPublished,
  frontmatterSchema,
  parsePost,
} from './generate-content.mjs';

test('frontmatter validation rejects incomplete metadata', () => {
  assert.throws(() => frontmatterSchema.parse({ title: 'Short', published: true }));
});

test('sample article metadata parses and remains a draft', async () => {
  const article = await parsePost('angular-signals-vs-rxjs.md');
  assert.equal(article.published, false);
  assert.equal(article.slug, 'angular-signals-vs-rxjs');
  assert.ok(article.html.includes('code-frame'));
  assert.ok(article.tableOfContents.length >= 2);
  assert.ok(article.html.includes('href="/blog/angular-signals-vs-rxjs#'));
  assert.ok(!article.html.includes('class="heading-anchor" href="#'));
});

test('published filtering excludes drafts and orders newest first', () => {
  const posts = filterPublished([
    { slug: 'draft', date: '2026-10-14', published: false },
    { slug: 'older', date: '2025-01-01', published: true },
    { slug: 'newer', date: '2026-01-01', published: true },
  ]);
  assert.deepEqual(
    posts.map(({ slug }) => slug),
    ['newer', 'older'],
  );
});

test('sitemap routes expose only the homepage and public detail content', () => {
  assert.deepEqual(buildRouteEntries([{ slug: 'article', date: '2026-01-01' }]), [
    { route: '', date: undefined },
    { route: 'engineering', date: undefined },
    { route: 'projects', date: undefined },
    { route: 'case-studies/angular-enterprise-architecture', date: undefined },
    { route: 'case-studies/design-systems', date: undefined },
    { route: 'case-studies/real-time-systems', date: undefined },
    { route: 'case-studies/workflow-architecture', date: undefined },
    { route: 'case-studies/ai-product-engineering', date: undefined },
    { route: 'case-studies/computer-vision', date: undefined },
    { route: 'work/ts-reactivity-engine', date: undefined },
    { route: 'work/visual-kapital', date: undefined },
    { route: 'work/task-around-website', date: undefined },
    { route: 'work/white-label-restaurant', date: undefined },
    { route: 'engineering/web-performance', date: undefined },
    { route: 'engineering/accessibility', date: undefined },
    { route: 'engineering/angular-architectures', date: undefined },
    { route: 'engineering/angular-dependency-injection', date: undefined },
    { route: 'engineering/reactive-consistency', date: undefined },
    { route: 'engineering/resilient-real-time-sessions', date: undefined },
    { route: 'engineering/ai-interface-state', date: undefined },
    { route: 'engineering/opencv-anchored-annotations', date: undefined },
    { route: 'blog/article', date: '2026-01-01' },
  ]);
});
