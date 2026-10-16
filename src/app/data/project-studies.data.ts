import type { StudyContent } from '../models/study.models';

export const projectStudies: Readonly<Record<string, StudyContent>> = {
  'ts-reactivity-engine': {
    lead: 'I built this zero-dependency TypeScript runtime to study how signals, computed values, and effects work beneath a framework. Four implementations develop dependency cleanup, lazy evaluation, batching, ownership, and cycle detection, with source code available for each stage.',
    scopeNote:
      'This is an educational runtime with happy-path demos and limited automated verification. It does not establish production guarantees for scheduling or error recovery.',
    sections: [
      {
        id: 'changing-dependencies',
        label: 'Dependency graph',
        title: 'Updating the dependency graph',
        paragraphs: [
          'The repository starts from signals and effects, then develops the mechanisms needed to keep them useful. A signal stores a value; an effect reads values and reacts when they change. Those reads establish dependencies. The central difficulty is that the set of reads can change on the next execution: a conditional branch may stop consulting one signal and start consulting another.',
          'The developer log addresses this with dependency cleanup before an effect reruns. Previous subscriptions are removed, then the current execution establishes the relationships it actually needs. This is the difference between a graph that reflects the current computation and a growing list of everything the computation has ever touched. The latter produces the zombie listeners called out in the README.',
        ],
      },
      {
        id: 'consistent-updates',
        label: 'Scheduling',
        title: 'Batching and lazy evaluation',
        paragraphs: [
          'Immediate notification becomes awkward when two derived values depend on the same upstream signal and a downstream effect reads both. The diamond-shaped dependency graph exposes an ordering problem: an effect can observe one updated branch alongside another branch that still contains an older value.',
          'The documented progression introduces a global update queue and batch boundaries, then explores lazy push–pull evaluation and topological consistency. These ideas make different responsibilities explicit: writes invalidate work, reads establish which derived values are needed, and scheduling determines when observers run. Batching is useful because the visible unit of change can contain several writes rather than each individual assignment.',
        ],
      },
      {
        id: 'runtime-boundaries',
        label: 'Lifecycle',
        title: 'Effect ownership and cycle detection',
        paragraphs: [
          'Ownership-based cleanup and execution-stack cycle detection extend the exercise beyond value propagation. Cleanup asks which effects belong to an operation and when that work should stop listening. Cycle detection asks what happens when reactive execution feeds back into itself. The README describes descriptive errors for infinite loops, making a failure inspectable instead of allowing unbounded recursion.',
          'The source is organized as four stages: basic signal propagation, dependency cleanup, lazy computed values, and a complete experiment combining the mechanisms. That progression makes it possible to compare the bookkeeping and scheduling choices directly rather than infer them from a framework API.',
        ],
      },
    ],
    flow: {
      title: 'From write to observation',
      steps: [
        {
          title: 'Read',
          detail: 'An active computation reads signals and establishes its dependencies.',
        },
        {
          title: 'Invalidate',
          detail: 'A write marks dependent work as needing another evaluation.',
        },
        {
          title: 'Coordinate',
          detail: 'Batching and lazy evaluation coordinate when dependent work becomes current.',
        },
        {
          title: 'Observe',
          detail: 'Effects consume updated values; ownership gives that work a cleanup boundary.',
        },
      ],
    },
    decisions: [
      {
        title: 'Build without dependencies',
        choice: 'Keep the mechanics visible in a standalone TypeScript experiment.',
        tradeoff:
          'The project teaches the runtime itself, while taking responsibility for behavior a mature library already handles.',
      },
      {
        title: 'Rebuild subscriptions on execution',
        choice: 'Remove previous dependencies before collecting the next set of reads.',
        tradeoff:
          'Each execution performs bookkeeping so obsolete branches stop receiving notifications.',
      },
      {
        title: 'Coordinate propagation',
        choice: 'Explore queued batching alongside lazy push–pull evaluation.',
        tradeoff:
          'A more involved scheduler must preserve understandable execution order and coherent reads.',
      },
      {
        title: 'Prefer an inspectable progression',
        choice: 'Present successive architectural stages with their limitations.',
        tradeoff:
          'Educational clarity takes priority over tuning and a production-support promise.',
      },
    ],
    references: [
      {
        label: 'Public source and architectural progression',
        url: 'https://github.com/vitNapastiuk98/ts-reactivity-engine',
      },
      {
        label: 'Developer log and documented limitations',
        url: 'https://github.com/vitNapastiuk98/ts-reactivity-engine/blob/main/Readme.md',
      },
    ],
  },
  'visual-kapital': {
    lead: 'Visual Kapital is a personal asset-tracking application built with Kotlin Multiplatform and shipped on Android. I contributed across the application, including financial dashboards, external data integrations, subscriptions, and AI-assisted analysis.',
    scopeNote:
      'This account covers my shareable contribution and Android delivery. The public video demonstrates the product; proprietary source, provider details, and unverified performance claims are excluded.',
    sections: [
      {
        id: 'asset-dashboard',
        label: 'Product',
        title: 'A mobile view of personal assets',
        paragraphs: [
          'The application brings personal asset information into financial dashboards. External financial data integrations supply information used by the product, while AI-assisted analysis provides an additional way to examine it. Subscription functionality is part of the application scope.',
          'The video linked above shows the product experience. It provides a concrete reference for the application described here without exposing its internal implementation.',
        ],
      },
      {
        id: 'contribution-and-delivery',
        label: 'Contribution and delivery',
        title: 'Application development through Android delivery',
        paragraphs: [
          'My work covered the application modules and financial dashboard, including the integration, subscription, and analysis functionality used within the product.',
          'The application was delivered on Android using a Kotlin Multiplatform foundation. The public demonstration is the release reference available for this case study.',
        ],
      },
    ],
    references: [
      {
        label: 'Public product demonstration by Vitalii Napastiuk',
        url: 'https://www.youtube.com/watch?v=8PpHj_BgPuM',
      },
    ],
  },
  'task-around-website': {
    lead: 'TaskAround Website 2.0 is a Nuxt and Vue website for a local-services marketplace. My contribution covered service discovery and two separate onboarding journeys: posting a task and becoming a service provider, or Tasker.',
    scopeNote:
      'The public repository documents an unpublished website. Automated tests are listed as future work; this case study describes the implementation without claiming production usage or verified journey completion.',
    sections: [
      {
        id: 'nuxt-structure',
        label: 'Frontend architecture',
        title: 'Route pages, reusable components, and shared logic',
        paragraphs: [
          'The Nuxt 4 application uses Vue 3 and TypeScript. Route pages live separately from reusable components, including wizards, profiles, and layout elements. Composables hold shared logic and state, while models define TypeScript interfaces and Zod schemas.',
          'Navigation middleware handles concerns such as city detection. Nuxt plugins initialize services such as Firebase, keeping service setup separate from individual page components. These boundaries make the discovery pages and onboarding flows parts of the same application without putting every responsibility into route templates.',
        ],
      },
      {
        id: 'localized-discovery',
        label: 'Routes and localization',
        title: 'Discover services by city, category, or provider',
        paragraphs: [
          'Dynamic routes organize the website around cities, service categories, and provider profiles. A visitor can enter at a local category page or an individual Tasker profile rather than starting from the homepage.',
          'The application uses Nuxt internationalization with locale resources stored separately from page components. Language is therefore part of the routing and content structure, alongside the city and service context. The documented service configuration also includes Google Maps and Firebase.',
        ],
      },
      {
        id: 'task-creation',
        label: 'Customer journey',
        title: 'Describe a task through a guided flow',
        paragraphs: [
          'The task-creation wizard structures the information a customer provides when requesting local help. It is a dedicated journey from discovery into task submission, with its own steps and form inputs.',
          'This flow uses the same component, composable, and model organization as the rest of the Nuxt application. Zod is included in the documented validation stack; complete end-to-end coverage remains future work in the repository.',
        ],
      },
      {
        id: 'tasker-onboarding',
        label: 'Provider journey',
        title: 'Give prospective Taskers a separate entry point',
        paragraphs: [
          'Becoming a Tasker is a separate wizard for people who want to offer services. Its purpose differs from posting a task: it introduces a provider into the marketplace rather than collecting a customer request.',
          'Keeping these journeys distinct allows their steps and guidance to reflect different user intentions while sharing the website layout, localization, and reusable interface components.',
        ],
      },
    ],
    references: [
      {
        label: 'Public Nuxt application source',
        url: 'https://github.com/algonova-io/taskaround_website2.0',
      },
      {
        label: 'Application structure, integrations, and setup',
        url: 'https://github.com/algonova-io/taskaround_website2.0/blob/main/README.md',
      },
    ],
  },
  'white-label-restaurant': {
    lead: 'I developed an Angular customer website and administration dashboard with an NestJS TypeScript API and MongoDB persistence. The platform combines configurable restaurant branding with menu, event, and reservation management in one repository.',
    scopeNote:
      'This account describes the public implementation. A production deployment, multi-tenant isolation, and reservation concurrency guarantees are outside the evidence available in the repository.',
    sections: [
      {
        id: 'restaurant-configuration',
        label: 'White-label configuration',
        title: 'Restaurant identity as application data',
        paragraphs: [
          'The white-label configuration covers the restaurant logo, theme, social links, and About Us content. These settings customize the public website while the underlying menu, event, and reservation features remain part of a shared application.',
          'The backend exposes restaurant configuration through a dedicated resource controller. This gives branding and descriptive content an explicit place in the API instead of treating each restaurant identity as a separate frontend implementation.',
        ],
      },
      {
        id: 'public-and-admin',
        label: 'Angular application',
        title: 'Public presentation and administration',
        paragraphs: [
          'The Angular 19 client contains the customer-facing website and an administration dashboard. Visitors browse restaurant information, menus, and events and can request table reservations. Administrators manage the content and reservations behind those pages.',
          'Menu management includes categories, items, and specialties; event management supports creating and publishing restaurant events. The frontend uses RxJS for state and HTTP interactions, with SCSS styling and localization support.',
        ],
      },
      {
        id: 'api-and-persistence',
        label: 'NestJS backend',
        title: 'Resource controllers and MongoDB persistence',
        paragraphs: [
          'The monorepo separates the Angular client from a Node.js, NestJS, and TypeScript server. Class-based resource controllers organize operations for restaurant configuration, authentication, menus, categories, reservations, events, and users.',
          'The backend uses Mongoose for MongoDB persistence and includes JWT-based administrator authentication with bcryptjs for password hashing. This separates browser interactions, API operations, and stored restaurant data into explicit implementation boundaries.',
        ],
      },
    ],
    flow: {
      title: 'Content management across the stack',
      steps: [
        {
          title: 'Administration',
          detail: 'An administrator edits restaurant content through the Angular dashboard.',
        },
        {
          title: 'Resource API',
          detail: 'NestJS TypeScript controllers expose the corresponding resource operations.',
        },
        {
          title: 'Persistence',
          detail: 'Mongoose models connect the API to MongoDB.',
        },
        {
          title: 'Public website',
          detail:
            'The Angular customer interface presents restaurant information, menus, and events.',
        },
      ],
    },
    references: [
      {
        label: 'Public full-stack project source',
        url: 'https://github.com/vitNapastiuk98/whitelabelRestaurant',
      },
      {
        label: 'Restaurant features, API resources, and setup',
        url: 'https://github.com/vitNapastiuk98/whitelabelRestaurant/blob/master/README.md',
      },
    ],
  },
};
