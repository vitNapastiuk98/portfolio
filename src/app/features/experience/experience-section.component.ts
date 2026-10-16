import { Component, input } from '@angular/core';
import { RevealDirective } from '../../animations/reveal.directive';
import { experience } from '../../data/profile.data';

@Component({
  selector: 'app-experience-section',
  imports: [RevealDirective],
  template: `
    <section
      class="experience-section section-shell"
      [class.page-version]="standalone()"
      aria-labelledby="experience-heading"
    >
      @if (standalone()) {
        <h2 id="experience-heading" class="sr-only">Professional experience</h2>
      } @else {
        <header class="showcase-heading" appReveal>
          <div>
            <p class="showcase-kicker">04 / Experience</p>
            <h2 id="experience-heading">Experience</h2>
          </div>
          <p>Frontend architecture, real-time products, and AI SaaS.</p>
        </header>
      }

      <div class="experience-ledger">
        @for (item of items; track item.organization; let index = $index) {
          <article class="experience-entry" appReveal>
            <div class="experience-entry__summary">
              <div class="experience-entry__meta">
                <span class="experience-entry__index">{{
                  (index + 1).toString().padStart(2, '0')
                }}</span>
                <p class="experience-entry__period">{{ item.period }}</p>
              </div>
              <p>{{ item.organization }}</p>
              <h3>{{ item.role }}</h3>
            </div>
            <div class="experience-entry__scope">
              <p>{{ item.description }}</p>
              <ul aria-label="Responsibilities">
                @for (responsibility of item.responsibilities; track responsibility) {
                  <li>{{ responsibility }}</li>
                }
              </ul>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class ExperienceSectionComponent {
  readonly standalone = input(false);
  readonly items = experience;
}
