// Node's test runner has no bundler, so it cannot load the plain CSS files
// design-system components import as a side effect (Vite handles those at
// build/dev time). This hook makes such imports resolve to an empty module
// instead of failing with ERR_UNKNOWN_FILE_EXTENSION, so component modules
// can be imported under `node:test` for logic-level tests.
export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    };
  }

  return nextLoad(url, context);
}
