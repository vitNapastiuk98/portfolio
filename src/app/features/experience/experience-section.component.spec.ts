import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { experience } from '../../data/profile.data';
import { ExperienceSectionComponent } from './experience-section.component';

describe('ExperienceSectionComponent', () => {
  it('keeps the INPS scale and performance results in one responsibility', () => {
    const responsibilities = experience.find(
      (item) => item.organization === 'Minsait / Indra — INPS',
    )!.responsibilities;
    const scaleOrPerformance = responsibilities.filter((item) =>
      /serving millions|Core Web Vitals|Lighthouse/.test(item),
    );

    expect(scaleOrPerformance).toHaveLength(1);
    expect(scaleOrPerformance[0]).toContain('Angular and TypeScript');
    expect(scaleOrPerformance[0]).toContain('95+ and accessibility scores of 100 on audited pages');
    expect(scaleOrPerformance[0]).toContain('WCAG 2.1 AA');
    expect(responsibilities.some((item) => item.includes('Sirio'))).toBe(true);
  });

  it('presents each role as two readable columns with CV-backed outcomes', async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceSectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(ExperienceSectionComponent);
    fixture.componentRef.setInput('standalone', true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const entries = Array.from(root.querySelectorAll<HTMLElement>('.experience-entry'));

    expect(entries).toHaveLength(3);
    expect(entries.every((entry) => entry.querySelectorAll(':scope > div').length === 2)).toBe(
      true,
    );
    expect(root.textContent).toContain('Senior Product Engineer / Frontend Architect');
    expect(root.textContent).toContain('reducing integration effort by 90%');
    expect(root.textContent).toContain('accessibility scores of 100');
  });
});
