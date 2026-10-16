import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home.page';

describe('HomePage', () => {
  it('renders the immersive portfolio sections without a filler about poster', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), { provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const schema = JSON.parse(
      TestBed.inject(DOCUMENT).getElementById('profile-schema')!.textContent!,
    );
    expect(schema['@graph'][1].mainEntity.name).toBe('Vitalii Napastiuk');
    expect(schema['@graph'][1].mainEntity.sameAs).toHaveLength(3);

    expect(root.querySelector('[data-section="hero"]')).toBeTruthy();
    expect(root.querySelector('[data-section="about"]')).toBeFalsy();
    expect(root.querySelector('[data-section="expertise"]')).toBeTruthy();
    expect(root.querySelector('[data-section="work"]')).toBeTruthy();
    expect(root.querySelector('[data-section="experience"]')).toBeTruthy();
    expect(root.querySelector('[data-section="writing"]')).toBeTruthy();
    expect(root.querySelector('[data-section="conversation"]')).toBeTruthy();
    expect(root.querySelector('#home')).toBeTruthy();
    expect(root.querySelector('#expertise')).toBeTruthy();
    expect(root.querySelector('#work')).toBeTruthy();
    expect(root.querySelector('#experience')).toBeTruthy();
    expect(root.querySelector('#writing')).toBeTruthy();
    expect(root.querySelector('#contact')).toBeTruthy();
    expect(root.querySelector('h1')?.textContent).toContain('Vitalii');
    expect(root.querySelector('h1')?.textContent).toContain('Napastiuk');
  });
});
