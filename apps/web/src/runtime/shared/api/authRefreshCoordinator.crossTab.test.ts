import {
  describe,
  expect,
  it,
} from 'vitest';

import { BrowserAuthRefreshCoordinator } from './authRefreshCoordinator';

// These tests exercise BrowserAuthRefreshCoordinator with real platform
// primitives (BroadcastChannel + the Web Locks API), not mocks -- both are
// available as process-global objects under Node, giving genuine
// multi-tab-like behavior: two coordinator instances in this same process
// stand in for two browser tabs sharing one origin.

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

describe('BrowserAuthRefreshCoordinator cross-tab coordination (Phase 8 §6, §30)', () => {
  it('only one tab performs the refresh; the other waits and reuses the result via afterExternal', async () => {
    const tabA = new BrowserAuthRefreshCoordinator();
    const tabB = new BrowserAuthRefreshCoordinator();

    let performCallsA = 0;
    let performCallsB = 0;
    let afterExternalCallsB = 0;

    const resultA = tabA.coordinateRefresh({
      afterExternal: async () => 'after-external-A',
      perform: async () => {
        performCallsA += 1;
        await wait(40);
        return 'session-from-A';
      },
    });

    const resultB = tabB.coordinateRefresh({
      afterExternal: async () => {
        afterExternalCallsB += 1;
        return 'after-external-B';
      },
      perform: async () => {
        performCallsB += 1;
        return 'session-from-B';
      },
    });

    const [valueA, valueB] = await Promise.all([resultA, resultB]);

    expect(valueA).toBe('session-from-A');
    expect(valueB).toBe('after-external-B');
    expect(performCallsA).toBe(1);
    expect(performCallsB).toBe(0);
    expect(afterExternalCallsB).toBe(1);
  });

  it('when the refreshing tab fails, the waiting tab also rejects instead of using a stale/fabricated session', async () => {
    const tabA = new BrowserAuthRefreshCoordinator();
    const tabB = new BrowserAuthRefreshCoordinator();

    const resultA = tabA.coordinateRefresh({
      afterExternal: async () => 'unused',
      perform: async () => {
        await wait(30);
        throw new Error('refresh token reuse detected');
      },
    });
    const resultB = tabB.coordinateRefresh({
      afterExternal: async () => 'unused',
      perform: async () => 'should-not-run',
    });

    await expect(resultA).rejects.toThrow('refresh token reuse detected');
    await expect(resultB).rejects.toThrow();
  });

  it('a logout published from one tab is observed by the other', async () => {
    const tabA = new BrowserAuthRefreshCoordinator();
    const tabB = new BrowserAuthRefreshCoordinator();

    const received = new Promise((resolve) => {
      tabB.subscribe((event) => {
        if (event.type === 'logout') resolve(event);
      });
    });

    tabA.publish({ reason: 'logout-all', type: 'logout' });

    await expect(received).resolves.toEqual({ reason: 'logout-all', type: 'logout' });
  });

  it('a fresh tab does not treat a stale externalRefreshActive flag as blocking forever once the lock is free', async () => {
    const tabA = new BrowserAuthRefreshCoordinator();
    await tabA.coordinateRefresh({
      afterExternal: async () => 'unused',
      perform: async () => 'session-from-A',
    });

    const tabB = new BrowserAuthRefreshCoordinator();
    const resultB = await tabB.coordinateRefresh({
      afterExternal: async () => 'unused',
      perform: async () => 'session-from-B',
    });

    expect(resultB).toBe('session-from-B');
  });
});
