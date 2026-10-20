import { professionalPreviews } from '../professional-previews.data';
import type { ProfessionalStudy } from '../../models/professional-study.models';
export const aiStudy: ProfessionalStudy = {
  ...professionalPreviews[4],
  lead: 'A useful AI product is more than a transcript. It can present data, collect a decision and guide a multi-step business task. The difficult frontend boundary is turning uncertain model output into predictable application behavior without handing the model control of the browser or the user’s business operations.',
  scopeNote:
    'HeyVista context reflects frontend architectural and product-development responsibility from the supplied history. Contracts, diagrams and examples here are original; backend authorization and execution remain backend responsibilities.',
  sections: [
    {
      id: 'context',
      label: 'Product context',
      title: 'Frontend product engineering from the initial concept',
      paragraphs: [
        'HeyVista.ai / CSI Works involved architecting and developing the frontend from the initial product concept, translating requirements into modular Angular architecture and a working SaaS interface. The work included RAG-powered assistance, structured responses, schema-driven generative UI, multi-step interactions and reusable embeddable AI modules—not a one-off chatbot wrapper.',
        'The supplied scope describes ten supported interactive UI content types, five business action categories and twenty documented interaction scenarios. Those figures describe the product vocabulary and design coverage, not a benchmark or a claim that every interaction was independently tested here. Frontend ownership includes rendering, local interaction state, confirmation flows and embedding; it does not imply ownership of every proprietary backend or retrieval subsystem.',
      ],
    },
    {
      id: 'architecture',
      label: 'Architectural decision',
      title: 'Treat the response as data, not a new application',
      paragraphs: [
        'Raw model-generated HTML gives an external output source too much influence over DOM structure, semantics and interaction. Sanitization alone does not define which business behaviors are allowed. The reference design accepts a versioned response vocabulary, validates it and maps known block kinds to trusted Angular components.',
        'RAG and model orchestration provide backend context, but the frontend still treats each response as untrusted. Unknown kinds, oversized collections, invalid identifiers and malformed action proposals need an explicit fallback. A schema cannot decide whether a business operation is authorized; that remains a separate backend check at execution time.',
      ],
      diagram: {
        id: 'ai-response-path',
        title: 'Reference response-to-interface boundary',
        caption:
          'Responsibility diagram, not a disclosure of HeyVista backend internals. The frontend validates/render proposals; the backend validates and executes authorized operations.',
        nodes: [
          {
            id: 'backend',
            label: 'Backend / model output',
            detail: 'Structured response envelope',
          },
          {
            id: 'validate',
            label: 'Frontend validation',
            detail: 'Version, kinds, size, identity',
          },
          { id: 'registry', label: 'Component registry', detail: 'Trusted Angular views' },
          { id: 'execute', label: 'Backend action endpoint', detail: 'Authorize and deduplicate' },
          { id: 'confirm', label: 'User confirmation', detail: 'Current proposal + context' },
          { id: 'state', label: 'Interaction state', detail: 'Selection, edits, pending work' },
        ],
        edges: [
          { from: 'backend', to: 'validate' },
          { from: 'validate', to: 'registry' },
          { from: 'registry', to: 'state' },
          { from: 'state', to: 'confirm' },
          { from: 'confirm', to: 'execute' },
        ],
      },
      codeExamples: [
        {
          title: 'An independently defined response vocabulary',
          language: 'typescript',
          code: `type UiBlock =
  | { kind: 'summary'; id: string; text: string }
  | { kind: 'options'; id: string; options: readonly { id: string; label: string }[] }
  | { kind: 'action'; id: string; proposalId: string; label: string };
interface ResponseEnvelope {
  version: 1;
  conversationId: string;
  turnId: string;
  blocks: readonly UiBlock[];
}
// Parse unknown JSON with a runtime schema before constructing this type.
// Bound block counts/text sizes, reject unknown kinds and duplicate IDs.
// This three-kind example is a subset for explanation, not the product's exact schema.`,
        },
      ],
    },
    {
      id: 'rendering',
      label: 'Angular implementation',
      title: 'Own the components and their state transitions',
      paragraphs: [
        'The registry is an application allowlist, not a map of arbitrary server strings to import paths. Each component owns accessible presentation and emits typed intent. The parent owns the current response identity, while an options block owns its current local selection. Stable block identity avoids destroying a control every time surrounding text changes.',
        'Streaming adds another boundary when used: incomplete JSON is not yet a valid actionable response. Incremental text can be displayed under a defined protocol, but a business action should not become executable merely because part of its label has arrived. The reference approach publishes complete validated blocks and waits for a confirmed current proposal before enabling an action.',
      ],
      codeExamples: [
        {
          title: 'A trusted registry with Angular-owned rendering',
          language: 'typescript',
          code: `const blockComponents = {
  summary: SummaryBlockComponent,
  options: OptionsBlockComponent,
  action: ActionProposalComponent,
} satisfies Record<UiBlock['kind'], Type<unknown>>;

// Component imports NgComponentOutlet, and blocks have already been validated.
// @for (block of response().blocks; track block.id) {
//   <ng-container [ngComponentOutlet]="blockComponents[block.kind]"
//     [ngComponentOutletInputs]="{ block: block }" />
// }
// Each component declares a compatible block input; it never executes model HTML.`,
        },
        {
          title: 'Local interaction state belongs to a stable response block',
          language: 'typescript',
          code: `readonly selected = signal<string | null>(null);
readonly selection = output<{ blockId: string; optionId: string }>();
choose(block: Extract<UiBlock, { kind: 'options' }>, optionId: string) {
  if (!block.options.some(option => option.id === optionId)) return;
  this.selected.set(optionId);
  this.selection.emit({ blockId: block.id, optionId });
}
// When a block is replaced rather than updated, reset its local selection.
// Render options as labelled native controls with visible keyboard focus.`,
        },
      ],
    },
    {
      id: 'actions',
      label: 'Confirmation & authority',
      title: 'A proposal is not an operation',
      paragraphs: [
        'A model may suggest an action, but only an explicit user decision can initiate the business command. Present the target, relevant parameters and effect for review. Bind confirmation to the proposal identity and current conversation revision; a changed plan invalidates an old confirmation rather than silently reusing it.',
        'After confirmation, the frontend submits a command to a backend-controlled endpoint. The backend checks identity, authorization, parameters, current state and duplicate operation identity. The frontend reports pending, accepted, rejected or uncertain outcome from that contract. A network timeout does not prove failure and should not trigger a blind duplicate write.',
      ],
      codeExamples: [
        {
          title: 'A user-confirmed action lifecycle',
          language: 'text',
          code: `Model/backend proposal -> validate envelope and proposal identity
Render trusted action component -> display effect and parameters
User reviews -> explicit confirmation of the current proposal
Frontend command -> backend authorization, validation and execution
Accepted/rejected/uncertain -> reconcile canonical state and show feedback
New plan or turn -> invalidate confirmations tied to the old proposal`,
        },
      ],
    },
    {
      id: 'embedding',
      label: 'Product modularity',
      title: 'Share infrastructure without sharing every instance’s state',
      paragraphs: [
        'Reusable AI modules were exported through Angular Elements / framework-independent Web Components for integration into websites through HTML and JavaScript. This is a distribution boundary: hosts need stable properties/events, naming and registration rules, styles, authentication integration and a documented lifecycle.',
        'Shared infrastructure can provide transport and configuration while each embedded instance owns conversation and interaction state. A global conversation store accidentally shared by two widgets would couple independent hosts. Angular Elements changes packaging and integration; it does not make Angular runtime cost disappear or remove SSR/hydration compatibility considerations.',
      ],
      diagram: {
        id: 'ai-embedding',
        title: 'Reference embedded-module boundaries',
        caption:
          'Independent packaging example reflecting the need for reusable AI modules; specific package names and host integrations are illustrative.',
        nodes: [
          { id: 'core', label: 'Shared infrastructure', detail: 'Transport and configuration' },
          { id: 'module', label: 'Angular AI module', detail: 'Registry + instance state' },
          {
            id: 'element',
            label: 'Custom element boundary',
            detail: 'Properties, events, lifecycle',
          },
          { id: 'hosta', label: 'Host website A', detail: 'Independent conversation' },
          { id: 'hostb', label: 'Host website B', detail: 'Independent conversation' },
          { id: 'contract', label: 'Host integration', detail: 'Auth/context via contracts' },
        ],
        edges: [
          { from: 'core', to: 'module' },
          { from: 'module', to: 'element' },
          { from: 'element', to: 'hostb' },
          { from: 'hosta', to: 'module' },
          { from: 'contract', to: 'element' },
        ],
      },
      codeExamples: [
        {
          title: 'Export a component through Angular Elements',
          language: 'typescript',
          code: `const element = createCustomElement(AiAssistantComponent, { injector });
if (!customElements.get('reference-ai-assistant')) {
  customElements.define('reference-ai-assistant', element);
}
// Host: <reference-ai-assistant></reference-ai-assistant>
// Pass structured properties through JavaScript; do not embed secret tokens in markup.
// Use component-level providers for per-instance conversation state where required.`,
          explanation:
            'A duplicate-registration guard does not solve conflicting versions. Define which bundle owns registration and how host context is validated. The portfolio does not add Angular Elements as a runtime dependency for this explanatory snippet.',
        },
      ],
    },
  ],
  flow: {
    title: 'From untrusted output to an authorized operation',
    steps: [
      {
        title: 'Interpret',
        detail: 'Accept only a complete, versioned and validated response vocabulary.',
      },
      {
        title: 'Render',
        detail: 'Instantiate trusted components with local state and accessible interactions.',
      },
      { title: 'Confirm', detail: 'Bind the user decision to the current proposal and context.' },
      {
        title: 'Reconcile',
        detail: 'Reflect backend-controlled execution and reject stale response state.',
      },
    ],
  },
  decisions: [
    {
      title: 'Structured UI',
      choice: 'Map validated kinds to a component allowlist.',
      tradeoff:
        'Less arbitrary expressive freedom, but predictable behavior and maintainable accessibility.',
    },
    {
      title: 'Instance state',
      choice: 'Keep selections and conversation identity per module.',
      tradeoff:
        'Shared infrastructure needs clear boundaries rather than a convenient global mutable store.',
    },
    {
      title: 'Explicit confirmation',
      choice: 'Separate suggestion, review and backend command.',
      tradeoff: 'Adds interaction steps for consequential operations; it preserves user authority.',
    },
  ],
  checks: [
    {
      scenario: 'Unknown or malformed response kind',
      expectation:
        'Reject or render an explicit fallback; never interpret it as executable markup.',
    },
    {
      scenario: 'Response A arrives after the user starts turn B',
      expectation: 'Check conversation/turn identity before publishing A into current state.',
    },
    {
      scenario: 'Plan changes after confirmation opens',
      expectation: 'Invalidate the confirmation and show the new effect before accepting intent.',
    },
    {
      scenario: 'Two assistant widgets share a page',
      expectation:
        'Selections and conversations remain isolated; only intentional infrastructure is shared.',
    },
  ],
  takeaways: [
    'The product boundary is a trusted interaction system, not arbitrary model output.',
    'User intent and backend authority must remain separate from model proposals.',
    'Reusable embedding makes state isolation and contract versioning part of frontend architecture.',
  ],
  references: [
    {
      label: 'Angular — Programmatic rendering',
      url: 'https://angular.dev/guide/components/programmatic-rendering',
    },
    { label: 'Angular — Elements', url: 'https://angular.dev/guide/elements' },
  ],
  related: [
    { label: 'AI interface state design study', path: '/engineering/ai-interface-state' },
    { label: 'Angular dependency injection', path: '/engineering/angular-dependency-injection' },
  ],
};
