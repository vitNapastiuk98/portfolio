import { Component, signal } from '@angular/core';

type DemoBlock =
  | { kind: 'summary'; text: string }
  | { kind: 'options'; label: string; options: readonly string[] };
@Component({
  selector: 'app-ai-response-example',
  template: `
    <section class="response-example" aria-labelledby="response-example-title">
      <h3 id="response-example-title">A structured response rendered as Angular controls</h3>
      <p>
        Local reference example: a proposal can be reviewed and confirmed without executing a
        business operation.
      </p>
      @for (block of blocks; track $index) {
        @switch (block.kind) {
          @case ('summary') {
            <p>{{ block.text }}</p>
          }
          @case ('options') {
            <fieldset>
              <legend>{{ block.label }}</legend>
              @for (option of block.options; track option) {
                <label
                  ><input
                    type="radio"
                    name="reference-report"
                    [value]="option"
                    [checked]="selected() === option"
                    (change)="choose(option)"
                  />
                  {{ option }}</label
                >
              }
            </fieldset>
          }
        }
      }
      <button type="button" [disabled]="!selected()" (click)="reviewed.set(selected())">
        Review proposal
      </button>
      @if (reviewed(); as value) {
        <div role="region" aria-label="Review current proposal">
          <p>
            Confirm a proposal for: <strong>{{ value }}</strong>
          </p>
          <button type="button" (click)="reviewed.set(null)">Keep editing</button>
          <button type="button" (click)="confirm()">Confirm proposal example</button>
        </div>
      }
      <p role="status">{{ status() }}</p>
    </section>
  `,
  styles: `
    .response-example {
      margin-top: 2rem;
      padding: 1.5rem;
      border: 1px solid var(--rule);
    }
    p {
      color: var(--muted);
      line-height: 1.7;
    }
    fieldset {
      border: 1px solid var(--rule);
      padding: 1rem;
    }
    label {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      min-height: 44px;
    }
    button {
      min-height: 44px;
      margin: 0.75rem 0.75rem 0.5rem 0;
      padding: 0.65rem 1rem;
      border: 1px solid var(--rule);
      color: var(--paper);
      background: var(--night);
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    :is(button, input):focus-visible {
      outline: 2px solid var(--orange);
      outline-offset: 4px;
    }
  `,
})
export class AiResponseExampleComponent {
  readonly blocks: readonly DemoBlock[] = [
    { kind: 'summary', text: 'Choose a report to include in a proposed plan.' },
    { kind: 'options', label: 'Report scope', options: ['Current month', 'Previous month'] },
  ];
  readonly selected = signal<string | null>(null);
  readonly reviewed = signal<string | null>(null);
  readonly status = signal('');
  choose(option: string): void {
    const choices = this.blocks.find((block) => block.kind === 'options');
    if (choices?.kind !== 'options' || !choices.options.includes(option)) return;
    this.selected.set(option);
    this.reviewed.set(null);
    this.status.set('');
  }
  confirm(): void {
    if (!this.reviewed() || this.reviewed() !== this.selected()) return;
    this.status.set(`Example confirmation recorded for ${this.reviewed()}.`);
    this.reviewed.set(null);
  }
}
