import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SeoService } from '../../core/seo.service';
import { publicProjects } from '../../data/projects.data';
import { ProjectVisualComponent } from '../../shared/project-visual.component';
import { StudyBodyComponent } from '../../shared/study-body.component';
import { projectStudies } from '../../data/project-studies.data';

@Component({
  selector: 'app-work-page',
  imports: [RouterLink, ProjectVisualComponent, StudyBodyComponent],
  template: `
    @if (project(); as item) {
      <article class="project-study">
        <header class="project-study__header">
          <a class="article-back" routerLink="/projects">← Independent Projects</a>
          <p class="eyebrow">{{ item.category }}</p>
          @if (item.featured) {
            <p class="study-featured">Featured product / Shipped on Android</p>
          }
          <h1>{{ item.title }}</h1>
          <p class="project-study__summary">{{ item.summary }}</p>
          @if (item.demoUrl) {
            <a class="text-link study-demo" [href]="item.demoUrl" target="_blank" rel="noreferrer"
              >Watch the product demo <span>↗</span></a
            >
          }
          <dl>
            <div>
              <dt>Context</dt>
              <dd>{{ item.organization }}</dd>
            </div>
            <div>
              <dt>{{ item.featured ? 'Delivery' : 'Source Code' }}</dt>
              <dd>
                {{
                  item.featured
                    ? 'Android application'
                    : item.url
                      ? 'Public source'
                      : 'Product overview'
                }}
              </dd>
            </div>
          </dl>
        </header>

        <div
          class="project-study__visual project-record__visual--{{ item.slug }}"
          aria-hidden="true"
        >
          <app-project-visual [slug]="item.slug" />
        </div>

        <section class="project-study__scope" aria-labelledby="project-scope-title">
          <p class="eyebrow">Engineering scope</p>
          <h2 id="project-scope-title">Engineering Scope</h2>
          @if (item.technologies; as technologies) {
            <p><strong>Stack:</strong> {{ technologies.join(' · ') }}</p>
          }
          @if (item.url) {
            <a class="text-link" [href]="item.url" target="_blank" rel="noreferrer">
              Inspect the source <span>↗</span>
            </a>
          }
        </section>
        @if (study(); as content) {
          <app-study-body [study]="content" [path]="'/work/' + item.slug" />
        }
        <nav class="study-related" aria-label="Continue exploring">
          <p class="eyebrow">Keep exploring</p>
          @for (related of relatedProjects(); track related.slug) {
            <a [routerLink]="['/work', related.slug]"
              ><span>{{ related.category }}</span
              ><strong>{{ related.title }}</strong
              ><i aria-hidden="true">↗</i></a
            >
          }
          <a routerLink="/" fragment="engineering"
            ><span>Beyond the projects</span><strong>Engineering design studies</strong
            ><i aria-hidden="true">↗</i></a
          >
        </nav>
      </article>
    } @else {
      <section class="not-found">
        <p class="eyebrow">Project unavailable</p>
        <h1>This project record is not public.</h1>
        <a class="button button--primary" routerLink="/projects">Independent Projects</a>
      </section>
    }
  `,
})
export class WorkPage {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );
  readonly project = computed(
    () => publicProjects.find(({ slug }) => slug === this.slug()) ?? null,
  );
  readonly study = computed(() => projectStudies[this.slug()] ?? null);
  readonly relatedProjects = computed(() =>
    publicProjects.filter((item) => item.slug !== this.slug()).slice(0, 2),
  );

  constructor() {
    effect(() => {
      const project = this.project();
      if (!project) {
        this.seo.update({
          title: 'Project not found — Vitalii Napastiuk',
          description: 'The requested project could not be found.',
          path: `/work/${this.slug()}`,
          noIndex: true,
        });
        return;
      }
      this.seo.update({
        title: `${project.title} — Vitalii Napastiuk`,
        description: project.summary,
        path: `/work/${project.slug}`,
      });
    });
  }
}
