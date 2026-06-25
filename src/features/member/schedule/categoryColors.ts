export const CATEGORY_COLOR: Record<string, string> = {
  CLUB: "#2563eb",
  ACADEMIC: "#dc2626",
  EXTERNAL: "#9333ea",
  MANAGEMENT: "#16a34a",
  GROUP_ACTIVITY: "#ea580c",
  BIG_SEMINAR: "#2563eb",
  AFTERPARTY: "#ca8a04",
  OTHER: "#6b7280",
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLOR[category] ?? "#9ca3af";
}
