import { describe, expect, it } from 'vitest';
import { projectStudies } from './project-studies.data';
import { publicProjects } from './projects.data';

const reservedAnchors = ['flow', 'decisions', 'validation', 'takeaways', 'references'];

describe('project studies', () => {
  it('covers exactly the public project slugs', () => {
    expect(Object.keys(projectStudies).sort()).toEqual(
      publicProjects.map((project) => project.slug).sort(),
    );
  });

  it('provides unique usable anchors and complete content for each present block', () => {
    for (const study of Object.values(projectStudies)) {
      const anchors = study.sections.map((section) => section.id);
      expect(anchors.length).toBeGreaterThan(0);
      expect(new Set(anchors).size).toBe(anchors.length);
      for (const section of study.sections) {
        expect(section.id).toMatch(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/);
        expect(reservedAnchors).not.toContain(section.id);
        expect(section.title.trim()).not.toBe('');
        expect(section.paragraphs.length).toBeGreaterThan(0);
      }
      if (study.flow) {
        expect(study.flow.title.trim()).not.toBe('');
        expect(study.flow.steps.length).toBeGreaterThan(0);
        for (const step of study.flow.steps) {
          expect(step.title.trim()).not.toBe('');
          expect(step.detail.trim()).not.toBe('');
        }
      }
      if (study.decisions) {
        expect(study.decisions.length).toBeGreaterThan(0);
        for (const decision of study.decisions) {
          expect(decision.title.trim()).not.toBe('');
          expect(decision.choice.trim()).not.toBe('');
          expect(decision.tradeoff.trim()).not.toBe('');
        }
      }
      if (study.checks) {
        expect(study.checks.length).toBeGreaterThan(0);
        for (const check of study.checks) {
          expect(check.scenario.trim()).not.toBe('');
          expect(check.expectation.trim()).not.toBe('');
        }
      }
      if (study.takeaways) {
        expect(study.takeaways.length).toBeGreaterThan(0);
        expect(study.takeaways.every((takeaway) => takeaway.trim().length > 0)).toBe(true);
      }
      expect(study.lead.trim()).not.toBe('');
      expect(study.scopeNote.length).toBeGreaterThan(40);
      expect(study.references.length).toBeGreaterThan(0);
      for (const reference of study.references) {
        expect(new URL(reference.url).protocol).toBe('https:');
        expect(reference.label.length).toBeGreaterThan(10);
      }
    }
  });

  it('uses different narrative structures for product, runtime, website, and platform work', () => {
    const signatures = Object.values(projectStudies).map((study) =>
      JSON.stringify({
        sections: study.sections.length,
        flow: Boolean(study.flow),
        decisions: Boolean(study.decisions),
      }),
    );
    expect(new Set(signatures).size).toBe(4);
    expect(projectStudies['task-around-website'].sections.map((section) => section.id)).toContain(
      'tasker-onboarding',
    );
    expect(JSON.stringify(projectStudies)).not.toMatch(/glitch-free/i);
  });

  it('links inspectable projects to specific public GitHub sources', () => {
    for (const slug of ['ts-reactivity-engine', 'task-around-website', 'white-label-restaurant']) {
      for (const reference of projectStudies[slug].references) {
        const url = new URL(reference.url);
        expect(url.hostname).toBe('github.com');
        expect(url.pathname.split('/').filter(Boolean).length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('presents Visual Kapital as delivered work with its public demonstration', () => {
    const study = projectStudies['visual-kapital'];
    expect(study.lead).toContain('shipped on Android');
    expect(study.lead).toContain('Kotlin Multiplatform');
    expect(study.lead).toContain('subscriptions');
    expect(study.references).toContainEqual({
      label: 'Public product demonstration by Vitalii Napastiuk',
      url: 'https://www.youtube.com/watch?v=8PpHj_BgPuM',
    });
    expect(study.flow).toBeUndefined();
    expect(study.checks).toBeUndefined();
    expect(JSON.stringify(study)).not.toMatch(/tiny|hackathon|production-ready/i);
  });
});
