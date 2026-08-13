import {
  createReadStream,
  existsSync,
  statSync,
} from 'node:fs';
import {
  createServer,
} from 'node:http';
import {
  dirname,
  extname,
  relative,
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';

const currentFile =
  fileURLToPath(import.meta.url);
const webRoot =
  dirname(dirname(currentFile));
const storybookStaticDir =
  resolve(webRoot, 'storybook-static');
const serveMode =
  process.argv.includes('--serve');
const smokeMode =
  process.argv.includes('--smoke');
const requestedPort = Number(
  process.env.STORYBOOK_STATIC_PORT ?? 6011,
);
const serveHost =
  process.env.STORYBOOK_STATIC_HOST ?? '0.0.0.0';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.eot': 'application/vnd.ms-fontobject',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveStaticFile(requestUrl) {
  const url = new URL(
    requestUrl ?? '/',
    'http://127.0.0.1',
  );
  const pathname = decodeURIComponent(url.pathname);
  const normalizedPath = pathname === '/'
    ? '/index.html'
    : pathname;
  const filePath = resolve(
    storybookStaticDir,
    `.${normalizedPath}`,
  );
  const relativePath = relative(
    storybookStaticDir,
    filePath,
  );

  if (
    relativePath.startsWith('..')
    || relativePath === ''
    || resolve(filePath) === storybookStaticDir
  ) {
    return null;
  }

  if (existsSync(filePath)) {
    return filePath;
  }

  if (!extname(normalizedPath)) {
    return resolve(
      storybookStaticDir,
      'index.html',
    );
  }

  return filePath;
}

function assertBundleExists() {
  const indexPath = resolve(
    storybookStaticDir,
    'index.html',
  );
  const iframePath = resolve(
    storybookStaticDir,
    'iframe.html',
  );
  const storyIndexPath = resolve(
    storybookStaticDir,
    'index.json',
  );

  const missing = [
    indexPath,
    iframePath,
    storyIndexPath,
  ].filter((path) => !existsSync(path));

  if (missing.length > 0) {
    throw new Error([
      'Brak kompletnego Storybook bundle.',
      'Uruchom najpierw: pnpm run build-storybook',
      '',
      'Brakujące pliki:',
      ...missing,
    ].join('\n'));
  }
}

async function startServer({
  host,
  port,
}) {
  assertBundleExists();

  const server = createServer((request, response) => {
    const filePath = resolveStaticFile(request.url);

    if (!filePath || !existsSync(filePath)) {
      response.writeHead(404, {
        'content-type': 'text/plain; charset=utf-8',
      });
      response.end('Not found');
      return;
    }

    const stat = statSync(filePath);

    if (!stat.isFile()) {
      response.writeHead(404, {
        'content-type': 'text/plain; charset=utf-8',
      });
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-length': stat.size,
      'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
  });

  await new Promise((resolveServer, rejectServer) => {
    server.once('error', rejectServer);
    server.listen(port, host, () => {
      server.off('error', rejectServer);
      resolveServer();
    });
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Nie udało się ustalić adresu serwera Storybook bundle.');
  }

  return {
    host,
    port: address.port,
    server,
  };
}

async function stopServer(server) {
  if (!server) {
    return;
  }

  await new Promise((resolveServer, rejectServer) => {
    server.close((error) => {
      if (error) {
        rejectServer(error);
        return;
      }

      resolveServer();
    });
  });
}

async function runSmoke() {
  const {
    chromium,
  } = await import('@playwright/test');
  const started = await startServer({
    host: '127.0.0.1',
    port: 0,
  });
  const baseUrl = `http://127.0.0.1:${started.port}`;
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext({
    viewport: {
      width: 1440,
      height: 1024,
    },
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(String(error));
  });

  const result = {
    baseUrl,
    consoleErrors,
    iframeLoaded: false,
    managerLoaded: false,
    pageErrors,
  };

  try {
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    await page.waitForFunction(() => {
      const bodyText = document.body?.innerText ?? '';

      return bodyText.includes('00 FUNDAMENTY')
        || bodyText.includes('Find components')
        || Boolean(document.querySelector('a[href*="path=/story/"]'));
    }, {
      timeout: 15000,
    });

    result.managerLoaded = true;

    await page.goto(
      `${baseUrl}/iframe.html?id=00-fundamenty-01-fundamenty-wizualne--kierunek-wizualny&viewMode=story`,
      {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      },
    );

    await page.waitForSelector('#storybook-root', {
      timeout: 10000,
    });

    await page.waitForFunction(() => {
      const bodyText = document.body?.innerText ?? '';

      return bodyText.includes('Start fundamentów wizualnych');
    }, {
      timeout: 10000,
    });

    result.iframeLoaded = true;
  } finally {
    await context.close();
    await browser.close();
    await stopServer(started.server);
  }

  console.log(JSON.stringify(result, null, 2));

  if (
    !result.managerLoaded
    || !result.iframeLoaded
    || result.consoleErrors.length > 0
    || result.pageErrors.length > 0
  ) {
    process.exitCode = 1;
  }
}

async function runServe() {
  const started = await startServer({
    host: serveHost,
    port: requestedPort,
  });

  console.log('Storybook static bundle ready.');
  console.log('');
  console.log(`Local: http://localhost:${started.port}/`);
  console.log(`Loopback: http://127.0.0.1:${started.port}/`);
  console.log('');
  console.log('To jest statyczny bundle Storybooka, bez dev HMR/WebSocket.');
  console.log('Zatrzymaj przez Ctrl+C.');
}

try {
  if (smokeMode) {
    await runSmoke();
  } else if (serveMode) {
    await runServe();
  } else {
    console.log('Użycie:');
    console.log('node scripts/storybook-bundle-server.mjs --serve');
    console.log('node scripts/storybook-bundle-server.mjs --smoke');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
