import {
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {
  createServer,
} from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {
  spawn,
  spawnSync,
} from 'node:child_process';
import {
  fileURLToPath,
} from 'node:url';

const scriptDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);
const root = path.resolve(scriptDirectory, '..');
const staticDirectory = path.join(
  root,
  'apps/web/storybook-static',
);
const outputArgument = process.argv
  .slice(2)
  .find((argument) => argument !== '--');

const outputDirectory = path.resolve(
  outputArgument
  ?? path.join(root, 'foundation-evidence'),
);
const port = Number(process.env.FOUNDATION_EVIDENCE_PORT ?? 6107);
const debugPort = Number(
  process.env.FOUNDATION_EVIDENCE_DEBUG_PORT ?? port + 1,
);

const requiredExports = [
  'KierunekWizualny',
  'Typografia',
  'KolorySemantyczne',
  'StatusySystemowe',
  'SpacingIGrid',
  'PromienieIGeometria',
  'LinieISeparacja',
  'GlebiaIWarstwy',
  'Ikonografia',
  'MotionIReducedMotion',
  'Dostepnosc',
  'TloAuth',
  'CanvasAplikacji',
  'PowierzchniaDanych',
  'SeparatoryIObramowania',
  'GradientySwiatloISzklo',
];

const foundationCoreExports = requiredExports.slice(0, 11);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function removeDirectoryWithRetries(directoryPath) {
  const attempts = 6;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      rmSync(directoryPath, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 150,
      });
      return true;
    } catch (error) {
      if (attempt === attempts) {
        console.warn(
          `Nie udało się usunąć katalogu tymczasowego Chrome: ${directoryPath}`,
          error,
        );
        return false;
      }

      await delay(250 * attempt);
    }
  }

  return false;
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_BIN,
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser',
    '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
    '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate.includes('/')) {
      if (existsSync(candidate)) {
        return candidate;
      }
      continue;
    }

    const result = spawnSync('which', [candidate], {
      encoding: 'utf8',
    });

    if (result.status === 0 && result.stdout.trim()) {
      return result.stdout.trim();
    }
  }

  return null;
}

