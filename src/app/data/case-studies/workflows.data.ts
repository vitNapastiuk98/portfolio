import { professionalPreviews } from '../professional-previews.data';
import type { ProfessionalStudy } from '../../models/professional-study.models';
export const workflowStudy: ProfessionalStudy = {
  ...professionalPreviews[3],
  lead: 'Configuration can mean changing a field, changing a step or changing the topology of a process. Those are different powers. Welfare in Cloud and BStep illustrate why a form wizard and an executable workflow graph should not be forced into the same runtime abstraction.',
  scopeNote:
    'WIC and BStep are separate professional systems. Models, algorithms and synchronization policies below are independent reference examples; they do not reproduce private schemas or claim an undocumented production conflict strategy.',
  sections: [
    {
      id: 'context',
      label: 'Context & constraints',
      title: 'Two kinds of configurable product',
      paragraphs: [
        'Welfare in Cloud supported application and processing workflows for public-sector grants and benefits. Angular 16 and Angular Formly rendered dynamic forms with conditional fields/validation, configurable workflow steps, backend-driven definitions, application status and backend integrations. Supported configuration changes could update forms or steps without a frontend release; that does not mean arbitrary new frontend behavior could be introduced as data.',
        'BStep was end-to-end product development across the web frontend, backend and Kotlin Android application. It included visual graph creation, task assignment, directed connections, branches and optional loops, guided execution, local Realm persistence and server/device synchronization. Offline execution makes the current node and recorded decisions durable product state, rather than just the active tab of a wizard.',
      ],
    },
    {
      id: 'forms',
      label: 'Schema-driven forms',
      title: 'Let configuration select trusted controls',
      paragraphs: [
        'A form schema describes fields, constraints and supported conditional behavior. A renderer maps it to an allowlist of controls. The contract must specify what happens to hidden field values, which validation rules apply and how a schema revision is associated with an existing application. Do not accept executable expressions or arbitrary component names directly from an untrusted definition.',
        'The reference uses Formly for presentation, with application code translating a validated backend schema into Formly configuration. Conditional required rules and visibility must agree; otherwise a hidden field can block submission. The server validates the submitted values against the applicable definition regardless of client-side checks.',
      ],
      codeExamples: [
        {
          title: 'A restricted schema translated into Formly fields',
          language: 'typescript',
          code: `type FieldSchema = {
  key: 'applicantName' | 'householdSize';
  kind: 'text' | 'integer';
  label: string;
  required: boolean;
};
const fields: FormlyFieldConfig[] = validatedSchema.map(field => ({
  key: field.key,
  type: 'input',
  props: {
    label: field.label,
    type: field.kind === 'integer' ? 'number' : 'text',
    required: field.required,
  },
}));
// <form [formGroup]="form" (ngSubmit)="submit()">
//   <formly-form [form]="form" [fields]="fields" [model]="model" />
//   <button type="submit">Continue</button>
// </form>`,
          explanation:
            'Configure FormlyModule, ReactiveFormsModule and a supported input type/theme in the consuming application. Validate the schema before mapping, reject duplicate keys and unknown control kinds, and encode supported conditions as data interpreted by trusted code.',
        },
      ],
    },
    {
      id: 'graph',
      label: 'Executable graph',
      title: 'A loop needs execution semantics, not just an arrow',
      paragraphs: [
        'A graph editor describes possible connections. Its runtime needs entry/terminal nodes, available transitions, decision input, task completion and an execution identity. A branch can depend on recorded input; a loop can legitimately revisit a node. A global visited-node set therefore cannot be used to reject every repeated node during execution.',
        'The reference decision is to separate the immutable workflow definition from a revisioned execution record. A graph validator checks unique IDs, existing targets, reachable terminal paths and permitted transitions. A loop needs an explicit exit and a product policy for repeated work; a valid graph does not guarantee that every execution will terminate.',
      ],
      diagram: {
        id: 'workflow-graph',
        title: 'Reference workflow with a branch and correction loop',
        caption:
          'Example graph: Start → Inspect → Decide; Decide can Finish or request Correct, which returns to Inspect. The return path represents a deliberate loop.',
        columns: 3,
        nodes: [
          { id: 'start', label: 'Start', detail: 'Create execution identity' },
          { id: 'inspect', label: 'Inspect', detail: 'Complete assigned task' },
          { id: 'decide', label: 'Decide', detail: 'Record branch input' },
          { id: 'sync', label: 'Persist locally', detail: 'Record revision and intent' },
          { id: 'correct', label: 'Correct', detail: 'Repeat work with context' },
          { id: 'finish', label: 'Finish', detail: 'Terminal execution state' },
        ],
        edges: [
          { from: 'start', to: 'inspect' },
          { from: 'inspect', to: 'decide' },
          { from: 'decide', to: 'finish', label: 'pass' },
          { from: 'decide', to: 'correct', label: 'revise' },
          { from: 'correct', to: 'inspect', label: 'repeat' },
          { from: 'correct', to: 'sync' },
        ],
      },
      codeExamples: [
        {
          title: 'Definitions and execution state are separate records',
          language: 'typescript',
          code: `type NodeId = string;
interface Edge { readonly to: NodeId; readonly outcome: string; }
interface WorkflowNode {
  readonly id: NodeId;
  readonly terminal: boolean;
  readonly edges: readonly Edge[];
}
interface WorkflowDefinition {
  readonly version: string;
  readonly entry: NodeId;
  readonly nodes: readonly WorkflowNode[];
}
interface Execution {
  readonly id: string;
  readonly definitionVersion: string;
  readonly current: NodeId;
  readonly revision: number;
  readonly completed: boolean;
}`,
        },
      ],
    },
    {
      id: 'execution',
      label: 'Implementation',
      title: 'Advance one explicit transition at a time',
      paragraphs: [
        'Guided execution should not recursively run through a graph until it happens to stop. Advance one authorized transition after task completion or a recorded decision. This bounds synchronous work, makes loop behavior visible and gives persistence a clear transaction boundary.',
        'The following transition function assumes a validated definition, then checks execution identity/version, revision bounds and the selected edge. Task permissions and business preconditions are additional server/domain policies, not properties that an arrow can enforce. Persist the returned execution together with its event before displaying the next durable step.',
      ],
      codeExamples: [
        {
          title: 'An illustrative single-transition executor',
          language: 'typescript',
          code: `function advance(def: WorkflowDefinition, state: Execution, outcome: string): Execution {
  if (state.completed || state.definitionVersion !== def.version) throw Error('Invalid execution');
  if (!Number.isSafeInteger(state.revision) || state.revision < 0
      || state.revision === Number.MAX_SAFE_INTEGER) throw Error('Invalid revision');
  const current = def.nodes.find(node => node.id === state.current);
  const matches = current?.edges.filter(edge => edge.outcome === outcome) ?? [];
  if (!current || current.terminal || matches.length !== 1) throw Error('Ambiguous transition');
  const target = def.nodes.find(node => node.id === matches[0].to);
  if (!target) throw Error('Missing target');
  return { ...state, current: target.id, revision: state.revision + 1, completed: target.terminal };
}`,
        },
      ],
    },
    {
      id: 'offline',
      label: 'Offline & synchronization',
      title: 'Durable local progress is not yet server acceptance',
      paragraphs: [
        'Realm persistence in the Android client supports local execution state. Synchronization must then distinguish locally recorded work from server-accepted work. An illustrative outbox associates a unique operation ID, expected server revision and definition version with each transition. Retries resend the same operation identity rather than inventing a new action.',
        'On reconnect, the server may accept, report an already-applied operation or reject a stale revision. Last-write-wins is easy but can erase a meaningful branch or task completion. Rebase only when domain rules make it safe; otherwise preserve local evidence and ask for reconciliation. This policy is a recommended design to reason about conflicts, not a claim that BStep used this exact protocol.',
      ],
      codeExamples: [
        {
          title: 'Offline-to-online reference sequence',
          language: 'text',
          code: `Android: complete task -> local transaction(execution + outbox intent)
UI: show locally saved progress, not server-confirmed progress
Network restored -> send operationId + expectedRevision + definitionVersion
Server: authorize -> validate transition -> deduplicate -> accept or reject
Accepted/already applied -> mark intent acknowledged and reconcile snapshot
Conflict -> retain local evidence; resolve explicitly before new dependent work`,
        },
      ],
      table: {
        caption: 'Configuration power changes runtime responsibilities',
        columns: ['Concern', 'Form/step configuration', 'Executable graph'],
        rows: [
          [
            'Unit of change',
            'A field or supported step definition',
            'A transition and its execution meaning',
          ],
          [
            'Validation',
            'Field/condition/schema consistency',
            'Topology, task rules and execution revision',
          ],
          [
            'Offline state',
            'Draft values and application status',
            'Durable traversal, decisions and pending operations',
          ],
          [
            'Complexity cost',
            'Limited by the supported control vocabulary',
            'Loops, conflicts and versioned execution semantics',
          ],
        ],
      },
    },
  ],
  flow: {
    title: 'From definition to accepted progress',
    steps: [
      { title: 'Validate definition', detail: 'Accept only supported schema or graph vocabulary.' },
      {
        title: 'Render or execute',
        detail: 'Choose controls for a form, or one permitted transition for a graph.',
      },
      {
        title: 'Persist progress',
        detail: 'Keep values, execution revision and pending intent consistent.',
      },
      { title: 'Reconcile authority', detail: 'Distinguish local save from backend acceptance.' },
    ],
  },
  decisions: [
    {
      title: 'Two runtimes',
      choice: 'Use forms for configurable input; a graph model for executable topology.',
      tradeoff:
        'Sharing field controls is useful; merging all semantics into a wizard creates hidden limitations.',
    },
    {
      title: 'Single-step execution',
      choice: 'Record one transition after a deliberate decision.',
      tradeoff: 'Automation needs explicit scheduling rather than unbounded recursive traversal.',
    },
    {
      title: 'Offline intent',
      choice: 'Preserve operation identity and local evidence.',
      tradeoff:
        'Conflict resolution adds product decisions that a generic sync library cannot invent.',
    },
  ],
  checks: [
    {
      scenario: 'A required field becomes hidden',
      expectation:
        'Validation and retention policy agree; the user is not blocked by an inaccessible error.',
    },
    {
      scenario: 'A graph contains an unknown target or ambiguous branch',
      expectation: 'Reject the definition or transition before changing execution state.',
    },
    {
      scenario: 'A loop repeats',
      expectation:
        'Record another bounded transition; do not treat every revisit as a structural error.',
    },
    {
      scenario: 'A transition is resent after a timeout',
      expectation:
        'The reference protocol reuses operation identity and requires server deduplication, not duplicate execution.',
    },
  ],
  takeaways: [
    'Configuration is a constrained language, not permission to execute arbitrary data.',
    'A workflow graph needs execution and persistence semantics beyond its visual editor.',
    'Offline progress and authoritative acceptance are different product states.',
  ],
  references: [
    { label: 'Formly — Angular forms', url: 'https://formly.dev/' },
    { label: 'Angular — Reactive forms', url: 'https://angular.dev/guide/forms/reactive-forms' },
  ],
  related: [
    { label: 'Reactive consistency and ownership', path: '/engineering/reactive-consistency' },
    {
      label: 'Enterprise frontend architecture',
      path: '/case-studies/angular-enterprise-architecture',
    },
  ],
};
