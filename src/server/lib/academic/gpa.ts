export const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  F: 0.0,
};

export type GpaItem = { finalGrade: string | null; creditHours: number };

export function calculateGpa(items: GpaItem[]): number | null {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const item of items) {
    const point = item.finalGrade ? GRADE_POINTS[item.finalGrade] : undefined;
    if (point !== undefined && item.creditHours > 0) {
      totalPoints += point * item.creditHours;
      totalCredits += item.creditHours;
    }
  }

  if (totalCredits === 0) return null;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}
