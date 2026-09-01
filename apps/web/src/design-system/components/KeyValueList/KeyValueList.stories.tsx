import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  KeyValueList,
} from './KeyValueList';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const groups = [
  {
    id: 'connection',
    items: [
      { id: 'account', label: 'Konto', value: 'sklep-polska@woocommerce' },
      { id: 'workspace', label: 'Workspace', value: 'Sklep Polska' },
    ],
    title: 'Połączenie',
  },
  {
    id: 'sync',
    items: [
      { id: 'last-sync', label: 'Ostatnia synchronizacja', value: '18 min temu' },
      { id: 'completeness', label: 'Kompletność danych', value: '98%' },
    ],
    title: 'Synchronizacja',
  },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Dane/KeyValueList',
  component: KeyValueList,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    groups,
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
  },
} satisfies Meta<typeof KeyValueList>;

export default meta;

type Story = StoryObj<typeof meta>;


function StorySection({
  children,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-key-value-list-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const KeyValueListStory: Story = {
  name: 'KeyValueList',
  render: (args) => (
    <StoryPresentationPage
      className="pd-key-value-list-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry KeyValueList', en: 'KeyValueList parameters' })}
          items={[
            { label: <Localized pl="Element" en="Element" />, value: '<dl>' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="key-value-list"
      summary={
        <Localized
          pl="Pary etykieta/wartość pogrupowane sekcjami — np. panel Konfiguracja integracji. value przyjmuje dowolny ReactNode, nie tylko tekst."
          en="Label/value pairs grouped into sections — e.g. an integration Configuration panel. value accepts any ReactNode, not just text."
        />
      }
      title={<Localized pl="Fakty pogrupowane w sekcje." en="Facts grouped into sections." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="kv-controlled" style={{ maxWidth: '420px' }}>
          <KeyValueList {...args} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('kv-controlled').querySelectorAll('section')).toHaveLength(groups.length);
  },
};
