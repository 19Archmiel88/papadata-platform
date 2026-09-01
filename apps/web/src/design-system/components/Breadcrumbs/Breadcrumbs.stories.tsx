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
  Breadcrumbs,
} from './Breadcrumbs';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const items = [
  { current: false, href: '/', id: 'root', label: 'Integracje' },
  { current: false, href: '/katalog', id: 'catalog', label: 'Katalog' },
  { current: true, href: null, id: 'provider', label: 'WooCommerce' },
];

const longItems = [
  { current: false, href: '/', id: 'l1', label: 'Integracje' },
  { current: false, href: '/a', id: 'l2', label: 'Katalog' },
  { current: false, href: '/b', id: 'l3', label: 'Sprzedaż' },
  { current: false, href: '/c', id: 'l4', label: 'WooCommerce' },
  { current: false, href: '/d', id: 'l5', label: 'Sklep Polska' },
  { current: true, href: null, id: 'l6', label: 'Konfiguracja' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Nawigacja/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    items,
    maxVisible: 5,
  },
} satisfies Meta<typeof Breadcrumbs>;

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
      className="pd-breadcrumbs-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const BreadcrumbsStory: Story = {
  name: 'Breadcrumbs',
  render: (args) => (
    <StoryPresentationPage
      className="pd-breadcrumbs-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Breadcrumbs', en: 'Breadcrumbs parameters' })}
          items={[
            { label: <Localized pl="maxVisible" en="maxVisible" />, value: String(args.maxVisible) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="breadcrumbs"
      summary={
        <Localized
          pl="Ścieżka nawigacji dla widoków zagnieżdżonych (np. Integracje → Katalog → WooCommerce). Gdy ścieżka przekracza maxVisible, środkowe poziomy zwijają się do wielokropka."
          en="A navigation trail for nested views (e.g. Integrations → Catalog → WooCommerce). When the path exceeds maxVisible, middle levels collapse into an ellipsis."
        />
      }
      title={<Localized pl="Ścieżka z powrotem tam, skąd przyszedłeś." en="A trail back to where you came from." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="breadcrumbs-controlled">
          <Breadcrumbs {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Długa ścieżka (zwinięta)" en="Long trail (collapsed)" />}>
        <div data-testid="breadcrumbs-long">
          <Breadcrumbs items={longItems} maxVisible={4} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nav = canvas.getByTestId('breadcrumbs-controlled').querySelector('nav');
    await expect(nav).toBeInTheDocument();
    await expect(canvas.getByTestId('breadcrumbs-controlled').querySelectorAll('li')).toHaveLength(items.length);

    await expect(canvas.getByTestId('breadcrumbs-long').querySelector('.pd-breadcrumbs__ellipsis')).toBeInTheDocument();
  },
};
