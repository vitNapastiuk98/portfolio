import { Component } from '@angular/core';
import { RevealDirective } from '../../animations/reveal.directive';
import { publicProjects } from '../../data/projects.data';
import { ProjectVisualComponent } from '../../shared/project-visual.component';

@Component({
  selector: 'app-work-preview',
  imports: [RevealDirective, ProjectVisualComponent],
  template: `
    <section class="work-preview section-shell" aria-labelledby="work-preview-title">
      <header class="showcase-heading" appReveal>
        <div>
          <p class="showcase-kicker">03 / Selected work</p>
          <h2 id="work-preview-title">Selected Work</h2>
        </div>
        <p>Shipped products, inspectable systems, and the engineering decisions behind them.</p>
      </header>

      @for (item of projects; track item.slug; let index = $index) {
        <article class="project-stage" appReveal>
          <div
            class="project-stage__visual project-record__visual--{{ item.slug }}"
            aria-hidden="true"
          >
            <app-project-visual [slug]="item.slug" />
          </div>
          <div class="project-stage__copy">
            @if (item.featured) {
              <p class="study-featured">Featured product / Shipped on Android</p>
            }
            <div class="project-stage__meta">
              <span>{{ item.category }}</span
              ><span>{{ (index + 1).toString().padStart(2, '0') }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <ul>
              @for (contribution of item.contributions; track contribution) {
                <li>{{ contribution }}</li>
              }
            </ul>
            <div class="project-stage__links">
              @if (item.demoUrl) {
                <a [href]="item.demoUrl" target="_blank" rel="noreferrer">Watch demo ↗</a>
              }
              @if (item.url) {
                <a [href]="item.url" target="_blank" rel="noreferrer">Inspect source ↗</a>
              }
              <a [href]="'/work/' + item.slug">Explore the engineering study ↗</a>
            </div>
          </div>
        </article>
      }
    </section>
  `,
})
export class WorkPreviewComponent {
  readonly projects = [...publicProjects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );
}
