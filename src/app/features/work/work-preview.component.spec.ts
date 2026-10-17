import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WorkPreviewComponent } from './work-preview.component';
import { publicProjects } from '../../data/projects.data';

describe('WorkPreviewComponent', () => {
  it('gives every public project a full visual block and study link', async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(WorkPreviewComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const stages = root.querySelectorAll('.project-stage');
    expect(stages).toHaveLength(publicProjects.length);
    expect(root.querySelector('.project-directory')).toBeNull();
    expect(stages[0].querySelector('h3')?.textContent).toBe('Visual Kapital');
    expect(
      stages[0].querySelector('a[href="https://www.youtube.com/watch?v=8PpHj_BgPuM"]')?.textContent,
    ).toContain('Watch demo');
    expect(stages[0].querySelector('.study-featured')?.textContent).toContain('Shipped on Android');
    expect(root.querySelector('#engineering')).toBeNull();
    publicProjects.forEach((project) => {
      const stage = Array.from(stages).find((element) =>
        element.querySelector(`a[href="/work/${project.slug}"]`),
      )!;
      expect(stage.querySelector('h3')?.textContent).toBe(project.title);
      expect(stage.querySelector('app-project-visual')).toBeTruthy();
      expect(stage.querySelector(`a[href="/work/${project.slug}"]`)).toBeTruthy();
      const reference = project.url;
      if (reference) {
        expect(stage.querySelector(`a[href="${reference}"]`)?.textContent).toContain(
          'Inspect source',
        );
      }
    });
    expect(root.querySelector('.capital-chart')).toBeTruthy();
    expect(root.querySelector('.restaurant-console')).toBeTruthy();
    expect(root.querySelector('.task-map-visual__route')).toBeTruthy();
    expect(root.querySelector('a[href="/work/logistics-form-migration"]')).toBeNull();
  });

  it('renders every reactive dependency and pulse in one SVG coordinate system', async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(WorkPreviewComponent);
    fixture.detectChanges();
    const graph = (fixture.nativeElement as HTMLElement).querySelector('.runtime-graph');
    const svg = graph?.querySelector('svg');
    const nodes = svg?.querySelectorAll('.runtime-graph__node');
    const paths = Array.from(svg?.querySelectorAll('.runtime-graph__edge') ?? []);
    const motions = Array.from(svg?.querySelectorAll('.runtime-graph__pulse animateMotion') ?? []);
    const expectedPaths = [
      'M200 250 C220 180 225 125 245 108',
      'M200 250 C218 320 220 372 225 388',
      'M455 108 C490 130 505 190 520 250',
      'M495 388 C510 365 515 305 520 250',
    ];

    expect(nodes).toHaveLength(4);
    expect(paths).toHaveLength(4);
    expect(motions).toHaveLength(4);
    expect(svg?.textContent).toContain('linkedSignal()');
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(expectedPaths);
    expect(
      paths.every((path) => path.getAttribute('marker-end') === 'url(#runtime-edge-arrow)'),
    ).toBe(true);
    expect(motions.map((motion) => motion.getAttribute('path'))).toEqual(expectedPaths);
    expect(motions.every((motion) => motion.getAttribute('dur') === '5s')).toBe(true);
    expect(motions.every((motion) => motion.getAttribute('begin') === '0s')).toBe(true);
    expect(motions.map((motion) => motion.getAttribute('keyTimes'))).toEqual([
      '0;0.06;0.46;1',
      '0;0.06;0.46;1',
      '0;0.5;0.9;1',
      '0;0.5;0.9;1',
    ]);
    expect(svg?.querySelectorAll('.runtime-graph__pulse[opacity="0"]')).toHaveLength(4);
    const fades = Array.from(svg?.querySelectorAll('.runtime-graph__pulse animate') ?? []);
    expect(fades).toHaveLength(4);
    expect(fades.every((fade) => fade.getAttribute('values') === '0;0;1;1;0;0')).toBe(true);
    expect(graph?.querySelector(':scope > .runtime-graph__node')).toBeFalsy();
  });
});
