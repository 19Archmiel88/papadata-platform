import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import {
  keyValueGroups,
} from '../Data/storyData';
import '../Data/data-showcase.css';
import {
  KeyValueList,
} from './KeyValueList';

const meta = {
  title: '10 Komponenty/KeyValueList',
  component: KeyValueList,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof KeyValueList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KeyValueListStory: Story = {
  args: {
    groups: [],
  },
  name: 'Lista klucz-wartość',
  render: () => (
    <main className="pd-data-story">
      <div className="pd-data-story__inner">
        <header className="pd-data-story__header">
          <p className="pd-data-story__kicker">10 Komponenty/KeyValueList</p>
          <h1>Lista klucz-wartość ma wspierać szczegóły operacyjne bez budowania całego panelu bocznego.</h1>
          <p className="pd-data-story__lead">
            Klucze i wartości są rozdzielone precyzyjną siatką, a dłuższe treści
            mogą zawijać się bez utraty czytelności.
          </p>
        </header>

        <section className="pd-data-story__section">
          <h2>Warianty</h2>
          <div className="pd-data-story__rows">
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Grupy danych dla kontekstu obszaru, jakości i operacji.</p>
              </div>
              <div className="pd-data-story__canvas">
                <KeyValueList groups={keyValueGroups} />
              </div>
            </div>
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Węższy rytm jest przydatny dla paneli pomocniczych i podsumowań.</p>
              </div>
              <div className="pd-data-story__canvas">
                <KeyValueList
                  density="compact"
                  groups={keyValueGroups}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
};
