import { describe, expect, it } from 'vitest';

import {
  integrationStoryFixtures,
  validateIntegrationStoryFixtures,
} from './integrationFixtures';

describe('Fala 2 integration Storybook fixtures', () => {
  it('waliduje wszystkie wymagane stany modułu integracji', () => {
    const fixtures = validateIntegrationStoryFixtures();

    expect(fixtures).toHaveLength(36);
    expect(fixtures.map((fixture) => fixture.fixtureId)).toContain('provider_unavailable');
    expect(fixtures.map((fixture) => fixture.fixtureId)).toContain(
      'workspace_switch_during_operation',
    );
  });

  it('nie umieszcza sekretów ani tokenów w fixtures', () => {
    const serialized = JSON.stringify(integrationStoryFixtures);

    expect(serialized).not.toMatch(/access_token|refresh_token|client_secret/i);
    expect(serialized).not.toMatch(/credential-material/i);
  });
});
