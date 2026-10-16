import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import type { ElementRef } from '@angular/core';
import {
  afterNextRender,
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SeoService } from '../../core/seo.service';
import { generatedSiteConfig } from '../../../generated/site-config.generated';
import { blogPosts } from '../../../generated/blog-posts.generated';

@Component({
  selector: 'app-article-page',
  imports: [RouterLink],
  template: `
    @if (post(); as article) {
      <div class="reading-progress" [style.width.%]="progress()"></div>
      <article class="article-page">
        <header>
          <a class="article-back" routerLink="/" fragment="writing">← All writing</a>
          <p class="article-tags">{{ article.tags.join(' / ') }}</p>
          <h1>{{ article.title }}</h1>
          <p class="article-deck">{{ article.description }}</p>
          <div class="article-meta">
            <time [attr.datetime]="article.date">{{ article.date }}</time
            ><span>{{ article.readingMinutes }} min read</span><span>Vitalii Napastiuk</span>
          </div>
        </header>
        <div class="article-layout">
          <aside class="article-toc" aria-label="Table of contents">
            <p>On this page</p>
            @for (item of article.tableOfContents; track item.id) {
              <a
                [routerLink]="['/blog', article.slug]"
                [fragment]="item.id"
                [class.subheading]="item.level === 3"
                >{{ item.text }}</a
              >
            }
          </aside>
          <div #articleBody class="article-body" [innerHTML]="articleHtml()"></div>
          <aside class="article-share" aria-label="Share this article">
            <span>Share</span>
            <a
              [href]="linkedInShareUrl()"
              target="_blank"
              rel="noreferrer"
              aria-label="Share on LinkedIn"
              >in</a
            >
            <button type="button" (click)="copyUrl()">
              {{ copied() ? '✓' : '⧉'
              }}<span class="sr-only" aria-live="polite">{{
                copyFailed() ? 'Could not copy article URL' : 'Copy article URL'
              }}</span>
            </button>
          </aside>
        </div>
        <footer class="article-footer">
          <div>
            <p>Written by</p>
            <h2>Vitalii Napastiuk</h2>
            <p>
              Senior software engineer working across frontend architecture, full-stack systems, AI
              products, and real-time applications.
            </p>
          </div>
          @if (related().length > 0) {
            <section class="related-articles" aria-labelledby="related-title">
              <p>Continue reading</p>
              <h2 id="related-title">Related articles</h2>
              @for (item of related(); track item.slug) {
                <a [routerLink]="['/blog', item.slug]">{{ item.title }} <span>↗</span></a>
              }
            </section>
          }
          <nav aria-label="More articles">
            @if (previous(); as item) {
              <a [routerLink]="['/blog', item.slug]"><span>Previous</span>{{ item.title }}</a>
            }
            @if (next(); as item) {
              <a [routerLink]="['/blog', item.slug]"><span>Next</span>{{ item.title }}</a>
            }
          </nav>
        </footer>
      </article>
    } @else {
      <section class="not-found">
        <p class="eyebrow">Article unavailable</p>
        <h1>This article is not published.</h1>
        <a class="button button--primary" routerLink="/" fragment="writing">Return to writing</a>
      </section>
    }
  `,
})
export class ArticlePage {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly articleBody = viewChild<ElementRef<HTMLElement>>('articleBody');
  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );
  readonly post = computed(() => blogPosts.find((post) => post.slug === this.slug()) ?? null);
  readonly articleHtml = computed(() => {
    const article = this.post();
    // Generated article HTML is allow-list sanitized before this trusted binding.
    return article ? this.sanitizer.bypassSecurityTrustHtml(article.html) : '';
  });
  readonly progress = signal(0);
  readonly copied = signal(false);
  readonly copyFailed = signal(false);
  readonly previous = computed(() => {
    const index = blogPosts.findIndex(({ slug }) => slug === this.slug());
    return index >= 0 ? (blogPosts[index + 1] ?? null) : null;
  });
  readonly next = computed(() => {
    const index = blogPosts.findIndex(({ slug }) => slug === this.slug());
    return index > 0 ? blogPosts[index - 1] : null;
  });
  readonly related = computed(() => {
    const current = this.post();
    if (!current) return [];
    return blogPosts
      .filter(
        (candidate) =>
          candidate.slug !== current.slug &&
          candidate.tags.some((tag) => current.tags.includes(tag)),
      )
      .slice(0, 2);
  });

  constructor() {
    effect(() => {
      const article = this.post();
      if (!article) {
        this.seo.update({
          title: 'Article not found — Vitalii Napastiuk',
          description: 'The requested article could not be found.',
          path: `/blog/${this.slug()}`,
          noIndex: true,
        });
        this.seo.removeJsonLd('blog-posting-schema');
        return;
      }
      const path = `/blog/${article.slug}`;
      this.seo.update({
        title: `${article.title} — Vitalii Napastiuk`,
        description: article.description,
        path,
        type: 'article',
        publishedTime: article.date,
        tags: article.tags,
      });
      this.seo.setJsonLd('blog-posting-schema', {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        author: {
          '@type': 'Person',
          name: 'Vitalii Napastiuk',
          url: generatedSiteConfig.productionUrl,
        },
        image: `${generatedSiteConfig.productionUrl}/og-default.png`,
        inLanguage: generatedSiteConfig.language,
        mainEntityOfPage: `${generatedSiteConfig.productionUrl}${path}`,
      });
    });
    afterNextRender(() => this.initializeArticleInteractions());
    afterRenderEffect(() => {
      this.post();
      this.initializeCodeCopy();
    });
    this.destroyRef.onDestroy(() => this.seo.removeJsonLd('blog-posting-schema'));
  }

  linkedInShareUrl(): string {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${generatedSiteConfig.productionUrl}/blog/${this.slug()}`)}`;
  }

  async copyUrl(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.copyFailed.set(false);
    try {
      await navigator.clipboard.writeText(location.href);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      this.copied.set(false);
      this.copyFailed.set(true);
    }
  }

  private initializeArticleInteractions(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const updateProgress = (): void => {
      const root = document.documentElement;
      const distance = root.scrollHeight - root.clientHeight;
      this.progress.set(distance > 0 ? Math.min(100, (root.scrollTop / distance) * 100) : 0);
    };
    addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    this.destroyRef.onDestroy(() => removeEventListener('scroll', updateProgress));
  }

  private initializeCodeCopy(): void {
    const body = this.articleBody()?.nativeElement;
    body?.querySelectorAll<HTMLElement>('.code-frame').forEach((frame) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code');
      button.addEventListener('click', async () => {
        const code = frame.querySelector('code')?.textContent ?? '';
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copied';
        } catch {
          button.textContent = 'Copy failed';
        }
        setTimeout(() => (button.textContent = 'Copy'), 1400);
      });
      frame.querySelector('.code-frame__bar')?.appendChild(button);
    });
  }
}
