import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const fixture = new URL('../public/performance-lab/index.html', import.meta.url);

test('the lab defaults to optimized and keeps work and feedback equivalent', async () => {
  const html = await readFile(fixture, 'utf8');
  for (const mode of ['baseline', 'optimized', 'invalid']) {
    const dom = new JSDOM(html, {
      url: `http://localhost/performance-lab/?mode=${mode}`,
      runScripts: 'dangerously',
      beforeParse(window) {
        window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0);
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const document = dom.window.document;
    assert.equal(document.body.dataset.mode, mode === 'baseline' ? 'baseline' : 'optimized');
    assert.equal(
      document.querySelector('.mode-nav [aria-current="page"]')?.getAttribute('href'),
      `?mode=${document.body.dataset.mode}`,
    );
    assert.equal(document.getElementById('primary-content').hidden, false);
    document.getElementById('replay-content').click();
    assert.equal(document.getElementById('primary-content').hidden, mode === 'baseline');
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
  for (const mode of ['baseline', 'optimized']) {
    const rows = report.runs.filter((run) => run.mode === mode);
    for (const [metric, value] of Object.entries(report.medians[mode])) {
      assert.equal(value, rows.map((run) => run[metric]).sort((a, b) => a - b)[2]);
    }
  }
  for (const mode of ['baseline', 'optimized']) {
    assert.equal(report.runs.filter((run) => run.mode === mode).length, 5);
    for (const run of report.runs.filter((run) => run.mode === mode)) {
      assert.ok(run.lcpMs > 0);
      assert.ok(run.cls >= 0);
      assert.ok(run.responseFrameMs > 0);
      assert.equal(run.interactionMs === null, run.interactionId === null);
      if (run.interactionMs !== null) assert.ok(run.interactionMs > 0);
      assert.ok(run.longTaskCount >= 0);
    }
  }
});

test('the published study quotes the committed medians without claiming field INP', async () => {
  const report = JSON.parse(
    await readFile(new URL('../public/performance-lab/results.json', import.meta.url)),
  );
  const study = await readFile(
    new URL('../src/app/data/web-performance.data.ts', import.meta.url),
    'utf8',
  );
  const before = report.medians.baseline;
  const after = report.medians.optimized;
  assert.ok(study.includes(`LCP ${Math.round(before.lcpMs)} → ${Math.round(after.lcpMs)} ms`));
  assert.ok(study.includes(`CLS ${before.cls.toFixed(3)} → ${after.cls.toFixed(3)}`));
  assert.ok(
    study.includes(
      `proxy ${Math.round(before.responseFrameMs)} → ${Math.round(after.responseFrameMs)} ms`,
    ),
  );
  assert.ok(
    study.includes(`${Math.round(before.completionMs)} → ${Math.round(after.completionMs)} ms`),
  );
  assert.ok(study.includes('It is not field INP'));
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
