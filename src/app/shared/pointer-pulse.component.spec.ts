import { TestBed } from '@angular/core/testing';
import { PointerPulseComponent } from './pointer-pulse.component';

describe('PointerPulseComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses the custom pointer for a mouse, responds to links, and restores it on blur and teardown', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    let render: FrameRequestCallback = () => undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      render = callback;
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(PointerPulseComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const link = document.createElement('a');
    host.appendChild(link);
    document.body.appendChild(host);
    const move = (target: Element, pointerType = 'mouse'): void => {
      target.dispatchEvent(
        Object.assign(
          new MouseEvent('pointermove', {
            bubbles: true,
            clientX: 120,
            clientY: 80,
          }),
          { pointerType },
        ),
      );
    };

    expect(document.documentElement.classList.contains('has-custom-pointer')).toBe(false);
    move(link);
    render(0);
    expect(host.style.getPropertyValue('--pointer-x')).toBe('120px');
    expect(host.classList.contains('is-interactive')).toBe(true);
    expect(document.documentElement.classList.contains('has-custom-pointer')).toBe(true);

    const input = document.createElement('input');
    host.appendChild(input);
    move(input);
    expect(host.classList.contains('is-visible')).toBe(false);
    expect(document.documentElement.classList.contains('has-custom-pointer')).toBe(false);

    move(link);
    render(0);
    window.dispatchEvent(new Event('blur'));
    expect(document.documentElement.classList.contains('has-custom-pointer')).toBe(false);
    move(link, 'touch');
    expect(host.classList.contains('is-visible')).toBe(false);

    move(link);
    render(0);
    fixture.destroy();
    expect(document.documentElement.classList.contains('has-custom-pointer')).toBe(false);
    host.remove();
  });

  it('keeps standard behavior when motion or pointer capabilities do not match', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false })),
    );
    const fixture = TestBed.createComponent(PointerPulseComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    window.dispatchEvent(Object.assign(new MouseEvent('pointermove'), { pointerType: 'mouse' }));
    expect(document.documentElement.classList.contains('has-custom-pointer')).toBe(false);
  });
});