function createStaticServer() {
  return createServer((request, response) => {
    const requestUrl = new URL(
      request.url ?? '/',
      `http://127.0.0.1:${port}`,
    );
    const pathname = decodeURIComponent(requestUrl.pathname);
    let filePath = path.join(
      staticDirectory,
      pathname === '/' ? 'index.html' : pathname,
    );

    if (!path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!filePath.startsWith(staticDirectory) || !existsSync(filePath)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': mimeTypes[extension] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    createReadStream(filePath).pipe(response);
  });
}

function makeGlobals({
  theme = 'light',
  locale = 'pl',
  density = 'comfortable',
  motion = 'full',
} = {}) {
  return [
    `theme:${theme}`,
    `locale:${locale}`,
    `density:${density}`,
    `motion:${motion}`,
  ].join(';');
}

function safeName(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function loadStoryIndex() {
  const indexPath = path.join(staticDirectory, 'index.json');
  const index = JSON.parse(readFileSync(indexPath, 'utf8'));
  const entries = Object.values(index.entries ?? {});
  const byExport = new Map();

  for (const entry of entries) {
    if (entry.type === 'story' && entry.exportName) {
      byExport.set(entry.exportName, entry);
    }
  }

  return byExport;
}

function buildCases(byExport) {
  const cases = [];

  for (const exportName of requiredExports) {
    const entry = byExport.get(exportName);
    if (!entry) {
      throw new Error(`Missing built story export: ${exportName}`);
    }

    for (const theme of ['light', 'dark']) {
      cases.push({
        exportName,
        storyId: entry.id,
        name: `${safeName(exportName)}-${theme}-pl-comfortable-full-page`,
        width: 1440,
        height: 1000,
        fullPage: true,
        globals: makeGlobals({ theme }),
      });
    }
  }

  for (const exportName of foundationCoreExports) {
    const entry = byExport.get(exportName);
    if (!entry) {
      throw new Error(`Missing built foundation story export: ${exportName}`);
    }

    cases.push({
      exportName,
      storyId: entry.id,
      name: `${safeName(exportName)}-mobile-dark-pl-comfortable-full-page`,
      width: 390,
      height: 844,
      fullPage: true,
      globals: makeGlobals({ theme: 'dark' }),
    });

    cases.push({
      exportName,
      storyId: entry.id,
      name: `${safeName(exportName)}-light-pl-comfortable-200-zoom-full-page`,
      width: 720,
      height: 1000,
      fullPage: true,
      globals: makeGlobals({ theme: 'light' }),
      zoom: 2,
    });
  }

  const extras = [
    {
      exportName: 'Typografia',
      name: 'typografia-light-en-full-page',
      width: 1440,
      height: 1000,
      fullPage: true,
      globals: makeGlobals({ locale: 'en' }),
    },
    {
      exportName: 'Typografia',
      name: 'typografia-mobile-pl-full-page',
      width: 390,
      height: 844,
      fullPage: true,
      globals: makeGlobals(),
    },
    {
      exportName: 'SpacingIGrid',
      name: 'spacing-grid-tablet-compact-full-page',
      width: 834,
      height: 1000,
      fullPage: true,
      globals: makeGlobals({ density: 'compact' }),
    },
    {
      exportName: 'TloAuth',
      name: 'tlo-auth-mobile-dark-full-page',
      width: 390,
      height: 844,
      fullPage: true,
      globals: makeGlobals({ theme: 'dark' }),
    },
    {
      exportName: 'CanvasAplikacji',
      name: 'canvas-aplikacji-mobile-compact-full-page',
      width: 390,
      height: 844,
      fullPage: true,
      globals: makeGlobals({ density: 'compact' }),
    },
    {
      exportName: 'PowierzchniaDanych',
      name: 'powierzchnia-danych-tablet-dark-compact-full-page',
      width: 834,
      height: 1000,
      fullPage: true,
      globals: makeGlobals({ theme: 'dark', density: 'compact' }),
    },
    {
      exportName: 'MotionIReducedMotion',
      name: 'motion-global-reduced-full-page',
      width: 1440,
      height: 1000,
      fullPage: true,
      globals: makeGlobals({ motion: 'reduced' }),
    },
    {
      exportName: 'MotionIReducedMotion',
      name: 'motion-system-reduced-global-full-full-page',
      width: 1440,
      height: 1000,
      fullPage: true,
      globals: makeGlobals({ motion: 'full' }),
      forceReducedMotion: true,
    },
    {
      exportName: 'Dostepnosc',
      name: 'dostepnosc-focus-primary-light',
      width: 1440,
      height: 1000,
      globals: makeGlobals({ theme: 'light' }),
      action: 'focus-primary',
    },
    {
      exportName: 'Dostepnosc',
      name: 'dostepnosc-focus-primary-dark',
      width: 1440,
      height: 1000,
      globals: makeGlobals({ theme: 'dark' }),
      action: 'focus-primary',
    },
    {
      exportName: 'Dostepnosc',
      name: 'dostepnosc-listbox-selected-active-light',
      width: 1440,
      height: 1000,
      globals: makeGlobals({ theme: 'light' }),
      action: 'listbox-active',
    },
    {
      exportName: 'Dostepnosc',
      name: 'dostepnosc-listbox-selected-active-dark',
      width: 1440,
      height: 1000,
      globals: makeGlobals({ theme: 'dark' }),
      action: 'listbox-active',
    },
    {
      exportName: 'MotionIReducedMotion',
      name: 'motion-full-running',
      width: 1440,
      height: 1000,
      globals: makeGlobals({ motion: 'full' }),
      action: 'motion-full',
    },
    {
      exportName: 'MotionIReducedMotion',
      name: 'motion-reduced-running',
      width: 1440,
      height: 1000,
      globals: makeGlobals({ motion: 'full' }),
      action: 'motion-reduced',
    },
  ];

  for (const item of extras) {
    const entry = byExport.get(item.exportName);
    cases.push({
      ...item,
      storyId: entry.id,
    });
  }

  return cases;
}

class CdpClient {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl;
    this.socket = null;
    this.messageId = 0;
    this.pending = new Map();
    this.eventWaiters = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.webSocketUrl);

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('CDP WebSocket connection timeout.'));
      }, 10000);

      this.socket.addEventListener('open', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      this.socket.addEventListener('error', (event) => {
        clearTimeout(timeout);
        reject(new Error(`CDP WebSocket error: ${String(event)}`));
      }, { once: true });
    });

    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);

      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) {
          return;
        }
        this.pending.delete(message.id);

        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result ?? {});
        }
        return;
      }

      if (message.method) {
        const waiters = this.eventWaiters.get(message.method) ?? [];
        this.eventWaiters.delete(message.method);
        for (const waiter of waiters) {
          clearTimeout(waiter.timeout);
          waiter.resolve(message.params ?? {});
        }
      }
    });
  }

  send(method, params = {}) {
    this.messageId += 1;
    const id = this.messageId;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMilliseconds = 15000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const waiters = this.eventWaiters.get(method) ?? [];
        this.eventWaiters.set(
          method,
          waiters.filter((item) => item.timeout !== timeout),
        );
        reject(new Error(`Timeout waiting for ${method}.`));
      }, timeoutMilliseconds);

      const waiters = this.eventWaiters.get(method) ?? [];
      waiters.push({ resolve, reject, timeout });
      this.eventWaiters.set(method, waiters);
    });
  }

  close() {
    this.socket?.close();
  }
}

