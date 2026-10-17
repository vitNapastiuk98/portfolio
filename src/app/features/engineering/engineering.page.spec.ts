import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { engineeringStudies } from '../../data/engineering-studies.data';
import { EngineeringPage } from './engineering.page';

describe('EngineeringPage', () => {
  it.each(engineeringStudies)(
    'renders the complete $slug study and related reading',
    async (study) => {
      await TestBed.configureTestingModule({
        imports: [EngineeringPage],
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: { paramMap: of(convertToParamMap({ slug: study.slug })) },
          },
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(EngineeringPage);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('h1')?.textContent).toBe(study.title);
      expect(root.querySelectorAll('.study-section')).toHaveLength(
        study.sections.length + (study.presentation === 'article' ? 1 : 5),
      );
      if (study.experiment && study.presentation !== 'article') {
        expect(root.querySelector('.project-study__header .eyebrow')?.textContent).toContain(
          'Lab experiment',
        );
        expect(root.querySelectorAll('.study-experiment a')).toHaveLength(4);
        expect(root.querySelector('a[href="/performance-lab/results.json"]')).toBeTruthy();
      }
      if (study.slug === 'opencv-anchored-annotations') {
        expect(root.querySelectorAll('app-anchor-tracking-diagram svg[role="img"]')).toHaveLength(
          4,
        );
        expect(root.querySelector('app-anchor-tracking-diagram')?.textContent).toContain(
          'not captured footage',
        );
        expect(root.querySelector('.study-brief')?.textContent).toContain(
          'Engineering contribution',
        );
        expect(root.querySelector('.study-brief')?.textContent).toContain(
          'Designed and implemented',
        );
        expect(root.querySelector('.project-study__header .eyebrow')?.textContent).toContain(
          'Case study',
        );
        expect(root.querySelector('.project-study__header .eyebrow')?.textContent).not.toContain(
          'Design study',
        );
        expect(root.querySelector('h2#validation')?.textContent).toBe(
          'Failure scenarios to validate',
        );
      }
      expect(root.querySelectorAll('.study-related a')).toHaveLength(
        engineeringStudies.filter(
          (other) =>
            other.slug !== study.slug &&
            (!study.relatedSlugs || study.relatedSlugs.includes(other.slug)),
        ).length,
      );
      if (study.presentation === 'article') {
        expect(root.querySelector('.engineering-article')).toBeTruthy();
        expect(root.querySelector('.project-study__header .eyebrow')?.textContent).toContain(
          'Article',
        );
        expect(root.querySelector('.study-brief')).toBeNull();
        expect(root.querySelector('.study-scope-note')).toBeNull();
        expect(root.querySelector('.study-experiment')).toBeNull();
        expect(root.querySelector('app-accessibility-examples')).toBeNull();
        expect(root.querySelector('app-angular-performance-lab')).toBeNull();
        expect(root.querySelectorAll('figure').length).toBeGreaterThan(0);
        expect(root.querySelectorAll('.study-code').length).toBeGreaterThan(0);
      }
      const schema = JSON.parse(
        TestBed.inject(DOCUMENT).getElementById('engineering-study-schema')!.textContent!,
      );
      expect(schema['@type']).toBe('TechArticle');
      expect(schema.headline).toBe(study.title);
      if (study.presentation !== 'article') {
        expect(root.querySelector('.study-scope-note')?.textContent).toContain('study');
      }
      expect(
        TestBed.inject(DOCUMENT).querySelector('link[rel="canonical"]')?.getAttribute('href'),
      ).toContain(`/engineering/${study.slug}`);
    },
  );

  it('does not index missing engineering studies', async () => {
    await TestBed.configureTestingModule({
      imports: [EngineeringPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: 'unavailable' })) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(EngineeringPage);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-study-body')).toBeNull();
    expect(
      TestBed.inject(DOCUMENT).querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex, follow');
  });
});
