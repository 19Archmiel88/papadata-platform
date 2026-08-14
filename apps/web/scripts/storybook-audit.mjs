import {
  createReadStream,
  existsSync,
  readFileSync,
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
import AxeBuilder from '@axe-core/playwright';
import {
  chromium,
  expect,
} from '@playwright/test';

const FULL_AUDIT =
  process.argv.includes('--full');
const BUSINESS_SCREEN_AUDIT =
  process.argv.includes('--business-screens');
const SERVE_STATIC =
  process.argv.includes('--serve-static')
  && !process.env.STORYBOOK_URL;
const currentFile =
  fileURLToPath(import.meta.url);
const webRoot =
  dirname(dirname(currentFile));
const storybookStaticDir =
  resolve(webRoot, 'storybook-static');
const storyIndexPath =
  resolve(storybookStaticDir, 'index.json');
const storyIndex = JSON.parse(
  readFileSync(storyIndexPath, 'utf8'),
);
const entries = Object.values(storyIndex.entries);
let baseUrl =
  process.env.STORYBOOK_URL
  ?? 'http://127.0.0.1:6010';

const desktopViewport = {
  width: 1440,
  height: 1024,
};
const tabletViewport = {
  width: 768,
  height: 1024,
};
const mobileViewport = {
  width: 390,
  height: 844,
};

const crossCuttingPatternTargets = [
  {
    title: '18 Wzorce interfejsu/Układ strony i sekcji',
  },
  {
    title: '18 Wzorce interfejsu/Routing feedbacku',
  },
  {
    title: '18 Wzorce interfejsu/Ładowanie danych i operacje w tle',
  },
  {
    title: '18 Wzorce interfejsu/Tabela z filtrami i akcjami',
  },
  {
    title: '18 Wzorce interfejsu/Potwierdzenia i operacje destrukcyjne',
  },
  {
    title: '18 Wzorce interfejsu/Approval, step-up i ochrona zmian',
  },
  {
    title: '18 Wzorce interfejsu/Panele szczegółów, dowodów i rekomendacji',
  },
  {
    title: '18 Wzorce interfejsu/Readiness operacyjny',
  },
  {
    title: '18 Wzorce interfejsu/Formularze złożone i kreatory',
  },
  {
    title: '18 Wzorce interfejsu/Macierz stanów przekrojowych',
  },
  {
    title: '18 Wzorce interfejsu/DataDecisionWorkspace',
  },
];


const businessScreenTargets = [
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.01 Widok główny',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.02 Kolejka uwagi',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.03 KPI',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.04 Plan vs wynik',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.05 Drivery wyniku',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.06 Źródła sprzedaży',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.07 Ruch',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.08 Produkty',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.09 Klienci',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.10 Lejek',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.11 Rekomendacje AI',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.12 Sygnały sprzedażowe',
  },
  {
    title: '30 Centrum Dowodzenia/Ekrany produkcyjne',
    name: '30.13 Waterfall',
  },
  {
    title: '31 Kampanie płatne/Ekrany produkcyjne',
    name: '31.01 Przegląd',
  },
  {
    title: '31 Kampanie płatne/Ekrany produkcyjne',
    name: '31.02 Lista kampanii',
  },
  {
    title: '31 Kampanie płatne/Ekrany produkcyjne',
    name: '31.03 Szczegóły kampanii',
  },
  {
    title: '31 Kampanie płatne/Ekrany produkcyjne',
    name: '31.04 Atrybucja i sprzedaż',
  },
  {
    title: '31 Kampanie płatne/Ekrany produkcyjne',
    name: '31.05 Budżet',
  },
  {
    title: '31 Kampanie płatne/Ekrany produkcyjne',
    name: '31.06 Diagnostyka',
  },
];

const matrixTargets = [
  {
    title: '00 Fundamenty/01 Fundamenty wizualne',
    name: 'Kierunek wizualny',
  },
  {
    title: '00 Fundamenty/02 Powierzchnie i komunikaty',
    name: 'Canvas, tło i powierzchnie',
  },
  {
    title: '00 Fundamenty/03 Marka',
  },
  {
    title: '00 Fundamenty/04 Ikony',
  },
  {
    title: '00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje',
  },
  {
    title: '00 Fundamenty/05 Akcje i wejścia/Pola tekstowe i formularzowe',
  },
  ...crossCuttingPatternTargets,
];

