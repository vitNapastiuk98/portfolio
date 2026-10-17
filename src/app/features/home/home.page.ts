import type { OnInit } from '@angular/core';
import { Component, DestroyRef, inject } from '@angular/core';
import { HeroMotionDirective } from '../../animations/hero-motion.directive';
import { SeoService } from '../../core/seo.service';
import { profile } from '../../data/profile.data';
import { HeroSceneComponent } from '../../shared/hero-scene.component';
import { generatedSiteConfig } from '../../../generated/site-config.generated';
import { ExperienceSectionComponent } from '../experience/experience-section.component';
import { ExpertiseSectionComponent } from '../expertise/expertise-section.component';
import { WorkPreviewComponent } from '../work/work-preview.component';
import { EngineeringSectionComponent } from '../engineering/engineering-section.component';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroMotionDirective,
    HeroSceneComponent,
    ExpertiseSectionComponent,
    WorkPreviewComponent,
    EngineeringSectionComponent,
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
    <div id="engineering" data-section="engineering"><app-engineering-section /></div>
    <div id="experience" data-section="experience"><app-experience-section /></div>

    <section
      id="contact"
      class="contact-band"
      data-section="conversation"
      aria-labelledby="contact-band-title"
    >
      <div class="contact-band__inner">
        <p class="showcase-kicker">05 / Contact</p>
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
