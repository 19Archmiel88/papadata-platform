import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import {
  BusinessScreen,
  businessScreenDefinitions,
  createStorybookBusinessData,
} from '../../../screens/business';

const meta = {
  title: '30 Centrum Dowodzenia/Landing page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      disable: true,
    },
    test: {
      disable: true,
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const onePageDefinition = businessScreenDefinitions.find(
  (definition) => definition.group === 'command-center' && definition.id === '30.01',
);

if (!onePageDefinition) {
  throw new Error('Missing Command Center definition for 30.01');
}

const storyData = createStorybookBusinessData(onePageDefinition);

export const FullLandingPageStory: Story = {
  name: '30.00 Cały landing page',
  render: () => (
    <BusinessScreen
      data={storyData}
      definition={onePageDefinition}
      mode="runtime"
    />
  ),
};
