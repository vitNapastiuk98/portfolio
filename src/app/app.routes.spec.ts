import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';

describe('application routes', () => {
  it.each([
    ['/expertise', '/#expertise'],
    ['/work', '/#work'],
    ['/experience', '/#experience'],
    ['/blog', '/#writing'],
    ['/contact', '/#contact'],
  ])('redirects the legacy section route %s to %s', async (legacyUrl, expectedUrl) => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
    const router = TestBed.inject(Router);

    await router.navigateByUrl(legacyUrl);

    expect(router.url).toBe(expectedUrl);
    TestBed.resetTestingModule();
  });

  it('includes articles, project records, and standalone engineering studies', () => {
    expect(routes.some(({ path }) => path === 'blog/:slug')).toBe(true);
    expect(routes.some(({ path }) => path === 'work/:slug')).toBe(true);
    expect(routes.some(({ path }) => path === 'engineering/:slug')).toBe(true);
    expect(routes.some(({ path }) => path === 'engineering')).toBe(true);
  });
});
