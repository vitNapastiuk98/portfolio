import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { opencvAnchoredAnnotations } from '../data/opencv-anchored-annotations.data';
import { StudyBodyComponent } from './study-body.component';

describe('StudyBodyComponent', () => {
  it('connects every contents link to a unique heading on the current study route', async () => {
    await TestBed.configureTestingModule({
      imports: [StudyBodyComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(StudyBodyComponent);
    fixture.componentRef.setInput('study', opencvAnchoredAnnotations);
    fixture.componentRef.setInput('path', '/engineering/opencv-anchored-annotations');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const headings = [...root.querySelectorAll<HTMLHeadingElement>('h2[id]')];
    expect(headings).toHaveLength(8);
    expect(new Set(headings.map((heading) => heading.id)).size).toBe(headings.length);
    const links = [...root.querySelectorAll<HTMLAnchorElement>('.study-nav a')];
    expect(links).toHaveLength(headings.length);
    for (const link of links) {
      expect(link.getAttribute('href')).toBe(
        `/engineering/opencv-anchored-annotations${link.hash}`,
      );
      expect(headings.some((heading) => `#${heading.id}` === link.hash)).toBe(true);
    }
    expect(root.querySelectorAll('.study-flow li')).toHaveLength(4);
    expect(root.querySelector('table caption')?.textContent).toContain('tradeoffs');
    expect(root.querySelectorAll('thead th[scope="col"]')).toHaveLength(3);
    expect(root.querySelectorAll('.study-checks li').length).toBeGreaterThanOrEqual(4);
    expect(root.querySelector('.study-scope-note')?.textContent).toContain(
      'Diagrams are illustrative',
    );
  });
  it('omits sections and contents links absent from a compact project narrative', async () => {
    await TestBed.configureTestingModule({ imports: [StudyBodyComponent] }).compileComponents();
    const fixture = TestBed.createComponent(StudyBodyComponent);
    fixture.componentRef.setInput('study', {
      lead: 'Product contribution',
      scopeNote: 'Public summary',
      sections: [
        {
          id: 'delivery',
          label: 'Delivery',
          title: 'Android delivery',
          paragraphs: ['Released product.'],
        },
      ],
      references: [],
    });
    fixture.componentRef.setInput('path', '/work/example');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    for (const id of ['flow', 'decisions', 'validation', 'takeaways']) {
      expect(root.querySelector('#' + id)).toBeNull();
      expect(root.querySelector('.study-nav a[href$="#' + id + '"]')).toBeNull();
    }
    expect(root.querySelector('#delivery')).toBeTruthy();
  });
});
