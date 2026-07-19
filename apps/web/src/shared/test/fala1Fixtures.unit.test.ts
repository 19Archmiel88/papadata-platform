import { describe, expect, it } from 'vitest';

import { foundationCapabilities } from '../../shell';
import {
  canonicalStoryFixtureSchema,
  canonicalStoryFixtures,
  foundationMockHandlers,
  validateCanonicalStoryFixtures,
} from './fala1Fixtures';

describe('Fala 1 canonical Storybook fixtures', () => {
  it('waliduje wszystkie kanoniczne fixture schematami domenowymi', () => {
    const fixtures = validateCanonicalStoryFixtures();

    expect(fixtures).toHaveLength(12);
    expect(fixtures.map((fixture) => fixture.fixtureId)).toContain('ctx_owner_ready');
    expect(fixtures.map((fixture) => fixture.fixtureId)).toContain('billing_past_due');
  });

  it('utrzymuje billing past due jako realnie wyłączony entitlement', () => {
    const fixture = canonicalStoryFixtures.billing_past_due;

    expect(fixture.context.capabilities).toContain(foundationCapabilities.billingRead);
    expect(
      fixture.context.entitlements.some(
        (entitlement) =>
          entitlement.capability === foundationCapabilities.billingRead &&
          entitlement.enabled,
      ),
    ).toBe(false);
  });

  it('udostępnia handler fixtures bez zależności od runtime Storybooka', () => {
    expect(foundationMockHandlers).toHaveLength(3);

    for (const handler of foundationMockHandlers) {
      expect(canonicalStoryFixtureSchema.parse(handler.response).fixtureId).toBe(
        handler.fixtureId,
      );
    }
  });
});
