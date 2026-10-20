import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { professionalPreviews } from '../../data/professional-previews.data';

@Component({
  selector: 'app-work-preview',
  imports: [RouterLink],
  template: `
    <section class="professional-work" aria-labelledby="work-preview-title">
      <div class="section-shell">
        <header class="showcase-heading">
          <div>
            <p class="showcase-kicker">03 / Selected Engineering Work</p>
            <h2 id="work-preview-title">Engineering Beyond the Interface</h2>
          </div>
          <div class="professional-work__intro">
            <p>
              The most interesting engineering decisions rarely happen in isolation. They emerge
              from real constraints: complex business workflows, evolving requirements, distributed
              systems, performance, and the need to keep software maintainable as it grows.
            </p>
            <p>
              These studies explore architectural decisions, implementation approaches, and
              trade-offs drawn from my work on enterprise applications, AI products, and real-time
              systems.
            </p>
          </div>
        </header>
        <div class="professional-work__grid">
          @for (
            study of studies;
            track study.slug;
            let index = $index;
            let first = $first;
            let last = $last
          ) {
            <a
              class="professional-card"
              [class.professional-card--featured]="first"
              [class.professional-card--wide]="first || last"
              [routerLink]="['/case-studies', study.slug]"
            >
              <div class="professional-card__copy">
                <p class="professional-card__meta">
                  <span>{{ (index + 1).toString().padStart(2, '0') }}</span> / {{ study.category }}
                </p>
                <h3>{{ study.title }}</h3>
                <p>{{ study.summary }}</p>
                <ul class="study-metadata" aria-label="Technologies">
                  @for (tech of study.technologies; track tech) {
                    <li>{{ tech }}</li>
                  }
                </ul>
                <span class="professional-card__link"
                  >Read the case study <span aria-hidden="true">↗</span></span
                >
              </div>
              <ol class="professional-card__flow" aria-label="Architectural responsibilities">
                @for (step of study.previewFlow; track step) {
                  <li>{{ step }}</li>
                }
              </ol>
            </a>
          }
        </div>
        <aside class="professional-work__independent">
          <div>
            <h3>Beyond the studies</h3>
            <p>
              Explore independently built products, experimental implementations, and open-source
              engineering work.
            </p>
          </div>
          <a class="text-link" routerLink="/projects"
            >View Independent Projects <span aria-hidden="true">↗</span></a
          >
        </aside>
      </div>
    </section>
  `,
})
export class WorkPreviewComponent {
  readonly studies = professionalPreviews;
}
