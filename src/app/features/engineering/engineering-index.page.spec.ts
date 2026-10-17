import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { engineeringStudies } from '../../data/engineering-studies.data';
import { writingPreviews } from '../../data/writing-previews.data';
import { EngineeringIndexPage } from './engineering-index.page';

describe('EngineeringIndexPage', () => {
  it('filters studies by category and restores the collection using native buttons', async () => {
    await TestBed.configureTestingModule({
      imports: [EngineeringIndexPage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(EngineeringIndexPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('.engineering-card')).toHaveLength(
      engineeringStudies.length + writingPreviews.length,
    );
    const buttons = Array.from(root.querySelectorAll('button'));
    const category = engineeringStudies[0].category;
    buttons.find((button) => button.textContent?.trim() === category)!.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.engineering-card')).toHaveLength(
      engineeringStudies.filter((study) => study.category === category).length,
    );
    expect(root.querySelector('button[aria-pressed="true"]')?.textContent).toContain(category);
    buttons.find((button) => button.textContent?.trim() === 'Writing')!.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.engineering-card')).toHaveLength(writingPreviews.length);
    expect(root.querySelectorAll('a[href^="/blog/"]')).toHaveLength(writingPreviews.length);
    buttons[0].click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.engineering-card')).toHaveLength(
      engineeringStudies.length + writingPreviews.length,
    );
    expect(
      TestBed.inject(DOCUMENT).querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toMatch(/\/engineering$/);
  });
});
