import type { ServerRoute } from '@angular/ssr';
import { PrerenderFallback, RenderMode } from '@angular/ssr';
import { blogPosts } from '../generated/blog-posts.generated';
import { publicProjects } from './data/projects.data';
import { engineeringStudies } from './data/engineering-studies.data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'engineering/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return engineeringStudies.map(({ slug }) => ({ slug }));
    },
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return blogPosts.map(({ slug }) => ({ slug }));
    },
  },
  {
    path: 'work/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return publicProjects.map(({ slug }) => ({ slug }));
    },
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
