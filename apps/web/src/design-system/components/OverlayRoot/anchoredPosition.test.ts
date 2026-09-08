import { describe, expect, it } from 'vitest';
import { anchoredPosition } from './anchoredPosition';

describe('Anchored overlay viewport collisions', () => {
  const viewport = { width: 1440, height: 1000 };
  const panel = { width: 210, height: 90 };
  it('opens an export menu above a trigger at the bottom of the page', () => {
    const result = anchoredPosition(
      { left: 1160, right: 1240, top: 940, bottom: 978 },
      panel,
      viewport,
      'bottom-end',
    );
    expect(result.left).toBe(1030);
    expect(result.top).toBe(844);
    expect(result.top + panel.height).toBeLessThan(940);
  });
  it('keeps a menu below its trigger when it fits', () => {
    expect(
      anchoredPosition(
        { left: 100, right: 180, top: 80, bottom: 118 },
        panel,
        viewport,
        'bottom-start',
      ),
    ).toMatchObject({ left: 100, top: 124 });
  });
  it('flips a top popover down at the top edge', () => {
    expect(
      anchoredPosition({ left: 100, right: 180, top: 20, bottom: 58 }, panel, viewport, 'top').top,
    ).toBe(64);
  });
  it('flips a side panel left at the right edge', () => {
    expect(
      anchoredPosition(
        { left: 1340, right: 1400, top: 200, bottom: 238 },
        panel,
        viewport,
        'right-start',
      ).left,
    ).toBe(1124);
  });
  it('constrains oversized panels and offscreen anchors on a small viewport', () => {
    expect(
      anchoredPosition(
        { left: -10, right: 50, top: 800, bottom: 840 },
        { width: 600, height: 900 },
        { width: 390, height: 640 },
        'bottom-end',
      ),
    ).toEqual({ left: 16, top: 16, maxWidth: 358, maxHeight: 608 });
  });
});
