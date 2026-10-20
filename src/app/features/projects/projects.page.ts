import { Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../animations/reveal.directive';
import { publicProjects } from '../../data/projects.data';
import { ProjectVisualComponent } from '../../shared/project-visual.component';

@Component({
  selector: 'app-projects-page',
  imports: [RouterLink, RevealDirective, ProjectVisualComponent],
  template: `
    <section
      class="work-preview section-shell independent-projects"
      aria-labelledby="work-preview-title"
    >
      <header class="showcase-heading" appReveal>
        <div>
          <p class="showcase-kicker">Independent projects</p>
          <h1 id="work-preview-title">Independent Projects</h1>
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
            <h2>{{ item.title }}</h2>
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
              <a [routerLink]="['/work', item.slug]">Explore the engineering study ↗</a>
            </div>
          </div>
        </article>
      }
    </section>
  `,
})
export class ProjectsPage implements OnInit {
  private readonly seo = inject(SeoService);
  ngOnInit(): void {
    this.seo.update({
      title: 'Independent Projects — Vitalii Napastiuk',
      description: 'Independently built products, experiments and open-source engineering work.',
      path: '/projects',
    });
  }
  readonly projects = [...publicProjects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  );
}