async function waitForJson(url, attempts = 80) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }

  throw lastError ?? new Error(`Unable to read ${url}.`);
}

async function launchBrowser(browser) {
  const userDataDirectory = mkdtempSync(
    path.join(os.tmpdir(), 'papadata-foundation-chrome-'),
  );
  const browserOutput = [];
  const browserProcess = spawn(browser, [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${userDataDirectory}`,
    'about:blank',
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  browserProcess.stdout.on('data', (chunk) => {
    browserOutput.push(chunk.toString());
  });
  browserProcess.stderr.on('data', (chunk) => {
    browserOutput.push(chunk.toString());
  });

  await waitForJson(`http://127.0.0.1:${debugPort}/json/version`);

  const response = await fetch(
    `http://127.0.0.1:${debugPort}/json/new?about:blank`,
    { method: 'PUT' },
  );
  const target = await response.json();
  const client = new CdpClient(target.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');

  return {
    browserProcess,
    browserOutput,
    client,
    userDataDirectory,
  };
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.text ?? 'Runtime evaluation failed.',
    );
  }

  return result.result?.value;
}

async function dispatchKey(client, key, code, virtualKeyCode) {
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code,
    windowsVirtualKeyCode: virtualKeyCode,
    nativeVirtualKeyCode: virtualKeyCode,
  });
}

async function runAction(client, action) {
  if (!action) {
    return null;
  }

  if (action === 'focus-primary') {
    await evaluate(client, `(() => {
      document.activeElement?.blur?.();
      document.body.tabIndex = -1;
      document.body.focus();
      return true;
    })()`);
    await dispatchKey(client, 'Tab', 'Tab', 9);
    await delay(180);

    return evaluate(client, `(() => {
      const active = document.activeElement;
      return {
        activeText: active?.textContent?.trim() ?? '',
        focusVisible: Boolean(active?.matches?.(':focus-visible')),
      };
    })()`);
  }

  if (action === 'listbox-active') {
    await evaluate(client, `(() => {
      const listbox = document.querySelector('[role="listbox"]');
      listbox?.focus();
      return Boolean(listbox);
    })()`);
    await dispatchKey(client, 'ArrowDown', 'ArrowDown', 40);
    await delay(180);

    return evaluate(client, `(() => {
      const selected = document.querySelector('[role="option"][aria-selected="true"]');
      const active = document.querySelector('[role="option"][data-active="true"]');
      return {
        selected: selected?.textContent?.trim() ?? '',
        active: active?.textContent?.trim() ?? '',
        areDifferent: selected !== active,
      };
    })()`);
  }

  if (action === 'motion-full' || action === 'motion-reduced') {
    const index = action === 'motion-full' ? 0 : 1;

    const before = await evaluate(client, `(() => {
      const modes = [...document.querySelectorAll('.pd-f0-motion-mode')];
      const mode = modes[${index}];
      const button = mode?.querySelector('button');
      const status = mode?.querySelector('[role="status"]');
      const track = mode?.querySelector('.pd-f0-motion-demo__track');

      const result = {
        modeCount: modes.length,
        mode: mode?.getAttribute('data-motion') ?? '',
        buttonFound: Boolean(button),
        statusBefore: status?.textContent?.trim() ?? '',
        trackFound: Boolean(track),
      };

      button?.click();

      return result;
    })()`);

    await delay(action === 'motion-full' ? 80 : 30);

    const after = await evaluate(client, `(() => {
      const modes = [...document.querySelectorAll('.pd-f0-motion-mode')];
      const mode = modes[${index}];
      const status = mode?.querySelector('[role="status"]');
      const track = mode?.querySelector('.pd-f0-motion-demo__track');
      const marker = track?.firstElementChild;

      return {
        statusAfter: status?.textContent?.trim() ?? '',
        trackTransform: marker
          ? getComputedStyle(marker).transform
          : '',
      };
    })()`);

    return {
      ...before,
      ...after,
      statusChanged:
        Boolean(before.statusBefore)
        && Boolean(after.statusAfter)
        && before.statusBefore !== after.statusAfter,
    };
  }

  throw new Error(`Unknown evidence action: ${action}`);
}

