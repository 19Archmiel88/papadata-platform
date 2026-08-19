import type {
  CommandCenterVisitDigest as CommandCenterVisitDigestData,
} from './commandCenterOnePageModel';
import {
  formatSignedPercent,
  shortenMetricLabel,
} from './commandCenterOnePageModel';

/**
 * Thin, optional briefing line: renders only when there is a previous visit
 * to compare against and it changed something worth naming (see
 * {@link resolveCommandCenterVisitDigest}). No prior visit, or nothing
 * meaningful moved, both resolve to `digest === null` — the strip disappears
 * entirely rather than showing an empty or repetitive line.
 */
export function CommandCenterVisitDigest({
  digest,
}: {
  readonly digest: CommandCenterVisitDigestData | null;
}) {
  if (!digest) {
    return null;
  }

  const parts: string[] = [];

  if (digest.newIssueCount > 0) {
    parts.push(`${digest.newIssueCount} ${digest.newIssueCount === 1 ? 'nowy problem' : 'nowe problemy'}`);
  }

  if (digest.resolvedIssueCount > 0) {
    parts.push(`${digest.resolvedIssueCount} ${digest.resolvedIssueCount === 1 ? 'problem rozwiązany' : 'problemy rozwiązane'}`);
  }

  if (digest.newRecommendationCount > 0) {
    parts.push(`${digest.newRecommendationCount} ${digest.newRecommendationCount === 1 ? 'nowa rekomendacja' : 'nowe rekomendacje'}`);
  }

  const topShift = digest.shifts[0];

  if (topShift) {
    parts.push(`${shortenMetricLabel(topShift.label)} ${formatSignedPercent(topShift.deltaRatio)}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    <p
      className="pd-command-center-one-page__visit-digest"
      role="status"
    >
      Od ostatniej wizyty: {parts.join(' · ')}
    </p>
  );
}
