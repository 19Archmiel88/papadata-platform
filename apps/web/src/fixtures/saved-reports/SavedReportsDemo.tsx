import {SavedReportsScreen} from '../../screens/saved-reports/SavedReportsScreen';
import {createReportsDemo} from '../../screens/saved-reports/SavedReports.demo';
import {buildReportSnapshot} from '../../screens/saved-reports/SavedReports.build';
export function SavedReportsDemo(){return <SavedReportsScreen mode="demo" data={createReportsDemo()} build={async config=>buildReportSnapshot(config)}/>;}
