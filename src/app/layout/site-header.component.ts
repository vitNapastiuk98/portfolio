import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { profile } from '../data/profile.data';

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header" [class.menu-open]="menuOpen()">
      <a
        class="header-identity"
        routerLink="/"
        fragment="home"
        aria-label="VN — Vitalii Napastiuk, Senior Engineer — home"
      >
        <strong>VN</strong><span aria-hidden="true">/</span>
        <small>Senior<br />Engineer</small>
      </a>
      <nav id="primary-navigation" aria-label="Primary navigation">
        @for (item of navigation; track item.fragment) {
          <a
            routerLink="/"
            [fragment]="item.fragment"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{
              paths: 'exact',
              queryParams: 'ignored',
              matrixParams: 'ignored',
              fragment: 'exact',
            }"
          >
            <span>{{ item.index }}</span
            ><b>{{ item.label }}</b>
          </a>
        }
      </nav>
      <a class="header-contact" [href]="'mailto:' + profile.email">
        <span>Available / Remote</span><strong>Contact ↗</strong>
      </a>
      <button
        class="menu-button"
        type="button"
        (click)="toggleMenu()"
        [attr.aria-expanded]="menuOpen()"
        aria-controls="primary-navigation"
        [attr.aria-label]="menuOpen() ? 'Close navigation' : 'Open navigation'"
      >
        <span></span><span></span>
      </button>
      <div class="header-progress" aria-hidden="true"></div>
    </header>
  `,
})
export class SiteHeaderComponent {
  private readonly platformId = inject(PLATFORM_ID);
  readonly menuOpen = signal(false);
  readonly profile = profile;
  readonly navigation = [
    { index: '01', label: 'Expertise', fragment: 'expertise' },
    { index: '02', label: 'Work', fragment: 'work' },
    { index: '03', label: 'Experience', fragment: 'experience' },
    { index: '04', label: 'Writing', fragment: 'writing' },
    { index: '05', label: 'Contact', fragment: 'contact' },
  ] as const;

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        if (isPlatformBrowser(this.platformId)) document.body.classList.remove('navigation-open');
      });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('navigation-open', this.menuOpen());
    }
  }

  @HostListener('document:keydown.escape')
  closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (isPlatformBrowser(this.platformId)) document.body.classList.remove('navigation-open');
  }
}
