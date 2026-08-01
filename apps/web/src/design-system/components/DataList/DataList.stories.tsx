import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import {
  Button,
} from '../Button';
import {
  dataListItems,
} from '../Data/storyData';
import '../Data/data-showcase.css';
import {
  DataList,
} from './DataList';

const meta = {
  title: '10 Komponenty/DataList',
  component: DataList,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof DataList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DataListStory: Story = {
  args: {
    items: [],
  },
  name: 'Lista danych',
  render: () => (
    <main className="pd-data-story">
      <div className="pd-data-story__inner">
        <header className="pd-data-story__header">
          <p className="pd-data-story__kicker">10 Komponenty/DataList</p>
          <h1>Lista danych ma być czytelna na mniejszych szerokościach i nadal wyglądać analitycznie.</h1>
          <p className="pd-data-story__lead">
            Wiersze korzystają z separatorów, krótkich metadanych i lokalnych akcji,
            bez pakowania każdego rekordu do osobnej karty.
          </p>
        </header>

        <section className="pd-data-story__section">
          <h2>Warianty</h2>
          <div className="pd-data-story__rows">
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Status, opis, metadane i akcja pozostają w jednym rytmie wiersza.</p>
              </div>
              <div className="pd-data-story__canvas">
                <DataList
                  items={dataListItems.map((item) => ({
                    ...item,
                    action: (
                      <Button size="small" variant="ghost">
                        {item.action}
                      </Button>
                    ),
                  }))}
                />
              </div>
            </div>
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Mniejsza gęstość nadaje się do paneli pomocniczych i wąskich kolumn.</p>
              </div>
              <div className="pd-data-story__canvas">
                <DataList
                  density="compact"
                  items={dataListItems.map((item) => ({
                    ...item,
                    action: (
                      <Button size="small" variant="ghost">
                        {item.action}
                      </Button>
                    ),
                  }))}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
};
