import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';
import hljs from 'highlight.js';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

const root = process.cwd();
const contentDirectory = path.join(root, 'content/blog');
const generatedFile = path.join(root, 'src/generated/blog-posts.generated.ts');
const generatedSiteConfigFile = path.join(root, 'src/generated/site-config.generated.ts');
const publicDirectory = path.join(root, 'public');
const checkOnly = process.argv.includes('--check');

export const frontmatterSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string().min(1)).min(1),
  published: z.boolean(),
  featured: z.boolean().default(false),
});

const languageAliases = {
  ts: 'typescript',
  js: 'javascript',
  angular: 'html',
  shell: 'bash',
  sh: 'bash',
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniqueHeadingSlug(value, slugs) {
  const base = slugify(value) || 'section';
  const seen = slugs.get(base) ?? 0;
  slugs.set(base, seen + 1);
  return seen === 0 ? base : `${base}-${seen + 1}`;
}

function plainText(token) {
  if (typeof token === 'string') return token;
  if (token && typeof token.text === 'string') return token.text;
  return '';
}

function escapeAttribute(value = '') {
  return value.replace(
    /[&<>\"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
      })[character],
  );
}

function renderMarkdown(markdown, slug) {
  const tableOfContents = [];
  const headingSlugs = new Map();
  const renderer = {
    heading(token) {
      const depth = token.depth;
      const text = token.text;
      const id = uniqueHeadingSlug(text, headingSlugs);
      if (depth === 2 || depth === 3) {
        tableOfContents.push({ id, text, level: depth });
      }
      return `<h${depth} id="${id}">${text}<a class="heading-anchor" href="/blog/${slug}#${id}" aria-label="Link to ${text}">#</a></h${depth}>`;
    },
    code(token) {
      const requested = plainText(token.lang).split(/\s+/)[0];
      const language = languageAliases[requested] ?? requested;
      const code = plainText(token);
      const supported = language && hljs.getLanguage(language);
      const highlighted = supported
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;
      const label = supported ? language : 'text';
      return `<div class="code-frame" data-language="${label}"><div class="code-frame__bar"><span>${label}</span></div><pre><code class="hljs language-${label}">${highlighted}</code></pre></div>`;
    },
    image(token) {
      const source = escapeAttribute(token.href);
      const alt = escapeAttribute(token.text);
      const caption = escapeAttribute(token.title || token.text);
      return `<figure><img src="${source}" alt="${alt}" loading="lazy">${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
    },
  };

  marked.use({ renderer, gfm: true, breaks: false });
  const unsafeHtml = marked.parse(markdown);
  const withCallouts = unsafeHtml.replace(
    /<blockquote>\s*<p>\[!(NOTE|TIP|WARNING)\]\s*([\s\S]*?)<\/blockquote>/gi,
    (_, kind, body) =>
      `<aside class="callout callout--${kind.toLowerCase()}"><p><strong>${kind}</strong> ${body}</aside>`,
  );

  const html = sanitizeHtml(withCallouts, {
    allowedTags: [
      'a',
      'aside',
      'blockquote',
      'br',
      'code',
      'del',
      'div',
      'em',
      'figcaption',
      'figure',
      'h2',
      'h3',
      'h4',
      'hr',
      'img',
      'li',
      'ol',
      'p',
      'pre',
      'span',
      'strong',
      'table',
      'tbody',
      'td',
      'th',
      'thead',
      'tr',
      'ul',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'class', 'aria-label'],
      code: ['class'],
      div: ['class', 'data-language'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      aside: ['class'],
      span: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  });

  return { html, tableOfContents };
}

function readingMinutes(markdown) {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export async function parsePost(fileName) {
  const source = await fs.readFile(path.join(contentDirectory, fileName), 'utf8');
  const parsed = matter(source);
  const metadata = frontmatterSchema.parse(parsed.data);
  const slug = fileName.replace(/\.md$/, '');
  if (slugify(slug) !== slug) {
    throw new Error(`${fileName}: filenames must use lowercase kebab-case.`);
  }
  const { html, tableOfContents } = renderMarkdown(parsed.content, slug);
  return {
    slug,
    title: metadata.title,
    description: metadata.description,
    date: metadata.date,
    tags: metadata.tags,
    featured: metadata.featured,
    published: metadata.published,
    readingMinutes: readingMinutes(parsed.content),
    html,
    tableOfContents,
  };
}

export function filterPublished(posts) {
  return posts.filter((post) => post.published).sort((a, b) => b.date.localeCompare(a.date));
}

async function getSiteConfig() {
  const config = JSON.parse(await fs.readFile(path.join(root, 'site.config.json'), 'utf8'));
  const configuredUrl = process.env.SITE_URL || config.productionUrl;
  if (process.env.CI === 'true' && (!process.env.SITE_URL || configuredUrl.includes('localhost'))) {
    throw new Error('CI requires a non-local SITE_URL repository variable.');
  }
  return { ...config, productionUrl: configuredUrl.replace(/\/$/, '') };
}

function escapeXml(value) {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      })[character],
  );
}

export function buildRouteEntries(posts) {
  // shortcut: Node cannot import the Angular TS manifest without warnings; update when publicProjects changes.
  const projectSlugs = [
    'ts-reactivity-engine',
    'visual-kapital',
    'task-around-website',
    'white-label-restaurant',
  ];
  return [
    { route: '', date: undefined },
    { route: 'engineering', date: undefined },
    ...projectSlugs.map((slug) => ({ route: `work/${slug}`, date: undefined })),
    ...[
      'web-performance',
      'reactive-consistency',
      'resilient-real-time-sessions',
      'ai-interface-state',
      'opencv-anchored-annotations',
    ].map((slug) => ({ route: `engineering/${slug}`, date: undefined })),
    ...posts.map((post) => ({ route: `blog/${post.slug}`, date: post.date })),
  ];
}

async function generate() {
  const fileNames = (await fs.readdir(contentDirectory))
    .filter((file) => file.endsWith('.md'))
    .sort();
  const parsedPosts = await Promise.all(fileNames.map(parsePost));
  const posts = filterPublished(parsedPosts).map(({ published: _published, ...post }) => post);
  const tags = [...new Set(posts.flatMap((post) => post.tags))].sort();
  const generated = `// Generated by scripts/generate-content.mjs. Do not edit.\nimport { BlogPost } from '../app/models/content.models';\n\nexport const blogPosts: readonly BlogPost[] = ${JSON.stringify(posts, null, 2)};\nexport const blogTags: readonly string[] = ${JSON.stringify(tags, null, 2)};\n`;

  if (checkOnly) {
    const existing = await fs.readFile(generatedFile, 'utf8').catch(() => '');
    if (existing !== generated)
      throw new Error('Generated blog manifest is stale. Run npm run content:generate.');
    console.log(`Validated ${parsedPosts.length} article file(s); ${posts.length} published.`);
    return;
  }

  const config = await getSiteConfig();
  const generatedSiteConfig = `// Generated by scripts/generate-content.mjs. Do not edit.\nexport const generatedSiteConfig = ${JSON.stringify(config, null, 2)} as const;\n`;
  const routeEntries = buildRouteEntries(posts);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routeEntries.map(({ route, date }) => `  <url><loc>${escapeXml(`${config.productionUrl}/${route}`)}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${escapeXml(config.siteName)}</title><link>${escapeXml(config.productionUrl)}</link><description>Technical writing by ${escapeXml(config.author)}.</description>${posts.map((post) => `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(`${config.productionUrl}/blog/${post.slug}`)}</link><guid>${escapeXml(`${config.productionUrl}/blog/${post.slug}`)}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escapeXml(post.description)}</description></item>`).join('')}</channel></rss>\n`;

  await fs.mkdir(path.dirname(generatedFile), { recursive: true });
  await fs.writeFile(generatedFile, generated);
  await fs.writeFile(generatedSiteConfigFile, generatedSiteConfig);
  await fs.writeFile(path.join(publicDirectory, 'sitemap.xml'), sitemap);
  await fs.writeFile(path.join(publicDirectory, 'rss.xml'), rss);
  await fs.writeFile(
    path.join(publicDirectory, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${config.productionUrl}/sitemap.xml\n`,
  );
  console.log(`Generated content for ${posts.length} published article(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generate().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
