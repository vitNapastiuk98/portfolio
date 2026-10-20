import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { professionalPreviews } from '../../data/professional-previews.data';
import { WorkPreviewComponent } from './work-preview.component';

describe('professional engineering showcase', () => {
  it('features six professional studies and separates independent projects', async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorkPreviewComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h2')?.textContent).toBe('Engineering Beyond the Interface');
    expect(root.querySelectorAll('.professional-card')).toHaveLength(6);
    expect(root.querySelector('.professional-card--featured')?.getAttribute('href')).toBe(
      '/case-studies/angular-enterprise-architecture',
    );
    expect(
      Array.from(root.querySelectorAll('.professional-card')).map((a) => a.getAttribute('href')),
    ).toEqual(professionalPreviews.map((s) => '/case-studies/' + s.slug));
    expect(root.querySelector('a[href="/projects"]')).toBeTruthy();
    expect(root.querySelector('a[href^="/work/"]')).toBeNull();
  });
});
