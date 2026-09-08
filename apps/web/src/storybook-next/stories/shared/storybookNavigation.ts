// Storybook's manager does not forward arbitrary query parameters to its iframe.
// Restore the explicitly shared scope before any product screen mounts.
function restoreManagerScope() {
  if (typeof window === 'undefined' || window.parent === window) return;
  try {
    const parent = new URL(window.parent.location.href);
    if (!parent.searchParams.has('path')) return;
    const iframe = new URL(window.location.href);
    for (const key of [
      'from',
      'to',
      'compare',
      'channel',
      'campaignView',
      'orderView',
      'orderSource',
      'orderQueue',
      'productView',
      'productCategory',
      'productFilter',
      'productSegment',
      'decisionView',
      'decisionFilter',
      'decisionDomain',
      'decisionOwner',
      'decisionSearch',
      'decisionSort',
      'decisionId',
      'reportId',
      'reportVersion',
      'reportMode',
      'reportCollection',
      'reportSearch',
    ]) {
      const value = parent.searchParams.get(key);
      if (value) iframe.searchParams.set(key, value);
    }
    window.history.replaceState(window.history.state, '', iframe);
  } catch {
    /* Cross-origin embedding has no access to the manager's URL. */
  }
}
restoreManagerScope();

const stories: Readonly<Record<string, string>> = {
  '/app': 'analiza-centrum-dowodzenia-całość--overview',
  '/app/command-center': 'analiza-centrum-dowodzenia-całość--overview',
  '/app/campaigns': 'analiza-kampanie-płatne-całość--overview',
  '/app/orders': 'analiza-zamówienia-całość--overview',
  '/app/products': 'analiza-produkty-całość--overview',
  '/app/customers': 'analiza-klienci-całość--overview',
  '/app/traffic': 'analiza-ruch-na-stronie-całość--overview',
  '/app/assistant': 'papa-asystent-przebudowa--full-page',
  '/app/papa': 'raporty-zapisane-raporty-całość--library',
  '/app/integrations/sources': 'dane-i-integracje-integracje-całość--sources-story',
  '/app/settings/organizacja': 'administracja-ustawienia-całość--full-page',
  '/app/billing/subskrypcja': 'administracja-subskrypcja-i-płatności-całość--full-page',
  '/app/decisions/centrum-decyzji': 'decyzje-centrum-decyzji-całość--overview',
  '/app/help/strona-glowna-pomocy': 'wsparcie-centrum-pomocy-całość--full-page',
};
export function storybookHref(path: string): string {
  const destination = new URL(path, window.location.origin);
  path = destination.pathname;
  const story =
    stories[path] ??
    stories[
      Object.keys(stories)
        .filter((key) => path.startsWith(`${key}/`))
        .sort((a, b) => b.length - a.length)[0]
    ];
  if (!story) return path;
  const url = new URL(window.location.href);
  url.pathname = '/iframe.html';
  url.searchParams.set('id', story);
  url.searchParams.set('viewMode', 'story');
  destination.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  url.searchParams.set('globals', `theme:${document.documentElement.dataset.theme ?? 'light'}`);
  return url.toString();
}
export function navigateStorybook(path: string) {
  const href = storybookHref(path);
  if (window.parent === window) {
    window.location.assign(href);
    return;
  }
  const target = new URL(href);
  const manager = new URL(window.parent.location.href);
  manager.searchParams.set('path', `/story/${target.searchParams.get('id')}`);
  for (const key of [
    'from',
    'to',
    'compare',
    'channel',
    'campaignView',
    'orderView',
    'orderSource',
    'orderQueue',
    'productView',
    'productCategory',
    'productFilter',
    'productSegment',
    'decisionView',
    'decisionFilter',
    'decisionDomain',
    'decisionOwner',
    'decisionSearch',
    'decisionSort',
    'decisionId',
    'reportId',
    'reportVersion',
    'reportMode',
    'reportCollection',
    'reportSearch',
    'globals',
  ]) {
    const value = target.searchParams.get(key);
    if (value) manager.searchParams.set(key, value);
  }
  window.parent.location.assign(manager);
}
