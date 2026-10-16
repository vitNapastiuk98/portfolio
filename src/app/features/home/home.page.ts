import type { OnInit } from '@angular/core';
import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroMotionDirective } from '../../animations/hero-motion.directive';
import { RevealDirective } from '../../animations/reveal.directive';
import { SeoService } from '../../core/seo.service';
import { profile } from '../../data/profile.data';
import { HeroSceneComponent } from '../../shared/hero-scene.component';
import { blogPosts } from '../../../generated/blog-posts.generated';
import { generatedSiteConfig } from '../../../generated/site-config.generated';
import { ExperienceSectionComponent } from '../experience/experience-section.component';
import { ExpertiseSectionComponent } from '../expertise/expertise-section.component';
import { WorkPreviewComponent } from '../work/work-preview.component';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    HeroMotionDirective,
    RevealDirective,
    HeroSceneComponent,
    ExpertiseSectionComponent,
    WorkPreviewComponent,
    ExperienceSectionComponent,
  ],
  template: `
    <section id="home" class="hero" data-section="hero" aria-labelledby="hero-title" appHeroMotion>
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-title-lockup">
        <h1 id="hero-title">
          <span class="hero-name-line" data-hero-line="first"><span>Vitalii</span></span>
          <span class="hero-name-line" data-hero-line="second">
            <span>Napastiuk</span>
          </span>
        </h1>
      </div>

      <app-hero-scene data-hero-scene />

      <div class="hero-copy" data-hero-copy>
        <p class="hero-specialisms">
          <strong>Frontend Architecture</strong> <i>/</i> Full-Stack <i>/</i> AI &amp; Real-Time
          Systems
        </p>
      </div>
    </section>

    <div id="expertise" data-section="expertise"><app-expertise-section /></div>
    <div id="work" data-section="work"><app-work-preview /></div>
    <div id="experience" data-section="experience"><app-experience-section /></div>

    @if (latestPosts.length > 0) {
      <section
        class="writing-section section-shell"
        id="writing"
        data-section="writing"
        aria-labelledby="writing-title"
      >
        <header class="showcase-heading" appReveal>
          <div>
            <p class="showcase-kicker">05 / Writing</p>
            <h2 id="writing-title">Latest writing</h2>
          </div>
        </header>
        <div class="writing-list">
          @for (post of latestPosts; track post.slug) {
            <a class="writing-entry" [routerLink]="['/blog', post.slug]" appReveal>
              <div>
                <time [attr.datetime]="post.date">{{ post.date }}</time>
                <span>{{ post.readingMinutes }} min read</span>
              </div>
              <h3>{{ post.title }}</h3>
              <p>{{ post.description }}</p>
              <span class="writing-entry__arrow" aria-hidden="true">↗</span>
            </a>
          }
        </div>
      </section>
    } @else {
      <section
        class="writing-prompt section-shell"
        id="writing"
        data-section="writing"
        aria-labelledby="writing-title"
      >
        <p class="eyebrow" appReveal>03 — Technical journal</p>
        <div appReveal>
          <h2 id="writing-title">Writing in progress.</h2>
          <p>
            Notes on frontend architecture, real-time systems, and lessons from shipping software.
            The first article is in progress.
          </p>
        </div>
      </section>
    }

    <section
      id="contact"
      class="contact-band"
      data-section="conversation"
      aria-labelledby="contact-band-title"
    >
      <div class="contact-band__inner">
        <p class="showcase-kicker">06 / Contact</p>
        <h2 id="contact-band-title">A hard problem is a good place to begin.</h2>
        <div class="contact-band__links">
          <p>Available for fully remote senior engineering roles and B2B contracts.</p>
          <a class="button button--light" [href]="'mailto:' + profile.email"
            >{{ profile.email }} <span>↗</span></a
          >
        </div>
      </div>
    </section>
  `,
})
export class HomePage implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly profile = profile;
  readonly latestPosts = blogPosts.slice(0, 3);

  ngOnInit(): void {
    this.seo.update({
      title: 'Vitalii Napastiuk — Senior Software Engineer',
      description:
        'Senior software engineer in Rome building scalable frontend, full-stack, AI, and real-time applications.',
      path: '/',
    });
    const url = generatedSiteConfig.productionUrl;
    this.seo.setJsonLd('profile-schema', {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${url}/#website`,
          url,
          name: generatedSiteConfig.siteName,
          inLanguage: generatedSiteConfig.language,
        },
        {
          '@type': 'ProfilePage',
          '@id': `${url}/#profile`,
          url,
          name: `${profile.name} — ${profile.title}`,
          isPartOf: { '@id': `${url}/#website` },
          mainEntity: {
            '@type': 'Person',
            '@id': `${url}/#person`,
            name: profile.name,
            jobTitle: profile.title,
            url,
            sameAs: [profile.github, profile.linkedin, profile.medium],
          },
        },
      ],
    });
    this.destroyRef.onDestroy(() => this.seo.removeJsonLd('profile-schema'));
  }
}
