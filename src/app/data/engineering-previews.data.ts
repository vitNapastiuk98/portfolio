import type { EngineeringStudy } from '../models/study.models';

type EngineeringPreview = Pick<
  EngineeringStudy,
  'slug' | 'shortTitle' | 'category' | 'studyType' | 'evidenceSummary'
>;

export const performancePreview = {
  slug: 'web-performance',
  shortTitle: 'Beyond Lighthouse — Web Performance',
  category: 'Frontend Engineering',
  studyType: 'conceptual',
  evidenceSummary:
    'Angular SSR, SSG, hydration, deferrable views and the browser metrics behind performance decisions.',
} as const satisfies EngineeringPreview;

export const accessibilityPreview = {
  slug: 'accessibility',
  shortTitle: 'Accessible by Design — Accessibility Engineering',
  category: 'Inclusive interfaces',
  studyType: 'conceptual',
  evidenceSummary:
    'Angular patterns for semantic templates, accessible forms, focus, dialogs and visual design.',
} as const satisfies EngineeringPreview;

export const architecturesPreview = {
  slug: 'angular-architectures',
  shortTitle: 'Angular Architectures — From Modules to DDD',
  category: 'Frontend Architecture',
  studyType: 'conceptual',
  evidenceSummary:
    'From NgModules and standalone routes to feature ownership, dependency inversion and domain boundaries.',
} as const satisfies EngineeringPreview;

export const dependencyInjectionPreview = {
  slug: 'angular-dependency-injection',
  shortTitle: 'Angular Dependency Injection — Contracts to Composition',
  category: 'Angular Dependency Injection',
  studyType: 'conceptual',
  evidenceSummary:
    'Tokens, services, factories and scopes through one feature with interchangeable REST and GraphQL backends.',
} as const satisfies EngineeringPreview;

export const featuredEngineeringStudies = [
  performancePreview,
  accessibilityPreview,
  architecturesPreview,
  dependencyInjectionPreview,
];
