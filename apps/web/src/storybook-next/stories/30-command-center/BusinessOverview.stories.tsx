import type {Meta,StoryObj} from '@storybook/react-vite';
import {BusinessOverviewScreen,type BusinessOverviewProps} from '../../../screens/command-center/BusinessOverviewScreen';
import {OverviewScenario} from '../../../fixtures/commerce/CommerceScenarios';
import {overviewFixture} from '../../../fixtures/commerce/commerceFixtures';
import {StorybookProductShellFrame} from '../shared/StorybookProductShellFrame';
const meta={id:'papadata-business-overview',title:'ANALIZA/Centrum Dowodzenia/Dane rzeczywiste',component:BusinessOverviewScreen,parameters:{layout:'fullscreen'},args:{state:'ready'}} satisfies Meta<typeof BusinessOverviewScreen>;
export default meta;
type Story=StoryObj<typeof meta>;
const data=overviewFixture({from:'2026-08-01',to:'2026-08-31',timezone:'Europe/Warsaw'});
function renderStory(args:BusinessOverviewProps){return <StorybookProductShellFrame activePath="/app/command-center"><OverviewScenario {...args}/></StorybookProductShellFrame>;}
export const Overview:Story={render:renderStory,name:'Pełny widok'};
export const Loading:Story={render:renderStory,args:{state:'loading'}};
export const Forbidden:Story={render:renderStory,args:{state:'forbidden'}};
export const Offline:Story={render:renderStory,args:{state:'offline'}};
export const ReadFailure:Story={render:renderStory,args:{state:'error',problem:'Jawny scenariusz błędu odczytu.'}};
export const Empty:Story={render:renderStory,args:{data:{...data,metrics:data.metrics.map(row=>({...row,value:null,previous:null})),points:[],meta:{...data.meta,quality:'empty'}}}};
export const Stale:Story={render:renderStory,args:{data:{...data,meta:{...data.meta,quality:'stale',lastSuccessfulSyncAt:'2026-07-01T10:00:00Z'}}}};
export const SourceSelection:Story={render:renderStory,args:{data:{...data,metrics:data.metrics.map(row=>({...row,value:null,previous:null})),points:[],meta:{...data.meta,sourceId:null,quality:'selection_required'}}}};
