import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { professionalStudies } from '../../data/professional-studies.data';
import { CaseStudyPage } from './case-study.page';

describe('professional case-study pages', () => {
  it.each(professionalStudies)(
    'renders $slug with scoped examples, diagrams and canonical metadata',
    async (study) => {
      await TestBed.configureTestingModule({
        imports: [CaseStudyPage],
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: { paramMap: of(convertToParamMap({ slug: study.slug })) },
          },
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(CaseStudyPage);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('h1')?.textContent).toBe(study.title);
      expect(root.querySelectorAll('.study-section').length).toBeGreaterThanOrEqual(10);
      expect(root.querySelector('svg[role="img"]')).toBeTruthy();
      expect(root.querySelectorAll('.study-code').length).toBeGreaterThanOrEqual(2);
      expect(root.querySelector('.study-scope-note')?.textContent).toBe(study.scopeNote);
      expect(
        TestBed.inject(DOCUMENT).querySelector('link[rel="canonical"]')?.getAttribute('href'),
      ).toContain('/case-studies/' + study.slug);
      expect(TestBed.inject(DOCUMENT).getElementById('professional-study-schema')).toBeTruthy();
    },
  );
});
