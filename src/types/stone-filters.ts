export type StoneCutGrade = "good" | "veryGood" | "excellent";

export interface StoneFilters {
  clarity: string[];
  color: string[];
  cut: StoneCutGrade[];
  polish?: string[]; // 抛光等级，固定为 ["E", "EX", "ID", "2EX", "I"]
  carat: { min: number; max: number };
  budget: { min: number; max: number };
  certificate: string[];
}
