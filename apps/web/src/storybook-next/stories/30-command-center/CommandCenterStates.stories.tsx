import { useState } from 'react';
import type { Meta } from '@storybook/react-vite';
import { CommandCenterScreen } from '../../../screens/command-center/CommandCenterScreen';
import { commandCenterDemoSeed } from '../../../fixtures/command-center/commandCenterDemoSeed';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = {
  title: 'ANALIZA/Przegląd/Stany',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
function StateStory({ state }: { readonly state: 'loading' | 'error' | 'empty' | 'partial' }) {
  const [recovered, setRecovered] = useState(false);
  const data =
    state === 'empty'
      ? { ...commandCenterDemoSeed, days: [] }
      : state === 'partial'
        ? {
            ...commandCenterDemoSeed,
            days: commandCenterDemoSeed.days.filter((day) => day.date !== '2026-08-12'),
          }
        : commandCenterDemoSeed;
  return (
    <StorybookProductShellFrame activePath="/app/command-center">
      <CommandCenterScreen
        data={data}
        state={recovered || state === 'empty' || state === 'partial' ? 'ready' : state}
        onRetry={() => setRecovered(true)}
      />
    </StorybookProductShellFrame>
  );
}
export const Loading = { name: 'Wczytywanie', render: () => <StateStory state="loading" /> };
export const Error = { name: 'Błąd i ponowienie', render: () => <StateStory state="error" /> };
export const Empty = { name: 'Brak danych', render: () => <StateStory state="empty" /> };
export const Partial = { name: 'Niepełny okres', render: () => <StateStory state="partial" /> };
