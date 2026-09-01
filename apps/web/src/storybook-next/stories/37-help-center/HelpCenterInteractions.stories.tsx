import type {
  Meta,
} from '@storybook/react-vite';

import {
  SearchSuggestions as SearchSuggestionsStory,
  ProcedureEscalationAndIncidents as ProcedureEscalationAndIncidentsStory,
} from './HelpCenterBiPage.story-support';

const meta = {
  title: 'WSPARCIE/Centrum Pomocy/Interakcje',
} satisfies Meta;

export default meta;

export const SearchSuggestions = {
  ...SearchSuggestionsStory,
  name: 'Sugestie wyszukiwania',
};

export const ProcedureEscalationAndIncidents = {
  ...ProcedureEscalationAndIncidentsStory,
  name: 'Procedura i eskalacja',
};
