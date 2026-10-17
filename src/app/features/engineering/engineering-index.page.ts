import type { OnInit } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { engineeringStudies } from '../../data/engineering-studies.data';
import { writingPreviews } from '../../data/writing-previews.data';

@Component({
  selector: 'app-engineering-index-page',
  imports: [RouterLink],
  template: `
    <section class="engineering-collection section-shell" aria-labelledby="collection-title">
      <header class="showcase-heading">
        <div>
          <a class="article-back" routerLink="/" fragment="engineering">← Portfolio</a>
          <p class="showcase-kicker">Ideas & engineering</p>
          <h1 id="collection-title">Engineering & Writing</h1>
        </div>
        <p>
          Angular, frontend architecture and the browser platform. All studies and articles in one
          collection.
        </p>
      </header>
      <div class="engineering-filters" role="group" aria-label="Filter publications by category">
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
        {{ filtered().length }} {{ filtered().length === 1 ? 'publication' : 'publications' }}
      </p>
      <div class="engineering-index__grid">
        @for (entry of filtered(); track entry.path) {
          <a class="engineering-card" [routerLink]="entry.path">
            <div class="engineering-card__meta">
              <span>{{ entry.category }}</span
              ><span>{{ entry.kind }}</span>
            </div>
            <h2>{{ entry.title }}</h2>
            <p>{{ entry.summary }}</p>
            <span class="engineering-card__link">Read more <i aria-hidden="true">↗</i></span>
          </a>
        }
      </div>
    </section>
  `,
})
export class EngineeringIndexPage implements OnInit {
  private readonly seo = inject(SeoService);
  readonly entries = [
    ...engineeringStudies.map((study) => ({
      title: study.title,
      summary: study.summary,
      category: study.category,
      kind: study.presentation === 'article' ? 'Article' : 'Study',
      path: `/engineering/${study.slug}`,
    })),
    ...writingPreviews,
  ];
  readonly selected = signal('All topics');
  readonly categories = ['All topics', ...new Set(this.entries.map((entry) => entry.category))];
  readonly filtered = computed(() =>
    this.entries.filter(
      (entry) => this.selected() === 'All topics' || entry.category === this.selected(),
    ),
  );

  ngOnInit(): void {
    this.seo.update({
      title: 'Engineering & Writing — Vitalii Napastiuk',
      description:
        'Angular, architecture, accessibility and web performance: studies and articles in one collection.',
      path: '/engineering',
    });
  }
}
