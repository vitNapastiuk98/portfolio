import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

describe('static route manifest', () => {
  it('prerenders public article and project detail routes', async () => {
    const articleRoute = serverRoutes.find(({ path }) => path === 'blog/:slug');
    expect(articleRoute?.renderMode).toBe(RenderMode.Prerender);
    expect(articleRoute && 'getPrerenderParams' in articleRoute).toBe(true);
    if (articleRoute && 'getPrerenderParams' in articleRoute) {
      await expect(articleRoute.getPrerenderParams()).resolves.toEqual([
        { slug: 'deconstructing-reactivity' },
        { slug: 'bypass-angular-interceptors' },
      ]);
    }
    const projectRoute = serverRoutes.find(({ path }) => path === 'work/:slug');
    expect(projectRoute?.renderMode).toBe(RenderMode.Prerender);
    expect(projectRoute && 'getPrerenderParams' in projectRoute).toBe(true);
    if (projectRoute && 'getPrerenderParams' in projectRoute) {
      await expect(projectRoute.getPrerenderParams()).resolves.toEqual([
        { slug: 'ts-reactivity-engine' },
        { slug: 'visual-kapital' },
        { slug: 'task-around-website' },
        { slug: 'white-label-restaurant' },
      ]);
    }
    expect(serverRoutes.at(-1)?.path).toBe('**');
  });
});
