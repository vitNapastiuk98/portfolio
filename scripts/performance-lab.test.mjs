import { accumulateLayoutShift } from '../public/performance-lab/metrics.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const fixture = new URL('../public/performance-lab/index.html', import.meta.url);

test('the lab defaults to optimized and keeps work and feedback equivalent', async () => {
  const html = await readFile(fixture, 'utf8');
  for (const mode of [
    'baseline',
    'optimized',
    'delay-only',
    'reservation-only',
    'scheduling-only',
    'invalid',
  ]) {
    const dom = new JSDOM(html, {
      url: `http://localhost/performance-lab/?mode=${mode}`,
      runScripts: 'dangerously',
      beforeParse(window) {
        window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0);
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const document = dom.window.document;
    assert.equal(document.body.dataset.mode, mode === 'invalid' ? 'optimized' : mode);
    assert.equal(
      document.querySelector('.mode-nav [aria-current="page"]')?.getAttribute('href'),
      `?mode=${document.body.dataset.mode}`,
    );
    assert.equal(document.getElementById('primary-content').hidden, false);
    document.getElementById('replay-content').click();
    assert.equal(
      document.getElementById('primary-content').hidden,
      ['baseline', 'reservation-only', 'scheduling-only'].includes(mode),
    );
    await new Promise((resolve) => setTimeout(resolve, 850));
    assert.equal(document.getElementById('primary-content').hidden, false);
    assert.match(document.getElementById('content-observation').textContent, /ready|arrived/i);
    document.getElementById('run-work').click();
    await new Promise((resolve) => setTimeout(resolve, 650));
    assert.equal(document.getElementById('feedback').textContent, 'Saved');
    assert.equal(document.getElementById('work-progress').value, 30000000);
    assert.match(document.getElementById('work-observation').textContent, /complete/i);
    assert.equal(document.getElementById('run-work').disabled, false);
    assert.ok(Number(document.body.dataset.checksum) > 0);
    dom.window.close();
  }
});

test('the report retains paired raw samples, missing field INP and reproducibility metadata', async () => {
  const report = JSON.parse(
    await readFile(new URL('../public/performance-lab/results.json', import.meta.url)),
  );
  assert.equal(report.scope, 'Synthetic local lab; not field Core Web Vitals');
  assert.equal(report.environment.cpuSlowdown, 4);
  assert.deepEqual(report.environment.viewport, { width: 390, height: 844, deviceScaleFactor: 1 });
  assert.equal(report.fieldINP, null);
  assert.equal(
    report.fixtureSha256,
    createHash('sha256')
      .update(await readFile(fixture))
      .digest('hex'),
  );
  assert.equal(new Set(report.runs.map((run) => run.checksum)).size, 1);
  for (const mode of [
    'baseline',
    'optimized',
    'delay-only',
    'reservation-only',
    'scheduling-only',
  ]) {
    const rows = report.runs.filter((run) => run.mode === mode);
    for (const [metric, value] of Object.entries(report.medians[mode])) {
      assert.equal(value, rows.map((run) => run[metric]).sort((a, b) => a - b)[2]);
    }
  }
  for (const mode of [
    'baseline',
    'optimized',
    'delay-only',
    'reservation-only',
    'scheduling-only',
  ]) {
    assert.equal(report.runs.filter((run) => run.mode === mode).length, 5);
    for (const run of report.runs.filter((run) => run.mode === mode)) {
      assert.ok(run.lcpMs > 0);
      assert.ok(run.contentReadyMs > 0);
      assert.ok(run.cls >= 0);
      assert.ok(run.responseFrameMs > 0);
      assert.equal(run.interactionMs === null, run.interactionId === null);
      if (run.interactionMs !== null) assert.ok(run.interactionMs > 0);
      assert.ok(run.longTaskCount >= 0);
    }
  }
});

test('the performance article explains Angular concepts without a local experiment narrative', async () => {
  const article = await readFile(
    new URL('../src/app/data/web-performance.data.ts', import.meta.url),
    'utf8',
  );
  for (const concept of [
    'RenderMode.Prerender',
    'RenderMode.Server',
    'provideClientHydration',
    '@defer',
    'NgOptimizedImage',
  ]) {
    assert.ok(article.includes(concept), concept);
  }
  assert.doesNotMatch(
    article,
    /performance-lab|Recorded local medians|measurementSummary|response-frame proxy|controlled-results/,
  );
});

test('lab assets and report resolve correctly after Firebase removes the trailing slash', async () => {
  const html = await readFile(fixture, 'utf8');
  const dom = new JSDOM(html, {
    url: 'https://vit-napastiuk.web.app/performance-lab?mode=optimized',
  });
  for (const href of ['results.json', 'README.md']) {
    const link = [...dom.window.document.querySelectorAll('a')].find((link) =>
      link.getAttribute('href')?.endsWith(href),
    );
    assert.equal(new URL(link.href).pathname, `/performance-lab/${href}`);
  }
  for (const font of [...html.matchAll(/url\(['"]([^'"]+\.woff2)['"]\)/g)]) {
    assert.ok(
      new URL(font[1], dom.window.location.href).pathname.startsWith('/performance-lab/fonts/'),
    );
  }
  assert.ok(html.includes("fetch('/performance-lab/results.json')"));
  dom.window.close();
});

test('CLS starts its first session at the first shift and honors strict session boundaries', () => {
  const state = { start: null, last: null, value: 0, maximum: 0 };
  const shift = (startTime, value = 0.1, hadRecentInput = false) =>
    accumulateLayoutShift(state, { startTime, value, hadRecentInput });
  shift(4000);
  shift(4800);
  shift(5600);
  shift(6400);
  shift(7200);
  shift(8000);
  shift(8800);
  assert.equal(state.start, 4000);
  assert.ok(Math.abs(state.maximum - 0.7) < 1e-9);
  shift(9000); // Exactly five seconds starts a new session.
  assert.equal(state.start, 9000);
  shift(9500, 1, true);
  assert.equal(state.last, 9000);
  shift(10000); // Exactly one second starts another session.
  assert.equal(state.start, 10000);
});

test('all conditions preserve raw evidence, variance and instrumentation attribution', async () => {
  const report = JSON.parse(
    await readFile(new URL('../public/performance-lab/results.json', import.meta.url)),
  );
  assert.equal(report.runs.length, 25);
  assert.equal(
    report.instrumentationSha256,
    createHash('sha256')
      .update(await readFile(new URL('../public/performance-lab/metrics.mjs', import.meta.url)))
      .digest('hex'),
  );
  for (const [mode, metrics] of Object.entries(report.distributions)) {
    const rows = report.runs.filter((run) => run.mode === mode);
    for (const [key, distribution] of Object.entries(metrics)) {
      assert.equal(distribution.min, Math.min(...rows.map((run) => run[key])));
      assert.equal(distribution.max, Math.max(...rows.map((run) => run[key])));
      assert.ok(distribution.sampleStandardDeviation >= 0);
    }
    for (const row of rows) {
      assert.ok(row.lcpCandidates.length > 0);
      assert.equal(row.trustedEvents[0].target, 'run-work');
      assert.ok(
        row.lcpCandidates.every((entry) => entry.startTime <= row.trustedEvents[0].startTime),
      );
      if (row.interactionId !== null)
        assert.ok(
          row.eventTiming.some(
            (entry) => entry.attributedToSave && entry.interactionId === row.interactionId,
          ),
        );
      assert.equal(row.longTasks.length, row.longTaskCount);
    }
  }
});
