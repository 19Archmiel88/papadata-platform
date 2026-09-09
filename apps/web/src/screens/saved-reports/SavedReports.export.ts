export { renderSavedReportCsv as reportCsv, renderSavedReportHtml as reportHtml, renderSavedReportJson as reportJson, escapeSavedReportHtml as escapeReportHtml } from '@papadata/contracts';
export function downloadReport(content: string, mime: string, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime })),
    link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
