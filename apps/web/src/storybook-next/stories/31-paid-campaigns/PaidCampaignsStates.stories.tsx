import { useState } from 'react';
import type { Meta } from '@storybook/react-vite';
import { PaidCampaignsScreen } from '../../../screens/paid-campaigns/PaidCampaignsScreen';
import { campaignDemoDays } from '../../../screens/paid-campaigns/CampaignAnalysis.data';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
const meta = { title: 'ANALIZA/Kampanie płatne/Stany', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
function StateView({ kind }: {readonly kind: 'loading'|'error'|'empty'|'partial'}) {
 const [recovered,setRecovered]=useState(false);
 const days=kind==='empty'?[]:kind==='partial'?campaignDemoDays.filter(d=>d.date!=='2026-08-12'):campaignDemoDays;
 return <StorybookProductShellFrame activePath="/app/campaigns"><PaidCampaignsScreen observations={days} state={recovered||kind==='empty'||kind==='partial'?'ready':kind} onRetry={()=>setRecovered(true)}/></StorybookProductShellFrame>;
}
export const Loading={name:'Wczytywanie',render:()=><StateView kind="loading"/>};
export const Error={name:'Błąd i ponowienie',render:()=><StateView kind="error"/>};
export const Empty={name:'Brak danych',render:()=><StateView kind="empty"/>};
export const Partial={name:'Niepełny okres',render:()=><StateView kind="partial"/>};
