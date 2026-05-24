/** 예약 분류 (그룹활동 제외) */
export const ReservationCategory = {
  CLUB: "CLUB",         // 동아리
  ACADEMIC: "ACADEMIC",  // 학사
  EXTERNAL: "EXTERNAL",  // 외부
} as const;
export type ReservationCategory =
  (typeof ReservationCategory)[keyof typeof ReservationCategory];

export const ReservationCategoryLabel: Record<ReservationCategory, string> = {
  [ReservationCategory.CLUB]: "동아리",
  [ReservationCategory.ACADEMIC]: "학사",
  [ReservationCategory.EXTERNAL]: "외부",
};

export const ReservationCategoryColor: Record<ReservationCategory, string> = {
  [ReservationCategory.CLUB]: "#00a0e9",
  [ReservationCategory.ACADEMIC]: "#2ecc71",
  [ReservationCategory.EXTERNAL]: "#e67e22",
};

const isReservationCategory = (value: string): value is ReservationCategory =>
  Object.values(ReservationCategory).includes(value as ReservationCategory);

export function getReservationCategoryLabel(category: string): string {
  return isReservationCategory(category)
    ? ReservationCategoryLabel[category]
    : category;
}

export function getReservationCategoryColor(category: string): string {
  return isReservationCategory(category)
    ? ReservationCategoryColor[category]
    : "#00a0e9";
}

/** 방 정보 */
export type Room = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  /** SVG 약도 위치 (비율 기반) */
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** 일정 등록 가능 여부 */
  isSelectable: boolean;
  /** 방 상태: available(일정 가능) | restricted(출입금지) | under_construction(공사중) */
  status: "available" | "restricted" | "under_construction";
};

/** 일정 */
export type Schedule = {
  id: number;
  location: string;        // 방 위치 (405, 410 등)
  title: string;
  category: string;        // CLUB, ACADEMIC, EXTERNAL
  author: string;          // 등록자 (member ID)
  state: string;           // 일정 상태
  scheduledAt: string;     // ISO 8601 형식 (2024-05-14T09:00:00Z)
  endAt: string;           // ISO 8601 형식 (2024-05-14T10:00:00Z)
  checkCode?: string;      // 출석 코드
  expoint?: number;        // 경험치
  createdAt: string;       // 생성일시
  updatedAt: string;       // 수정일시
};

/** 일정 생성 요청 */
export type CreateScheduleRequest = {
  location: string;       // 방 위치
  title: string;
  category: string;       // CLUB, ACADEMIC, EXTERNAL
  scheduledAt: string;    // ISO 8601 형식
  endAt: string;          // ISO 8601 형식
  checkCode?: string;
  expoint?: number;
};

/** 일정 수정 요청 */
export type UpdateScheduleRequest = Partial<CreateScheduleRequest>;

/** API 응답 일정 목록 */
export type ScheduleListResponse = {
  schedules: Schedule[];
};
