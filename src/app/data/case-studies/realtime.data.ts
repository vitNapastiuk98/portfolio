import { professionalPreviews } from '../professional-previews.data';
import type { ProfessionalStudy } from '../../models/professional-study.models';
export const realtimeStudy: ProfessionalStudy = {
  ...professionalPreviews[2],
  lead: 'A video consultation can still carry media while its application-event connection is reconnecting. It can also appear connected while a microphone permission has been revoked. A single online boolean cannot describe that experience truthfully.',
  scopeNote:
    'The project responsibilities below follow supplied experience. State machines, recovery sequences and Angular code are independent illustrative designs; exact retry policies are not attributed to production.',
  sections: [
    {
      id: 'context',
      label: 'Context & constraints',
      title: 'Two professional settings, several independent lifecycles',
      paragraphs: [
        'Frontend leadership on Sportello Telematico Evoluto covered an Angular 16 citizen/operator consultation experience: video and chat, screen sharing, device selection and changes, background replacement, Picture-in-Picture, connection recovery, session handling, permission-sensitive interfaces and backend integration. Azure Communication Services supplied communication/media capabilities; SignalR carried application-level events and notifications. SignalR was not the transport carrying ACS media.',
        'Brochesia / BView adds industrial remote assistance involving web applications, Android/smart-glasses clients and video collaboration, with WebRTC, OpenVidu, Kurento, Angular, Node.js and Kotlin in the ecosystem. These systems make resource ownership and recoverable UI state important across device and network changes. Application Insights in the public-sector context supplied telemetry for diagnosing the experience.',
      ],
    },
    {
      id: 'architecture',
      label: 'Architectural decision',
      title: 'Represent session, media and events separately',
      paragraphs: [
        'The reference design gives a business session its own identity and authority. Media state reports whether audio/video can flow. Application-event state reports whether business notifications can be received. Derived UI state explains the combination: “Call active; updates reconnecting” is more useful than toggling the entire screen to offline.',
        'Keeping separate channels is more work than one connection status, but it prevents a transport reconnect from being mistaken for a new business session. Local camera and microphone choices remain a separate device concern. An operator action may still require backend permission checks even when both transports are healthy.',
      ],
      diagram: {
        id: 'realtime-channels',
        title: 'Independent communication responsibilities',
        caption:
          'Reference responsibility map: media and application notifications are separate paths, not a claim about a private deployment topology.',
        nodes: [
          { id: 'ui', label: 'Angular session UI', detail: 'Derived, truthful feedback' },
          { id: 'session', label: 'Business session', detail: 'Identity, role, revision' },
          { id: 'events', label: 'Application events', detail: 'SignalR notifications' },
          { id: 'devices', label: 'Device controller', detail: 'Permissions and tracks' },
          { id: 'media', label: 'Media controller', detail: 'ACS / WebRTC lifecycle' },
          { id: 'server', label: 'Session endpoint', detail: 'Authoritative snapshot' },
        ],
        edges: [
          { from: 'ui', to: 'session' },
          { from: 'session', to: 'events' },
          { from: 'ui', to: 'devices' },
          { from: 'devices', to: 'media' },
          { from: 'events', to: 'server' },
        ],
      },
      codeExamples: [
        {
          title: 'An illustrative state machine with a reconciliation gate',
          language: 'typescript',
          code: `type EventChannel = 'connected' | 'reconnecting' | 'offline';
type Media = 'joining' | 'active' | 'degraded' | 'ended';
type SessionPhase = 'idle' | 'joining' | 'active' | 'reconciling' | 'ended';
// idle -> joining -> active
// active + event-channel loss -> reconciling (media may remain active)
// reconciling + accepted server snapshot -> active
// reconciling + session expired -> ended
// Ending the business session terminates both channels explicitly.`,
        },
      ],
    },
    {
      id: 'recovery',
      label: 'Recovery sequence',
      title: 'Reconnect the transport, then reconcile the session',
      paragraphs: [
        'Transport reconnection alone does not tell the application which messages it missed. An illustrative recovery sequence pauses permission-sensitive commands, reconnects the event channel, fetches an authoritative session snapshot and resumes only after local state matches its revision. Events received during reconciliation need ordering rules; simply replaying them can apply old transitions after a newer snapshot.',
        'Use an epoch or session identifier to reject callbacks from a previous call. Backoff with jitter can reduce retry pressure, but retries must be bounded by session validity and cancellation. Automatic read retries are different from retrying a command with an uncertain outcome: a server-side idempotency contract or a status query is needed before repeating a write.',
      ],
      codeExamples: [
        {
          title: 'A recovery sequence to reason about before choosing a library',
          language: 'text',
          code: `Event connection lost → mark updates as reconnecting
Media remains active → retain the call controls that are still valid
Reconnect transport → request session snapshot with identity/revision
Reject stale callbacks → reconcile missed changes against authority
Session valid → re-enable commands; session expired → explain and end
User leaves at any step → cancel recovery and dispose owned resources`,
        },
      ],
    },
    {
      id: 'ownership',
      label: 'Angular implementation',
      title: 'A session-scoped service owns cleanup',
      paragraphs: [
        'A media SDK usually exposes several resources: event listeners, active calls, local tracks and device-change observers. Binding all of those directly to presentation components creates duplicate listeners when views are recreated. Put the lifecycle behind an owned service; components bind derived state and send intent.',
        'The reference Angular service uses a disposal contract instead of assuming every SDK shares the same close method. A session-scoped service must also handle acquisition finishing after its owner has been destroyed. A root service can intentionally survive navigation, but then it needs an explicit leave/reset policy and must not leak one citizen’s session into another.',
      ],
      codeExamples: [
        {
          title: 'Dispose even when asynchronous acquisition finishes late',
          language: 'typescript',
          code: `interface SessionResources { dispose(): Promise<void>; }
interface SessionAdapter { acquire(): Promise<SessionResources>; }
@Injectable()
export class SessionOwner {
  private readonly destroy = inject(DestroyRef);
  private resources?: SessionResources;
  private readonly telemetry = inject(SessionTelemetry);
  private readonly adapter = inject(SESSION_ADAPTER);
  readonly phase = signal<'idle' | 'joining' | 'active' | 'error'>('idle');
  constructor() {
    this.destroy.onDestroy(() => {
      const resource = this.resources;
      this.resources = undefined;
      if (resource) void this.release(resource);
    });
  }
  async join() {
    if (this.phase() !== 'idle') return;
    this.phase.set('joining');
    try {
      const acquired = await this.adapter.acquire();
      if (this.destroy.destroyed) { await this.release(acquired); return; }
      this.resources = acquired;
      this.phase.set('active');
    } catch (error) {
      if (!this.destroy.destroyed) this.phase.set('error');
      this.telemetry.recordFailure(error);
    }
  }
  private async release(resource: SessionResources) {
    try { await resource.dispose(); }
    catch (error) { this.telemetry.recordFailure(error); }
  }
}
// The adapter removes listeners, stops owned tracks and leaves its call.
// It must also clean partially acquired resources if acquire() rejects.`,
        },
      ],
    },
    {
      id: 'observability',
      label: 'Failure analysis',
      title: 'Observe transitions without collecting the conversation',
      paragraphs: [
        'Log correlation identifiers, state transitions, SDK error categories and timing boundaries that explain a failed join or recovery. Avoid media content, tokens, personal chat and unnecessary device identifiers. A trace should distinguish session authorization failure, media permission denial and event-channel reconnection instead of collapsing them into one generic connection error.',
        'Some failures are local to a device: unplugging a microphone should trigger a recoverable selection path, not silently keep a dead track. Background replacement and Picture-in-Picture introduce their own feature and platform constraints. Degrading an optional effect can be preferable to ending a consultation, provided the interface explains the current capability.',
      ],
    },
  ],
  flow: {
    title: 'Session lifecycle with explicit recovery authority',
    steps: [
      { title: 'Join', detail: 'Resolve identity, permissions and owned communication resources.' },
      { title: 'Operate', detail: 'Render business, media and event state independently.' },
      {
        title: 'Reconcile',
        detail: 'Reconnect events and accept an authoritative snapshot before commands resume.',
      },
      { title: 'Leave', detail: 'Dispose channels, listeners and tracks; reject late results.' },
    ],
  },
  decisions: [
    {
      title: 'Separate channels',
      choice: 'Keep media and application-event state independent.',
      tradeoff: 'More states to explain, but fewer misleading online/offline transitions.',
    },
    {
      title: 'Recovery authority',
      choice: 'Reconcile a snapshot after an event gap.',
      tradeoff: 'Adds a backend contract and latency; blind replay is simpler but can be wrong.',
    },
    {
      title: 'Session ownership',
      choice: 'One owner disposes SDK resources.',
      tradeoff: 'Its lifetime must match whether a call should survive navigation.',
    },
  ],
  checks: [
    {
      scenario: 'SignalR disconnects while media is active',
      expectation: 'Explain event recovery without falsely declaring the call ended.',
    },
    {
      scenario: 'Microphone is unplugged or permission revoked',
      expectation: 'Expose the unavailable device and a selection/recovery action.',
    },
    {
      scenario: 'User leaves while joining',
      expectation: 'Dispose a late-acquired call instead of publishing it into an abandoned view.',
    },
    {
      scenario: 'A callback belongs to a previous session',
      expectation: 'Reject it by identity/epoch before applying state.',
    },
  ],
  takeaways: [
    'A transport connection is not the business session.',
    'Resource cleanup and stale-event rejection are part of reliability.',
    'Observability should explain transitions without exposing conversation content.',
  ],
  references: [
    {
      label: 'Azure Communication Services overview',
      url: 'https://learn.microsoft.com/azure/communication-services/overview',
    },
    {
      label: 'SignalR JavaScript client',
      url: 'https://learn.microsoft.com/aspnet/core/signalr/javascript-client',
    },
    {
      label: 'Angular — Component lifecycle',
      url: 'https://angular.dev/guide/components/lifecycle',
    },
  ],
  related: [
    {
      label: 'Real-time session recovery design study',
      path: '/engineering/resilient-real-time-sessions',
    },
    { label: 'Computer vision in live video', path: '/case-studies/computer-vision' },
  ],
};
