import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WorkPage } from './work.page';

describe('WorkPage', () => {
  it('uses the complete shared dependency graph for the runtime study', async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: 'ts-reactivity-engine' })) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorkPage);
    fixture.detectChanges();
    const graph = (fixture.nativeElement as HTMLElement).querySelector('app-runtime-graph');
    expect(graph?.querySelectorAll('.runtime-graph__node')).toHaveLength(4);
    expect(graph?.querySelectorAll('.runtime-graph__edge')).toHaveLength(4);
    expect(graph?.textContent).toContain('linkedSignal()');
  });

  it.each([
    [
      'task-around-website',
      'TaskAround Website',
      'https://github.com/algonova-io/taskaround_website2.0',
    ],
    [
      'white-label-restaurant',
      'White-label Restaurant Platform',
      'https://github.com/vitNapastiuk98/whitelabelRestaurant',
    ],
  ])('renders %s with its public reference', async (slug, title, reference) => {
    await TestBed.configureTestingModule({
      imports: [WorkPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug })) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorkPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain(title);
    expect(root.querySelector(`a[href="${reference}"]`)).toBeTruthy();
    expect(root.querySelector('.project-study__scope')?.textContent).toContain('Stack:');
  });
  it('does not render the draft form experiment as a public study', async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: 'logistics-form-migration' })) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorkPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.project-study')).toBeNull();
    expect(
      TestBed.inject(DOCUMENT).querySelector('meta[name="robots"]')?.getAttribute('content'),
    ).toBe('noindex, follow');
    expect(root.textContent).toContain('This project record is not public.');
  });

  it('renders the requested project as a focused study', async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: 'visual-kapital' })) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WorkPage);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Visual Kapital');
    expect(root.textContent).toContain('Mobile / Fintech');
    expect(root.querySelector('.project-study__header')?.textContent).not.toContain(
      'TypeScript Reactivity Engine',
    );
    expect(root.querySelector('.project-study')).toBeTruthy();
    expect(root.querySelector('.project-study__scope a[target="_blank"]')).toBeFalsy();
    const demo = root.querySelector<HTMLAnchorElement>('.study-demo');
    expect(demo?.getAttribute('href')).toBe('https://www.youtube.com/watch?v=8PpHj_BgPuM');
    expect(demo?.textContent).toContain('Watch the product demo');
  });
});
