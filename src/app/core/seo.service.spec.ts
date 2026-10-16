import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { generatedSiteConfig } from '../../generated/site-config.generated';

describe('SeoService', () => {
  const home = { title: 'Portfolio', description: 'Software engineering portfolio', path: '/' };

  it('sets crawl directives, author metadata, and a compatible social preview', () => {
    const seo = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    seo.update(home);

    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'index, follow, max-image-preview:large',
    );
    expect(document.querySelector('meta[name="author"]')?.getAttribute('content')).toBe(
      'Vitalii Napastiuk',
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      `${generatedSiteConfig.productionUrl}/og-default.png`,
    );
    expect(document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe(
      generatedSiteConfig.siteName,
    );
    expect(
      document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content'),
    ).toBeTruthy();
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });

  it('clears article-only metadata when navigating to other pages', () => {
    const seo = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    seo.update({
      ...home,
      path: '/blog/example',
      type: 'article',
      publishedTime: '2026-01-01',
      tags: ['Angular', 'TypeScript'],
    });
    seo.update({ ...home, path: '/blog/next', type: 'article', tags: ['WebRTC'] });
    expect(
      [...document.querySelectorAll('meta[property="article:tag"]')].map((tag) =>
        tag.getAttribute('content'),
      ),
    ).toEqual(['WebRTC']);
    seo.update(home);
    expect(document.querySelector('meta[property="article:published_time"]')).toBeNull();
    expect(document.querySelector('meta[property="article:tag"]')).toBeNull();
  });

  it('excludes error pages and resets indexing on subsequent navigation', () => {
    const seo = TestBed.inject(SeoService);
    const document = TestBed.inject(DOCUMENT);
    const missing = { ...home, path: '/404', noIndex: true };
    seo.update(missing);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
    seo.update(home);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'index, follow, max-image-preview:large',
    );
  });
});
