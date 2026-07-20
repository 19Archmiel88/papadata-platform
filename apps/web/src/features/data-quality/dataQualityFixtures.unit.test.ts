import { describe, expect, it } from 'vitest';

import {
  dataQualityFixtureIds,
  dataQualityStoryFixtures,
} from './dataQualityFixtures';

describe('Fala 3 data quality fixtures', () => {
  it('waliduje wszystkie wymagane stany Storybooka Fali 3', () => {
    expect(Object.keys(dataQualityStoryFixtures).sort()).toEqual(
      [...dataQualityFixtureIds].sort(),
    );
    expect(dataQualityStoryFixtures.ready.dataset.readinessStatus).toBe('READY');
    expect(dataQualityStoryFixtures.no_data.readiness.status).toBe('NO_DATA');
    expect(dataQualityStoryFixtures.blocked.readiness.status).toBe('BLOCKED');
    expect(dataQualityStoryFixtures.reconciliation_outside_tolerance.reconciliation.status).toBe(
      'FAIL',
    );
  });
});
