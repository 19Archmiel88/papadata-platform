import {
  usePapaLabRuntime,
} from '../../runtime/shell/papa-assistant';
import {
  PapaAssistantLabScreen,
} from '../../screens/papa-assistant/lab/PapaAssistantLabScreen';
import {
  createPapaAssistantLabRuntimeData,
} from './papaAssistantLabRuntimeAdapter';

export function PapaAssistantLabPage() {
  const runtime = usePapaLabRuntime({ enabled: true });
  const data = createPapaAssistantLabRuntimeData(runtime);

  return <PapaAssistantLabScreen data={data} />;
}
