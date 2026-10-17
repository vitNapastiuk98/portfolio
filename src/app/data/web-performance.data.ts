import { performancePreview } from './engineering-previews.data';
import type { EngineeringStudy } from '../models/study.models';

export const webPerformance: EngineeringStudy = {
  ...performancePreview,
  presentation: 'article',
  title: 'Beyond Lighthouse: Understanding Performance in Angular',
  summary:
    'How browser metrics connect to Angular rendering, hydration, deferred views and the cost of an interaction.',
  lead: 'Performance is a sequence of dependencies: the server produces a response, the browser discovers content and assets, JavaScript makes the page interactive, and every later interaction competes for main-thread time. Angular offers several ways to organize that work. Choosing between them starts with understanding which part of the experience a technique can change—and which costs it leaves in place.',
  scopeNote: '',
  technologies: ['Angular', 'SSR', 'SSG', 'Hydration', 'Core Web Vitals'],
  relatedSlugs: ['angular-architectures', 'accessibility'],
  sections: [
    {
      id: 'core-metrics',
      label: 'The browser model',
      title: 'Three metrics, three different kinds of delay',
      paragraphs: [
        'Largest Contentful Paint (LCP) describes when the largest eligible visible image or text block is painted. It is about the main content becoming visible, not a page becoming fully loaded. The critical path can include server response time, resource discovery, transfer and render delay. In Angular, the first question is whether the important content exists in the initial HTML or appears only after client code and data arrive.',
        'Interaction to Next Paint (INP) describes responsiveness across qualifying interactions during a visit. It includes input delay, event processing and presentation delay; the longest interaction generally determines the value, with outlier handling on pages with many interactions. An Angular handler that does little can still wait behind another long task. A timer around the handler captures neither the complete interaction nor the page-level metric.',
        'Cumulative Layout Shift (CLS) describes unexpected movement using session windows: shifts grouped with gaps below one second, up to a five-second window, with the largest window determining CLS. Shifts close to qualifying user input are excluded. Images without reserved geometry, font changes, conditional banners and asynchronous Angular views can all contribute. It is not a sum of every layout movement during the page lifetime.',
      ],
      table: {
        caption: 'Core Web Vitals: what each metric asks',
        columns: ['Metric', 'User-visible question', 'Good threshold at the 75th percentile'],
        rows: [
          ['LCP', 'When does the main content become visible?', '≤ 2.5 seconds'],
          ['INP', 'How quickly does the page respond to an interaction?', '≤ 200 milliseconds'],
          ['CLS', 'Does content move unexpectedly?', '≤ 0.1'],
        ],
      },
      codeExamples: [
        {
          title: 'Begin with a stable Angular page structure',
          language: 'html',
          code: `<article>
  <h1>{{ article.title }}</h1>
  <p>{{ article.summary }}</p>
  <img ngSrc="/images/angular-rendering.webp" width="1200" height="800"
       priority alt="Angular rendering stages" />
  @defer (on viewport) {
    <app-related-articles />
  } @placeholder {
    <div class="related-placeholder">Related reading</div>
  }
</article>`,
          explanation:
            'Render primary content without a client-only gate. Import NgOptimizedImage for ngSrc, reserve image and placeholder geometry, and use priority only when the image is the likely LCP candidate. Defer secondary content when it has a separate delivery cost.',
        },
      ],
    },
    {
      id: 'angular-rendering',
      label: 'CSR, SSR & SSG',
      title: 'Choose when Angular should produce the page',
      paragraphs: [
        'Client-side rendering starts with an app shell and needs JavaScript before Angular can produce the page content. Server-side rendering produces HTML for a request. Static generation produces that HTML during the build. These choices change content discovery and delivery; they do not remove the cost of images, fonts, application code or interaction handlers.',
        'For a portfolio or documentation site, prerendered routes are a natural fit: public content changes with a deployment and can be served as static files. A live, public product page may benefit from request-time SSR when freshness matters. An authenticated dashboard can use CSR when its content is client-specific. SSR must also account for response time, caching, authorization and the cost of server rendering.',
        'Evaluate the actual critical path. SSG can remove request-time rendering work, while SSR may introduce data-fetch latency before HTML arrives. Hydration reuses server-rendered DOM instead of rebuilding it, but client code still has to load and run. A fast LCP does not imply that every control is already responsive.',
      ],
      codeExamples: [
        {
          title: 'Make rendering mode an explicit Angular server-route decision',
          language: 'typescript',
          code: `import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'engineering/**', renderMode: RenderMode.Prerender },
  { path: 'products/:id', renderMode: RenderMode.Server },
  { path: 'account/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];`,
          explanation:
            'This hybrid example requires a server deployment for the Server route. Static hosting can serve prerendered output, but cannot execute request-time Angular SSR. Parameterized prerender routes also need their build-time parameters supplied through getPrerenderParams.',
        },
        {
          title: 'Connect server routing and client hydration',
          language: 'typescript',
          code: `// app.config.server.ts: merge this with the shared application config.
provideServerRendering(withRoutes(serverRoutes));

// app.config.ts
provideClientHydration(withEventReplay());`,
          explanation:
            'Event replay can capture supported early interactions and replay them after hydration. It does not make expensive handlers cheaper. Keep the server and client DOM consistent; avoid direct DOM mutations or divergent browser-only markup before hydration.',
        },
      ],
    },
    {
      id: 'angular-deferral',
      label: 'Deferrable views',
      title: 'Defer optional features, not the content the reader came for',
      paragraphs: [
        'Angular @defer can split eligible dependencies and postpone rendering a secondary feature. A below-the-fold chart is a better candidate than the article heading or hero image. Deferring the LCP element behind an interaction or viewport trigger can delay its discovery and make the initial experience worse.',
        'A component must be standalone to be directly deferred, and references outside the defer block in the same file can make it eager. Use the production bundle graph and network waterfall to confirm the split. A placeholder should reserve a useful footprint; a loading state with a different height can cause a layout shift.',
        'In a normal SSR/SSG render, defer blocks render their placeholder rather than their deferred content. Incremental hydration provides a different option: withIncrementalHydration() enables hydration triggers that can render the block on the server and defer its client hydration. Choose this when server-rendered content must remain visible while its JavaScript becomes interactive later, then check both early interactions and layout.',
      ],
      codeExamples: [
        {
          title: 'Load a secondary Angular chart near the viewport',
          language: 'html',
          code: `<h1>Order activity</h1>
<p>The page's main content is rendered immediately.</p>

@defer (on viewport; prefetch on idle) {
  <app-order-history-chart />
} @placeholder {
  <div class="chart-placeholder">Order history chart</div>
} @loading (after 150ms; minimum 200ms) {
  <div class="chart-placeholder" role="status">Loading chart…</div>
} @error {
  <p>The chart could not be loaded. The order list is still available.</p>
}
<!-- Give the placeholder and chart a compatible block-size. -->`,
        },
        {
          title: 'Keep server-rendered content and hydrate it later',
          language: 'typescript',
          code: `// Shared application providers, when incremental hydration is appropriate:
provideClientHydration(withIncrementalHydration());

// In the component template:
// @defer (hydrate on viewport) {
//   <app-order-history-chart />
// }`,
          explanation:
            'Incremental hydration enables event replay. It is an additional lifecycle to reason about, not an instruction to defer every component. Measure JavaScript delivery, hydration work and interaction readiness separately.',
        },
      ],
    },
    {
      id: 'angular-assets',
      label: 'LCP & CLS in templates',
      title: 'Expose the important asset and reserve its space',
      paragraphs: [
        'When an image is the LCP candidate, first inspect its request start, transfer size and render delay. NgOptimizedImage provides Angular-aware loading hints and requires explicit dimensions for ordinary images. Use priority for the likely above-the-fold LCP image, not for every thumbnail. Responsive sources need a matching sizes declaration so a phone does not download a desktop-sized asset.',
        'Dimensions reserve the image aspect ratio before the bytes arrive. The same principle applies to asynchronous Angular content: keep a stable region for a chart, embedded preview or @defer placeholder. Font swaps and content inserted above the viewport can still move the page, so inspect Layout Shift entries rather than assuming an image fix eliminated every source.',
      ],
      codeExamples: [
        {
          title: 'An Angular hero image with explicit geometry',
          language: 'typescript',
          code: `import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: \`<img ngSrc="/images/study-hero.webp"
    width="1200" height="800" priority
    sizes="(max-width: 700px) 100vw, 700px"
    alt="Dependency boundaries of the order approval feature" />\`,
})
export class StudyHero {}`,
          explanation:
            'Configure an image loader or suitable srcset when serving responsive variants. Choose alternative text from the image purpose; use an empty alt value for purely decorative imagery. CSS should preserve the aspect ratio when sizing the image responsively.',
        },
      ],
    },
    {
      id: 'angular-diagnostic',
      label: 'Rendering & identity',
      title: 'Keep Angular work proportional to the change',
      paragraphs: [
        'Start with a specific symptom: replacing a list with fresh objects recreates rows and can disturb focus or local control state. With @for, track a stable, unique business ID when a logical row survives a refresh. Tracking the object itself describes a different identity, even when all its fields happen to match.',
        'Signals and OnPush make update dependencies more explicit, but neither removes expensive work that is still required. A computed value can memoize a derivation until its signal dependencies change. It is useful for a filtered list; it is not a worker thread. Profile the update, inspect DOM retention and compare equivalent inputs before claiming an improvement.',
      ],
      codeExamples: [
        {
          title: 'Derive the list once per dependency change',
          language: 'typescript',
          code: `@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<input #filter aria-label="Filter orders" [value]="query()"
    (input)="query.set(filter.value)" />
    @for (order of visibleOrders(); track order.id) {
      <app-order-row [order]="order" />
    }\`,
  imports: [OrderRowComponent],
})
export class OrderList {
  readonly orders = input.required<readonly Order[]>();
  readonly query = signal('');
  readonly visibleOrders = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.orders().filter(order => order.reference.toLowerCase().includes(query));
  });
}`,
          explanation:
            'This illustrates the dependency and identity choices rather than a benchmark. For large datasets, consider pagination or virtualization, and measure filtering separately from DOM rendering. OnPush still responds to events and signal changes; it does not mean a component never checks.',
        },
      ],
    },
    {
      id: 'angular-interactions',
      label: 'Interaction latency',
      title: 'An Angular click handler still runs on the main thread',
      paragraphs: [
        'Setting a loading signal does not guarantee that the browser paints it before the next line of synchronous computation. A long handler can delay input processing and the next presentation even if change detection itself is inexpensive. Event Timing, a performance trace and long-task entries help distinguish input delay, processing and presentation delay.',
        'For work that must stay on the main thread, bounded chunks with task boundaries can provide opportunities for input and rendering. For substantial pure computation, a Web Worker can move it off the main thread, at the cost of message serialization, cancellation and lifecycle management. Yielding often increases total completion time, so report both responsiveness and completion.',
      ],
      codeExamples: [
        {
          title: 'Publish progress from bounded chunks',
          language: 'typescript',
          code: `readonly running = signal(false);
readonly processed = signal(0);

async process(items: readonly Item[]) {
  if (this.running()) return;
  this.running.set(true);
  try {
    for (let start = 0; start < items.length; start += 200) {
      for (const item of items.slice(start, start + 200)) {
        this.processItem(item);
      }
      this.processed.set(Math.min(start + 200, items.length));
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
  } finally {
    this.running.set(false);
  }
}`,
          explanation:
            'A chunk count is not a time budget: tune it from traces, because one item may already be expensive. A resolved Promise yields only to the microtask queue and can still starve rendering. Production work should also stop when the component is destroyed or the operation is cancelled. Angular CLI can scaffold a worker with ng generate web-worker.',
        },
      ],
    },
    {
      id: 'reading-performance',
      label: 'Reasoning about performance',
      title: 'Choose evidence that answers the question',
      paragraphs: [
        'A lab tool observes a particular environment and a limited sequence of actions. Field data observes real visits across devices, networks, page states and interaction patterns. Lighthouse is useful for diagnosis, but its score does not describe every visitor. Total Blocking Time is a lab diagnostic, not a substitute for field INP. Compare the same route, content and interaction under known conditions before attributing a difference to an Angular setting.',
        'For LCP, examine the candidate and its dependency chain. For CLS, inspect the moving elements and session windows. For responsiveness, inspect Event Timing and a main-thread trace, then use Angular DevTools to understand component checks and updates. A browser trace can expose work outside Angular; an Angular profile can explain why a component was checked. Neither view alone explains the whole page.',
        'The most useful architectural choice is often to avoid unnecessary work: prerender stable public content, keep the primary content discoverable, defer secondary dependencies, preserve DOM identity and move expensive computation away from critical interactions. These techniques have different costs. Select the one that addresses the actual dependency or bottleneck rather than applying every optimization to every route.',
      ],
      codeExamples: [
        {
          title: 'Separate rendering cost from data and application work',
          language: 'typescript',
          code: `// Around a specific Angular application operation:
performance.mark('orders-update-start');
this.orders.set(nextOrders);
afterNextRender(() => {
  performance.mark('orders-update-rendered');
  performance.measure('orders-update',
    'orders-update-start', 'orders-update-rendered');
}, { injector: this.injector });`,
          explanation:
            'A custom mark can help locate an update in a trace. This interval includes scheduling and Angular rendering; it is not INP, a paint measurement or proof of a production improvement. Use the browser timeline to interpret it.',
        },
      ],
    },
  ],
  flow: { title: '', steps: [] },
  decisions: [],
  checks: [],
  takeaways: [],
  references: [
    { label: 'web.dev — Core Web Vitals', url: 'https://web.dev/articles/vitals' },
    { label: 'web.dev — Largest Contentful Paint', url: 'https://web.dev/articles/lcp' },
    { label: 'web.dev — Interaction to Next Paint', url: 'https://web.dev/articles/inp' },
    { label: 'web.dev — Cumulative Layout Shift', url: 'https://web.dev/articles/cls' },
    { label: 'Angular — Server and hybrid rendering', url: 'https://angular.dev/guide/ssr' },
    { label: 'Angular — Hydration', url: 'https://angular.dev/guide/hydration' },
    {
      label: 'Angular — Incremental hydration',
      url: 'https://angular.dev/guide/incremental-hydration',
    },
    { label: 'Angular — Deferrable views', url: 'https://angular.dev/guide/templates/defer' },
    { label: 'Angular — Image optimization', url: 'https://angular.dev/guide/image-optimization' },
    {
      label: 'Angular — Profiling with DevTools',
      url: 'https://angular.dev/tools/devtools/profiler',
    },
  ],
};
