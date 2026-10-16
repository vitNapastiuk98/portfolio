import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';

@Component({
  selector: 'app-pointer-pulse',
  template: '<span class="pointer-dot"></span><span class="pointer-ring"></span>',
  host: { 'aria-hidden': 'true' },
})
export class PointerPulseComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(() => {
      if (
        !isPlatformBrowser(this.platformId) ||
        !matchMedia(
          '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        ).matches
      )
        return;

      const root = document.documentElement;
      let frame = 0;
      const hide = (): void => {
        cancelAnimationFrame(frame);
        frame = 0;
        this.host.classList.remove('is-visible');
        root.classList.remove('has-custom-pointer');
      };
      const move = (event: PointerEvent): void => {
        const target = event.target instanceof Element ? event.target : null;
        if (
          event.pointerType !== 'mouse' ||
          target?.closest(
            'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
          )
        ) {
          hide();
          return;
        }
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          this.host.style.setProperty('--pointer-x', `${event.clientX}px`);
          this.host.style.setProperty('--pointer-y', `${event.clientY}px`);
          this.host.classList.toggle(
            'is-interactive',
            Boolean(target?.closest('a, button, [role="button"]')),
          );
          this.host.classList.add('is-visible');
          root.classList.add('has-custom-pointer');
          frame = 0;
        });
      };

      window.addEventListener('pointermove', move, { passive: true });
      window.addEventListener('blur', hide);
      document.documentElement.addEventListener('pointerleave', hide);
      this.destroyRef.onDestroy(() => {
        hide();
        window.removeEventListener('pointermove', move);
        window.removeEventListener('blur', hide);
        document.documentElement.removeEventListener('pointerleave', hide);
      });
    });
  }
}
