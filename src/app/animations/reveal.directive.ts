import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';

@Directive({ selector: '[appReveal]' })
export class RevealDirective {
  readonly revealDelay = input(0);
  readonly revealMode = input<'soft' | 'wipe'>('soft');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(async () => {
      if (!isPlatformBrowser(this.platformId) || typeof matchMedia !== 'function') return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const wipe = this.revealMode() === 'wipe' && matchMedia('(min-width: 768px)').matches;
      const animation = gsap.fromTo(
        this.element,
        wipe
          ? { y: 36, clipPath: 'inset(0 0 100% 0)' }
          : { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: wipe ? 0.78 : 0.64,
          delay: this.revealDelay(),
          ease: 'power3.out',
          scrollTrigger: { trigger: this.element, start: 'top 94%', once: true },
        },
      );

      this.destroyRef.onDestroy(() => {
        animation.scrollTrigger?.kill();
        animation.kill();
      });
    });
  }
}
