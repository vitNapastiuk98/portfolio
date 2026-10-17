import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { profile } from '../data/profile.data';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div>
        <a class="footer-name" routerLink="/" fragment="home">Vitalii Napastiuk</a>
        <p>Senior Software Engineer · Rome, Italy</p>
      </div>
      <div class="footer-links" aria-label="Professional links">
        <a [href]="profile.resumeUrl" target="_blank" rel="noreferrer"
          >Resume (PDF) <span>↗</span></a
        >
        <a [href]="profile.github" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
        <a [href]="profile.linkedin" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
        <a [href]="profile.medium" target="_blank" rel="noreferrer">Medium <span>↗</span></a>
        <a routerLink="/engineering">Engineering studies <span>↗</span></a>
        <a [href]="'mailto:' + profile.email">Email <span>↗</span></a>
      </div>
      <p class="footer-meta">© {{ year }} · Built with Angular and Three.js.</p>
    </footer>
  `,
})
export class SiteFooterComponent {
  readonly profile = profile;
  readonly year = new Date().getFullYear();
}
