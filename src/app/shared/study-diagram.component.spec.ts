import { TestBed } from '@angular/core/testing';
import { StudyDiagramComponent } from './study-diagram.component';

describe('responsibility diagram', () => {
  it('gives directed edges and feedback a textual alternative', () => {
    const fixture = TestBed.createComponent(StudyDiagramComponent);
    fixture.componentRef.setInput('diagram', {
      id: 'diagram-test',
      title: 'Task loop',
      caption: 'Reference example',
      columns: 3,
      nodes: [
        { id: 'a', label: 'Inspect', detail: 'Review task' },
        { id: 'b', label: 'Decide', detail: 'Record outcome' },
        { id: 'c', label: 'Finish', detail: 'Complete task' },
      ],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'a', label: 'repeat' },
      ],
    });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('svg')?.getAttribute('aria-labelledby')).toContain(
      'diagram-test-description',
    );
    expect(root.querySelector('desc')?.textContent).toContain('Finish to Inspect: repeat');
    expect(root.querySelectorAll('path[marker-end]')).toHaveLength(3);
    expect(fixture.componentInstance.edges()[2].path).toContain('V');
    expect(root.querySelector('figcaption')?.textContent).toBe('Reference example');
  });
});
