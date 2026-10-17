import { Component, input } from '@angular/core';

@Component({
  selector: 'app-engineering-article-visual',
  template: `
    @if (subject() === 'accessibility' && section() === 'browser-model') {
      <figure class="article-figure">
        <p class="eyebrow">One interface, two representations</p>
        <div class="figure-pair">
          <div class="figure-panel">
            <span class="figure-label">Angular template → browser UI</span>
            <div class="illustrated-button">Save draft</div>
            <code>&lt;button (click)="saveDraft()"&gt;</code>
          </div>
          <div class="figure-panel figure-tree">
            <span class="figure-label">Accessibility tree</span>
            <dl>
              <dt>Role</dt>
              <dd>button</dd>
              <dt>Name</dt>
              <dd>Save draft</dd>
              <dt>State</dt>
              <dd>enabled</dd>
            </dl>
          </div>
        </div>
        <figcaption>
          Angular binds the action. Native HTML supplies the semantics and activation behavior.
        </figcaption>
      </figure>
    }
    @if (subject() === 'accessibility' && section() === 'keyboard-navigation') {
      <figure class="article-figure">
        <p class="eyebrow">The focus journey</p>
        <ol class="figure-sequence">
          <li><strong>Trigger</strong><span>Open the dialog</span></li>
          <li><strong>Dialog</strong><span>Focus a useful action</span></li>
          <li><strong>Dismiss</strong><span>Escape or a close action</span></li>
          <li><strong>Return</strong><span>Restore the working context</span></li>
        </ol>
        <figcaption>
          A focus destination belongs to the interaction design, just as much as the dialog's visual
          position.
        </figcaption>
      </figure>
    }
    @if (subject() === 'accessibility' && section() === 'visual-design') {
      <figure class="article-figure">
        <p class="eyebrow">An error needs more than a color</p>
        <div class="figure-pair">
          <div class="figure-panel">
            <span class="figure-label">Color alone</span>
            <div class="illustrated-field" aria-hidden="true">Request reference</div>
            <p>A red boundary leaves the reason unstated.</p>
          </div>
          <div class="figure-panel">
            <span class="figure-label">State + explanation</span>
            <div class="illustrated-field" aria-hidden="true">Request reference</div>
            <p><strong>! Enter the request reference.</strong></p>
            <code>aria-invalid + aria-describedby</code>
          </div>
        </div>
        <figcaption>
          Illustrations of field states, not interactive form controls. The explanation remains
          available without distinguishing colors.
        </figcaption>
      </figure>
    }
    @if (subject() === 'angular-architectures' && section() === 'dependency-direction') {
      <figure class="article-figure">
        <p class="eyebrow">Angular at the boundary</p>
        <ol class="figure-sequence">
          <li><strong>Component</strong><span>Template, input and feedback</span></li>
          <li><strong>Use case</strong><span>Coordinate an approval</span></li>
          <li><strong>Domain</strong><span>Protect an invariant</span></li>
        </ol>
        <div class="figure-note"><code>HttpOrderAdapter → OrderPort ← ApproveOrder</code></div>
        <figcaption>
          Arrows describe source dependencies. Angular DI supplies the adapter at the feature
          boundary; the domain does not import HttpClient.
        </figcaption>
      </figure>
    }
    @if (subject() === 'angular-dependency-injection' && section() === 'multiple-backends') {
      <figure class="article-figure">
        <p class="eyebrow">One consumer, interchangeable infrastructure</p>
        <div class="figure-pair">
          <div class="figure-panel">
            <span class="figure-label">Feature</span>
            <code>OrderPage → OrderReader → ORDERS_BACKEND</code>
            <p>The component depends on the feature contract.</p>
          </div>
          <div class="figure-panel">
            <span class="figure-label">Composition boundary</span>
            <code>REST config → RestOrdersBackend</code>
            <code>GraphQL config → GraphqlOrdersBackend</code>
            <p>The provider factory selects one implementation.</p>
          </div>
        </div>
        <figcaption>
          Both adapters implement OrdersBackend. Backend selection changes configuration and
          transport translation, while the consuming Angular page keeps the same contract.
        </figcaption>
      </figure>
    }
    @if (subject() === 'web-performance' && section() === 'angular-rendering') {
      <figure class="article-figure">
        <p class="eyebrow">When does the page HTML exist?</p>
        <dl class="rendering-paths">
          <div>
            <dt>CSR</dt>
            <dd>Request → app shell → JavaScript → page content</dd>
          </div>
          <div>
            <dt>SSR</dt>
            <dd>Request → server render → page HTML → hydration</dd>
          </div>
          <div>
            <dt>SSG</dt>
            <dd>Build → page HTML; request → static response → hydration</dd>
          </div>
        </dl>
        <figcaption>
          Earlier HTML can help content discovery. Server response time, assets, client work and
          interaction readiness still determine the experience.
        </figcaption>
      </figure>
    }
  `,
  styles: `
    :host {
      display: contents;
    }
    .article-figure {
      margin: 2.5rem 0;
      padding: clamp(1.2rem, 3vw, 2rem);
      border-block: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.025);
    }
    .article-figure .eyebrow {
      margin: 0 0 1.5rem;
    }
    .figure-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    .figure-panel {
      min-width: 0;
      padding: 1rem;
      border: 1px solid var(--line);
    }
    .figure-label {
      display: block;
      color: var(--muted);
      font: 0.7rem var(--font-mono, monospace);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 1.25rem;
    }
    .illustrated-button {
      display: inline-block;
      padding: 0.65rem 1.1rem;
      color: #fff;
      background: #743047;
      margin-bottom: 1rem;
    }
    code {
      display: block;
      font-size: 0.75rem;
      overflow-wrap: anywhere;
    }
    dl {
      margin: 0;
    }
    .figure-tree dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.6rem 1.5rem;
    }
    dt {
      color: var(--muted);
    }
    dd {
      margin: 0;
    }
    .figure-sequence {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 0;
      margin: 0;
      counter-reset: step;
    }
    .figure-sequence li {
      padding: 0.5rem 1rem 0.5rem 0;
      border-top: 2px solid var(--line);
      counter-increment: step;
    }
    .figure-sequence li::before {
      content: '0' counter(step);
      display: block;
      color: var(--muted);
      font-family: monospace;
      margin-bottom: 1rem;
    }
    .figure-sequence strong,
    .figure-sequence span {
      display: block;
    }
    .figure-sequence span {
      color: var(--muted);
      font-size: 0.85rem;
      margin-top: 0.4rem;
    }
    .figure-note {
      padding-top: 1.5rem;
    }
    .illustrated-field {
      border: 2px solid #ac2948;
      padding: 0.65rem;
      color: var(--muted);
    }
    .figure-panel p {
      font-size: 0.85rem;
    }
    figcaption {
      font-size: 0.8rem;
      line-height: 1.6;
      color: var(--muted);
      margin-top: 1.5rem;
    }
    .rendering-paths > div {
      display: grid;
      grid-template-columns: 3rem 1fr;
      gap: 1rem;
      padding-block: 1rem;
      border-bottom: 1px solid var(--line);
    }
    .rendering-paths dt {
      font-family: monospace;
    }
    @media (max-width: 600px) {
      .figure-pair {
        grid-template-columns: 1fr;
      }
      .figure-sequence {
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
      }
    }
  `,
})
export class EngineeringArticleVisualComponent {
  readonly subject = input.required<string>();
  readonly section = input.required<string>();
}
