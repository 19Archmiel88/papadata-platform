// The scheduler dedups each cron firing through app.platform_schedule_runs'
// (schedule_key, scheduled_for) unique key (see ReconciliationScheduler.
// enqueueSingleton's "on conflict do nothing" reservation): every firing
// within the same UTC hour must truncate to the same instant so a scheduler
// restart, a `stalledInterval` re-fire, or clock jitter within that hour
// reuses the existing reservation instead of double-enqueueing the job.
export function dateTruncatedToHour(value: Date): string {
  const copy = new Date(value);
  copy.setUTCMinutes(0, 0, 0);
  return copy.toISOString();
}