function actionPassed(action, evidence) {
  if (!action) {
    return true;
  }

  if (action === 'focus-primary') {
    return evidence?.focusVisible === true
      && /Zastosuj filtr|Apply filter/.test(evidence.activeText ?? '');
  }

  if (action === 'listbox-active') {
    return evidence?.areDifferent === true
      && Boolean(evidence.selected)
      && Boolean(evidence.active);
  }

  if (action === 'motion-full') {
    return evidence?.modeCount === 2
      && evidence?.mode === 'full'
      && evidence?.buttonFound === true
      && evidence?.trackFound === true
      && evidence?.statusChanged === true;
  }

  if (action === 'motion-reduced') {
    return evidence?.modeCount === 2
      && evidence?.mode === 'reduced'
      && evidence?.buttonFound === true
      && evidence?.trackFound === true
      && evidence?.statusChanged === true;
  }

  return false;
}

async function collectLayoutEvidence(client, captureCase) {
  return evaluate(client, `(() => {
    const html = document.documentElement;
    const body = document.body;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pageScrollWidth = Math.max(html.scrollWidth, body.scrollWidth);
    const pageScrollHeight = Math.max(html.scrollHeight, body.scrollHeight);
    const visibleElements = [...document.querySelectorAll('main, section, article, h1, h2, h3, p, button, [role="img"]')]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return rect.width > 0
          && rect.height > 0
          && style.visibility !== 'hidden'
          && style.display !== 'none';
      });
    const unnamedInteractive = [...document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="option"], [role="listbox"]')]
      .filter((element) => {
        if (element.getAttribute('aria-hidden') === 'true') {
          return false;
        }

        if (element.matches('input, select, textarea')) {
          return !element.getAttribute('aria-label')
            && !element.getAttribute('aria-labelledby')
            && !element.getAttribute('title')
            && (!element.labels || element.labels.length === 0);
        }

        return !(element.textContent ?? '').trim()
          && !element.getAttribute('aria-label')
          && !element.getAttribute('aria-labelledby')
          && !element.getAttribute('title');
      })
      .slice(0, 11)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute('role') ?? '',
        className: String(element.getAttribute('class') ?? ''),
      }));

    return {
      story: ${JSON.stringify(captureCase.exportName)},
      width: viewportWidth,
      height: viewportHeight,
      requestedZoom: ${JSON.stringify(captureCase.zoom ?? 1)},
      pageScrollWidth,
      pageScrollHeight,
      pageHorizontalOverflow: pageScrollWidth > viewportWidth + 1,
      visibleElementCount: visibleElements.length,
      unnamedInteractive,
    };
  })()`);
}

function buildFailureReasons({
  actionEvidence,
  captureCase,
  clipped,
  layoutEvidence,
  screenshotPath,
}) {
  const reasons = [];

  if (!existsSync(screenshotPath)) {
    reasons.push('missing-screenshot');
  }

  if (clipped) {
    reasons.push('full-page-capture-clipped');
  }

  if (layoutEvidence?.pageHorizontalOverflow) {
    reasons.push('page-horizontal-overflow');
  }

  if ((layoutEvidence?.visibleElementCount ?? 0) === 0) {
    reasons.push('blank-or-hidden-story');
  }

  if ((layoutEvidence?.unnamedInteractive?.length ?? 0) > 0) {
    reasons.push('unnamed-interactive-control');
  }

  if (!actionPassed(captureCase.action, actionEvidence)) {
    reasons.push(`action-${captureCase.action}-failed`);
  }

  return reasons;
}