const zoomTargets = [
  {
    title: '00 Fundamenty/01 Fundamenty wizualne',
    name: 'Kierunek wizualny',
  },
  {
    title: '00 Fundamenty/02 Powierzchnie i komunikaty',
    name: 'Canvas, tło i powierzchnie',
  },
  {
    title: '00 Fundamenty/03 Marka',
  },
  {
    title: '00 Fundamenty/04 Ikony',
  },
  {
    title: '00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje',
  },
  {
    title: '00 Fundamenty/05 Akcje i wejścia/Pola tekstowe i formularzowe',
  },
  ...crossCuttingPatternTargets,
];

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
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

  return filePath;
}

async function startStaticStorybookServer() {
  if (!existsSync(storybookStaticDir)) {
    throw new Error(
      `Brak katalogu Storybook bundle: ${storybookStaticDir}. Najpierw uruchom build-storybook.`,
    );
  }

  if (!existsSync(storyIndexPath)) {
    throw new Error(
      `Brak indeksu Storybook bundle: ${storyIndexPath}. Najpierw uruchom build-storybook.`,
    );
  }

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
      'content-length': stat.size,
      'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
  });

  await new Promise((resolveServer, rejectServer) => {
    server.once('error', rejectServer);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', rejectServer);
      resolveServer();
    });
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new Error('Nie udało się ustalić adresu lokalnego serwera Storybook bundle.');
  }

  baseUrl = `http://127.0.0.1:${address.port}`;

  return server;
}

