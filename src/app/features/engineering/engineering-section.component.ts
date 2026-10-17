import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { writingPreviews } from '../../data/writing-previews.data';
import { featuredEngineeringStudies } from '../../data/engineering-previews.data';

@Component({
  selector: 'app-engineering-section',
  imports: [RouterLink],
  template: `
    <section class="engineering-home section-shell" aria-labelledby="engineering-title">
      <span id="writing" class="publication-anchor" aria-hidden="true"></span>
      <header class="showcase-heading">
        <div>
          <p class="showcase-kicker">Ideas & engineering</p>
          <h2 id="engineering-title">Engineering & Writing</h2>
        </div>
        <p>Angular, architecture and the browser platform. Studies and articles in one place.</p>
      </header>
      <div class="engineering-index__grid">
        @for (study of featured; track study.path) {
          <a class="engineering-card" [routerLink]="study.path">
            <div class="engineering-card__meta">
              <span>{{ study.category }}</span>
              <span>{{ study.kind }}</span>
            </div>
            <h3>{{ study.title }}</h3>
            <p>{{ study.summary }}</p>
            <span class="engineering-card__link">Read more <i aria-hidden="true">↗</i></span>
          </a>
        }
      </div>
      <a class="text-link engineering-home__all" routerLink="/engineering">
        Browse all studies & writing <span aria-hidden="true">↗</span>
      </a>
    </section>
  `,
})
export class EngineeringSectionComponent {
  readonly featured = [
    ...featuredEngineeringStudies.map((study) => ({
      slug: study.slug,
      title: study.shortTitle,
      summary: study.evidenceSummary,
      category: study.category,
      kind: 'Study',
      path: `/engineering/${study.slug}`,
    })),
    ...writingPreviews.slice(0, 3),
  ];
}
