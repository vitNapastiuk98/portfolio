import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { generatedSiteConfig } from '../../generated/site-config.generated';
import { profile } from '../data/profile.data';

interface SeoConfig {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly type?: 'website' | 'article';
  readonly image?: string;
  readonly publishedTime?: string;
  readonly tags?: readonly string[];
  readonly noIndex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(config: SeoConfig): void {
    const url = `${generatedSiteConfig.productionUrl}${config.path === '/' ? '' : config.path}`;
    const image = new URL(config.image ?? '/og-default.png', generatedSiteConfig.productionUrl)
      .href;
    this.title.setTitle(config.title);
    this.setName('description', config.description);
    this.setName('author', profile.name);
    this.setName(
      'robots',
      config.noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    );
    this.setProperty('og:site_name', generatedSiteConfig.siteName);
    this.setProperty('og:locale', 'en_US');
    this.setProperty('og:title', config.title);
    this.setProperty('og:description', config.description);
    this.setProperty('og:type', config.type ?? 'website');
    this.setProperty('og:url', url);
    this.setProperty('og:image', image);
    for (const property of ['og:image:width', 'og:image:height', 'og:image:type']) {
      this.meta.removeTag(`property='${property}'`);
    }
    if (!config.image) {
      this.setProperty('og:image:width', '1200');
      this.setProperty('og:image:height', '630');
      this.setProperty('og:image:type', 'image/png');
    }
    this.setProperty('og:image:alt', `${profile.name} — ${profile.title}`);
    this.setName('twitter:card', 'summary_large_image');
    this.setName('twitter:title', config.title);
    this.setName('twitter:description', config.description);
    this.setName('twitter:image', image);
    this.setName('twitter:image:alt', `${profile.name} — ${profile.title}`);
    this.setCanonical(url);
    this.meta.removeTag("property='article:published_time'");
    if (config.type === 'article' && config.publishedTime) {
      this.setProperty('article:published_time', config.publishedTime);
    }
    this.document.head
      .querySelectorAll<HTMLMetaElement>('meta[property="article:tag"]')
      .forEach((tag) => tag.remove());
    config.tags?.forEach((tag) => this.meta.addTag({ property: 'article:tag', content: tag }));
  }

  setJsonLd(id: string, value: object): void {
    this.document.getElementById(id)?.remove();
    const script = this.document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(value).replace(/</g, '\\u003c');
    this.document.head.appendChild(script);
  }

  removeJsonLd(id: string): void {
    this.document.getElementById(id)?.remove();
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
