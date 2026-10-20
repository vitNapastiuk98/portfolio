import { TestBed } from '@angular/core/testing';
import { AiResponseExampleComponent } from './ai-response-example.component';

describe('AI proposal reference interaction', () => {
  it('requires a current reviewed choice and invalidates stale confirmation', () => {
    const fixture = TestBed.createComponent(AiResponseExampleComponent);
    const model = fixture.componentInstance;
    model.confirm();
    expect(model.status()).toBe('');
    model.choose('Current month');
    model.reviewed.set(model.selected());
    model.choose('Previous month');
    model.confirm();
    expect(model.status()).toBe('');
    model.reviewed.set(model.selected());
    model.confirm();
    expect(model.status()).toContain('Previous month');
    expect(model.reviewed()).toBeNull();
    model.choose('Untrusted choice');
    expect(model.selected()).toBe('Previous month');
  });
});
