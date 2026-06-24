// ScheduleCategoryBadge의 색상과 일치 (영문 카테고리 → 색상)
export const CATEGORY_COLOR: Record<string, string> = {
  CLUB: "#1ab1ff",
  ACADEMIC: "#981E32",
  EXTERNAL: "#7c3aed",
  MANAGEMENT: "#C9A84C",
  GROUP_ACTIVITY: "#0077b6",
  BIG_SEMINAR: "#16a34a",
  AFTERPARTY: "#ed64a6",
  OTHER: "#555555",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLOR[category] ?? "#9ca3af";
}
