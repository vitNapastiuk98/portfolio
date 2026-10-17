import type { OnInit } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { engineeringStudies } from '../../data/engineering-studies.data';

@Component({
  selector: 'app-engineering-index-page',
  imports: [RouterLink],
  template: `
    <section class="engineering-collection section-shell" aria-labelledby="collection-title">
      <header class="showcase-heading">
        <div>
          <a class="article-back" routerLink="/" fragment="work">← Selected work</a>
          <p class="showcase-kicker">Engineering studies</p>
          <h1 id="collection-title">Decisions &amp; tradeoffs</h1>
        </div>
        <p>
          Technical investigations into how interfaces behave, where designs fail, and what the
          evidence supports. Each study states whether it is a design proposal, a reconstruction, or
          a working experiment.
        </p>
      </header>
      <div class="engineering-filters" role="group" aria-label="Filter studies by category">
        @for (category of categories; track category) {
          <button
            type="button"
            [attr.aria-pressed]="selected() === category"
            (click)="selected.set(category)"
          >
            {{ category }}
          </button>
        }
      </div>
      <p class="engineering-count" role="status">
        {{ filtered().length }} {{ filtered().length === 1 ? 'study' : 'studies' }}
      </p>
      <div class="engineering-index__grid">
        @for (study of filtered(); track study.slug) {
          <a class="engineering-card" [routerLink]="['/engineering', study.slug]">
            <div class="engineering-card__meta">
              <span>{{ study.category }}</span>
              <span>{{
                study.experiment
                  ? 'Lab experiment'
                  : study.experience
                    ? 'Case study'
                    : 'Design study'
              }}</span>
            </div>
            <h2>{{ study.title }}</h2>
            <p>{{ study.summary }}</p>
            <span class="engineering-card__link">Explore study <i aria-hidden="true">↗</i></span>
          </a>
        }
      </div>
    </section>
  `,
})
export class EngineeringIndexPage implements OnInit {
  private readonly seo = inject(SeoService);
  readonly selected = signal('All studies');
  readonly categories = [
    'All studies',
    ...new Set(engineeringStudies.map((study) => study.category)),
  ];
  readonly filtered = computed(() =>
    engineeringStudies.filter(
      (study) => this.selected() === 'All studies' || study.category === this.selected(),
    ),
  );

  ngOnInit(): void {
    this.seo.update({
      title: 'Engineering Studies — Vitalii Napastiuk',
      description:
        'Frontend engineering investigations, working experiments, architectural decisions and their tradeoffs.',
      path: '/engineering',
    });
  }
}
