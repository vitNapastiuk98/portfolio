import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../core/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `<section class="not-found">
    <p class="eyebrow">404 / Off the map</p>
    <h1>This route has no system behind it.</h1>
    <a class="button button--primary" routerLink="/">Return home <span>↗</span></a>
  </section>`,
})
export class NotFoundPage implements OnInit {
  private readonly seo = inject(SeoService);
  ngOnInit(): void {
    this.seo.update({
      title: 'Page not found — Vitalii Napastiuk',
      description: 'The requested page could not be found.',
      path: '/404',
      noIndex: true,
    });
  }
}
