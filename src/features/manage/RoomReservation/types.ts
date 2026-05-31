/** 예약 분류 */
export const ReservationCategory = {
  CLUB: "CLUB",                       // 동아리
  ACADEMIC: "ACADEMIC",               // 학사
  EXTERNAL: "EXTERNAL",               // 외부
  MANAGEMENT: "MANAGEMENT",           // 관리
  GROUP_ACTIVITY: "GROUP_ACTIVITY",   // 그룹활동
  SEMINAR: "SEMINAR",                 // 세미나
  AFTERPARTY: "AFTERPARTY",           // 뒤풀이
  OTHER: "OTHER",                     // 기타
} as const;
export type ReservationCategory =
  (typeof ReservationCategory)[keyof typeof ReservationCategory];

export const ReservationCategoryLabel: Record<ReservationCategory, string> = {
  [ReservationCategory.CLUB]: "동아리",
  [ReservationCategory.ACADEMIC]: "학사",
  [ReservationCategory.EXTERNAL]: "외부",
  [ReservationCategory.MANAGEMENT]: "관리",
  [ReservationCategory.GROUP_ACTIVITY]: "그룹활동",
  [ReservationCategory.SEMINAR]: "세미나",
  [ReservationCategory.AFTERPARTY]: "뒤풀이",
  [ReservationCategory.OTHER]: "기타",
};

export const ReservationCategoryColor: Record<ReservationCategory, string> = {
  [ReservationCategory.CLUB]: "#00a0e9",
  [ReservationCategory.ACADEMIC]: "#2ecc71",
  [ReservationCategory.EXTERNAL]: "#e67e22",
  [ReservationCategory.MANAGEMENT]: "#8b5cf6",
  [ReservationCategory.GROUP_ACTIVITY]: "#ec4899",
  [ReservationCategory.SEMINAR]: "#14b8a6",
  [ReservationCategory.AFTERPARTY]: "#f43f5e",
  [ReservationCategory.OTHER]: "#94a3b8",
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

/** 일정 데이터 기본 구조 */
export type Schedule = {
  id: number;
  name: string;
  //행사명 (CLUB, ACADEMIC, EXTERNAL, MANAGEMENT, GROUP_ACTIVITY, SEMINAR, AFTERPARTY, OTHER)
  //일반 카테고리 -> 카테고리를 GROUP_ACTIVITY로 강제 확정 동아리실 선택만 가능(405,407-1,410), 운영진 카테고리 -> CLUB, ACADEMIC, EXTERNAL, MANAGEMENT, GROUP_ACTIVITY, SEMINAR, AFTERPARTY, OTHER -> 장소 선택 가능(405,407-1,410,외부)

  location: string;        // 방 위치 (405, 410, 외부 등) + 
  title: string;
  category: string;        // ReservationCategory 값들
  author: number;          // 등록자 (member ID)
  state: string;           // 일정 상태
  scheduledAt: string;     // ISO 8601 형식 (2024-05-14T09:00:00Z)
  endAt: string;           // ISO 8601 형식 (2024-05-14T10:00:00Z)
  checkCode?: string;      // 출석 코드
  expoint?: number;        // 경험치
  createdAt: string;       // 생성일시
  updatedAt: string;       // 수정일시
};


/* ==========================================================================
   🛠️ 관리자 피드백 기반: 일정 CRUD 생성 / 수정 요청 DTO
   ========================================================================== */

/** [공통 필드] 모든 일정 생성에 들어가는 공통 정보 */
export type BaseCreateScheduleRequest = {
  title: string;
  scheduledAt: string;     // ISO 8601 형식
  endAt: string;           // ISO 8601 형식
  useCheckCode?: boolean;  // true 시 백엔드에서 checkCode 자동 생성
};

/** 1. 일반 회원용 (POST /schedules/group-activity) */
export type CreateGroupActivityRequest = BaseCreateScheduleRequest & {
  category: typeof ReservationCategory.GROUP_ACTIVITY; // "GROUP_ACTIVITY" 고정
  location: "405" | "407-1" | "410";                  // 동아리실 선택만 가능 (경험치 없음)
};

/** 2. 운영진용 (POST /schedules) */
export type CreateAdminScheduleRequest = BaseCreateScheduleRequest & {
  // 세미나를 제외한 운영진용 카테고리 권한
  category: Exclude<ReservationCategory, typeof ReservationCategory.SEMINAR>;
  location: "405" | "407-1" | "410" | "외부";         // 외부 포함 전체 장소 선택 가능
  expoint: number;                                    // 경험치 로직 포함
};

/** 3. 세미나용 (POST /schedules/big-seminar) */
export type CreateSeminarScheduleRequest = BaseCreateScheduleRequest & {
  category: typeof ReservationCategory.SEMINAR;       // "SEMINAR" 고정
  location: "405" | "407-1" | "410" | "외부";         // 외부 포함
  expoint: number;                                    // 경험치 로직 포함
  isSummerSeason: boolean;                            // 빅세미나 추가 필드
  isSpeakAfter: boolean;                              // 빅세미나 추가 필드
};


/* ==========================================================================
   🛠️ 관리자 피드백 기반: 일정 수정 요청 DTO (카테고리 변경 분리)
   ========================================================================== */

/** * [수정] 1. 일반 회원용 (PATCH /schedules/group-activity/{scheduleId}) 
 * - 카테고리는 GROUP_ACTIVITY 고정이므로 수정 항목에서 제외 (Omit)
 */
export type UpdateGroupActivityRequest = Partial<Omit<CreateGroupActivityRequest, 'category'>>;

/** * [수정] 2. 운영진용 (PATCH /schedules/{scheduleId}) 
 * - 카테고리 변경은 별도 API를 사용하므로 수정 항목에서 제외
 */
export type UpdateAdminScheduleRequest = Partial<Omit<CreateAdminScheduleRequest, 'category'>>;

/** * [수정] 3. 세미나용 (PATCH /schedules/big-seminar/{scheduleId}) 
 * - 세미나 관련 추가 필드(isSummerSeason 등) 수정 가능
 */
export type UpdateSeminarScheduleRequest = Partial<Omit<CreateSeminarScheduleRequest, 'category'>>;

/** * [카테고리 변경 전용] (PATCH /schedules/{scheduleId}/category) 
 * - 운영진 권한 필요
 * - 타 카테고리에서 '세미나'로 변경될 경우를 대비해 세미나 전용 필드를 Optional(?)로 받음
 */
export type UpdateScheduleCategoryRequest = {
  category: ReservationCategory;
  isSummerSeason?: boolean;
  isSpeakAfter?: boolean;
};


/* ==========================================================================
   조회 (기존 유지)
   ========================================================================== */

/** GET /schedules 쿼리 파라미터 */
export type GetSchedulesParams = {
  from?: string;   // ISO 8601. 미지정 시 전체 조회
  limit?: number;  // 1~50, 기본 50
};

/** GET /schedules 응답 */
export type ScheduleListResponse = {
  count: number;
  schedules: Schedule[];
};