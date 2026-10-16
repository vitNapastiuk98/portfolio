import type { Project } from '../models/content.models';

/**
 * The manifest is intentionally conservative. A project is visible only when its
 * status is changed to `published` or `public-summary-only` after approval.
 */
export const projects: readonly Project[] = [
  {
    slug: 'ts-reactivity-engine',
    title: 'TypeScript Reactivity Engine',
    category: 'Runtime Architecture / TypeScript',
    organization: 'Independent / Open Source',
    summary:
      'A zero-dependency reactive runtime built from first principles to study signals, effects, batching, lazy computed values, ownership, and cycle detection.',
    contributions: [
      'Dependency graph design',
      'Signals and effects',
      'Batched reactive updates',
      'Lazy push-pull evaluation',
      'Ownership and disposal',
      'Cycle detection',
    ],
    publicationStatus: 'published',
    ownership: 'independent',
    url: 'https://github.com/vitNapastiuk98/ts-reactivity-engine',
    technologies: ['TypeScript', 'Signals', 'Computed values', 'Effects', 'Linked signals'],
    details: [
      'An educational runtime for understanding what happens underneath fine-grained reactive interfaces. The repository implements the primitives directly rather than wrapping a framework.',
      'Signals track their consumers, computed values evaluate on demand, and effects respond to changes. Batching groups writes; ownership and disposal clean up subscriptions when work is no longer needed.',
      'The implementation and examples make the dependency graph, update cycle and cleanup behavior available to inspect and experiment with.',
    ],
  },
  {
    slug: 'visual-kapital',
    title: 'Visual Kapital',
    demoUrl: 'https://www.youtube.com/watch?v=8PpHj_BgPuM',
    category: 'Mobile / Fintech',
    organization: 'Independent product / Android release',
    featured: true,
    summary:
      'A personal asset tracking application bringing financial dashboards, external data integrations, subscriptions, and AI-assisted analysis into a Kotlin Multiplatform product shipped on Android.',
    contributions: [
      'Application modules',
      'Financial dashboards',
      'External financial data integrations',
      'Subscription functionality',
      'AI-assisted analysis',
    ],
    publicationStatus: 'public-summary-only',
    ownership: 'hackathon',
    technologies: ['Kotlin Multiplatform', 'Android', 'Financial data integrations'],
    details: [
      'A mobile product focused on bringing personal asset information into a financial dashboard. The application was shipped on Android, moving the work beyond a design concept into a delivered user experience.',
      'The work covered application modules, financial dashboards, external data integrations, subscription functionality and AI-assisted analysis.',
      'Kotlin Multiplatform provides the shared application foundation, with Android as the shipped platform.',
    ],
  },
  {
    slug: 'task-around-website',
    title: 'TaskAround Website',
    category: 'Web / Local Marketplace',
    organization: 'TaskAround / Algonova repository',
    summary:
      'An unpublished Nuxt website project for TaskAround, connecting people who need help with local service providers.',
    contributions: [
      'Vue and Nuxt website development',
      'Local service discovery pages',
      'Task posting and tasker entry points',
      'Multilingual website content',
    ],
    publicationStatus: 'public-summary-only',
    ownership: 'independent',
    url: 'https://github.com/algonova-io/taskaround_website2.0',
    technologies: ['Vue 3', 'Nuxt 4', 'TypeScript', 'Internationalization'],
    details: [
      'The project includes step-by-step flows for creating a task and becoming a tasker, alongside service-provider profiles and discovery pages.',
      'Built with Vue 3 and Nuxt 4, it includes multilingual content and routes organized around cities, service categories and provider profiles.',
      'The website has not been published. The repository is available to inspect the project and its documented setup.',
    ],
  },
  {
    slug: 'white-label-restaurant',
    title: 'White-label Restaurant Platform',
    category: 'SaaS / Restaurant Operations',
    organization: 'Independent',
    summary:
      'An Angular and NestJS platform for restaurant websites, menus, events and table reservations, with configurable branding and an administration dashboard.',
    contributions: [
      'Angular customer website and admin dashboard',
      'NestJS and TypeScript REST API',
      'Menus, events and reservation management',
      'JWT administrator authentication',
      'MongoDB persistence',
      'Restaurant branding and localization',
    ],
    publicationStatus: 'public-summary-only',
    ownership: 'independent',
    url: 'https://github.com/vitNapastiuk98/whitelabelRestaurant',
    technologies: ['Angular 19', 'TypeScript', 'NestJS', 'MongoDB', 'RxJS', 'SCSS'],
    details: [
      'A monorepo with an Angular client and a Node.js API. Restaurant operators manage the content that customers see on their public website: menus, categories, events, reservations and restaurant information.',
      'White-label configuration covers the restaurant identity, including logo, theme, social links and about content. An authenticated administration area keeps editing separate from the customer-facing pages.',
      'The API uses NestJS, TypeScript and MongoDB with Mongoose. Resource controllers handle restaurant configuration, authentication, menu categories, reservations and events.',
    ],
  },
];

export const publicProjects = projects.filter(
  ({ publicationStatus }) =>
    publicationStatus === 'published' || publicationStatus === 'public-summary-only',
);
