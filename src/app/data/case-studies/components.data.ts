import { professionalPreviews } from '../professional-previews.data';
import type { ProfessionalStudy } from '../../models/professional-study.models';

export const componentsStudy: ProfessionalStudy = {
  ...professionalPreviews[1],
  lead: 'A dropdown or dialog used by many applications is a shared behavioral dependency. Changing its events, focus behavior or validation semantics can break a citizen journey even when the new component looks identical.',
  scopeNote:
    'The professional contribution concerns Angular integration libraries and Lit-based components in the shared Sirio ecosystem, not sole ownership of the design system. The implementations below are independently written examples.',
  sections: [
    {
      id: 'context',
      label: 'Context & constraints',
      title: 'A library is consumed by applications with different release cycles',
      paragraphs: [
        'Sirio work included Angular integration libraries and Lit-based Web Components across notifications, navigation, dialogs, dropdowns, autocomplete, pagination, expandable panels, tooltips and other shared interfaces. INPS applications—within Italy’s national social security institution—consume shared interaction contracts rather than an isolated set of visual assets.',
        'The constraint is compatibility across consumers: an application may adopt a new library version after another has already migrated. A change to event timing, overlay placement or accessible naming can therefore matter as much as a renamed property. Shared-library engineering needs documentation, versioning, tests and a migration path alongside the implementation.',
      ],
    },
    {
      id: 'architecture',
      label: 'Architecture & alternatives',
      title: 'Separate platform behavior from framework integration',
      paragraphs: [
        'An Angular-native component is the simplest choice when all consumers are Angular and the API benefits from templates, dependency injection or forms integration. A Web Component can share behavior across framework boundaries, but properties, events, slots, styling and custom-element registration become an explicit platform contract.',
        'An Angular wrapper can translate this contract into typed inputs/outputs and form semantics. It should not duplicate the underlying widget’s state machine or install a second focus trap. The reference layering keeps behavior in one place and framework adaptation thin; it is useful when heterogeneous consumers justify the additional distribution and compatibility work.',
      ],
      diagram: {
        id: 'component-layers',
        title: 'Reference shared-component layers',
        caption:
          'Conceptual layering based on the interoperability problem; this is not a private Sirio package map.',
        columns: 3,
        nodes: [
          { id: 'app', label: 'Angular application', detail: 'Business state and workflows' },
          { id: 'wrapper', label: 'Angular wrapper', detail: 'Typed bindings and forms' },
          { id: 'element', label: 'Lit Web Component', detail: 'Interaction and semantics' },
          { id: 'other', label: 'Other web consumer', detail: 'Platform properties/events' },
          { id: 'tokens', label: 'Semantic tokens', detail: 'Theme contracts and fallbacks' },
          { id: 'platform', label: 'Browser platform', detail: 'Focus, DOM, accessibility' },
        ],
        edges: [
          { from: 'app', to: 'wrapper' },
          { from: 'wrapper', to: 'element' },
          { from: 'other', to: 'element' },
          { from: 'tokens', to: 'element' },
          { from: 'element', to: 'platform' },
        ],
      },
      table: {
        caption: 'Choose the distribution boundary deliberately',
        columns: ['Approach', 'Useful when', 'Cost'],
        rows: [
          [
            'Angular-native',
            'Consumers share Angular and need template/form integration',
            'Framework version compatibility',
          ],
          [
            'Web Component',
            'Independent consumers need the same interaction behavior',
            'Property/event contract, registration and style boundaries',
          ],
          [
            'Angular wrapper',
            'A platform component needs idiomatic Angular usage',
            'Another public API to maintain; avoid duplicating behavior',
          ],
        ],
      },
    },
    {
      id: 'contract',
      label: 'Implementation',
      title: 'Define properties and events before adding configuration flags',
      paragraphs: [
        'Attributes represent serialized markup; properties can carry typed runtime values. Boolean attributes depend on presence, so disabled="false" still means present unless the implementation deliberately defines otherwise. Events must document their detail shape and whether they cross a shadow boundary. Slots are part of the content contract, including who supplies an accessible name.',
        'The example notice owns dismissal and emits an identifier. A consumer owns whether the notice exists in its business state. Semantic CSS variables allow theme changes without depending on private shadow selectors. Changing those token names, removing a slot or changing event detail is an API migration, even if TypeScript consumers happen to compile.',
      ],
      codeExamples: [
        {
          title: 'An original Lit contract with a native action',
          language: 'typescript',
          code: `class StudyNotice extends LitElement {
  static properties = {
    noticeId: { type: String, attribute: 'notice-id' },
    disabled: { type: Boolean, reflect: true },
  };
  noticeId = '';
  disabled = false;
  render() {
    return html\`<section aria-label="Notification">
      <slot></slot>
      <button ?disabled=\${this.disabled} @click=\${this.dismiss}>Dismiss notification</button>
    </section>\`;
  }
  private dismiss() {
    this.dispatchEvent(new CustomEvent('notice-closed', {
      detail: { id: this.noticeId }, bubbles: true, composed: true,
    }));
  }
}
// Register once in the package entry point; define an ownership/version policy.
if (!customElements.get('study-notice')) customElements.define('study-notice', StudyNotice);`,
          explanation:
            'This is a representative Lit example, not a bundled dependency of the portfolio. Registration guards prevent duplicate definition errors but do not solve incompatible versions trying to claim the same element name.',
        },
        {
          title: 'Translate the platform event at an Angular boundary',
          language: 'typescript',
          code: `@Component({
  selector: 'app-notice',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`<study-notice [attr.notice-id]="noticeId()"
    (notice-closed)="onClosed($event)"><ng-content /></study-notice>\`,
})
export class NoticeComponent {
  readonly noticeId = input.required<string>();
  readonly closed = output<string>();
  onClosed(event: Event) {
    if (!(event instanceof CustomEvent)) return;
    const detail: unknown = event.detail;
    if (typeof detail === 'object' && detail !== null && 'id' in detail
      && typeof detail.id === 'string') this.closed.emit(detail.id);
  }
}`,
        },
      ],
    },
    {
      id: 'interaction',
      label: 'Accessibility contract',
      title: 'Focus behavior belongs to the component API',
      paragraphs: [
        'A dialog needs a title, appropriate initial focus, contained interaction, Escape dismissal where appropriate and a deliberate return destination. The following local Angular example uses the native modal lifecycle. It demonstrates the behavioral contract, without pretending to reproduce a Sirio component or certify WCAG conformance.',
        'The same reasoning applies to complex widgets: an autocomplete needs a defined active option and announcement model; a tooltip must not be the only source of an essential label; an expandable panel exposes expanded state and its controlled region. WCAG 2.1 AA provides a minimum reference, while manual keyboard and assistive-technology review evaluates whether the complete task makes sense.',
      ],
      codeExamples: [
        {
          title: 'A native modal can supply the platform focus boundary',
          language: 'html',
          code: `<button #trigger type="button" (click)="dialog.showModal()">Review change</button>
<dialog #dialog aria-labelledby="review-title" aria-describedby="review-help"
        (close)="trigger.focus()">
  <h2 id="review-title">Apply this change?</h2>
  <p id="review-help">Review the effect before continuing.</p>
  <button type="button" autofocus (click)="dialog.close('cancel')">Keep editing</button>
  <button type="button" (click)="dialog.close('confirm')">Confirm example</button>
</dialog>`,
          explanation:
            'Escape uses native cancellation. A real destructive workflow must restore focus somewhere meaningful if the original trigger is removed. Do not layer a second custom Tab trap over native modality.',
        },
      ],
    },
    {
      id: 'evolution',
      label: 'Maintenance',
      title: 'Version behavior as carefully as types',
      paragraphs: [
        'A safe internal refactor keeps public properties, event detail, content projection and keyboard behavior stable. A breaking change should have a documented replacement and a migration window; if old and new APIs coexist, define which wins. Broad configuration objects can hide incompatible combinations. Composable primitives often expose fewer invalid states.',
        'Test from the consumer boundary: names and roles, required labels, disabled activation, focus entry/exit, event payloads and Angular form updates. Component harnesses avoid brittle tests against private markup. Visual regression catches theme drift but cannot prove keyboard behavior; a consumer integration build catches packaging and version problems that an isolated unit suite cannot.',
      ],
    },
  ],
  flow: {
    title: 'A change through the component contract',
    steps: [
      {
        title: 'Declare intent',
        detail: 'The consumer supplies content, state and an accessible naming relationship.',
      },
      {
        title: 'Adapt the framework',
        detail: 'A wrapper maps Angular bindings to platform properties and events.',
      },
      {
        title: 'Own the interaction',
        detail: 'One implementation owns focus, keyboard behavior and state transitions.',
      },
      {
        title: 'Return a typed event',
        detail: 'The application updates business state through a stable public event.',
      },
    ],
  },
  decisions: [
    {
      title: 'Shared behavior',
      choice: 'Use a platform component when heterogeneous consumers justify it.',
      tradeoff: 'A framework-native API remains simpler for a single-framework estate.',
    },
    {
      title: 'Thin wrappers',
      choice: 'Adapt bindings and forms, not interaction state machines.',
      tradeoff: 'Wrapper and underlying versions must remain compatible.',
    },
    {
      title: 'Semantic styling',
      choice: 'Expose intentional tokens rather than private selectors.',
      tradeoff: 'Tokens also become a versioned contract, including their contrast implications.',
    },
  ],
  checks: [
    {
      scenario: 'Open, cancel and confirm a modal with the keyboard',
      expectation:
        'Focus enters a useful action, stays in the modal context and returns to the trigger.',
    },
    {
      scenario: 'A Web Component dispatches malformed event detail',
      expectation: 'The Angular boundary rejects it rather than trusting an unchecked cast.',
    },
    {
      scenario: 'A consumer upgrades one major version',
      expectation:
        'Migration notes identify renamed properties/events and a consumer build checks the public surface.',
    },
    {
      scenario: 'A theme changes',
      expectation:
        'Inspect text, focus and control contrast in every supported state; automated scores alone do not establish accessibility.',
    },
  ],
  takeaways: [
    'Component behavior is a dependency shared by multiple products.',
    'Interoperability moves complexity into explicit platform contracts.',
    'Accessible defaults reduce the burden on every consuming team.',
  ],
  references: [
    { label: 'Lit — Components', url: 'https://lit.dev/docs/components/overview/' },
    {
      label: 'WAI — Dialog pattern',
      url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
    },
    { label: 'W3C — WCAG 2.1', url: 'https://www.w3.org/TR/WCAG21/' },
  ],
  related: [
    { label: 'Accessible Angular websites', path: '/engineering/accessibility' },
    {
      label: 'Enterprise frontend architecture',
      path: '/case-studies/angular-enterprise-architecture',
    },
  ],
};
