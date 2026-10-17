import type { EngineeringStudy } from '../models/study.models';
import { dependencyInjectionPreview } from './engineering-previews.data';

export const angularDependencyInjection: EngineeringStudy = {
  ...dependencyInjectionPreview,
  presentation: 'article',
  title: 'Angular Dependency Injection: Contracts, Factories and Multiple Backends',
  summary:
    'How Angular resolves dependencies, owns service lifetimes and connects the same feature to different backend implementations.',
  lead: 'An order screen should not need to know whether its data comes from a REST service, GraphQL or an in-memory test implementation. Dependency injection gives Angular a composition point: the feature asks for a contract, and application configuration decides which implementation supplies it. The useful questions are what to inject, who creates it, where the instance lives and how that choice affects consumers.',
  scopeNote: '',
  technologies: ['Angular', 'InjectionToken', 'EnvironmentInjector', 'HttpClient', 'TestBed'],
  relatedSlugs: ['angular-architectures', 'accessibility', 'web-performance'],
  sections: [
    {
      id: 'tokens-and-contracts',
      label: 'Contracts & tokens',
      title: 'A token is the lookup key; a service is one possible value',
      paragraphs: [
        'Angular resolves a dependency by token. A class can be both the token and the implementation, which makes an ordinary application service easy to provide. A TypeScript interface cannot be a runtime token because it is erased during compilation. Use InjectionToken when a feature depends on an interface, configuration, a callback or another value without a suitable class token.',
        'Keep the domain contract small enough to describe what the feature needs. It should not expose HttpResponse, GraphQL envelopes or an HTTP base URL. Both backends should translate their transport-specific behavior into that contract. Identical TypeScript signatures are only the beginning: error semantics, cancellation, freshness and authorization must also be consistent for a replacement to be safe.',
      ],
      codeExamples: [
        {
          title: 'One feature contract, independent of the transport',
          language: 'typescript',
          code: `export interface Order {
  readonly id: string;
  readonly reference: string;
}
export interface OrdersBackend {
  load(id: string): Observable<Order>;
}
export const ORDERS_BACKEND = new InjectionToken<OrdersBackend>('ORDERS_BACKEND');`,
          explanation:
            'The token object is the identity. Two new InjectionToken calls with the same description are two different tokens. Export one token and import that same instance at every composition point. A token can also declare a root factory for a safe default; override it with a provider when an application needs a different value.',
        },
      ],
    },
    {
      id: 'constructor-or-inject',
      label: 'Requesting a dependency',
      title: 'Constructor injection and inject() use the same resolution system',
      paragraphs: [
        'Constructor parameters make a class dependency list explicit and are convenient when constructing the class directly in a unit test. inject() fits field initializers, functional guards, interceptors and provider factories, and infers the type from an InjectionToken without a separate @Inject decorator. Choose based on the API and construction style; neither form creates a different service scope or automatically improves performance.',
        'An injectable class is useful when a dependency owns behavior or state across calls. A pure calculation can stay an ordinary function. Do not turn every function into a service solely to make it injectable. Keep the domain model independent of Angular when it does not need Angular facilities, and inject an application-facing coordinator around it.',
      ],
      codeExamples: [
        {
          title: 'Constructor parameters show the dependency at construction',
          language: 'typescript',
          code: `@Injectable()
export class OrderReader {
  constructor(@Inject(ORDERS_BACKEND) private readonly backend: OrdersBackend) {}
  load(id: string) { return this.backend.load(id); }
}

// A plain unit test can also construct it explicitly:
const reader = new OrderReader(fakeBackend);`,
        },
        {
          title: 'inject() is useful in Angular-created classes and functions',
          language: 'typescript',
          code: `@Injectable()
export class OrderReader {
  private readonly backend = inject(ORDERS_BACKEND);
  load(id: string) { return this.backend.load(id); }
}

export const canOpenOrders: CanMatchFn = () => {
  const session = inject(SessionService);
  return session.canViewOrders();
};`,
          explanation:
            'The two OrderReader declarations are alternatives. A guard controls client navigation; backend authorization remains mandatory. A class with an inject() initializer must be constructed in an injection context, unlike the constructor-only version that can accept a fake directly.',
        },
      ],
    },
    {
      id: 'provider-recipes',
      label: 'Provider recipes',
      title: 'Choose what the injector should create—or reuse',
      paragraphs: [
        'A provider connects a token to a recipe. useClass asks Angular to instantiate a class and resolve its dependencies. useValue supplies an existing value. useFactory executes a synchronous construction function when the token is first resolved. useExisting makes one token an alias for another token, preserving the same instance.',
        'A factory can request dependencies through inject() or through a deps array passed as factory arguments. A deps array resolves every listed dependency; conditional inject() can avoid constructing an unselected backend. A factory is generally evaluated once per provider record in its owning injector, not on every inject() call. It is therefore a configuration and construction decision, not a reactive backend switch. If the backend must change during a session, inject a stable delegating service whose methods select the active backend, and define what happens to pending requests and cached data.',
      ],
      table: {
        caption: 'Angular provider recipes and the choice they express',
        columns: ['Recipe', 'Useful for', 'Important consequence'],
        rows: [
          [
            'useClass',
            'A replaceable service implementation',
            'Each provider record can create its own instance',
          ],
          [
            'useValue',
            'Configuration, a callback or a test double',
            'Angular receives the supplied value; it does not construct it',
          ],
          [
            'useFactory',
            'Selecting or constructing from other dependencies',
            'The factory runs in an injection context; async results are not unwrapped',
          ],
          [
            'useExisting',
            'Two tokens for the same service',
            'The alias resolves to the existing provider instance',
          ],
        ],
      },
      codeExamples: [
        {
          title: 'Alias an implementation instead of accidentally duplicating it',
          language: 'typescript',
          code: `providers: [
  RestOrdersBackend,
  { provide: ORDERS_BACKEND, useExisting: RestOrdersBackend },
]

// By contrast, providing RestOrdersBackend AND this recipe can create
// two separate instances:
// { provide: ORDERS_BACKEND, useClass: RestOrdersBackend }`,
        },
      ],
    },
    {
      id: 'multiple-backends',
      label: 'REST & GraphQL',
      title: 'Compose the same feature with two different backends',
      paragraphs: [
        'Keep transport translation at the adapter boundary. The REST adapter maps a resource response; the GraphQL adapter maps data and errors from an operation result. Both return an Order through the same Observable contract. The screen and OrderReader have no conditionals for transport selection.',
        'Configuration belongs at the composition boundary. A provideOrdersBackend function keeps the config token, implementation registrations and selection recipe together. Both adapters are registered, but Angular only constructs an adapter when it is requested. This pattern does not automatically remove the unused adapter from the bundle: runtime selection requires both implementations to be available.',
      ],
      codeExamples: [
        {
          title: 'Give each adapter one transport responsibility',
          language: 'typescript',
          code: `export interface OrdersConfig {
  readonly transport: 'rest' | 'graphql';
  readonly endpoint: string;
}
const ORDERS_CONFIG = new InjectionToken<OrdersConfig>('ORDERS_CONFIG');

@Injectable()
export class RestOrdersBackend implements OrdersBackend {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ORDERS_CONFIG);
  load(id: string): Observable<Order> {
    return this.http.get<unknown>(
      this.config.endpoint + '/orders/' + encodeURIComponent(id),
    ).pipe(map(decodeOrder));
  }
}

@Injectable()
export class GraphqlOrdersBackend implements OrdersBackend {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ORDERS_CONFIG);
  load(id: string): Observable<Order> {
    return this.http.post<unknown>(this.config.endpoint, {
      query: 'query Order($id: ID!) { order(id: $id) { id reference } }',
      variables: { id },
    }).pipe(map(decodeGraphqlOrder));
  }
}`,
          explanation:
            'decodeOrder and decodeGraphqlOrder represent runtime response decoders at the trust boundary. The GraphQL decoder must handle errors even when HTTP status is 200. Validate runtime configuration before providing it, and never put backend secrets in a browser token.',
        },
        {
          title: 'A provider function makes backend selection reviewable',
          language: 'typescript',
          code: `export function provideOrdersBackend(config: OrdersConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ORDERS_CONFIG, useValue: Object.freeze({ ...config }) },
    RestOrdersBackend,
    GraphqlOrdersBackend,
    {
      provide: ORDERS_BACKEND,
      useFactory: () => inject(ORDERS_CONFIG).transport === 'rest'
        ? inject(RestOrdersBackend)
        : inject(GraphqlOrdersBackend),
    },
    OrderReader,
  ]);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideOrdersBackend({ transport: 'rest', endpoint: '/api' }),
  ],
};`,
          explanation:
            'For a GraphQL deployment, provide transport: graphql and its endpoint. A build-time choice can import only one provider implementation; a runtime choice is more flexible but can ship both. The application bootstrap owns the choice, while the feature consumes the same contract.',
        },
        {
          title: 'The consuming Angular component stays transport-agnostic',
          language: 'typescript',
          code: `@Component({
  imports: [AsyncPipe],
  template: \`@if (order$ | async; as order) {
    <h1>Order {{ order.reference }}</h1>
  }\`,
})
export class OrderPage {
  private readonly reader = inject(OrderReader);
  private readonly route = inject(ActivatedRoute);
  readonly order$ = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter((id): id is string => id !== null),
    distinctUntilChanged(),
    switchMap(id => this.reader.load(id)),
  );
}`,
          explanation:
            'AsyncPipe manages the template subscription; switchMap replaces a stale read when the route ID changes. Add explicit loading and error states for the complete UI. Backend selection remains outside the component.',
        },
      ],
    },
    {
      id: 'scopes-and-lifetimes',
      label: 'Scope & lifetime',
      title: 'Provider location determines ownership',
      paragraphs: [
        'providedIn: root supplies an application-wide provider and supports tree-shaking when the service is unused. Route providers establish an EnvironmentInjector boundary for a feature and its children. Component providers live in an ElementInjector and can supply a separate instance for each component instance. A service is not universally a singleton: its provider records and injector hierarchy determine how many instances exist.',
        'Resolution starts from the requesting context and searches eligible parents. A child override does not reconfigure an already-created root service. If OrderReader is provided at root and captures the root ORDERS_BACKEND, overriding only the backend on a route does not change that reader. Provide the reader and backend together at the intended feature boundary.',
        'Component destruction destroys its injector-owned services; route reuse and retained environment injectors need more care. Do not assume every navigation away guarantees a reset. Use DestroyRef for resources owned by the injector, and define an explicit reset policy for transient state, caches and changes of account.',
      ],
      codeExamples: [
        {
          title: 'Different routes can compose the same feature differently',
          language: 'typescript',
          code: `export const routes: Routes = [
  {
    path: 'legacy-orders',
    providers: [provideOrdersBackend({ transport: 'rest', endpoint: '/api' })],
    loadChildren: () => import('./orders/orders.routes').then(m => m.ORDER_ROUTES),
  },
  {
    path: 'new-orders',
    providers: [provideOrdersBackend({ transport: 'graphql', endpoint: '/graphql' })],
    loadChildren: () => import('./orders/orders.routes').then(m => m.ORDER_ROUTES),
  },
];

// The route provider function provides OrderReader as well as its backend.
// Do not provide a conflicting backend inside ORDER_ROUTES.`,
        },
      ],
    },
    {
      id: 'constructor-values',
      label: 'Passing constructors',
      title: 'Inject an instance by default; pass a constructor for explicit creation',
      paragraphs: [
        'useClass: RestOrdersBackend means “Angular, construct the implementation for this token.” It does not inject the constructor itself. useValue: RestOrdersBackend would instead supply the class value. Passing a constructor is useful when a coordinator must create multiple independent objects with per-call parameters—for example, a backend session for each connected workspace.',
        'That changes ownership. Objects created with new are outside the injector-owned lifecycle, and their constructor dependencies are supplied manually. Their constructors should not secretly call inject() from a later method. If an implementation itself needs Angular DI, prefer a factory that captures Angular dependencies during provider creation, or use createComponent with an appropriate injector for dynamic Angular components.',
      ],
      codeExamples: [
        {
          title: 'A typed constructor token for plain, explicitly owned sessions',
          language: 'typescript',
          code: `interface BackendSession {
  close(): void;
}
interface SessionConstructor {
  new (endpoint: URL): BackendSession;
}
const SESSION_CONSTRUCTOR = new InjectionToken<SessionConstructor>('SESSION_CONSTRUCTOR');

// RestSession is a plain class taking a URL, not an Angular service.
{ provide: SESSION_CONSTRUCTOR, useValue: RestSession }

@Injectable()
export class SessionFactory {
  private readonly Session = inject(SESSION_CONSTRUCTOR);
  create(endpoint: URL): BackendSession {
    return new this.Session(endpoint);
  }
}
// The caller owns each returned session and must close it.`,
          explanation:
            'A constructor token is a deliberate creation API, not the usual way to switch injectable services. A callback token such as (endpoint: URL) => BackendSession is often even simpler and hides the constructor completely.',
        },
      ],
    },
    {
      id: 'factories-and-startup',
      label: 'Factories & configuration',
      title: 'A provider factory is synchronous; application startup can wait',
      paragraphs: [
        'useFactory can combine injected services, configuration and a construction policy. It is useful for adapting an external client, selecting an implementation or producing a function. The injector does not await an async factory: an async function provides a Promise value. If consumers need resolved runtime configuration before they are created, load it through an application initializer or before bootstrap.',
        'Keep initialization bounded and define failure behavior. A missing config response can block bootstrap if startup is waiting for it. A request used for configuration should not depend on an interceptor that itself requires that unfinished configuration. For SSR, separate server-only credentials from browser-safe configuration and avoid process-global mutable tenant state.',
      ],
      codeExamples: [
        {
          title: 'Load runtime configuration before the backend is first consumed',
          language: 'typescript',
          code: `providers: [
  RuntimeConfig,
  provideAppInitializer(() => inject(RuntimeConfig).load()),
  {
    provide: ORDERS_CONFIG,
    useFactory: () => inject(RuntimeConfig).orders(),
  },
  // Register adapters, ORDERS_BACKEND and OrderReader as in the provider recipe.
]

// RuntimeConfig.load() returns a Promise/Observable that completes.
// RuntimeConfig.orders() returns validated, browser-safe configuration.
// Nothing should resolve ORDERS_BACKEND until initialization has completed.`,
          explanation:
            'The initializer and factory serve different purposes: one waits for startup work, the other supplies a synchronously available value. In this alternative, omit the ORDERS_CONFIG useValue provider from the earlier static-config recipe.',
        },
      ],
    },
    {
      id: 'multi-providers',
      label: 'Extension points',
      title: 'Use multi providers for a collection, not for backend selection',
      paragraphs: [
        'A multi token collects contributions from providers in the same injector. It is useful for validators, policy checks or feature plugins when the caller intentionally runs several implementations. It is different from choosing one ORDERS_BACKEND. Keep the expected ordering and error behavior explicit, and do not mix multi and regular providers for the same token.',
        'Do not assume a child multi provider automatically concatenates all contributions from parent injectors. If a feature must inherit and extend a parent collection, model that aggregation deliberately using a separate local token and an explicit parent lookup. For HTTP middleware, Angular functional interceptors often make ordering clearer than a DI plugin collection.',
      ],
      codeExamples: [
        {
          title: 'Contribute feature policies through a multi token',
          language: 'typescript',
          code: `type OrderPolicy = (order: Order) => string | null;
const ORDER_POLICIES = new InjectionToken<readonly OrderPolicy[]>('ORDER_POLICIES');

providers: [
  { provide: ORDER_POLICIES, useValue: requireReference, multi: true },
  { provide: ORDER_POLICIES, useValue: validateReferenceFormat, multi: true },
]

// Inside an Angular injection context:
const policies = inject(ORDER_POLICIES, { optional: true }) ?? [];
const errors = policies.map(check => check(order)).filter(error => error !== null);`,
        },
      ],
    },
    {
      id: 'resolution-and-context',
      label: 'Resolution rules',
      title: 'Make context and hierarchy explicit when the default is wrong',
      paragraphs: [
        'inject() requires a synchronous injection context: a class being constructed by Angular, a provider factory or an API such as a functional guard. ngOnInit, an arbitrary event handler and code after await are not automatically injection contexts. Capture the needed dependency during construction and use the instance later. runInInjectionContext can establish a synchronous context for integration code, but does not carry that context across an asynchronous continuation.',
        'optional returns null when resolution fails. self restricts the lookup to the current injector; skipSelf starts at a parent; host constrains element-hierarchy lookup at the host boundary. Use these options to express an actual ownership contract, not to hide a missing provider. Circular dependencies usually indicate responsibilities that need separating; forwardRef can defer a reference, but cannot repair an architectural cycle.',
      ],
      codeExamples: [
        {
          title: 'Capture dependencies before entering asynchronous work',
          language: 'typescript',
          code: `@Injectable()
export class OrderActions {
  private readonly backend = inject(ORDERS_BACKEND);
  private readonly audit = inject(AuditTrail, { optional: true });

  async refresh(id: string) {
    const order = await firstValueFrom(this.backend.load(id));
    this.audit?.record('order-loaded', order.id);
    return order;
  }
}

// For a component that intentionally inherits a parent's store:
// readonly parent = inject(OrderStore, { skipSelf: true, optional: true });`,
        },
      ],
    },
    {
      id: 'dynamic-injectors',
      label: 'Dynamic composition',
      title: 'Create a child injector only when the lifetime needs its own boundary',
      paragraphs: [
        'A plugin host or workspace manager may need an environment that does not correspond to a routed page. createEnvironmentInjector can provide a backend contract for that environment while inheriting platform services from its parent. Keep ownership explicit: the code that creates this injector is responsible for destroying it.',
        'Do not create an injector for each request. That can fragment caches, duplicate stateful services and make cleanup harder. A component, route or application injector usually already supplies the correct boundary. Use a dynamic environment when its independent lifetime is itself a requirement, and remember that it does not rewrite the dependencies captured by parent-owned services.',
      ],
      codeExamples: [
        {
          title: 'An explicitly owned environment for one workspace',
          language: 'typescript',
          code: `// Inside a DI-created host service:
private readonly parent = inject(EnvironmentInjector);

openWorkspace() {
  const workspace = createEnvironmentInjector([
    provideOrdersBackend({ transport: 'rest', endpoint: '/workspace-api' }),
  ], this.parent);
  const reader = workspace.get(OrderReader);
  return {
    reader,
    close: () => workspace.destroy(),
  };
}
// The workspace owner calls close() on every exit path.`,
          explanation:
            'Provider-owned cleanup can use DestroyRef inside the child environment. Objects returned to a caller should not continue making requests after that environment has been closed.',
        },
      ],
    },
    {
      id: 'testing-di',
      label: 'Testing the composition',
      title: 'Test replacement, identity and scope as separate contracts',
      paragraphs: [
        'A fake backend makes the feature test independent of the network. It should implement the same contract rather than imitate HttpClient internals. Test each real adapter separately with provideHttpClientTesting and HttpTestingController: URL/operation mapping, response decoding, errors and cancellation. Test the provider factory with both transport configurations to confirm the intended implementation is selected.',
        'Provider location deserves its own test. Check whether two consumers should share an instance, whether a component-scoped store is isolated and whether useExisting preserves identity. Override a provider before the testing injector is instantiated. For components that declare their own providers, a root TestBed override may not reach the component injector; use overrideComponent to change the owning boundary.',
      ],
      codeExamples: [
        {
          title: 'Replace the backend without changing the reader',
          language: 'typescript',
          code: `const fake: OrdersBackend = {
  load: id => of({ id, reference: 'TEST-001' }),
};
TestBed.configureTestingModule({
  providers: [OrderReader, { provide: ORDERS_BACKEND, useValue: fake }],
});
const reader = TestBed.inject(OrderReader);
expect(await firstValueFrom(reader.load('42'))).toEqual({
  id: '42', reference: 'TEST-001',
});`,
        },
        {
          title: 'Verify an alias shares the existing instance',
          language: 'typescript',
          code: `TestBed.configureTestingModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
    { provide: ORDERS_CONFIG, useValue: { transport: 'rest', endpoint: '/api' } },
    RestOrdersBackend,
    { provide: ORDERS_BACKEND, useExisting: RestOrdersBackend },
  ],
});
expect(TestBed.inject(ORDERS_BACKEND)).toBe(TestBed.inject(RestOrdersBackend));`,
          explanation:
            'Provide HttpClient before its testing backend override. Assert the identity contract separately from transport behavior so a provider refactor cannot silently duplicate a stateful adapter.',
        },
      ],
    },
  ],
  flow: { title: '', steps: [] },
  decisions: [],
  checks: [],
  takeaways: [],
  references: [
    { label: 'Angular — Dependency injection', url: 'https://angular.dev/guide/di' },
    {
      label: 'Angular — Configuring dependency providers',
      url: 'https://angular.dev/guide/di/dependency-injection-providers',
    },
    {
      label: 'Angular — Hierarchical injectors',
      url: 'https://angular.dev/guide/di/hierarchical-dependency-injection',
    },
    {
      label: 'Angular — Injection context',
      url: 'https://angular.dev/guide/di/dependency-injection-context',
    },
    { label: 'Angular — InjectionToken', url: 'https://angular.dev/api/core/InjectionToken' },
    {
      label: 'Angular — Application initialization',
      url: 'https://angular.dev/api/core/provideAppInitializer',
    },
    { label: 'Angular — HTTP testing', url: 'https://angular.dev/guide/http/testing' },
  ],
};
