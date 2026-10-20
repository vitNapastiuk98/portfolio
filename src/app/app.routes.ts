import { inject } from '@angular/core';
import { Router, type RedirectFunction, type Routes } from '@angular/router';

const redirectToSection =
  (fragment: string): RedirectFunction =>
  () =>
    inject(Router).createUrlTree(['/'], { fragment });

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.page').then((module) => module.HomePage),
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/projects.page').then((m) => m.ProjectsPage),
  },
  {
    path: 'case-studies/:slug',
    loadComponent: () =>
      import('./features/case-studies/case-study.page').then((m) => m.CaseStudyPage),
  },
  {
    path: 'engineering',
    loadComponent: () =>
      import('./features/engineering/engineering-index.page').then(
        (module) => module.EngineeringIndexPage,
      ),
  },
  {
    path: 'engineering/:slug',
    loadComponent: () =>
      import('./features/engineering/engineering.page').then((module) => module.EngineeringPage),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/article.page').then((module) => module.ArticlePage),
  },
  {
    path: 'work/:slug',
    loadComponent: () => import('./features/work/work.page').then((module) => module.WorkPage),
  },
  {
    path: 'expertise',
    redirectTo: redirectToSection('expertise'),
    pathMatch: 'full',
  },
  {
    path: 'work',
    redirectTo: redirectToSection('work'),
    pathMatch: 'full',
  },
  {
    path: 'experience',
    redirectTo: redirectToSection('experience'),
    pathMatch: 'full',
  },
  {
    path: 'blog',
    redirectTo: redirectToSection('writing'),
    pathMatch: 'full',
  },
  {
    path: 'contact',
    redirectTo: redirectToSection('contact'),
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found.page').then((module) => module.NotFoundPage),
  },
];
