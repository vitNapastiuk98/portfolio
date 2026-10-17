import { angularDependencyInjection } from './angular-dependency-injection.data';
import { accessibilityStudy } from './accessibility.data';
import { angularArchitecturesStudy } from './angular-architectures.data';
import type { EngineeringStudy } from '../models/study.models';
import { webPerformance } from './web-performance.data';
import { opencvAnchoredAnnotations } from './opencv-anchored-annotations.data';

export const engineeringStudies: readonly EngineeringStudy[] = [
  webPerformance,
  accessibilityStudy,
  angularArchitecturesStudy,
  angularDependencyInjection,
  {
    slug: 'reactive-consistency',
    title: 'Reactive consistency starts with ownership',
    category: 'State architecture',
    summary:
      'A design study of canonical state, derived values, and asynchronous boundaries in reactive interfaces.',
    lead: 'A reactive screen can update instantly and still describe an impossible situation. A selected account, its permissions, and its pending request may each be individually valid while belonging to different moments. The useful design question is which owner can guarantee that these values describe the same user intent.',
    scopeNote:
      'Technical design study: conceptual guidance with illustrative examples and proposed checks, not a description of deployed client architecture, measured production outcomes, or tests already run.',
    sections: [
      {
        id: 'canonical-owner',
        label: 'Ownership',
        title: 'Store intent once; derive the rest',
        paragraphs: [
          'Consider an account picker with a detail panel. Store the selected account ID and the loaded account collection. Derive the selected account from those inputs instead of storing a second mutable selected-account object. The invariant is simple: every visible detail belongs to the selected ID, or the screen explicitly shows that its data is unavailable. Refreshing the collection cannot silently leave a detached object on screen.',
          'Ownership also defines lifetime. A route can own the selected ID while a shared repository owns reusable account records. A child component receives values and emits user intent; it does not maintain an independent account selection. The counterexample is two subscribers copying each other through effects. Their apparent synchronization creates ordering questions and makes it unclear which update wins when navigation and refresh happen together.',
        ],
      },
      {
        id: 'derivation-contract',
        label: 'Derivation',
        title: 'Equality is an observable contract',
        paragraphs: [
          'Angular computed signals are lazy and memoized, and track the signals actually read during their latest derivation. Use that model for synchronous projections such as whether an account can be edited. Keep the derivation free of network requests and writes to other state. A computed value answers a question; it should not also initiate the operation whose result changes the answer.',
          'An equality function decides when two values count as unchanged for reactive consumers. Comparing only an account ID would hide a permission change if permissions are part of the value consumers need. Structural equality may avoid redundant downstream updates, but it does not deduplicate every side effect or provide transaction isolation. Logging, subscriptions, and imperative calls need their own lifecycle and ownership. Define equality around consumer-visible meaning before optimizing allocations.',
        ],
      },
      {
        id: 'async-authority',
        label: 'Async authority',
        title: 'A response needs permission to commit',
        paragraphs: [
          'Suppose the user selects account A and then account B before A finishes loading. Associate each load with the selected ID and a request generation. Commit a result only while both still match the current owner. Model loading, success, and failure together with that identity, so an old error cannot replace a newer success. A blank panel is not the only safe option: retained data can remain visible when clearly labeled as belonging to the previous selection.',
          'RxJS switchMap is useful when a new selection should unsubscribe from the previous inner stream. Unsubscription alone is not a universal promise that remote work stopped. An adapter may ignore cancellation, and a server may already have accepted a write. Keep an identity guard where results enter state, and give mutations their own semantics instead of treating every operation as a replaceable read.',
        ],
      },
    ],
    flow: {
      title: 'From selection to an authorized result',
      steps: [
        {
          title: 'Capture intent',
          detail: 'The route owner records the selected ID and advances its request generation.',
        },
        {
          title: 'Derive the view',
          detail: 'Pure projections expose matching cached data and an explicit loading state.',
        },
        {
          title: 'Resolve the read',
          detail:
            'A replaceable request returns data or an error tagged with its initiating identity.',
        },
        {
          title: 'Commit conditionally',
          detail: 'The owner accepts only the current generation, then dependent values recompute.',
        },
      ],
    },
    decisions: [
      {
        title: 'One selection owner',
        choice: 'Keep the selected ID in the route state.',
        tradeoff:
          'Children need explicit inputs and intent events, but navigation has one authoritative meaning.',
      },
      {
        title: 'Derived permissions',
        choice: 'Compute editability from current account and permission data.',
        tradeoff:
          'Missing inputs must be represented explicitly; copying a boolean would conceal that uncertainty.',
      },
      {
        title: 'Guarded replacement reads',
        choice: 'Combine stream replacement with a commit-time identity check.',
        tradeoff:
          'A small amount of request metadata remains necessary even when cancellation usually works.',
      },
    ],
    checks: [
      {
        scenario: 'A resolves after the user has selected B.',
        expectation: 'A cannot replace B’s data, error, or loading state.',
      },
      {
        scenario: 'Permissions change while the account ID stays the same.',
        expectation: 'Editability updates; an equality shortcut must not suppress the change.',
      },
      {
        scenario: 'A refreshed collection no longer contains the selection.',
        expectation:
          'The detail view shows an explicit unavailable state instead of an orphaned object.',
      },
      {
        scenario: 'The route closes with a read in flight.',
        expectation:
          'Owned subscriptions are disposed and a late callback cannot commit to the destroyed owner.',
      },
      {
        scenario: 'The same selected account is refreshed twice.',
        expectation: 'Only the current request generation can settle the loading and error state.',
      },
    ],
    takeaways: [
      'Write the consistency invariant before choosing a signal, stream, or store.',
      'Use derivation for relationships and explicit ownership for effects.',
      'Treat cancellation as resource management and commit authority as a separate correctness rule.',
    ],
    references: [
      {
        label: 'Angular: signals, computed values, and equality',
        url: 'https://angular.dev/guide/signals',
      },
      {
        label: 'RxJS: switchMap subscription behavior',
        url: 'https://rxjs.dev/api/operators/switchMap',
      },
      {
        label: 'MDN: AbortController cancellation',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
      },
    ],
  },
  {
    slug: 'resilient-real-time-sessions',
    title: 'Recovering a real-time session without losing its meaning',
    category: 'Real-time systems',
    summary:
      'A design study of separate signaling and media lifecycles, bounded recovery, and truthful connection status.',
    lead: 'A reconnecting socket does not necessarily mean a recovered conversation. A real-time interface must distinguish transport connectivity, application membership, and media health. Recovery is complete only when the state the product needs has been reconciled, or the interface explains which part remains unavailable.',
    scopeNote:
      'Technical design study: conceptual guidance with illustrative examples and proposed checks, not a description of deployed client architecture, measured production outcomes, or tests already run.',
    sections: [
      {
        id: 'separate-lifecycles',
        label: 'Lifecycles',
        title: 'Signaling and media fail independently',
        paragraphs: [
          'Imagine a browser conversation that uses a WebSocket for membership and negotiation messages and an RTCPeerConnection for media. Losing the socket can leave an established peer connection carrying audio. Conversely, an open socket says little about whether audio reaches the other participant. Track signaling availability, room membership, and media connection state separately, then derive a user-facing summary from those facts.',
          'The invariant is that the interface never reports a fully recovered session solely because a transport opened. A signaling interruption can display “Reconnecting session controls” while preserving working media. A media failure needs a different explanation. The counterexample is a single connected boolean toggled by both transports: whichever callback runs last hides the other failure and can offer controls that the server is not ready to honor.',
        ],
      },
      {
        id: 'recovery-budget',
        label: 'Recovery budget',
        title: 'Retry within a deadline and an ownership boundary',
        paragraphs: [
          'Give the session controller a recovery generation, a deadline, and a bounded retry schedule with backoff and jitter. Only one attempt owns the next transition. A new socket must authenticate and reconcile membership before application controls become available. If the server supports resumption, use its cursor or revision contract; otherwise obtain a fresh snapshot. Reconnecting alone does not prove that missed events were delivered.',
          'Treat a failed peer connection separately. An ICE restart can trigger renegotiation through signaling, but cannot guarantee recovery from every network or remote-peer failure. A transient disconnected state can justify observation within the product’s deadline rather than immediately rebuilding the call. If recovery exhausts its budget, stop automatic attempts and offer an explicit rejoin. Rejoining creates a new session generation so old callbacks cannot mutate it.',
        ],
      },
      {
        id: 'reconcile-intent',
        label: 'Reconciliation',
        title: 'Recover membership before replaying commands',
        paragraphs: [
          'A socket may close after the server accepts a command but before its acknowledgment arrives. Blind replay can duplicate a participant action. Where the application protocol supports it, assign an operation ID and have the server return the original outcome for repeated submissions. Where it does not, fetch authoritative state and ask the user to retry ambiguous actions. A transport acknowledgment and an application acknowledgment are different facts.',
          'Leaving the conversation must invalidate recovery immediately, close owned transports, and cancel scheduled attempts. Browser online events can prompt a guarded attempt, but they do not establish reachability to the service. Visibility changes can trigger reconciliation after suspension. Every trigger enters the same controller rather than starting its own reconnect loop. This keeps recovery explainable when the network, route, and user intent change at nearly the same time.',
        ],
      },
    ],
    flow: {
      title: 'A bounded recovery sequence',
      steps: [
        {
          title: 'Classify the failure',
          detail:
            'Record which transport or membership contract failed without discarding healthy media.',
        },
        {
          title: 'Attempt recovery',
          detail:
            'The current generation performs one scheduled attempt within the shared deadline.',
        },
        {
          title: 'Reconcile authority',
          detail:
            'Authenticate, restore membership, and obtain a snapshot or supported event continuation.',
        },
        {
          title: 'Resume or explain',
          detail: 'Enable reconciled controls, or stop and offer rejoin with an accurate status.',
        },
      ],
    },
    decisions: [
      {
        title: 'Separate state dimensions',
        choice: 'Track signaling, membership, and media independently.',
        tradeoff:
          'More explicit states are needed, but a working audio path can survive a controls outage.',
      },
      {
        title: 'Finite automatic recovery',
        choice: 'Use a deadline and bounded retries with jitter.',
        tradeoff:
          'Some sessions require manual rejoin; the interface avoids indefinite activity without progress.',
      },
      {
        title: 'Authoritative reconciliation',
        choice: 'Resume only through a documented server contract or fresh snapshot.',
        tradeoff:
          'Recovery may take another round trip, but missing events do not silently become accepted state.',
      },
      {
        title: 'Explicit ambiguous actions',
        choice: 'Deduplicate by operation ID where supported; otherwise reconcile before retry.',
        tradeoff:
          'Server cooperation is necessary for safe replay, and some outcomes must remain visibly uncertain.',
      },
    ],
    checks: [
      {
        scenario: 'Signaling drops while audio still flows.',
        expectation:
          'Audio remains attached and session controls report their restricted availability.',
      },
      {
        scenario: 'The socket opens but room membership has expired.',
        expectation:
          'The interface waits for membership reconciliation and does not declare recovery.',
      },
      {
        scenario: 'ICE recovery fails through the configured deadline.',
        expectation: 'Automatic recovery stops and an explicit rejoin action becomes available.',
      },
      {
        scenario: 'The user leaves during backoff, then enters another room.',
        expectation:
          'Old timers and callbacks cannot reconnect or update the new session generation.',
      },
      {
        scenario: 'A command was accepted before its acknowledgment was lost.',
        expectation:
          'A supported operation ID recovers the existing outcome; unsupported replay remains blocked pending reconciliation.',
      },
    ],
    takeaways: [
      'Define recovery in terms of application invariants, including membership and command outcomes.',
      'Give every retry a current owner, a deadline, and a terminal user-visible outcome.',
      'Preserve healthy media while repairing signaling, and acknowledge uncertainty when delivery is ambiguous.',
    ],
    references: [
      {
        label: 'W3C: WebRTC connection states and ICE restart',
        url: 'https://www.w3.org/TR/webrtc/',
      },
      {
        label: 'MDN: WebSocket lifecycle',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket',
      },
      {
        label: 'MDN: RTCPeerConnection.restartIce()',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/restartIce',
      },
    ],
  },
  {
    slug: 'ai-interface-state',
    title: 'State boundaries for an AI-assisted interface',
    category: 'AI interface design',
    summary:
      'A design study of untrusted proposals, stale responses, explicit action consent, and recoverable execution.',
    lead: 'An assistant can propose a next step without permission to execute it. Preserve that distinction across streaming, edits, retries, and navigation. The model proposes information; the application owns validation, authorization, and execution.',
    scopeNote:
      'Technical design study: conceptual guidance with illustrative examples and proposed checks, not a description of deployed client architecture, measured production outcomes, or tests already run.',
    sections: [
      {
        id: 'proposal-boundary',
        label: 'Proposals',
        title: 'Validate shape before interpreting intent',
        paragraphs: [
          'Consider an assistant that suggests updating a task’s due date. Its response may contain a task ID, a proposed date, and an explanation. Parse that response against an explicit contract: required fields, allowed action types, valid dates, and bounded text. Then apply domain checks against current application data. A syntactically valid task ID does not establish that the task exists or that the current user may edit it.',
          'Keep streamed text in a provisional display state. A partial object should never become an executable command, and a schema-valid response is still untrusted input. Render explanation text through the application’s safe text path. The counterexample is passing a generated action name directly to a dispatcher: an unexpected field or persuasive explanation can cross the boundary from suggestion into authority without a deliberate application decision.',
        ],
      },
      {
        id: 'request-lineage',
        label: 'Request lineage',
        title: 'A response belongs to a specific context',
        paragraphs: [
          'Associate every request with a request ID, the selected record, and the context revision used to produce it. If the user changes the task or edits its due date while a response is arriving, the old proposal loses commit authority. Cancellation saves resources where supported; an identity and revision check protects state even if a callback still arrives. Regenerating a response should replace the current proposal generation explicitly.',
          'Preserve useful distinctions in the view model: generating, invalid response, valid proposal, awaiting confirmation, executing, succeeded, and uncertain outcome. A generation error is different from an action failure. The user should be able to retry a read without accidentally repeating a write. Store confirmed action outcomes separately from replaceable conversational output so a late generation cannot overwrite evidence of an operation already accepted.',
        ],
      },
      {
        id: 'execution-authority',
        label: 'Execution authority',
        title: 'Consent attaches to a concrete operation',
        paragraphs: [
          'Separate reading a task from changing it. Before a write, show the exact task, proposed date, and relevant current value. Confirmation applies to that reviewed payload and revision, not to any later model output. If the payload changes, request confirmation again. The server must independently authorize the operation and reject stale revisions where concurrent edits would otherwise be overwritten. The model’s confidence cannot substitute for either check.',
          'Use an application operation ID for an accepted write and retain it across retries of that same operation. The server needs a deduplication contract; merely placing an ID in a browser request does not guarantee idempotency. After a timeout, report an uncertain outcome and reconcile by operation ID or authoritative state before sending another write. A changed payload is a new operation. This makes retry behavior follow user intent instead of network timing.',
        ],
      },
    ],
    flow: {
      title: 'From generated suggestion to confirmed change',
      steps: [
        {
          title: 'Capture context',
          detail:
            'Record the task, context revision, and request identity before generation begins.',
        },
        {
          title: 'Validate the proposal',
          detail:
            'Parse the completed response and check allowed values against current domain state.',
        },
        {
          title: 'Review the action',
          detail: 'Present the exact change and capture consent for that payload and revision.',
        },
        {
          title: 'Execute and reconcile',
          detail:
            'The server authorizes and deduplicates execution; the interface records a confirmed or uncertain outcome.',
        },
      ],
    },
    decisions: [
      {
        title: 'Untrusted structured output',
        choice: 'Validate both response shape and domain meaning before enabling action.',
        tradeoff:
          'Some plausible suggestions are rejected, but unsupported actions cannot enter the execution path.',
      },
      {
        title: 'Context-bound proposals',
        choice: 'Require matching request identity and context revision.',
        tradeoff:
          'A useful older answer may need regeneration after an edit; it cannot silently act on changed data.',
      },
      {
        title: 'Specific write consent',
        choice: 'Bind confirmation to the reviewed operation payload.',
        tradeoff:
          'Writes require an explicit review step, while read-only assistance can remain lightweight.',
      },
      {
        title: 'Stable operation identity',
        choice: 'Reuse an operation ID only when retrying the same accepted payload.',
        tradeoff:
          'The server must retain deduplication outcomes and expose a reconciliation path for ambiguous delivery.',
      },
    ],
    checks: [
      {
        scenario: 'A completed response omits the date or names an unsupported action.',
        expectation: 'Validation reports the invalid proposal and no execution control is enabled.',
      },
      {
        scenario: 'A response for task A arrives after navigation to task B.',
        expectation:
          'Its request identity prevents it from replacing B’s proposal or triggering an action.',
      },
      {
        scenario: 'The proposed date changes after the user confirms.',
        expectation:
          'Previous consent does not authorize the changed payload; review is required again.',
      },
      {
        scenario: 'Another editor changes the task before execution.',
        expectation:
          'Server revision checks reject the stale write and the interface presents current state for review.',
      },
      {
        scenario: 'The server accepts the write but the response times out.',
        expectation:
          'The interface reconciles the existing operation before retrying and never treats uncertainty as a confirmed failure.',
      },
    ],
    takeaways: [
      'Treat generated content as a proposal that crosses explicit validation and authorization boundaries.',
      'Make request lineage and consent part of state, so context changes revoke stale authority.',
      'Design the uncertain outcome before adding retries; idempotency requires a server-side contract.',
    ],
    references: [
      {
        label: 'MDN: client-side validation and server validation',
        url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation',
      },
      {
        label: 'MDN: AbortController cancellation',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
      },
      {
        label: 'RFC 9110: idempotent HTTP methods',
        url: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods',
      },
    ],
  },
  opencvAnchoredAnnotations,
];
