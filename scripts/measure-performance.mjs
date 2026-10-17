import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const lab = fileURLToPath(new URL('../public/performance-lab/', import.meta.url));
const chromePath =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = await mkdtemp(path.join(os.tmpdir(), 'portfolio-performance-'));
const fonts = {
  'manrope-latin-wght-normal.woff2': '@fontsource-variable/manrope',
  'syne-latin-wght-normal.woff2': '@fontsource-variable/syne',
  'ibm-plex-mono-latin-400-normal.woff2': '@fontsource/ibm-plex-mono',
};
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const fontName = pathname.startsWith('/performance-lab/fonts/')
    ? pathname.slice('/performance-lab/fonts/'.length)
    : '';
  const fontPackage = Object.hasOwn(fonts, fontName) ? fonts[fontName] : null;
  if (pathname !== '/' && !fontPackage) {
    response.writeHead(404).end();
    return;
  }
  try {
    const file = fontPackage
      ? fileURLToPath(new URL(`../node_modules/${fontPackage}/files/${fontName}`, import.meta.url))
      : path.join(lab, 'index.html');
    const content = await readFile(file);
    response
      .writeHead(200, {
        'Content-Type': fontPackage ? 'font/woff2' : 'text/html',
        'Cache-Control': 'no-store',
      })
      .end(content);
  } catch {
    response.writeHead(500).end('Fixture unavailable');
  }
});
let chrome;
let socket;
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );
  const debuggerUrl = await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Chrome startup timed out; set CHROME_PATH')),
      15000,
    );
    let stderr = '';
    chrome.stderr.on('data', (data) => {
      stderr += data;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    chrome.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    chrome.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chrome exited: ${code}`));
    });
  });
  const endpoint = new URL(debuggerUrl);
  const targets = await fetch(`http://${endpoint.host}/json/list`).then((response) =>
    response.json(),
  );
  const target = targets.find((entry) => entry.type === 'page');
  assert.ok(target, 'Chrome page target');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const task = pending.get(message.id);
    if (!task) return;
    clearTimeout(task.timeout);
    pending.delete(message.id);
    if (message.error) task.reject(new Error(message.error.message));
    else task.resolve(message.result);
  });
  const command = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const requestId = ++id;
      const timeout = setTimeout(() => {
        pending.delete(requestId);
        reject(new Error(`${method} timed out`));
      }, 15000);
      pending.set(requestId, { resolve, reject, timeout });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await command('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await command('Page.enable');
  await command('Runtime.enable');
  await command('Network.enable');
  await command('Network.setCacheDisabled', { cacheDisabled: true });
  await command('Emulation.setCPUThrottlingRate', { rate: 4 });
  const viewport = { width: 390, height: 844, deviceScaleFactor: 1 };
  await command('Emulation.setDeviceMetricsOverride', { ...viewport, mobile: true });
  await command('Page.addScriptToEvaluateOnNewDocument', {
    source: `
    window.labMetrics = { lcpMs: null, cls: 0, interactionMs: null, interactionId: null, longTaskCount: 0, longTaskMs: 0 };
    let sessionStart = 0, lastShift = 0, sessionValue = 0;
    new PerformanceObserver(list => { for (const entry of list.getEntries()) { window.labMetrics.lcpMs = entry.startTime; window.labMetrics.lcpElement = entry.element?.id || entry.element?.tagName || null; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      if (entry.startTime - lastShift > 1000 || entry.startTime - sessionStart > 5000) { sessionValue = 0; sessionStart = entry.startTime; }
      sessionValue += entry.value; lastShift = entry.startTime;
      window.labMetrics.cls = Math.max(window.labMetrics.cls, sessionValue);
    }}).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) {
      window.labMetrics.longTaskCount++; window.labMetrics.longTaskMs += entry.duration;
    }}).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) {
      if (entry.interactionId && (window.labMetrics.interactionMs === null || entry.duration > window.labMetrics.interactionMs)) {
        window.labMetrics.interactionMs = entry.duration; window.labMetrics.interactionId = entry.interactionId;
      }
    }}).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  `,
  });
  const runs = [];
  for (let pair = 0; pair < 5; pair++) {
    for (const mode of pair % 2 ? ['optimized', 'baseline'] : ['baseline', 'optimized']) {
      await command('Page.navigate', { url: `http://127.0.0.1:${port}/?mode=${mode}&run=${pair}` });
      // A fixed observation window captures the deliberately delayed content before interacting.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const point = await evaluate(
        `(() => { const button = document.getElementById('run-work'); button.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = button.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`,
      );
      await command('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        ...point,
        button: 'left',
        clickCount: 1,
      });
      await command('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        ...point,
        button: 'left',
        clickCount: 1,
      });
      const metrics = await evaluate(`new Promise((resolve, reject) => {
        const deadline = performance.now() + 10000;
        const poll = () => {
          if (document.body.dataset.completionMs) setTimeout(() => resolve({ ...window.labMetrics, completionMs: Number(document.body.dataset.completionMs), responseFrameMs: Number(document.body.dataset.responseFrameMs), checksum: Number(document.body.dataset.checksum) }), 250);
          else if (performance.now() > deadline) reject(new Error('Work did not finish'));
          else setTimeout(poll, 50);
        }; poll();
      })`);
      assert.ok(metrics.lcpMs > 0, `${mode}: observed LCP`);
      assert.ok(metrics.responseFrameMs > 0, `${mode}: response frame observed`);
      assert.equal(
        metrics.interactionMs === null,
        metrics.interactionId === null,
        'Missing Event Timing stays null',
      );
      assert.ok(metrics.checksum > 0, 'Work completed');
      runs.push({ pair: pair + 1, mode, ...metrics });
      console.log(
        `${mode}: LCP ${metrics.lcpMs} ms, CLS ${metrics.cls.toFixed(3)}, response frame ${metrics.responseFrameMs.toFixed(1)} ms; Event Timing ${metrics.interactionMs}`,
      );
    }
  }
  assert.equal(
    new Set(runs.map((run) => run.checksum)).size,
    1,
    'Both modes produce identical work',
  );
  const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
  const medians = Object.fromEntries(
    ['baseline', 'optimized'].map((mode) => [
      mode,
      Object.fromEntries(
        ['lcpMs', 'cls', 'responseFrameMs', 'longTaskCount', 'longTaskMs', 'completionMs'].map(
          (key) => [key, median(runs.filter((run) => run.mode === mode).map((run) => run[key]))],
        ),
      ),
    ]),
  );
  const version = await command('Browser.getVersion');
  const report = {
    scope: 'Synthetic local lab; not field Core Web Vitals',
    measuredAt: new Date().toISOString(),
    fixtureSha256: createHash('sha256')
      .update(await readFile(path.join(lab, 'index.html')))
      .digest('hex'),
    fieldINP: null,
    environment: {
      browser: version.product,
      platform: `${os.platform()} ${os.arch()}`,
      cpu: os.cpus()[0].model,
      cpuSlowdown: 4,
      viewport,
      network: 'Loopback, no network throttling',
      cache: 'Disabled; fresh navigation for each sample',
      repetitions: 5,
      order: 'Paired; alternating first mode',
      observationWindowMs: 1500,
      interaction:
        'One trusted CDP mouse click; handler start to second requestAnimationFrame callback, including one frame boundary; excludes input delay; not INP',
      eventTiming:
        'Maximum Event Timing duration if available (16 ms floor); missing entries remain null',
      fixture:
        'Standalone HTML with portfolio fonts and styling; excludes Angular and portfolio shell',
    },
    medians,
    runs,
  };
  const reportPath = path.join(lab, 'results.json');
  await writeFile(`${reportPath}.tmp`, `${JSON.stringify(report, null, 2)}\n`);
  await rename(`${reportPath}.tmp`, reportPath);
  console.log(JSON.stringify(medians, null, 2));
} finally {
  socket?.close();
  if (chrome?.pid && chrome.exitCode === null) {
    const exited = new Promise((resolve) => chrome.once('exit', resolve));
    chrome.kill();
    await exited;
  }
  await new Promise((resolve) => server.close(resolve));
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
