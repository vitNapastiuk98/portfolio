import { accessibilityPreview } from './engineering-previews.data';
import type { EngineeringStudy } from '../models/study.models';

export const accessibilityStudy: EngineeringStudy = {
  ...accessibilityPreview,
  presentation: 'article',
  title: 'Accessible by Design: Building Accessible Angular Websites',
  summary:
    'Semantics, keyboard navigation, forms, focus and visual design—translated into practical Angular patterns.',
  lead: 'Accessibility starts with the way a page is built: what its elements mean, how someone moves through it, and what happens when its state changes. In Angular, those decisions live in templates, component contracts, route transitions and form behavior. A useful way to approach them is to follow one task: find a page, fill in a request, correct a mistake and receive confirmation.',
  scopeNote: '',
  technologies: ['Angular', 'Semantic HTML', 'Reactive Forms', 'Angular CDK'],
  relatedSlugs: ['angular-architectures', 'web-performance'],
  sections: [
    {
      id: 'browser-model',
      label: 'Semantics',
      title: 'Give the browser the right information',
      paragraphs: [
        'The browser derives an accessibility tree from the DOM and its semantics. Assistive technology uses that representation to expose roles, names, values and states. A styled div can look like a button without providing its keyboard behavior or button role. A native button supplies those behaviors before Angular adds any application logic.',
        'An accessible name identifies a control; a description adds context. Prefer visible text and a native label association. Use aria-describedby for help or errors. An aria-label can override the name derived from visible text, so it is best reserved for controls such as an icon-only button whose purpose would otherwise be missing. The name should still match the visible wording when wording exists.',
      ],
      codeExamples: [
        {
          title: 'Keep the control native; let Angular handle the action',
          language: 'html',
          code: `<button type="button" (click)="saveDraft()">Save draft</button>

<label for="request-email">Email address</label>
<input id="request-email" type="email" autocomplete="email"
       required [formControl]="email" aria-describedby="email-help" />
<p id="email-help">We will send the request confirmation here.</p>`,
          explanation:
            'No keydown listener is needed for the button. Native activation already supports Enter, Space, pointer input and assistive technology. Reusable field components must preserve the label-to-control relationship, including unique IDs when several instances appear.',
        },
      ],
    },
    {
      id: 'page-and-navigation',
      label: 'Page structure',
      title: 'Make a route understandable before adding interactions',
      paragraphs: [
        'Landmarks and headings provide a map. Use one main landmark, name navigation regions when there is more than one, and choose headings by document hierarchy rather than font size. A skip link lets keyboard users bypass a repeated header. Source order should remain meaningful when the layout collapses to one column.',
        'Angular client navigation changes the page without a full browser navigation. Update the document title and define a focus policy for completed page transitions. Moving focus to the new page heading can orient a reader; applying the same rule to every query-parameter update would interrupt filtering and typing. Preserve fragment navigation and account for restored scroll positions.',
      ],
      codeExamples: [
        {
          title: 'A shell with a skip destination and real route links',
          language: 'html',
          code: `<a class="skip-link" href="#main-content">Skip to content</a>
<header>
  <nav aria-label="Main">
    <a routerLink="/engineering" routerLinkActive="active"
       ariaCurrentWhenActive="page">Engineering studies</a>
  </nav>
</header>
<main id="main-content" tabindex="-1">
  <router-outlet />
</main>`,
        },
        {
          title: 'Describe each Angular route',
          language: 'typescript',
          code: `export const routes: Routes = [
  {
    path: 'requests',
    title: 'Your requests',
    loadComponent: () => import('./requests.page').then(m => m.RequestsPage),
  },
];

// On a completed page transition, the route-focus policy can focus
// the rendered h1 (tabindex="-1"). Wait for rendering, and exclude
// same-page filters, fragments and history restoration as appropriate.`,
          explanation:
            'Angular route titles update the browser title. Focus movement is a separate application decision; use a shared navigation policy rather than a collection of page-specific timers.',
        },
      ],
    },
    {
      id: 'request-validation',
      label: 'Forms',
      title: 'Explain the error and provide a way back',
      paragraphs: [
        'A validation rule is only half of the interaction. The user also needs to know which field failed, why it failed and how to repair it. Keep the label visible, explain required input before submission and connect each error to its field. A red border alone does not communicate the problem.',
        'Reactive Forms owns validation state, while the template owns its presentation. Show errors after interaction or submission rather than marking untouched fields as failures immediately. After an unsuccessful submit, focus the first invalid field—or a linked error summary for a long form—once Angular has rendered the messages. Use stable IDs so dynamically inserted descriptions resolve correctly.',
      ],
      codeExamples: [
        {
          title: 'Expose the same validation state visually and programmatically',
          language: 'html',
          code: `<form [formGroup]="form" (ngSubmit)="submit()" novalidate>
  <label for="email">Email address (required)</label>
  <input #emailInput id="email" type="email" autocomplete="email"
         formControlName="email" required
         [attr.aria-invalid]="emailError() ? 'true' : null"
         [attr.aria-describedby]="emailError() ? 'email-help email-error' : 'email-help'" />
  <p id="email-help">Use an address where we can reply.</p>
  @if (emailError()) {
    <p id="email-error">Enter a valid email address, such as name@example.com.</p>
  }
  <button type="submit">Send request</button>
</form>`,
        },
        {
          title: 'Render the error before moving focus',
          language: 'typescript',
          code: `private readonly injector = inject(Injector);
readonly emailInput = viewChild.required<ElementRef<HTMLInputElement>>('emailInput');
readonly submitted = signal(false);
readonly form = new FormGroup({
  email: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  }),
});
emailError() {
  const field = this.form.controls.email;
  return field.invalid && (field.touched || this.submitted());
}
submit() {
  this.submitted.set(true);
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    afterNextRender(() => this.emailInput().nativeElement.focus(),
      { injector: this.injector });
    return;
  }
  // Send the validated request through the application service.
}`,
          explanation:
            'This single-field example has one recovery destination. For a reusable form, derive the first invalid field or render a summary with links. Server errors need the same field associations; Angular validators do not replace server validation.',
        },
      ],
    },
    {
      id: 'keyboard-navigation',
      label: 'Focus & dialogs',
      title: 'Treat focus as part of the component contract',
      paragraphs: [
        'Tab follows document order; Shift+Tab reverses it. Avoid positive tabindex values that impose a second ordering system. Keep a visible focus indicator and make sure sticky headers or overlays do not cover it. Buttons use ordinary Tab navigation; arrow keys belong to composite patterns such as tabs, menus and listboxes, each with its own interaction contract.',
        'A modal introduces a temporary context. It needs a name, an appropriate initial focus target, contained interaction, a dismissal path and a meaningful return destination. Angular CDK Dialog can own the overlay and focus lifecycle; the dialog content still owns its title, controls and decision wording. If the triggering row disappears after deletion, restore focus to the next useful destination rather than a detached element.',
      ],
      codeExamples: [
        {
          title: 'Let CDK Dialog manage the focus lifecycle',
          language: 'typescript',
          code: `private readonly dialog = inject(Dialog);

confirmRemoval() {
  const ref = this.dialog.open<boolean>(ConfirmRemovalComponent, {
    ariaLabelledBy: 'remove-title',
    ariaDescribedBy: 'remove-description',
    autoFocus: '[data-cancel]',
    restoreFocus: true,
  });
  ref.closed.subscribe(confirmed => {
    if (confirmed) this.removeRequest();
  });
}

// ConfirmRemovalComponent imports DialogModule and injects DialogRef.
// Its template:
// <h2 id="remove-title">Remove this request?</h2>
// <p id="remove-description">This action cannot be undone.</p>
// <button data-cancel (click)="ref.close(false)">Keep request</button>
// <button (click)="ref.close(true)">Remove request</button>`,
          explanation:
            'The CDK example assumes @angular/cdk is installed in the consuming application. Native dialog.showModal() is also a valid platform option. Avoid combining two independent focus traps or disabling Escape without providing an appropriate alternative.',
        },
        {
          title: 'Keep keyboard focus visible in the component stylesheet',
          language: 'css',
          code: `button:focus-visible, a:focus-visible, input:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 4px;
}
[id] { scroll-margin-top: 6rem; }
@media (forced-colors: active) {
  button:focus-visible, a:focus-visible, input:focus-visible {
    outline-color: Highlight;
  }
}`,
        },
      ],
    },
    {
      id: 'dynamic-updates',
      label: 'Dynamic content',
      title: 'Announce a result without moving the reader',
      paragraphs: [
        'An asynchronous action can finish without changing the focused element. A persistent role="status" region gives a non-urgent result a programmatic destination; changing its text lets assistive technology discover the update. Keep the region in the DOM before the update and use ordinary text for visible feedback. Reserve assertive alerts for interruptions that warrant immediate attention.',
        'Signals make component state explicit, but they do not make that state accessible by themselves. Bind state to visible text and appropriate attributes. Prevent repeated submissions in the handler as well as the interface. aria-disabled communicates a state but does not block clicks; native disabled blocks activation and also removes the control from the tab sequence. Choose deliberately when focus needs to remain on the initiating control.',
      ],
      codeExamples: [
        {
          title: 'A stable announcement region and explicit pending state',
          language: 'html',
          code: `<button type="button" [attr.aria-disabled]="saving()"
        (click)="save()">{{ saving() ? 'Saving…' : 'Save changes' }}</button>
<p role="status" aria-atomic="true">{{ message() }}</p>`,
        },
        {
          title: 'Update feedback on both success and failure',
          language: 'typescript',
          code: `readonly saving = signal(false);
readonly message = signal('');

async save() {
  if (this.saving()) return;
  this.saving.set(true);
  this.message.set('Saving changes…');
  try {
    await this.requests.save(this.form.getRawValue());
    this.message.set('Changes saved.');
  } catch {
    this.message.set('Changes could not be saved. Please try again.');
  } finally {
    this.saving.set(false);
  }
}`,
          explanation:
            'Do not announce every keystroke or put a whole page inside a live region. For dynamic lists, Angular @for tracking also matters: stable identity helps preserve the focused control instead of destroying and recreating its DOM node.',
        },
      ],
    },
    {
      id: 'visual-design',
      label: 'Visual design',
      title: 'Make meaning survive a change in how the page is seen',
      paragraphs: [
        'WCAG 2.2 AA text contrast requires 4.5:1 for ordinary text and 3:1 for large text (at least 18pt regular or 14pt bold). Non-text contrast has a different scope: visual information necessary to identify controls, states and certain graphical objects needs 3:1 against adjacent colors. A passing text pair says nothing about the visibility of a field boundary or a focus ring.',
        'Calculate contrast against the actual rendered background, including compositing when transparency is involved. For opaque sRGB colors, linearize each channel, calculate relative luminance as 0.2126R + 0.7152G + 0.0722B, then divide (lighter + 0.05) by (darker + 0.05). Do not round before checking a threshold: #777777 on white is about 4.48:1 and falls short for ordinary text.',
        'Angular theme bindings can switch semantic tokens, but every theme needs its own foreground/background pairs. Let content reflow instead of imposing fixed widths; respect reduced motion when transitions are nonessential. Pair an error color with explanatory text, and keep icons decorative when the text already communicates the same meaning.',
      ],
      codeExamples: [
        {
          title: 'Keep theme and error meaning in semantic contracts',
          language: 'html',
          code: `<section [attr.data-theme]="theme()">
  <label for="reference">Request reference</label>
  <input id="reference" [formControl]="reference"
         [attr.aria-invalid]="reference.invalid && reference.touched ? 'true' : null"
         [attr.aria-describedby]="reference.invalid && reference.touched ? 'reference-error' : null" />
  @if (reference.invalid && reference.touched) {
    <p id="reference-error" class="field-error">
      <span aria-hidden="true">!</span> Enter the request reference.
    </p>
  }
</section>`,
        },
        {
          title: 'Choose paired theme tokens, then verify their uses',
          language: 'css',
          code: `:host { --surface: #ffffff; --text: #202020; --error: #a11936; }
[data-theme="dark"] { --surface: #161616; --text: #f5f5f5; --error: #ffb3c1; }
section { color: var(--text); background: var(--surface); }
.field-error { color: var(--error); }
input { max-inline-size: 100%; }
@media (prefers-reduced-motion: reduce) {
  .confirmation { animation: none; }
}`,
        },
      ],
    },
    {
      id: 'testing-workflow',
      label: 'Engineering workflow',
      title: 'Test the task, not just the markup',
      paragraphs: [
        'Start component tests with roles and accessible names, then exercise the task in a browser: submit an invalid form, repair it, open a dialog, dismiss it and finish the action. Assert where focus lands and whether the corresponding description exists. A selector that only checks a CSS class misses the interaction contract.',
        'Combine automated scanning with keyboard, screen-reader and visual checks. For VoiceOver with Safari or NVDA with Firefox/Chrome, navigate landmarks and headings, inspect field names and errors, and follow the complete dialog and status flow. Check reflow, zoom, forced colors and visible focus. Lighthouse and axe can find many issues, but cannot judge whether alternative text is useful, a focus destination makes sense or the entire workflow is understandable.',
        'Use WCAG 2.2 AA to map requirements to behavior: 1.3.1 for relationships, 1.4.3 and 1.4.11 for contrast, 2.1.1 for keyboard access, 2.4.3 and 2.4.7 for focus, 3.3.1 and 3.3.2 for errors and instructions, and 4.1.2 and 4.1.3 for programmatic controls and status. These criteria guide review; accessibility also depends on the quality of the experience around them.',
      ],
      codeExamples: [
        {
          title: 'Express the Angular page contract in a browser test',
          language: 'typescript',
          code: `await page.getByRole('button', { name: 'Send request' }).click();
const email = page.getByRole('textbox', { name: 'Email address (required)' });
await expect(email).toBeFocused();
await expect(email).toHaveAttribute('aria-invalid', 'true');
await expect(page.locator('#email-error')).toBeVisible();
await email.fill('reader@example.com');
// Continue through success, failure, keyboard and dialog paths.`,
          explanation:
            'Role-based queries make a useful contract for Angular components. Use a browser runner such as Playwright for native focus and dialog behavior; a DOM-only unit environment does not reproduce the complete browser accessibility model.',
        },
      ],
    },
  ],
  flow: { title: '', steps: [] },
  decisions: [],
  checks: [],
  takeaways: [],
  references: [
    { label: 'W3C — WCAG 2.2', url: 'https://www.w3.org/TR/WCAG22/' },
    {
      label: 'WAI — Accessible names and descriptions',
      url: 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/',
    },
    {
      label: 'WAI — Dialog modal pattern',
      url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
    },
    { label: 'Angular — Accessibility', url: 'https://angular.dev/best-practices/a11y' },
    { label: 'Angular CDK — Dialog', url: 'https://material.angular.dev/cdk/dialog/overview' },
    { label: 'Angular — Reactive forms', url: 'https://angular.dev/guide/forms/reactive-forms' },
  ],
};
