import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { featuredEngineeringStudies } from '../../data/engineering-previews.data';
import { writingPreviews } from '../../data/writing-previews.data';
import { EngineeringSectionComponent } from './engineering-section.component';

describe('EngineeringSectionComponent', () => {
  it('combines featured studies and writing in the same collection', async () => {
    await TestBed.configureTestingModule({
      imports: [EngineeringSectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(EngineeringSectionComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h2')?.textContent).toBe('Engineering & Writing');
    expect(
      Array.from(root.querySelectorAll('.engineering-card')).map((link) =>
        link.getAttribute('href'),
      ),
    ).toEqual([
      ...featuredEngineeringStudies.map((study) => `/engineering/${study.slug}`),
      ...writingPreviews.slice(0, 3).map((post) => post.path),
    ]);
    expect(root.querySelector('a[href="/engineering"]')).toBeTruthy();
    expect(root.querySelector('#writing')).toBeTruthy();
    expect(root.querySelectorAll('.engineering-card p')).toHaveLength(
      featuredEngineeringStudies.length + writingPreviews.slice(0, 3).length,
    );
  });
});
