import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HeroSceneComponent } from './hero-scene.component';

describe('HeroSceneComponent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    ['mobile Safari', true, 4],
    ['a desktop with four CPU cores', false, 4],
  ])('mounts the WebGL scene on %s', async (_device, mobile, cores) => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query === '(max-width: 760px), (pointer: coarse)' && mobile,
      })),
    );
    vi.spyOn(navigator, 'hardwareConcurrency', 'get').mockReturnValue(cores);
    const scene = HeroSceneComponent.prototype as unknown as {
      supportsWebGl: () => boolean;
      mountScene: () => Promise<void>;
    };
    vi.spyOn(scene, 'supportsWebGl').mockReturnValue(true);
    const mount = vi.spyOn(scene, 'mountScene').mockResolvedValue();

    await TestBed.configureTestingModule({
      imports: [HeroSceneComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeroSceneComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mount).toHaveBeenCalledOnce();
  });

  it('retains the static fallback when WebGL mounting rejects', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );
    vi.spyOn(navigator, 'hardwareConcurrency', 'get').mockReturnValue(8);
    const scene = HeroSceneComponent.prototype as unknown as {
      supportsWebGl: () => boolean;
      mountScene: () => Promise<void>;
    };
    vi.spyOn(scene, 'supportsWebGl').mockReturnValue(true);
    await TestBed.configureTestingModule({
      imports: [HeroSceneComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeroSceneComponent);
    const mount = vi.spyOn(scene, 'mountScene').mockImplementation(() => {
      const host = (fixture.nativeElement as HTMLElement).querySelector('.scene-host')!;
      host.classList.add('has-webgl');
      host.appendChild(document.createElement('canvas'));
      return Promise.reject(new Error('Renderer initialization failed'));
    });

    fixture.detectChanges();
    await fixture.whenStable();

    const host = (fixture.nativeElement as HTMLElement).querySelector('.scene-host');
    expect(mount).toHaveBeenCalledOnce();
    expect(host?.classList.contains('has-webgl')).toBe(false);
    expect(host?.querySelector('canvas')).toBeNull();
    expect(host?.querySelector('.scene-fallback')).toBeTruthy();
  });

  it('renders an accessible static fallback without browser APIs on server', async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSceneComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeroSceneComponent);
    fixture.detectChanges();

    const figure: HTMLElement | null = fixture.nativeElement.querySelector('[role="img"]');
    expect(figure?.getAttribute('aria-label')).toContain('signal lattice');
    expect(figure?.querySelector('.scene-fallback')?.children).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('canvas')).toBeNull();
  });
});
