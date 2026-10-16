import { projects, publicProjects } from './projects.data';

describe('project publication controls', () => {
  it('never exposes private, draft, or in-progress projects', () => {
    expect(
      publicProjects.every(
        ({ publicationStatus }) =>
          publicationStatus === 'published' || publicationStatus === 'public-summary-only',
      ),
    ).toBe(true);
  });

  it('includes only approved projects in the public source manifest', () => {
    expect(projects).toHaveLength(4);
    expect(publicProjects).toHaveLength(4);
    expect(publicProjects.map(({ slug }) => slug)).toEqual([
      'ts-reactivity-engine',
      'visual-kapital',
      'task-around-website',
      'white-label-restaurant',
    ]);
  });

  it('provides concrete scope and technologies for every public study', () => {
    for (const project of publicProjects) {
      expect(project.details?.length).toBeGreaterThanOrEqual(2);
      expect(project.technologies?.length).toBeGreaterThanOrEqual(3);
    }
    expect(publicProjects.find(({ slug }) => slug === 'task-around-website')?.url).toBe(
      'https://github.com/algonova-io/taskaround_website2.0',
    );
    expect(publicProjects.find(({ slug }) => slug === 'task-around-website')?.summary).toContain(
      'unpublished',
    );
    expect(publicProjects.some(({ slug }) => slug === 'task-around')).toBe(false);
    expect(publicProjects.some(({ slug }) => slug === 'logistics-form-migration')).toBe(false);
  });
});
