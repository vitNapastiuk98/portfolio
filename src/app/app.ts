import { RouteFocusDirective } from './animations/route-focus.directive';
import { Component, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SiteFooterComponent } from './layout/site-footer.component';
import { SiteHeaderComponent } from './layout/site-header.component';
import { PointerPulseComponent } from './shared/pointer-pulse.component';

@Component({
  selector: 'app-root',
  imports: [
    RouteFocusDirective,
    RouterOutlet,
    SiteFooterComponent,
    SiteHeaderComponent,
    PointerPulseComponent,
  ],
  template: `
    <a class="skip-link" [attr.href]="router.url.split('#')[0] + '#main-content'"
      >Skip to content</a
    >
    <app-site-header />
    <main appRouteFocus id="main-content" tabindex="-1"><router-outlet /></main>
    <app-site-footer />
    <app-pointer-pulse />
  `,
})
export class App {
  protected readonly router = inject(Router);

  constructor() {
    inject(ViewportScroller).setOffset([0, 96]);
  }
}
