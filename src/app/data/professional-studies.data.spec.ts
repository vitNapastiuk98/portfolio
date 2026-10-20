import { professionalStudies } from './professional-studies.data';
import { engineeringStudies } from './engineering-studies.data';
import { publicProjects } from './projects.data';
import { projectStudies } from './project-studies.data';
import { blogPosts } from '../../generated/blog-posts.generated';

describe('professional study registry', () => {
  it('contains six substantial studies with valid links and diagram boundaries', () => {
    expect(professionalStudies).toHaveLength(6);
    const paths = new Set([
      ...professionalStudies.map((s) => '/case-studies/' + s.slug),
      ...engineeringStudies.map((s) => '/engineering/' + s.slug),
      ...publicProjects.map((s) => '/work/' + s.slug),
      ...blogPosts.map((s) => '/blog/' + s.slug),
      '/projects',
    ]);
    expect(new Set(professionalStudies.map((s) => s.slug)).size).toBe(6);
    for (const study of professionalStudies) {
      expect(study.sections.length).toBeGreaterThanOrEqual(5);
      expect(study.sections.every((s) => s.paragraphs.length >= 2)).toBe(true);
      expect(study.sections.filter((s) => s.codeExamples?.length).length).toBeGreaterThanOrEqual(2);
      expect(study.decisions?.length).toBeGreaterThanOrEqual(3);
      expect(study.checks?.length).toBeGreaterThanOrEqual(4);
      expect(study.contexts.length).toBeGreaterThan(0);
      const ids = study.sections.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      const diagrams = study.sections.flatMap((s) => (s.diagram ? [s.diagram] : []));
      expect(diagrams.length).toBeGreaterThan(0);
      for (const diagram of diagrams) {
        const nodes = new Set(diagram.nodes.map((n) => n.id));
        expect(nodes.size).toBe(diagram.nodes.length);
        expect(diagram.edges.every((e) => nodes.has(e.from) && nodes.has(e.to))).toBe(true);
      }
      for (const related of study.related) expect(paths.has(related.path)).toBe(true);
    }
    for (const project of publicProjects) expect(projectStudies[project.slug]).toBeTruthy();
  });
});