async function stopStaticStorybookServer(server) {
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

function resolveStoryId({
  title,
  name,
}) {
  const matchingEntries = entries.filter((entry) =>
    entry.title === title
    && (name ? entry.name === name : true),
  );

  if (matchingEntries.length !== 1) {
    throw new Error(
      `Nie udało się jednoznacznie rozpoznać story dla "${title}"${name ? ` / "${name}"` : ''}.`,
    );
  }

  return matchingEntries[0].id;
}

function summarizeAxe(violations) {
  return violations.reduce((summary, violation) => {
    if (violation.impact === 'critical') {
      summary.critical += 1;
    }

    if (violation.impact === 'serious') {
      summary.serious += 1;
    }

    return summary;
  }, {
    critical: 0,
    serious: 0,
  });
}

async function waitForStory(page) {
  await page.waitForSelector('#storybook-root', {
    timeout: 10000,
  });
  await page.waitForTimeout(900);
}

async function openStory(
  browser,
  storyId,
  {
    viewport = desktopViewport,
    zoom = 1,
  } = {},
) {
  const resolvedViewport =
    zoom > 1
      ? {
          width: Math.max(
            320,
            Math.floor(viewport.width / zoom),
          ),
          height: viewport.height,
        }
      : viewport;
  const context = await browser.newContext({
    viewport: resolvedViewport,
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

  await page.goto(
    `${baseUrl}/iframe.html?id=${storyId}&viewMode=story`,
    {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    },
  );
  await waitForStory(page);

  return {
    consoleErrors,
    context,
    page,
    pageErrors,
  };
}

async function detectHorizontalOverflow(page) {
  return page.evaluate(() => {
    const bodyWidth =
      document.body?.scrollWidth ?? 0;
    const documentWidth =
      document.documentElement.scrollWidth;
    const viewportWidth =
      document.documentElement.clientWidth;
    const widest =
      Math.max(bodyWidth, documentWidth);
    const overflow = widest - viewportWidth;

    return {
      hasOverflow: overflow > 1,
      overflow,
      viewportWidth,
      widest,
    };
  });
}

async function auditStory(
  browser,
  storyId,
  {
    marker,
    viewport,
    zoom = 1,
  } = {},
) {
  const {
    consoleErrors,
    context,
    page,
    pageErrors,
  } = await openStory(browser, storyId, {
    viewport,
    zoom,
  });

  if (marker) {
    await expect(
      page.getByRole('heading', {
        name: marker,
      }),
    ).toBeVisible();
  }

  const axeResults = await new AxeBuilder({
    page,
  }).analyze();
  const axeSummary = summarizeAxe(
    axeResults.violations,
  );
  const overflow = await detectHorizontalOverflow(page);

  await context.close();

  return {
    axe: axeSummary,
    consoleErrors,
    overflow,
    pageErrors,
  };
}

async function runPlayScan(browser) {
  const playStories = entries.filter((entry) =>
    entry.tags?.includes('play-fn'),
  );
  const results = [];

  for (const story of playStories) {
    const {
      consoleErrors,
      context,
      page,
      pageErrors,
    } = await openStory(browser, story.id);

    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      results.push({
        consoleFirst: consoleErrors[0] ?? null,
        id: story.id,
        pageFirst: pageErrors[0] ?? null,
      });
    }

    await context.close();
  }

  return {
    failingCount: results.length,
    results,
    total: playStories.length,
  };
}

async function main() {
  const staticServer = SERVE_STATIC
    ? await startStaticStorybookServer()
    : null;
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const playScan = await runPlayScan(browser);
    const storyResults = [];
    const activeTargets = BUSINESS_SCREEN_AUDIT
      ? businessScreenTargets
      : matrixTargets;
    const desktopStories = FULL_AUDIT
      ? entries.map((entry) => ({
          id: entry.id,
          name: entry.name,
          title: entry.title,
        }))
      : activeTargets.map((target) => ({
          id: resolveStoryId(target),
          name: target.name ?? null,
          title: target.title,
        }));

    for (const story of desktopStories) {
      const result = await auditStory(
        browser,
        story.id,
        {
          viewport: desktopViewport,
        },
      );

      storyResults.push({
        mode: 'desktop',
        story,
        ...result,
      });
    }

    const responsiveResults = [];

    for (const target of activeTargets) {
      const storyId = resolveStoryId(target);

      for (const viewport of [
        {
          key: '390',
          value: mobileViewport,
        },
        {
          key: '768',
          value: tabletViewport,
        },
      ]) {
        const result = await auditStory(
          browser,
          storyId,
          {
            marker: target.marker,
            viewport: viewport.value,
          },
        );

        responsiveResults.push({
          storyId,
          title: target.title,
          viewport: viewport.key,
          ...result,
        });
      }
    }

    const zoomResults = [];

    for (const target of zoomTargets) {
      const storyId = resolveStoryId(target);
      const result = await auditStory(
        browser,
        storyId,
        {
          viewport: desktopViewport,
          zoom: 2,
        },
      );

      zoomResults.push({
        storyId,
        title: target.title,
        ...result,
      });
    }

    const desktopSummary = storyResults.reduce((summary, result) => {
      summary.consoleErrors += result.consoleErrors.length;
      summary.pageErrors += result.pageErrors.length;
      summary.critical += result.axe.critical;
      summary.serious += result.axe.serious;
      return summary;
    }, {
      consoleErrors: 0,
      critical: 0,
      pageErrors: 0,
      serious: 0,
    });

    const responsiveSummary = responsiveResults.reduce((summary, result) => {
      summary.consoleErrors += result.consoleErrors.length;
      summary.pageErrors += result.pageErrors.length;
      summary.critical += result.axe.critical;
      summary.serious += result.axe.serious;
      summary.overflow += result.overflow.hasOverflow ? 1 : 0;
      return summary;
    }, {
      consoleErrors: 0,
      critical: 0,
      overflow: 0,
      pageErrors: 0,
      serious: 0,
    });

    const zoomSummary = zoomResults.reduce((summary, result) => {
      summary.consoleErrors += result.consoleErrors.length;
      summary.pageErrors += result.pageErrors.length;
      summary.critical += result.axe.critical;
      summary.serious += result.axe.serious;
      summary.overflow += result.overflow.hasOverflow ? 1 : 0;
      return summary;
    }, {
      consoleErrors: 0,
      critical: 0,
      overflow: 0,
      pageErrors: 0,
      serious: 0,
    });

    const summary = {
      businessScreenAudit: BUSINESS_SCREEN_AUDIT,
      desktop: desktopSummary,
      fullAudit: FULL_AUDIT,
      playScan,
      responsive: responsiveSummary,
      zoom: zoomSummary,
    };

    console.log(JSON.stringify({
      responsiveResults,
      storyResults,
      summary,
      zoomResults,
    }, null, 2));

    const failed =
      playScan.failingCount > 0
      || desktopSummary.consoleErrors > 0
      || desktopSummary.pageErrors > 0
      || desktopSummary.critical > 0
      || desktopSummary.serious > 0
      || responsiveSummary.consoleErrors > 0
      || responsiveSummary.pageErrors > 0
      || responsiveSummary.critical > 0
      || responsiveSummary.serious > 0
      || responsiveSummary.overflow > 0
      || zoomSummary.consoleErrors > 0
      || zoomSummary.pageErrors > 0
      || zoomSummary.critical > 0
      || zoomSummary.serious > 0
      || zoomSummary.overflow > 0;

    if (failed) {
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    await stopStaticStorybookServer(staticServer);
  }
}

await main();
