export type AttendanceCount = { status: string; count: number };

export function calculateAttendancePercentage(counts: AttendanceCount[]): number {
  const total = counts.reduce((s, c) => s + c.count, 0);
  if (total === 0) return 0;

  const present = counts
    .filter((c) => c.status === "Present" || c.status === "Late")
    .reduce((s, c) => s + c.count, 0);

  return Math.round((present / total) * 100);
}