async function capture(client, captureCase) {
  const screenshotPath = path.join(
    outputDirectory,
    `${captureCase.name}.png`,
  );
  const parameters = new URLSearchParams({
    id: captureCase.storyId,
    viewMode: 'story',
    globals: captureCase.globals,
  });
  const url = `http://127.0.0.1:${port}/iframe.html?${parameters}`;

  await client.send('Emulation.setDeviceMetricsOverride', {
    width: captureCase.width,
    height: captureCase.height,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: captureCase.width,
    screenHeight: captureCase.height,
  });
  await client.send('Emulation.setEmulatedMedia', {
    media: 'screen',
    features: [{
      name: 'prefers-reduced-motion',
      value: captureCase.forceReducedMotion ? 'reduce' : 'no-preference',
    }],
  });

  const loadEvent = client.waitForEvent('Page.loadEventFired');
  await client.send('Page.navigate', { url });
  await loadEvent;
  await evaluate(client, `document.fonts.ready.then(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }))`);
  await delay(350);

  const actionEvidence = await runAction(client, captureCase.action);
  const layoutEvidence = await collectLayoutEvidence(client, captureCase);
  const layoutMetrics = await client.send('Page.getLayoutMetrics');
  const contentSize = layoutMetrics.cssContentSize
    ?? layoutMetrics.contentSize;
  const documentHeight = Math.ceil(contentSize.height);
  const documentWidth = Math.ceil(contentSize.width);
  const fullPageHeight = Math.min(documentHeight, 16000);

  const screenshot = await client.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: true,
    ...(captureCase.fullPage
      ? {
          clip: {
            x: 0,
            y: 0,
            width: Math.max(captureCase.width, documentWidth),
            height: fullPageHeight,
            scale: 1,
          },
        }
      : {}),
  });

  writeFileSync(
    screenshotPath,
    Buffer.from(screenshot.data, 'base64'),
  );

  const clipped = captureCase.fullPage && documentHeight > fullPageHeight;
  const failureReasons = buildFailureReasons({
    actionEvidence,
    captureCase,
    clipped,
    layoutEvidence,
    screenshotPath,
  });
  const passed = failureReasons.length === 0;

  return {
    ...captureCase,
    screenshotPath,
    url,
    documentWidth,
    documentHeight,
    capturedHeight: captureCase.fullPage
      ? fullPageHeight
      : captureCase.height,
    clipped,
    actionEvidence,
    layoutEvidence,
    failureReasons,
    status: passed ? 'PASS' : 'FAIL',
  };
}

async function main() {
  if (!existsSync(staticDirectory)) {
    console.error(
      'Brak apps/web/storybook-static. Najpierw uruchom build Storybooka.',
    );
    process.exitCode = 1;
    return;
  }

  const browser = findBrowser();
  if (!browser) {
    console.error(
      'Nie znaleziono Chrome/Chromium. Ustaw CHROME_BIN albo wykonaj evidence ręcznie zgodnie z roadmapą.',
    );
    process.exitCode = 1;
    return;
  }

  mkdirSync(outputDirectory, { recursive: true });
  const byExport = loadStoryIndex();
  const cases = buildCases(byExport);
  const server = createStaticServer();
  let browserRuntime;

  await new Promise((resolve) => {
    server.listen(port, '127.0.0.1', resolve);
  });

  const results = [];

  try {
    browserRuntime = await launchBrowser(browser);

    for (const captureCase of cases) {
      console.log(`Evidence: ${captureCase.name}`);

      try {
        results.push(await capture(browserRuntime.client, captureCase));
      } catch (error) {
        results.push({
          ...captureCase,
          screenshotPath: path.join(
            outputDirectory,
            `${captureCase.name}.png`,
          ),
          status: 'FAIL',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  } finally {
    browserRuntime?.client.close();
    browserRuntime?.browserProcess.kill('SIGTERM');
    server.close();

    if (browserRuntime?.userDataDirectory) {
      await delay(350);
      await removeDirectoryWithRetries(
        browserRuntime.userDataDirectory,
      );
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    browser,
    storybookStatic: staticDirectory,
    outputDirectory,
    captureModel: 'CDP full-page, mobile, 200% zoom, layout and interaction evidence',
    foundationCoreExports,
    pass: results.filter((item) => item.status === 'PASS').length,
    fail: results.filter((item) => item.status === 'FAIL').length,
    results,
  };

  writeFileSync(
    path.join(outputDirectory, 'foundation-evidence-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `Foundation evidence: ${manifest.pass} PASS, ${manifest.fail} FAIL.`,
  );

  if (manifest.fail > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
