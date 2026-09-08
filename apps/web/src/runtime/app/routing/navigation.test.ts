import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import { safeReturnTo } from './navigation';

describe('safeReturnTo (Phase 8 §25 -- open-redirect regression)', () => {
  beforeAll(() => {
    (globalThis as { window?: unknown }).window = {
      location: { origin: 'https://app.papadata.pl' },
    };
  });

  afterAll(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('passes through a safe in-app path with query and hash', () => {
    expect(safeReturnTo('/app/reports?range=30d#top')).toBe('/app/reports?range=30d#top');
  });

  it('falls back to /app for null/empty input', () => {
    expect(safeReturnTo(null)).toBe('/app');
    expect(safeReturnTo('')).toBe('/app');
  });

  it('rejects a protocol-relative URL (schemeless open redirect)', () => {
    expect(safeReturnTo('//evil.example.com/phish')).toBe('/app');
  });

  it('rejects an absolute URL to a foreign origin', () => {
    expect(safeReturnTo('https://evil.example.com/phish')).toBe('/app');
    expect(safeReturnTo('http://app.papadata.pl.evil.example.com/')).toBe('/app');
  });

  it('rejects a non-http(s) scheme disguised as a path', () => {
    expect(safeReturnTo('javascript:alert(1)')).toBe('/app');
  });

  it('rejects a value that does not start with a single leading slash', () => {
    expect(safeReturnTo('app/reports')).toBe('/app');
    expect(safeReturnTo('  /app')).toBe('/app');
  });

  it('never carries credentials or a foreign host smuggled via userinfo/backslash tricks', () => {
    expect(safeReturnTo('/\\evil.example.com')).not.toContain('evil.example.com');
    expect(safeReturnTo('/@evil.example.com')).toBe('/@evil.example.com'); // same-origin path segment, not a host
  });
});
