export type CreditItem = { status: string | null; creditHours: number };

export function calculateCompletedCredits(items: CreditItem[]): number {
  return items
    .filter((i) => i.status === "Completed")
    .reduce((sum, i) => sum + i.creditHours, 0);
}
