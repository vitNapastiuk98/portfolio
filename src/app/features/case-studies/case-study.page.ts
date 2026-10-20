import { Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SeoService } from '../../core/seo.service';
import { professionalStudies } from '../../data/professional-studies.data';
import { profile } from '../../data/profile.data';
import { generatedSiteConfig } from '../../../generated/site-config.generated';
import { StudyBodyComponent } from '../../shared/study-body.component';
import { AnchorTrackingDiagramComponent } from '../../shared/anchor-tracking-diagram.component';
import { ReferenceDialogComponent } from './reference-dialog.component';
import { AiResponseExampleComponent } from './ai-response-example.component';

@Component({
  selector: 'app-case-study-page',
  imports: [
    RouterLink,
    StudyBodyComponent,
    AnchorTrackingDiagramComponent,
    ReferenceDialogComponent,
    AiResponseExampleComponent,
  ],
  template: `
    @if (study(); as item) {
      <article class="project-study engineering-study professional-study">
        <header class="project-study__header">
          <a class="article-back" routerLink="/" fragment="work">← Selected Engineering Work</a>
          <p class="eyebrow">{{ item.category }} / Professional engineering</p>
          <h1>{{ item.title }}</h1>
          <p class="project-study__summary">{{ item.summary }}</p>
          <ul class="study-metadata" aria-label="Technologies">
            @for (technology of item.technologies; track technology) {
              <li>{{ technology }}</li>
            }
          </ul>
        </header>
        <aside class="study-brief professional-study__context" aria-label="Professional context">
          <p class="eyebrow">Professional context</p>
          <ul>
            @for (context of item.contexts; track context) {
              <li>{{ context }}</li>
            }
          </ul>
          <p>Applied decisions, independently explained.</p>
        </aside>
        <ng-template #example let-sectionId>
          @if (item.slug === 'design-systems' && sectionId === 'interaction') {
            <app-reference-dialog />
          }
          @if (item.slug === 'ai-product-engineering' && sectionId === 'rendering') {
            <app-ai-response-example />
          }
          @if (item.slug === 'computer-vision' && sectionId === 'geometry') {
            <app-anchor-tracking-diagram />
          }
        </ng-template>
        <app-study-body
          [study]="item"
          [path]="'/case-studies/' + item.slug"
          [sectionExample]="example"
        />
        <nav class="study-related" aria-label="Related engineering material">
          <p class="eyebrow">Continue exploring</p>
          @for (related of item.related; track related.path) {
            <a [routerLink]="related.path"
              ><strong>{{ related.label }}</strong
              ><i aria-hidden="true">↗</i></a
            >
          }
          <a routerLink="/projects"
            ><strong>Independent projects</strong><i aria-hidden="true">↗</i></a
          >
        </nav>
      </article>
    } @else {
      <section class="not-found">
        <h1>Case study not found</h1>
        <a routerLink="/" fragment="work">Selected Engineering Work</a>
      </section>
    }
  `,
})
export class CaseStudyPage {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );
  readonly study = computed(
    () => professionalStudies.find((study) => study.slug === this.slug()) ?? null,
  );
  constructor() {
    effect(() => {
      const study = this.study();
      this.seo.update({
        title: `${study?.title ?? 'Case study not found'} — ${profile.name}`,
        description: study?.summary ?? 'The requested case study is unavailable.',
        path: `/case-studies/${this.slug()}`,
        type: study ? 'article' : 'website',
        noIndex: !study,
      });
      if (study)
        this.seo.setJsonLd('professional-study-schema', {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: study.title,
          description: study.summary,
          author: { '@type': 'Person', name: profile.name, url: generatedSiteConfig.productionUrl },
          mainEntityOfPage: `${generatedSiteConfig.productionUrl}/case-studies/${study.slug}`,
        });
      else this.seo.removeJsonLd('professional-study-schema');
    });
    this.destroyRef.onDestroy(() => this.seo.removeJsonLd('professional-study-schema'));
  }
}
