import { architecturesPreview } from './engineering-previews.data';
import type { EngineeringStudy } from '../models/study.models';

export const angularArchitecturesStudy: EngineeringStudy = {
  ...architecturesPreview,
  presentation: 'article',
  title: 'Angular Architectures: From NgModules to Domain Boundaries',
  technologies: ['Angular 22', 'TypeScript', 'Dependency injection', 'DDD'],
  problem:
    'Evolve an order-management frontend without turning every business change into a cross-application rewrite.',
  relatedSlugs: ['reactive-consistency', 'accessibility', 'web-performance'],
  updatedOn: '2026-10-17',
  summary:
    'A practical comparison of module-oriented, feature-based, vertical-slice and domain-oriented Angular applications: where state lives, which dependencies may point where, and what each abstraction costs.',
  lead: 'Replacing an NgModule with a standalone component changes Angular composition. It does not decide who owns an order, which team may change its approval policy, or what should happen when a server rejects a stale write. Those decisions belong to different architectural axes. This study separates them before proposing a migration.',
  scopeNote: '',
  sections: [
    {
      id: 'same-feature',
      label: 'Problem & constraints',
      title: 'Keep the business feature constant while changing the boundaries',
      paragraphs: [
        'The example is order approval. A draft has an identity, a revision and a total stored in integer minor units. A user needs approval permission; the server must approve exactly the revision the user reviewed. A retry after an uncertain response must carry the same operation identity. Loading, denied, pending, rejected and approved are different UI states. This is enough behavior to expose ownership problems without inventing a miniature enterprise.',
        'Use the same acceptance conditions for every architectural option. A read-only dashboard with two routes may need only a feature directory and a service. A regulated order workflow maintained by several teams may justify a domain model, explicit application use cases and a replaceable transport adapter. Folder count, standalone adoption and the number of interfaces do not establish either need.',
      ],
      bullets: [
        'The browser permission check improves UX; the server must enforce authorization and expected revision atomically.',
        'The local example does not implement server idempotency. The port carries a key; only the server can guarantee deduplication.',
        'An approval timeout is an uncertain outcome, not proof that the write failed. Do not silently retry it with a new identity.',
      ],
      table: {
        caption: 'Architecture choices operate on different axes; they are not a maturity ladder',
        columns: ['Choice', 'Primary question', 'When the extra boundary is useful'],
        rows: [
          [
            'NgModules / standalone',
            'How does Angular compose templates and injectors?',
            'Choose composition independently from business ownership',
          ],
          [
            'Horizontal layers',
            'Where are technical roles located?',
            'Small applications with few cross-feature changes',
          ],
          [
            'Feature-based',
            'Who owns this product area?',
            'Stable feature ownership with explicit public contracts',
          ],
          [
            'Vertical slices',
            'Can one user capability change end to end?',
            'Capabilities with independent delivery and tests',
          ],
          [
            'DDD-inspired',
            'Which business language and invariants belong together?',
            'Distinct contexts and consequential rules justify modeling',
          ],
          [
            'Clean Architecture',
            'Which direction may source dependencies point?',
            'Policy needs protection from volatile framework or transport details',
          ],
          [
            'Hexagonal',
            'Which ports separate the application from external systems?',
            'Adapters or protocol-level failure cases need independent tests',
          ],
          [
            'Microfrontends',
            'Who must deploy independently at runtime?',
            'Release independence outweighs runtime integration and compatibility cost',
          ],
        ],
      },
      codeExamples: [
        {
          title: 'Same feature, explicit boundary',
          language: 'typescript',
          code: `interface Order {
  readonly id: string;
  readonly revision: number;
  readonly status: 'draft' | 'approved';
  readonly totalMinor: number;
}
interface ApprovalCommand {
  readonly orderId: string;
  readonly expectedRevision: number;
  readonly idempotencyKey: string;
}`,
          explanation:
            'The executable version lives in architecture-examples/approve-order.ts. This is an order-approval contract, not a universal object model shared with billing and fulfillment.',
        },
      ],
    },
    {
      id: 'modules-to-standalone',
      label: 'Angular composition',
      title: 'NgModules and domain boundaries answer different questions',
      paragraphs: [
        'An NgModule declares a compilation scope and can contribute providers. A standalone component declares its own template dependencies; standalone route configurations can lazy-load components or child routes. Both can participate in feature-based or domain-oriented architectures. A large shared module can hide transitive template dependencies, but converting every declaration to standalone does not remove a shared mutable singleton or a forbidden feature import.',
        'Migrate incrementally: characterize a routed feature, make suitable declarations standalone, replace its routing composition and verify provider scope before removing its NgModule. A provider moved from a lazy environment injector to providedIn: root may become shared unexpectedly. Conversely, providing the same service in both a root and a component creates distinct owners. Standalone and NgModule code can interoperate during migration; do not combine a syntax migration with a wholesale domain rewrite.',
        'DI scope is a lifetime decision. Component providers create an instance owned by that component subtree. Route providers create an environment-injector boundary, but route reuse and cached configuration mean that leaving and returning to a URL is not a reliable reset policy. Explicitly define reset semantics for selected orders and in-flight writes instead of assuming that lazy loading destroys all state.',
      ],
      codeExamples: [
        {
          title: 'Make the feature owner explicit',
          language: 'typescript',
          code: `@Component({
  standalone: true,
  imports: [OrderListComponent, OrderDetailsComponent],
  providers: [OrdersFacade],
  template: '<app-order-list /><app-order-details />',
})
export class OrdersPage {}

export const routes: Routes = [{
  path: 'orders',
  loadComponent: () => import('./orders.page')
    .then(module => module.OrdersPage),
}];`,
          explanation:
            'Illustrative integration: the facade is owned by the page instance. A root repository can still own reusable server records; the component owner need not duplicate that cache.',
        },
      ],
    },
    {
      id: 'organize-by-change',
      label: 'Layers, features & slices',
      title: 'Organize around the changes that should stay local',
      paragraphs: [
        'A horizontal layout with components/, services/ and models/ makes technical roles easy to locate. It is inexpensive for a small application, but a single approval change can span every directory and a generic services folder can conceal cross-feature coupling. A feature-based layout co-locates the orders route, UI, state and tests. It improves ownership only when imports respect the boundary; moving the same cyclic imports into new folders changes very little.',
        'A vertical slice groups a user capability end to end: approve-order can own its form, application action, transport call and tests. Slices can share a stable domain policy without sharing every piece of UI state. Duplication can be preferable to prematurely combining two behaviors that happen to look similar. The cost is discovering which abstractions are shared deliberately and which are accidental copies that should evolve together.',
      ],
      codeExamples: [
        {
          title: 'Two useful structures, different ownership units',
          language: 'text',
          code: `Feature-based                     Vertical slices
orders/                           orders/
  orders.routes.ts                  approve-order/
  ui/                                 approve-order.page.ts
  state/                              approve-order.action.ts
  data-access/                        approval-http.adapter.ts
  orders.spec.ts                      approve-order.spec.ts
                                    search-orders/
                                    domain/`,
          explanation:
            'These are illustrative organization options. A slice may be a component or a routed capability; it does not need its own package, store or network endpoint.',
        },
      ],
      table: {
        caption: 'What each organization makes easier, and what it can hide',
        columns: ['Approach', 'Useful pressure', 'Cost or failure mode'],
        rows: [
          [
            'Horizontal layers',
            'A small team navigating technical roles',
            'A business change spans layers; feature ownership is implicit',
          ],
          [
            'Feature-based',
            'Stable product areas and teams',
            'Large features can become internal monoliths; imports need rules',
          ],
          [
            'Vertical slice',
            'Independent delivery of user capabilities',
            'Shared policy can be duplicated or over-extracted; cross-slice transactions remain real',
          ],
        ],
      },
    },
    {
      id: 'ddd-boundaries',
      label: 'DDD-inspired design',
      title: 'Use bounded contexts when the business language actually differs',
      paragraphs: [
        'DDD starts with a model and a language, not a domain/ directory. Sales may call an order approved when commercial conditions are accepted; fulfillment may call it releasable only after stock allocation. Reusing one frontend Order interface for both meanings can create a misleading global status enum. A bounded context lets each capability own its terms, invariants and translation from external data. Domain boundaries can sit inside one Angular application; they do not imply microservices.',
        'An aggregate is a consistency boundary for business rules, not a synonym for an NgRx store or an entity class. The approval example checks draft state, minor units and operation identity before calling the application port. The backend still owns the authoritative concurrent transition. Rich frontend domain models are justified when the client must explain or enforce substantial interaction policy; for straightforward CRUD they may duplicate server rules and increase synchronization cost.',
        'An anti-corruption layer translates an external DTO into the local model and rejects malformed values at that boundary. Do not export every backend field as a public domain type, and do not let a formatting view model become the canonical business state. Share stable identifiers and published contracts between contexts; explicit translations often age better than a sprawling shared/models package.',
      ],
      codeExamples: [
        {
          title: 'A policy with no Angular or HTTP dependency',
          language: 'typescript',
          code: `export function approvalCommand(
  order: Order, canApprove: boolean, idempotencyKey: string,
): ApprovalCommand {
  if (!canApprove) throw new Error('Approval permission is required.');
  if (!order.id.trim() || !Number.isSafeInteger(order.revision)
      || order.revision < 0) throw new Error('Invalid identity or revision.');
  if (!Number.isSafeInteger(order.totalMinor) || order.totalMinor < 0)
    throw new Error('Invalid minor units.');
  if (order.status !== 'draft') throw new Error('Only drafts can be approved.');
  if (!idempotencyKey.trim()) throw new Error('Operation identity required.');
  return { orderId: order.id, expectedRevision: order.revision, idempotencyKey };
}`,
          explanation:
            'The repository contains the executable equivalent and regression cases. This local guard never substitutes for server-side authorization, schema validation or a transactional revision check.',
        },
      ],
    },
    {
      id: 'dependency-direction',
      label: 'Clean & hexagonal',
      title: 'Invert volatile dependencies, not every function call',
      paragraphs: [
        'Clean Architecture emphasizes dependency direction: policy should not import Angular components, HttpClient or a persistence SDK. Hexagonal architecture names the application boundary as ports and adapters. They overlap and can be applied within a feature or slice. In this example an ApprovalPort is justified because the application action must be tested independently from HTTP and because transport failures are part of its behavior. An interface for a one-line pure formatter would add little.',
        'Angular DI wires a concrete HTTP adapter at the outer boundary. The application action validates the command, calls the port once, and rejects an inconsistent approval receipt. Components translate its outcome into visible state. Error handling belongs at the layer that can make a decision: a transport adapter translates protocol failures, an application action understands stale revisions, and the UI explains recovery. Catching every failure and returning an empty success object destroys that distinction.',
      ],
      codeExamples: [
        {
          title: 'Application port and use case',
          language: 'typescript',
          code: `interface ApprovalPort {
  approve(command: ApprovalCommand): Promise<Order>;
}

export async function approveOrder(
  order: Order, canApprove: boolean,
  key: string, port: ApprovalPort,
): Promise<Order> {
  const command = approvalCommand(order, canApprove, key);
  const reply = await port.approve(command);
  if (reply.id !== order.id || reply.status !== 'approved'
      || reply.revision !== order.revision + 1
      || reply.totalMinor !== order.totalMinor) {
    throw new Error('Unexpected approval transition.');
  }
  return reply;
}`,
          explanation:
            'The actual example is executable. A real HTTP adapter must also validate unknown JSON before returning a typed Order. The port does not make an unvalidated server response trustworthy.',
        },
        {
          title: 'Dependency diagram: source dependencies point inward',
          language: 'text',
          code: `Angular route / component
            ↓
       Orders facade
            ↓
    Approval application action → ApprovalPort
            ↓                         ↑ implements
      Pure domain policy        HTTP adapter → server

Composition root provides the adapter.
Domain policy imports no Angular or HTTP APIs.`,
          explanation:
            'Runtime calls go out through the adapter, while source code dependencies target the port. The distinction is the purpose of inversion, not extra directory nesting.',
        },
      ],
    },
    {
      id: 'angular-feature-boundary',
      label: 'Putting it into Angular',
      title: 'Use the route injector as a feature composition boundary',
      paragraphs: [
        'An interface is erased at runtime, so Angular needs an InjectionToken to resolve a port. Keep that token and its provider mapping in the Angular integration layer. The pure approval function can continue accepting a port as an ordinary argument; it does not need an Angular decorator or knowledge of an injector.',
        'A route provider is a useful scope for feature state shared by its child pages. A component provider is narrower; providedIn: root creates an application-level instance. Pick the lifetime from ownership requirements. Route reuse and retained injectors mean that leaving a URL should not be treated as a guaranteed reset policy for sensitive or transient state.',
        'Lazy routing and domain architecture solve different problems. loadChildren can split a feature entry point, while import rules decide which other features may depend on it. A route guard improves navigation behavior, but the server still authorizes an approval and rejects stale revisions. Keeping those responsibilities explicit prevents a frontend permission flag from becoming a security boundary.',
      ],
      codeExamples: [
        {
          title: 'Bind the HTTP adapter at the Angular edge',
          language: 'typescript',
          code: `// orders/angular/order.tokens.ts
export const APPROVAL_PORT = new InjectionToken<ApprovalPort>('APPROVAL_PORT');

// orders/angular/http-approval.adapter.ts
@Injectable()
export class HttpApprovalAdapter implements ApprovalPort {
  private readonly http = inject(HttpClient);
  approve(command: ApprovalCommand): Promise<Order> {
    return firstValueFrom(this.http.post<Order>('/api/orders/approve', command));
  }
}

// orders/orders.routes.ts
export const ORDER_ROUTES: Routes = [{
  path: '',
  providers: [
    OrderFacade,
    { provide: APPROVAL_PORT, useClass: HttpApprovalAdapter },
  ],
  children: [{
    path: ':id',
    loadComponent: () => import('./ui/order.page').then(m => m.OrderPage),
  }],
}];

// app.routes.ts: provideHttpClient() belongs in the application config.
{ path: 'orders', loadChildren: () => import('./orders/orders.routes')
    .then(m => m.ORDER_ROUTES) }`,
          explanation:
            'The adapter translates transport details and should validate an untrusted response at the boundary; HttpClient<Order> is a TypeScript assertion, not runtime validation. The example omits that parsing to keep the dependency direction visible.',
        },
        {
          title: 'Expose a small Angular-facing state contract',
          language: 'typescript',
          code: `@Injectable()
export class OrderFacade {
  private readonly port = inject(APPROVAL_PORT);
  private readonly busy = signal(false);
  private readonly failure = signal<string | null>(null);
  readonly pending = this.busy.asReadonly();
  readonly error = this.failure.asReadonly();

  async approve(order: Order, allowed: boolean, operationId: string) {
    if (this.busy()) return;
    this.busy.set(true);
    this.failure.set(null);
    try {
      return await approveOrder(order, allowed, operationId, this.port);
    } catch {
      this.failure.set('The approval could not be completed. Refresh the order before retrying.');
      return undefined;
    } finally {
      this.busy.set(false);
    }
  }
}`,
          explanation:
            'Inject the facade from the feature page and bind its readonly signals in the template. This facade coordinates UI state; the pure use case protects approval invariants. Reuse a stable operation ID when retrying an uncertain write, and make the server implement the corresponding idempotency contract.',
        },
      ],
    },
    {
      id: 'state-and-effects',
      label: 'State ownership',
      title: 'Separate derived views, replaceable reads and irreversible commands',
      paragraphs: [
        'The route can own the selected order ID, a repository can own cached server records, and a component or feature facade can own a pending approval attempt. Derive the selected view and editability from those sources instead of copying mutable snapshots into several stores. Signals are useful for synchronous local projections; RxJS is useful where cancellation, time and stream composition matter. Neither determines whether state belongs in a component, feature or shared repository.',
        'switchMap is useful for replacing a stale search read. It does not undo a server mutation. exhaustMap can suppress overlapping submit attempts in one subscription, but it is not a distributed deduplication protocol. Tag commands with order identity, reviewed revision and operation identity; after navigation, reconcile the canonical record without letting an old result overwrite a different selection. An error view should distinguish a rejected transition from an unknown network outcome.',
      ],
      table: {
        caption: 'Ownership choices for the same order screen',
        columns: ['State', 'Likely owner', 'Reason to choose differently'],
        rows: [
          [
            'Selected order ID',
            'URL or routed feature',
            'A transient picker may belong to one component',
          ],
          [
            'Reusable order records',
            'Repository/query cache',
            'Avoid a global cache when nothing consumes it outside the feature',
          ],
          [
            'Pending approval',
            'Application action / feature facade',
            'A long-lived workflow may survive its component',
          ],
          [
            'Display label and enabled state',
            'Derived projection',
            'Do not store a second mutable truth without a synchronization rule',
          ],
        ],
      },
    },
    {
      id: 'modularity-and-deployment',
      label: 'Teams & deployment',
      title: 'A package, a monorepo and a microfrontend are different boundaries',
      paragraphs: [
        'A public TypeScript entry point can define which contracts another feature imports. Path aliases make imports shorter; they do not enforce direction. For a large codebase, dependency rules, ownership review and cycle detection make the boundary executable. Nx tags or ESLint import restrictions are possible tools, not prerequisites for sensible feature boundaries. Keep dependency-free domain code free from Angular imports and test it without TestBed.',
        'An internal workspace library can serve several applications on one revision. A distributed package adds version compatibility, peer dependency, deprecation and migration obligations. A microfrontend adds runtime loading, composition, routing, shared dependency negotiation and operational failure modes. Use independent deployment when teams genuinely need it; do not introduce it to organize folders. Loading a remote Angular bundle can increase coupling to shared runtime versions rather than remove it.',
      ],
      table: {
        caption: 'Choose the smallest enforceable boundary',
        columns: ['Boundary', 'What it solves', 'What it costs'],
        rows: [
          [
            'Feature directory + public API',
            'Ownership inside one application',
            'Needs import discipline; no independent version',
          ],
          [
            'Workspace library',
            'Compile-time reuse and dependency rules',
            'Shared repository/release coordination',
          ],
          [
            'Versioned package',
            'Independent consumer upgrades',
            'Compatibility matrix, migrations, peer dependencies',
          ],
          [
            'Microfrontend',
            'Independent runtime delivery',
            'Integration, routing, failure handling and shared-runtime negotiation',
          ],
        ],
      },
    },
    {
      id: 'migration-plan',
      label: 'Migration & rollback',
      title: 'Move one capability at a time, with a stable seam',
      paragraphs: [
        'Start with a dependency map and a reproducible behavior test for approval. Put a facade in front of the existing service without changing the screen. Extract pure validation next, then a port for the transport dependency if it creates a useful seam. Move approval into its feature or slice, preserve the external route and contract, and switch the composition root. Convert NgModule composition separately when practical. These are reversible steps; a repository-wide rename is not a migration strategy.',
        'Use the old implementation as a comparison only where repeating an action is safe. Do not dual-run approval writes against a real backend. Test the candidate with recorded or synthetic reads and a fake port, then switch a single command path. Keep the old adapter available until its replacement is verified. Rollback must account for persisted state and backend contract changes; flipping a frontend route does not reverse an already accepted business command.',
      ],
      bullets: [
        'Characterize route behavior, validation, permissions, focus/error behavior and command identity before moving files.',
        'Keep the facade contract stable while replacing internal ownership or transport. Remove the adapter when the transition is complete.',
        'Measure coordination cost and change locality alongside bundle size and test execution; a cleaner directory tree is not an outcome by itself.',
      ],
      codeExamples: [
        {
          title: 'Migration seam without changing the component contract',
          language: 'text',
          code: `Before: Component → LegacyOrdersService → HTTP
Step 1: Component → OrdersFacade → LegacyOrdersService
Step 2: Component → OrdersFacade → approveOrder(policy, port)
Step 3: Component → OrdersFacade → approveOrder → HttpApprovalAdapter

Only one live command path writes an approval.
The component-facing facade stays stable during the move.`,
        },
      ],
    },
    {
      id: 'validation-and-limits',
      label: 'Keeping boundaries useful',
      title: 'Test the rule at the layer that owns it',
      paragraphs: [
        'Test a domain policy with plain TypeScript values. Test the Angular facade with a substituted port, and test the HTTP adapter with HttpTestingController. Browser tests then cover the user task across the assembled feature. This split makes a failure easier to locate without requiring every business rule to run through a rendered page.',
        'Architecture also needs feedback from change. If a small feature requires edits across six packages, inspect whether the boundary follows real ownership. If unrelated screens can import an internal store, use package exports or import rules to make that coupling visible. A folder diagram alone cannot enforce a dependency direction.',
      ],
      codeExamples: [
        {
          title: 'Replace infrastructure through the Angular testing injector',
          language: 'typescript',
          code: `const port = { approve: vi.fn() };
TestBed.configureTestingModule({
  providers: [OrderFacade, { provide: APPROVAL_PORT, useValue: port }],
});
const facade = TestBed.inject(OrderFacade);
// Resolve/reject the port and assert pending, error and result behavior.
// Keep policy edge cases in tests of approveOrder itself.`,
          explanation:
            'Use Angular TestBed where the injector or reactive component integration matters. A framework-independent function needs neither TestBed nor a browser.',
        },
      ],
    },
  ],
  flow: {
    title: 'One approval, explicit responsibility at every step',
    steps: [
      {
        title: 'Capture intent',
        detail: 'Record order ID, reviewed revision and one operation identity.',
      },
      {
        title: 'Check policy',
        detail: 'Validate the local draft and permission snapshot without side effects.',
      },
      {
        title: 'Call the port',
        detail:
          'Let an outer adapter execute the command; the server owns the authoritative transition.',
      },
      {
        title: 'Reconcile the result',
        detail:
          'Accept only the expected receipt and update the correct owner; preserve uncertain outcomes.',
      },
    ],
  },
  decisions: [
    {
      title: 'Layered versus feature/slice',
      choice:
        'Use feature boundaries for business ownership; introduce slices where capabilities change independently.',
      tradeoff:
        'Horizontal folders are simpler early. Slices can duplicate unstable details and need explicit shared policy.',
    },
    {
      title: 'Standalone versus NgModules',
      choice: 'Adopt standalone composition incrementally while preserving provider semantics.',
      tradeoff:
        'Simpler template dependencies do not automatically solve state ownership, coupling or domain boundaries.',
    },
    {
      title: 'DDD versus pragmatic CRUD',
      choice:
        'Model invariants and bounded contexts when business language and change pressure justify them.',
      tradeoff:
        'A rich client model can duplicate server policy and become expensive for simple forms.',
    },
    {
      title: 'Clean/hexagonal versus direct services',
      choice:
        'Introduce a port around a volatile or consequential dependency such as approval transport.',
      tradeoff:
        'Inversion supports isolated tests and replacement. Interfaces for every helper increase navigation without useful separation.',
    },
    {
      title: 'Native Angular versus independent runtime delivery',
      choice: 'Keep one deployment unless teams need independent release ownership.',
      tradeoff:
        'Microfrontends add runtime and compatibility failure modes; a library alone cannot provide release independence.',
    },
    {
      title: 'Global store versus feature owner',
      choice:
        'Promote state only when lifetime and consumers require it; derive views from canonical sources.',
      tradeoff:
        'Local state is easier to reason about, while cross-route workflows may require a longer-lived owner.',
    },
  ],
  checks: [
    {
      scenario: 'A module provider is moved to root during standalone migration.',
      expectation:
        'Verify consumers that previously had isolated state do not silently share one owner.',
    },
    {
      scenario: 'A user approves revision 7 while the server has revision 8.',
      expectation:
        'The server rejects the stale transition; the UI refreshes and asks the user to review rather than approving new data silently.',
    },
    {
      scenario: 'A command times out after the server may have accepted it.',
      expectation:
        'Keep the original operation identity and reconcile; do not invent success or create a new retry identity.',
    },
    {
      scenario: 'A feature imports another feature’s mutable internal store.',
      expectation:
        'Make the shared contract explicit or reject the import; moving folders alone is insufficient.',
    },
    {
      scenario: 'The adapter returns a different order or total.',
      expectation:
        'Reject the inconsistent receipt before the UI treats it as the expected approval.',
    },
    {
      scenario: 'An old result arrives after navigation to a different order.',
      expectation:
        'Update the canonical record by identity and do not overwrite the new selection or pending state.',
    },
  ],
  takeaways: [
    'Separate Angular composition, dependency direction, domain ownership and deployment before comparing architectures.',
    'Choose abstractions that protect a real invariant or volatile dependency; every boundary has a maintenance cost.',
    'Migrate behind a stable seam and keep one authoritative write path.',
    'A tested domain example is evidence for a boundary, not proof of an enterprise architecture or server guarantee.',
  ],
  references: [
    {
      label: 'Angular: standalone migration',
      url: 'https://angular.dev/reference/migrations/standalone',
    },
    { label: 'Angular: NgModules', url: 'https://angular.dev/guide/ngmodules/overview' },
    {
      label: 'Angular: hierarchical dependency injection',
      url: 'https://angular.dev/guide/di/hierarchical-dependency-injection',
    },
    {
      label: 'Angular: route loading strategies',
      url: 'https://angular.dev/guide/routing/loading-strategies',
    },
    {
      label: 'Martin Fowler: bounded context',
      url: 'https://martinfowler.com/bliki/BoundedContext.html',
    },
    {
      label: 'Alistair Cockburn: hexagonal architecture',
      url: 'https://alistair.cockburn.us/hexagonal-architecture/',
    },
  ],
};
