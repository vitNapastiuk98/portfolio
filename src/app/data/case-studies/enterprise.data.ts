import { professionalPreviews } from '../professional-previews.data';
import type { ProfessionalStudy } from '../../models/professional-study.models';

export const enterpriseStudy: ProfessionalStudy = {
  ...professionalPreviews[0],
  lead: 'An authenticated citizen journey crosses navigation, identity, permissions, forms and backend integrations. The architectural problem is keeping those responsibilities coherent without making every feature depend on the implementation of every other feature.',
  scopeNote:
    'Professional context is drawn from the supplied project history. Code and diagrams below are independent reference examples using the portfolio’s Angular version, rather than extracts of client applications.',
  sections: [
    {
      id: 'context',
      label: 'Context & constraints',
      title: 'A shared ecosystem, different application responsibilities',
      paragraphs: [
        'INPS is Italy’s national social security institution, responsible for pensions, welfare and public social-security services. Work on Area Riservata / MyINPS included building the application from scratch within that ecosystem: authenticated citizen experiences, backend integrations, navigation and shared application infrastructure. This was broader than a visual redesign.',
        'Portale Patronati adds concrete Angular experience with standalone components, routing, shared layouts, guards/resolvers, interceptors and reactive state, beginning in an Angular 17-era application context. CAF is supporting public-sector experience; its exact architecture, framework version and business rules are not documented here. The examples illustrate decisions relevant to this class of application, without attributing the same implementation to every project.',
      ],
    },
    {
      id: 'boundaries',
      label: 'Approaches & decision',
      title: 'Choose ownership boundaries before choosing folders',
      paragraphs: [
        'A horizontal components/services/models structure is easy to start and works for a small application. Its weakness appears when a change to one citizen journey requires edits throughout global directories, or when a shared service becomes the owner of unrelated business state. A feature boundary groups the route, view state, use cases and adapter involved in the same change.',
        'The reference decision is to keep authentication, layout and cross-application concerns in the shell, while a benefits feature owns its route state and backend contract. Shared UI contains reusable behavior, not knowledge of which business workflow happens to use it. A domain layer is justified when there are invariants or rules worth isolating; a screen that only reads and displays data may need no separate use-case class.',
      ],
      codeExamples: [
        {
          title: 'A feature boundary expressed in the source tree',
          language: 'text',
          code: `app/
  shell/                 # layout, session integration, global navigation
  features/benefits/
    benefits.routes.ts   # lazy entry point and provider scope
    benefits.page.ts     # presentation and user intent
    benefits.store.ts    # selected journey and read state
    benefits.port.ts     # feature-facing backend contract
    http-benefits.ts     # response decoding and transport mapping
  shared/ui/             # no imports from business features`,
        },
      ],
    },
    {
      id: 'architecture',
      label: 'System architecture',
      title: 'Make the component depend on a capability',
      paragraphs: [
        'The screen should ask to load a benefit journey rather than construct URLs and interpret several backend response shapes. A port expresses the feature’s needs; an adapter translates them into transport operations and validates responses at the boundary. Angular DI chooses the adapter at the route or application composition point.',
        'This is dependency inversion at a useful seam, not a requirement to wrap every Angular service. A shared interceptor can attach cross-cutting request context, but should not decide a feature’s workflow. Frontend guards improve navigation and affordances; authorization must still be enforced by each backend operation.',
      ],
      diagram: {
        id: 'enterprise-boundaries',
        title: 'Reference feature composition',
        caption:
          'Independent example: arrows show calls and provider composition, not a confidential INPS system topology.',
        nodes: [
          { id: 'shell', label: 'Application shell', detail: 'Session, layout, navigation' },
          { id: 'route', label: 'Feature route', detail: 'Lazy entry and provider scope' },
          { id: 'page', label: 'Page + owned state', detail: 'User intent and derived views' },
          { id: 'backend', label: 'Backend adapter', detail: 'Decode external responses' },
          { id: 'port', label: 'BenefitsPort', detail: 'Feature-facing contract' },
          { id: 'rules', label: 'Application policy', detail: 'Permissions and transitions' },
        ],
        edges: [
          { from: 'shell', to: 'route' },
          { from: 'route', to: 'page' },
          { from: 'page', to: 'rules' },
          { from: 'rules', to: 'port' },
          { from: 'port', to: 'backend' },
        ],
      },
      codeExamples: [
        {
          title: 'Route-level composition without transport knowledge in the page',
          language: 'typescript',
          code: `export interface BenefitsPort {
  load(id: string): Observable<BenefitJourney>;
}
export const BENEFITS = new InjectionToken<BenefitsPort>('BENEFITS');
export const routes: Routes = [{
  path: 'benefits',
  canMatch: [authenticated], // Navigation policy, not server authorization.
  providers: [BenefitsStore, { provide: BENEFITS, useClass: HttpBenefits }],
  loadComponent: () => import('./benefits.page').then(m => m.BenefitsPage),
}];
// HttpBenefits implements BenefitsPort and decodes untrusted responses.
// The application shell provides HttpClient and session integration.`,
        },
      ],
    },
    {
      id: 'state',
      label: 'Implementation',
      title: 'Give reads, commands and local editing different lifetimes',
      paragraphs: [
        'Signals fit synchronous local state and derived views. RxJS fits request replacement, event streams and cancellation. The important boundary is ownership: a component owns an unfinished edit; a feature owns the selected journey; session infrastructure owns identity. Copying all three into a global mutable object makes stale combinations difficult to detect.',
        'A resolver can load data that is essential before route activation, but blocking every navigation can make latency and failures feel like a frozen application. Rendering the shell and loading within the feature supports explicit loading/error states. Keep previously displayed records tied to the ID that produced them, especially when a slow response arrives after navigation.',
      ],
      codeExamples: [
        {
          title: 'Replace obsolete reads and derive the view from owned state',
          language: 'typescript',
          code: `@Injectable()
export class BenefitsStore {
  private readonly port = inject(BENEFITS);
  readonly selectedId = signal<string | null>(null);
  readonly state = toSignal(toObservable(this.selectedId).pipe(
    switchMap(id => id === null ? of({ kind: 'idle' } as const) :
      this.port.load(id).pipe(
        map(journey => ({ kind: 'ready', journey } as const)),
        startWith({ kind: 'loading' } as const),
        catchError(() => of({ kind: 'error' } as const)),
      )),
  ), { initialValue: { kind: 'idle' } as const });
  readonly canContinue = computed(() => this.state().kind === 'ready');
}
// In the page: render the discriminated state with @switch.
// Approval/submission commands need their own pending and revision policy.`,
        },
      ],
    },
    {
      id: 'coupling',
      label: 'Failure analysis',
      title: 'The cost of a boundary appears when requirements change',
      paragraphs: [
        'If another feature imports the benefits store and changes its selection, ownership has leaked. Prefer a public capability or a navigation parameter over reaching into internal state. Conversely, splitting every leaf component into a package adds dependency management without necessarily reducing coordination cost. Start with enforceable source boundaries and extract packages when reuse, release cadence or team ownership justify them.',
        'Provider scope is also behavior. Moving a store from a feature injector to root can unintentionally preserve another journey’s data; moving it into every row can duplicate requests. Characterize that lifetime before migrating NgModules to standalone composition. The migration changes Angular wiring, while feature/domain ownership remains a separate decision.',
      ],
    },
  ],
  flow: {
    title: 'One journey through the ownership boundaries',
    steps: [
      {
        title: 'Enter a route',
        detail: 'Resolve session-aware navigation and identify the selected journey.',
      },
      {
        title: 'Load through a port',
        detail: 'Keep transport and response decoding outside the component.',
      },
      {
        title: 'Derive the screen',
        detail: 'Render loading, error and ready states without stale identity.',
      },
      {
        title: 'Submit deliberately',
        detail: 'Validate permissions and concurrency on the server, then reconcile the result.',
      },
    ],
  },
  decisions: [
    {
      title: 'Feature-oriented source',
      choice: 'Co-locate code that changes together.',
      tradeoff: 'Cross-feature capabilities still require deliberately designed public contracts.',
    },
    {
      title: 'Signals and RxJS',
      choice: 'Use signals for owned state; streams for asynchronous replacement.',
      tradeoff: 'Bridging both everywhere obscures ownership; keep boundaries few and explicit.',
    },
    {
      title: 'Port at the integration seam',
      choice: 'Select a backend adapter with route-level DI.',
      tradeoff:
        'An interface adds maintenance; direct services remain reasonable for a small stable integration.',
    },
  ],
  checks: [
    {
      scenario: 'Navigate to B before A finishes loading',
      expectation:
        'Only B can become the current ready state; a late A response cannot replace it.',
    },
    {
      scenario: 'Session or permissions change',
      expectation:
        'Re-evaluate affordances; backend operations independently reject unauthorized requests.',
    },
    {
      scenario: 'A resolver fails',
      expectation:
        'Provide a recoverable route error rather than an indefinitely blocked navigation.',
    },
    {
      scenario: 'Provider scope changes during migration',
      expectation:
        'Test intended sharing/isolation and explicit reset behavior; do not infer lifetime from folder placement.',
    },
  ],
  takeaways: [
    'Feature ownership is a change-management decision, not a standalone-component syntax choice.',
    'Separate local editing, selected-record state and authentication context.',
    'Introduce abstractions where they isolate a real source of variation.',
  ],
  references: [
    { label: 'Angular — Routing', url: 'https://angular.dev/guide/routing' },
    {
      label: 'Angular — Hierarchical DI',
      url: 'https://angular.dev/guide/di/hierarchical-dependency-injection',
    },
  ],
  related: [
    {
      label: 'Angular architectures: from modules to DDD',
      path: '/engineering/angular-architectures',
    },
    { label: 'Angular dependency injection', path: '/engineering/angular-dependency-injection' },
  ],
};
