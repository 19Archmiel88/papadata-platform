import {
  readFileSync,
} from 'node:fs';
import {
  fileURLToPath,
} from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import {
  chromium,
  expect,
} from '@playwright/test';

const BASE_URL =
  process.env.STORYBOOK_URL
  ?? 'http://127.0.0.1:6010';
const FULL_AUDIT =
  process.argv.includes('--full');
const currentFile =
  fileURLToPath(import.meta.url);
const storyIndexPath =
  currentFile.replace(
    /scripts\/storybook-audit\.mjs$/,
    'storybook-static/index.json',
  );
const storyIndex = JSON.parse(
  readFileSync(storyIndexPath, 'utf8'),
);
const entries = Object.values(storyIndex.entries);

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
    title: '18 Wzorce interfejsu/Panele szczegółów, dowodów i rekomendacji',
  },
  {
    title: '18 Wzorce interfejsu/Readiness operacyjny',
  },
  {
    title: '18 Wzorce interfejsu/Macierz stanów przekrojowych',
  },
  {
    title: '18 Wzorce interfejsu/DataDecisionWorkspace',
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
    `${BASE_URL}/iframe.html?id=${storyId}&viewMode=story`,
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
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const playScan = await runPlayScan(browser);
    const storyResults = [];
    const desktopStories = FULL_AUDIT
      ? entries.map((entry) => ({
          id: entry.id,
          name: entry.name,
          title: entry.title,
        }))
      : matrixTargets.map((target) => ({
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

    for (const target of matrixTargets) {
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
  }
}

await main();
