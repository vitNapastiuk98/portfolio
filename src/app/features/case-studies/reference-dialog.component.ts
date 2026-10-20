import type { ElementRef } from '@angular/core';
import { Component, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-reference-dialog',
  template: `
    <section class="reference-example" aria-label="Dialog contract example">
      <h3>Try the dialog contract</h3>
      <p>
        A local Angular example: open with the keyboard, use Tab or Shift+Tab, then dismiss with
        Escape or an action.
      </p>
      <button #trigger type="button" (click)="open()">Review change</button>
      <p role="status">{{ status() }}</p>
      <dialog
        #modal
        aria-labelledby="reference-dialog-title"
        aria-describedby="reference-dialog-help"
        (close)="closed()"
      >
        <h2 id="reference-dialog-title">Apply this example change?</h2>
        <p id="reference-dialog-help">Review the decision, then confirm or return to editing.</p>
        <button type="button" autofocus (click)="modal.close('cancel')">Keep editing</button>
        <button type="button" (click)="modal.close('confirm')">Confirm example</button>
      </dialog>
    </section>
  `,
  styles: `
    .reference-example {
      margin-top: 2rem;
      padding: 1.5rem;
      border: 1px solid var(--rule);
    }
    p {
      color: var(--muted);
      line-height: 1.7;
    }
    button {
      min-height: 44px;
      margin: 0.5rem 0.75rem 0.5rem 0;
      padding: 0.65rem 1rem;
      border: 1px solid var(--rule);
      background: var(--night);
      color: var(--paper);
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--orange);
      outline-offset: 4px;
    }
    dialog {
      max-width: min(32rem, calc(100vw - 2rem));
      max-height: calc(100dvh - 2rem);
      overflow: auto;
      background: var(--night);
      color: var(--paper);
      padding: 1.5rem;
      border: 1px solid var(--rule);
    }
    dialog::backdrop {
      background: rgb(0 0 0 / 0.7);
    }
  `,
})
export class ReferenceDialogComponent {
  private readonly modal = viewChild.required<ElementRef<HTMLDialogElement>>('modal');
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  readonly status = signal('');
  open(): void {
    this.modal().nativeElement.returnValue = '';
    this.modal().nativeElement.showModal();
  }
  closed(): void {
    this.status.set(
      this.modal().nativeElement.returnValue === 'confirm'
        ? 'Example change confirmed.'
        : 'Returned to editing.',
    );
    this.trigger().nativeElement.focus();
  }
}
