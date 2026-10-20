import { TestBed } from '@angular/core/testing';
import { ReferenceDialogComponent } from './reference-dialog.component';

describe('dialog reference contract', () => {
  it('names the modal and clears an earlier result before Escape/cancellation', () => {
    const fixture = TestBed.createComponent(ReferenceDialogComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const dialog = root.querySelector('dialog')!;
    const trigger = root.querySelector('button')!;
    // JSDOM does not implement native modality; the browser session checks it separately.
    dialog.showModal = vi.fn();
    dialog.returnValue = 'confirm';
    trigger.click();
    expect(dialog.returnValue).toBe('');
    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(root.querySelector('#' + dialog.getAttribute('aria-labelledby'))?.textContent).toContain(
      'Apply',
    );
    dialog.dispatchEvent(new Event('close'));
    fixture.detectChanges();
    expect(root.querySelector('[role="status"]')?.textContent).toBe('Returned to editing.');
  });
});
