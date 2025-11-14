export type StoneCutGrade = "good" | "veryGood" | "excellent";

export interface StoneFilters {
  clarity: string[];
  color: string[];
  cut: StoneCutGrade;
  carat: { min: number; max: number };
  budget: { min: number; max: number };
  certificate: string[];
}
