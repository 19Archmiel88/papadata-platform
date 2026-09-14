import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { LegalDocumentScreen } from '../../../runtime/features/legal/LegalDocumentScreen';
import type { PublishedLegalDocument } from '@papadata/contracts';

// FIXTURE ONLY -- never a real Cookie Policy / Privacy Notice. See BATCH F:
// no approved legal copy exists in this repo yet, so this text must never
// be mistaken for, or published as, production policy content.
const fixtureDocument: PublishedLegalDocument = {
  body: [
    '# Dokument testowy (fixture)',
    '',
    'To jest wyłącznie treść demonstracyjna użyta w Storybooku, aby pokazać renderowanie prawdziwego komponentu `LegalDocumentScreen`. **Nie jest to prawdziwa treść prawna** i nie może zostać opublikowana jako obowiązująca polityka.',
    '',
    '## Sekcja przykładowa',
    '',
    'Renderer obsługuje nagłówki, akapity i listy:',
    '',
    '- pozycja pierwsza',
    '- pozycja druga',
    '- pozycja trzecia',
  ].join('\n'),
  effectiveAt: '2026-01-01T00:00:00.000Z',
  id: 'fixture-cookie-policy-1',
  title: 'Polityka cookies (fixture)',
  type: 'cookie_policy',
  version: '1',
};

const longFixtureDocument: PublishedLegalDocument = {
  ...fixtureDocument,
  body: [
    fixtureDocument.body,
    '',
    ...Array.from({ length: 12 }, (_, index) => [
      `## Sekcja ${index + 2} (fixture)`,
      '',
      'Akapit demonstracyjny powtórzony wielokrotnie wyłącznie po to, aby zweryfikować czytelność i przewijanie długiego dokumentu w komponencie `LegalDocumentScreen`. Treść nie ma znaczenia prawnego.',
    ].join('\n')),
  ].join('\n\n'),
  id: 'fixture-terms-of-service-1',
  title: 'Regulamin świadczenia usług (fixture, długi dokument)',
  type: 'terms_of_service',
};

const meta = {
  component: LegalDocumentScreen,
  id: 'papadata-legal-document',
  parameters: { layout: 'fullscreen' },
  title: 'SHARED/Legal document',
} satisfies Meta<typeof LegalDocumentScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  args: {
    document: fixtureDocument,
    onBack: fn(),
    onRetry: fn(),
    state: 'ready',
    type: 'cookie_policy',
  },
};

export const LongDocument: Story = {
  args: {
    document: longFixtureDocument,
    onBack: fn(),
    onRetry: fn(),
    state: 'ready',
    type: 'terms_of_service',
  },
};

export const Unavailable: Story = {
  args: {
    document: null,
    onBack: fn(),
    onRetry: fn(),
    state: 'unavailable',
    type: 'cookie_policy',
  },
};

export const Error: Story = {
  args: {
    document: null,
    onBack: fn(),
    onRetry: fn(),
    problem: 'Usługa dokumentów prawnych jest chwilowo niedostępna.',
    state: 'error',
    type: 'cookie_policy',
  },
};
