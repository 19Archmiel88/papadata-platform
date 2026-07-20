import { describe, expect, it } from 'vitest';

import {
  aiStoryFixtureSchema,
  aiStoryFixtures,
} from './aiFixtures';

describe('Fala 5 AI Storybook fixtures', () => {
  it('waliduje wszystkie syntetyczne stany UI Fali 5', () => {
    const fixtures = Object.values(aiStoryFixtures);

    expect(fixtures.length).toBe(73);
    expect(fixtures.every((fixture) => aiStoryFixtureSchema.safeParse(fixture).success)).toBe(true);
  });

  it('pokrywa osobno Papa Asystenta, Laboratorium AI i AI Actions', () => {
    const sections = new Set(Object.values(aiStoryFixtures).map((fixture) => fixture.section));

    expect(sections).toEqual(new Set([
      'action',
      'assistant',
      'governance',
      'history',
      'laboratory',
      'provenance',
      'recommendation',
      'settings',
    ]));
  });

  it('oznacza production AI jako zablokowane przez Gate S3', () => {
    expect(aiStoryFixtures.default.gateS3.productionAIBlocked).toBe(true);
    expect(
      aiStoryFixtures.default.gateS3.requirements.some(
        (requirement) => requirement.status === 'EVIDENCE_MISSING',
      ),
    ).toBe(true);
  });
});
