import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';

@Directive({ selector: '[appHeroMotion]' })
export class HeroMotionDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    afterNextRender(async () => {
      const reduced =
        typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!isPlatformBrowser(this.platformId) || reduced) return;

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: 'power4.out' } })
          .from('[data-hero-meta]', { opacity: 0, y: -12, duration: 0.55 }, 0.05)
          .from(
            '[data-hero-line] > span',
            { yPercent: 112, rotate: 1.5, duration: 1.15, stagger: 0.1 },
            0.08,
          )
          .from(
            '[data-hero-scene]',
            { opacity: 0, scale: 0.9, rotate: -2, duration: 1.2 },
            0.28,
          )
          .from('[data-hero-copy]', { opacity: 0, y: 22, duration: 0.8 }, 0.62)
          .from(
            '[data-hero-action]',
            { opacity: 0, x: -16, duration: 0.55, stagger: 0.07 },
            0.78,
          )
          .from('[data-hero-foot]', { opacity: 0, duration: 0.55 }, 0.9);

        gsap
          .timeline({
            scrollTrigger: {
              trigger: this.element,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.7,
            },
          })
          .to('[data-hero-line="first"]', { xPercent: -5, opacity: 0.28, ease: 'none' }, 0)
          .to('[data-hero-line="second"]', { xPercent: 6, opacity: 0.22, ease: 'none' }, 0)
          .to('[data-hero-scene]', { yPercent: 13, scale: 0.93, ease: 'none' }, 0)
          .to('[data-hero-copy]', { yPercent: -18, ease: 'none' }, 0);
      }, this.element);

      this.destroyRef.onDestroy(() => context.revert());
    });
  }
}
