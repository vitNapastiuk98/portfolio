import { writeFile } from 'node:fs/promises';

const [url, widthText, heightText, outputPath, scrollText, action] = process.argv.slice(2);
const width = Number(widthText);
const height = Number(heightText);

if (!url || !width || !height || !outputPath) {
  throw new Error('Usage: node scripts/visual-audit.mjs <url> <width> <height> <output.png>');
}

const targets = await fetch('http://127.0.0.1:9223/json').then((response) => response.json());
const pageTarget = targets.find((target) => target.type === 'page');
if (!pageTarget) throw new Error('No Chrome page target is available');
const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 0;
const browserErrors = [];

await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') {
    browserErrors.push(message.params.exceptionDetails.text);
  }
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
    browserErrors.push(message.params.entry.text);
  }
});

const command = (method, params = {}) => {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
};

await command('Page.enable');
await command('Runtime.enable');
await command('Log.enable');
await command('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width <= 760,
});
await command('Page.navigate', { url });
await new Promise((resolve) => setTimeout(resolve, 2200));

if (scrollText !== undefined) {
  await command('Runtime.evaluate', { expression: `scrollTo(0, ${Number(scrollText)})` });
  await new Promise((resolve) => setTimeout(resolve, 1400));
}

if (action === 'menu') {
  await command('Runtime.evaluate', {
    expression: `document.querySelector('.menu-button')?.click()`,
  });
  await new Promise((resolve) => setTimeout(resolve, 400));
}

if (action === 'pointer') {
  await command('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: Math.round(width * 0.68),
    y: Math.round(height * 0.62),
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
}

const { result } = await command('Runtime.evaluate', {
  returnByValue: true,
  expression: `(() => {
    const root = document.documentElement;
    const smallTargets = [...document.querySelectorAll('a, button, input')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: (element.getAttribute('aria-label') || element.textContent || element.tagName).trim().slice(0, 50),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .filter((target) => target.width < 44 || target.height < 44);
    return {
      title: document.title,
      viewport: [innerWidth, innerHeight],
      document: [root.scrollWidth, root.scrollHeight],
      overflowX: root.scrollWidth - root.clientWidth,
      headerRect: (() => {
        const rect = document.querySelector('.site-header')?.getBoundingClientRect();
        return rect ? [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)] : null;
      })(),
      headerChildren: [...document.querySelectorAll('.site-header > *')].map((element) => {
        const rect = element.getBoundingClientRect();
        return [element.className || element.tagName, Math.round(rect.left), Math.round(rect.width), getComputedStyle(element).visibility, getComputedStyle(element).opacity];
      }),
      topElements: [[75, 48], [300, 48], [600, 48], [900, 48]].map(([x, y]) => {
        const element = document.elementFromPoint(x, y);
        return [x, element?.tagName, element?.className || ''];
      }),
      smallTargets,
      canvasCount: document.querySelectorAll('canvas').length,
      sectionPositions: [...document.querySelectorAll('[data-section]')].map((section) => ({
        name: section.getAttribute('data-section'),
        top: Math.round(section.getBoundingClientRect().top + scrollY),
        height: Math.round(section.getBoundingClientRect().height),
      })),
      horizontalOverflow: [...document.querySelectorAll('body *')]
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            className: typeof element.className === 'string' ? element.className : '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          };
        })
        .filter((item) => item.left < -1 || item.right > innerWidth + 1)
        .slice(0, 20),
    };
  })()`,
});

const screenshot =
  scrollText === undefined
    ? await command('Page.getLayoutMetrics').then(({ contentSize }) =>
        command('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: true,
          clip: {
            x: 0,
            y: 0,
            width: Math.ceil(contentSize.width),
            height: Math.ceil(contentSize.height),
            scale: 1,
          },
        }),
      )
    : await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile(outputPath, Buffer.from(screenshot.data, 'base64'));
socket.close();

console.log(JSON.stringify({ ...result.value, browserErrors, screenshot: outputPath }, null, 2));
