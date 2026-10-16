import { Component, input } from '@angular/core';
import { RevealDirective } from '../../animations/reveal.directive';
import { expertiseAreas } from '../../data/profile.data';

@Component({
  selector: 'app-expertise-section',
  imports: [RevealDirective],
  template: `
    <section
      class="expertise-section"
      [class.page-version]="standalone()"
      aria-labelledby="expertise-heading"
    >
      @if (standalone()) {
        <h2 id="expertise-heading" class="sr-only">My Expertise</h2>
      } @else {
        <header class="showcase-heading" appReveal>
          <div>
            <p class="showcase-kicker">02 / Expertise</p>
            <h2 id="expertise-heading">My Expertise</h2>
          </div>
          <p>
            My work spans web applications, AI interfaces, real-time communication, and the services
            behind them.
          </p>
        </header>
      }

      <div class="expertise-list">
        @for (area of areas; track area.index) {
          <article class="expertise-row" appReveal [revealDelay]="$index * 0.04">
            <div class="expertise-index">{{ area.index }}</div>
            <div class="expertise-title">
              <p>{{ area.shortTitle }}</p>
              <h3>{{ area.title }}</h3>
            </div>
            <p class="expertise-description">{{ area.description }}</p>
            <ul aria-label="Technologies and capabilities">
              @for (capability of area.capabilities; track capability) {
                <li>{{ capability }}</li>
              }
            </ul>
          </article>
        }
      </div>
    </section>
  `,
})
export class ExpertiseSectionComponent {
  readonly standalone = input(false);
  readonly areas = expertiseAreas;
}
