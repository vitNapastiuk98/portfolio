import { Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SeoService } from '../../core/seo.service';
import { engineeringStudies } from '../../data/engineering-studies.data';
import { StudyBodyComponent } from '../../shared/study-body.component';
import { generatedSiteConfig } from '../../../generated/site-config.generated';
import { profile } from '../../data/profile.data';
import { AnchorTrackingDiagramComponent } from '../../shared/anchor-tracking-diagram.component';

@Component({
  selector: 'app-engineering-page',
  imports: [RouterLink, StudyBodyComponent, AnchorTrackingDiagramComponent],
  template: `
    @if (study(); as item) {
      <article class="project-study engineering-study">
        <header class="project-study__header">
          <a class="article-back" routerLink="/engineering">← Engineering studies</a>
          <p class="eyebrow">
            {{ item.category }} /
            {{
              item.experiment ? 'Lab experiment' : item.experience ? 'Case study' : 'Design study'
            }}
          </p>
          <h1>{{ item.title }}</h1>
          <p class="project-study__summary">{{ item.summary }}</p>
        </header>
        <aside class="study-brief" aria-label="Study at a glance">
          @if (item.experience; as experience) {
            <p class="eyebrow">Engineering contribution</p>
            <p>{{ experience.contribution }}</p>
            <p class="eyebrow">Key technical elements</p>
            <ul>
              @for (capability of experience.implemented; track capability) {
                <li>{{ capability }}</li>
              }
            </ul>
            <span>Implemented workflow · Reconstructed explanation</span>
          } @else {
            <p class="eyebrow">The engineering challenge</p>
            <p>{{ item.takeaways[0] }}</p>
            <ul>
              @for (step of item.flow.steps; track step.title) {
                <li>{{ step.title }}</li>
              }
            </ul>
            <span>{{
              item.experiment
                ? 'Runnable fixture · Recorded samples · Measurement limits'
                : 'Principles · Tradeoffs · Failure scenarios'
            }}</span>
          }
        </aside>
        @if (item.experiment) {
          <section class="study-experiment" aria-labelledby="experiment-title">
            <h2 id="experiment-title">Inspect the experiment</h2>
            <p>
              Two scheduling strategies, identical computation. Recorded local results are available
              inside the lab.
            </p>
            <nav aria-label="Performance experiment">
              <a href="/performance-lab/?mode=baseline">Run baseline ↗</a>
              <a href="/performance-lab/?mode=optimized">Run optimized ↗</a>
              <a href="/performance-lab/results.json">Raw measurements ↗</a>
              <a href="/performance-lab/README.md">Reproduce the test ↗</a>
            </nav>
          </section>
        }
        @if (item.slug === 'opencv-anchored-annotations') {
          <app-anchor-tracking-diagram />
        }
        <app-study-body [study]="item" [path]="'/engineering/' + item.slug" />
        <nav class="study-related" aria-label="Continue reading">
          <p class="eyebrow">Explore another problem</p>
          @for (related of relatedStudies(); track related.slug) {
            <a [routerLink]="['/engineering', related.slug]">
              <span>{{ related.category }}</span
              ><strong>{{ related.title }}</strong
              ><i aria-hidden="true">↗</i>
            </a>
          }
        </nav>
      </article>
    } @else {
      <section class="not-found">
        <p class="eyebrow">Study unavailable</p>
        <h1>This study could not be found.</h1>
        <a class="text-link" routerLink="/engineering"
          >Return to engineering studies <span>↗</span></a
        >
      </section>
    }
  `,
})
export class EngineeringPage {
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );
  readonly study = computed(
    () => engineeringStudies.find((item) => item.slug === this.slug()) ?? null,
  );
  readonly relatedStudies = computed(() =>
    engineeringStudies.filter((item) => item.slug !== this.slug()),
  );

  constructor() {
    effect(() => {
      const study = this.study();
      this.seo.update({
        title: study ? `${study.title} — Vitalii Napastiuk` : 'Study not found — Vitalii Napastiuk',
        description: study?.summary ?? 'The requested engineering study could not be found.',
        path: `/engineering/${this.slug()}`,
        noIndex: !study,
        type: study ? 'article' : 'website',
      });
      if (study) {
        this.seo.setJsonLd('engineering-study-schema', {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: study.title,
          description: study.summary,
          author: { '@type': 'Person', name: profile.name, url: generatedSiteConfig.productionUrl },
          image: `${generatedSiteConfig.productionUrl}/og-default.png`,
          inLanguage: generatedSiteConfig.language,
          mainEntityOfPage: `${generatedSiteConfig.productionUrl}/engineering/${study.slug}`,
        });
      } else {
        this.seo.removeJsonLd('engineering-study-schema');
      }
    });
    this.destroyRef.onDestroy(() => this.seo.removeJsonLd('engineering-study-schema'));
  }
}
