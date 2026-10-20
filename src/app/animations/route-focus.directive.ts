import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { afterNextRender, Directive, inject, Injector, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

@Directive({ selector: '[appRouteFocus]' })
export class RouteFocusDirective {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly platform = inject(PLATFORM_ID);
  constructor() {
    let previousPath: string | null = null;
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (!(event instanceof NavigationEnd)) return;
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        const changed = previousPath !== null && path !== previousPath;
        previousPath = path;
        if (!changed || event.urlAfterRedirects.includes('#') || !isPlatformBrowser(this.platform))
          return;
        afterNextRender(
          () => {
            const heading = this.document.querySelector<HTMLElement>('main h1');
            if (!heading) return;
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
          },
          { injector: this.injector },
        );
      });
  }
}
