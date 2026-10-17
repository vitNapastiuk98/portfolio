import { engineeringStudies } from './engineering-studies.data';

describe('public engineering studies', () => {
  it('distinguishes the anchored-annotation reconstruction from employer implementation and benchmarks', () => {
    const study = engineeringStudies.find(({ slug }) => slug === 'opencv-anchored-annotations')!;
    expect(study.scopeNote).toContain('reconstruction');
    expect(study.scopeNote).toContain('Employer source');
    expect(study.sections.flatMap(({ paragraphs }) => paragraphs).join(' ')).toContain(
      'original coordinates',
    );
    expect(study.checks.some(({ scenario }) => scenario.includes('small rectangle'))).toBe(true);
    expect(study.checks.some(({ scenario }) => scenario.includes('Occlusion'))).toBe(true);
    expect(JSON.stringify(study)).not.toMatch(/0\.03|0\.01|0\.72|Brochesia|Transtec/);
  });
  it('keeps the authored routes stable and unique', () => {
    expect(engineeringStudies.map(({ slug }) => slug)).toEqual([
      'web-performance',
      'accessibility',
      'angular-architectures',
      'angular-dependency-injection',
      'reactive-consistency',
      'resilient-real-time-sessions',
      'ai-interface-state',
      'opencv-anchored-annotations',
    ]);
    expect(new Set(engineeringStudies.map(({ slug }) => slug)).size).toBe(
      engineeringStudies.length,
    );
  });

  it('provides distinct section anchors without colliding with shared study navigation', () => {
    const sharedAnchors = ['flow', 'decisions', 'validation', 'takeaways', 'references'];
    for (const study of engineeringStudies) {
      const anchors = study.sections.map(({ id }) => id);
      expect(anchors.length).toBeGreaterThanOrEqual(3);
      expect(new Set(anchors).size).toBe(anchors.length);
      expect(anchors.every((id) => /^[a-z]+(?:-[a-z]+)*$/.test(id))).toBe(true);
      expect(anchors.some((id) => sharedAnchors.includes(id))).toBe(false);
      expect(study.sections.every(({ paragraphs }) => paragraphs.length >= 2)).toBe(true);
    }
  });

  it('clearly scopes conceptual guidance and supplies reviewable design artifacts', () => {
    for (const study of engineeringStudies) {
      if (study.presentation === 'article') {
        expect(study.sections.length).toBeGreaterThanOrEqual(6);
        expect(study.sections.some((section) => section.codeExamples?.length)).toBe(true);
        expect(study.references.length).toBeGreaterThanOrEqual(2);
        continue;
      }
      if (study.studyType === 'implemented') {
        expect(study.problem).toBeTruthy();
        expect(study.technologies?.length).toBeGreaterThan(0);
        expect(study.scopeNote).toContain('study');
      } else if (study.experiment) {
        expect(study.scopeNote).toContain('Implemented lab study');
        expect(study.scopeNote).toContain('not production results');
      } else if (study.experience) {
        expect(study.experience.contribution).toContain('Designed and implemented');
        expect(study.experience.implemented).toHaveLength(4);
        expect(study.scopeNote).toContain('not a verified record');
      } else if (study.studyType === 'conceptual') {
        expect(study.scopeNote).toContain('Technical design study');
        expect(study.scopeNote).toContain('illustrative');
      } else {
        expect(study.scopeNote).toContain('Technical design study: conceptual guidance');
        expect(study.scopeNote).toContain('not a description of deployed client architecture');
      }
      expect(study.flow.steps).toHaveLength(4);
      expect(study.decisions.length).toBeGreaterThanOrEqual(3);

      expect(study.decisions.every(({ choice, tradeoff }) => choice && tradeoff)).toBe(true);
      expect(study.checks.length).toBeGreaterThanOrEqual(4);

      expect(study.checks.every(({ scenario, expectation }) => scenario && expectation)).toBe(true);
      expect(study.takeaways.length).toBeGreaterThanOrEqual(3);
      expect(study.references.length).toBeGreaterThanOrEqual(2);

      for (const reference of study.references) {
        expect(new URL(reference.url).protocol).toBe('https:');
        expect(reference.label.length).toBeGreaterThan(0);
      }
    }
  });

  it('covers stale results, incomplete recovery, and uncertain action outcomes', () => {
    const reactivity = engineeringStudies.find((study) => study.slug === 'reactive-consistency')!;
    const realtime = engineeringStudies.find(
      (study) => study.slug === 'resilient-real-time-sessions',
    )!;
    const ai = engineeringStudies.find((study) => study.slug === 'ai-interface-state')!;
    expect(reactivity.checks.some(({ scenario }) => scenario.includes('A resolves'))).toBe(true);
    expect(reactivity.checks.some(({ scenario }) => scenario.includes('Permissions change'))).toBe(
      true,
    );
    expect(realtime.checks.some(({ scenario }) => scenario.includes('audio still flows'))).toBe(
      true,
    );
    expect(
      realtime.checks.some(({ scenario }) => scenario.includes('membership has expired')),
    ).toBe(true);
    expect(realtime.checks.some(({ scenario }) => scenario.includes('during backoff'))).toBe(true);
    expect(ai.checks.some(({ scenario }) => scenario.includes('after navigation'))).toBe(true);
    expect(ai.checks.some(({ scenario }) => scenario.includes('after the user confirms'))).toBe(
      true,
    );
    expect(ai.checks.some(({ scenario }) => scenario.includes('response times out'))).toBe(true);
  });
});
