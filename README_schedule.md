# 동아리실 소개 & 일정 추가 페이지

운영진용 동아리실 약도 조회 및 일정 등록 기능입니다. 두 개의 독립적인 페이지로 구성됩니다.

## 📄 페이지 구성

### 1️⃣ 동아리실 소개 페이지 (`/manage/room-info`)
**읽기 전용 모드** - 동아리방 조회 및 일정 확인만 가능

**기능:**
- 동아리방 약도 시각화 (SVG)
- 방 선택 시 주간 일정 조회
- 일정 상세 정보 모달 (수정 불가)
- 방: 405호, 406호, 407호, 408호, 410호 모두 조회 가능

### 2️⃣ 일정 추가 페이지 (`/manage/room-reservation`)
**편집 모드** - 일정 등록 가능

**기능:**
- 카테고리 선택 (8종): CLUB / ACADEMIC / EXTERNAL / MANAGEMENT / GROUP_ACTIVITY / SEMINAR / AFTERPARTY / OTHER
- 호실 선택: 405호 / 410호
- 인라인 캘린더로 날짜 선택
- 시간 선택: 시작 시간 ~ 종료 시간 (30분 단위)
- 제목 입력
- SEMINAR 카테고리 선택 시 세미나 전용 옵션 노출 (계절학기 여부, 뒷풀이 발표 여부)
- 일정 상세 모달 (읽기 전용)

## API 규약

### GET /schedules
일정 목록 조회

```
요청:
GET /schedules?from=<ISO8601>&limit=<number>

쿼리 파라미터:
  from  : (선택) ISO 8601. 미지정 시 전체 조회
  limit : (선택) 1~50, 기본 50

응답:
{
  count: number;
  schedules: Schedule[];
}
```

### POST /schedules
일반 일정 등록 (SEMINAR 제외)

```
요청:
{
  location: string;           // 방 ID (405, 410)
  title: string;              // 일정명
  category: string;           // CLUB, ACADEMIC, EXTERNAL, MANAGEMENT, AFTERPARTY, OTHER
  scheduledAt: string;        // ISO 8601 (2026-05-15T14:00:00Z)
  endAt: string;              // ISO 8601 (2026-05-15T15:00:00Z)
  useCheckCode?: boolean;     // true 시 백엔드에서 checkCode 자동 생성
  expoint?: number;           // 선택사항
}

응답:
Schedule
```

### POST /schedules/big-seminar
세미나 일정 등록 (category가 SEMINAR일 때)

```
요청:
{
  location: string;
  title: string;
  category: "SEMINAR";
  scheduledAt: string;        // ISO 8601
  endAt: string;              // ISO 8601
  useCheckCode?: boolean;
  expoint?: number;
  isSummerSeason: boolean;    // 계절학기 세미나 여부 (필수)
  isSpeakAfter: boolean;      // 뒷풀이 발표 여부 (필수)
}

응답:
Schedule
```

### GET /schedules/:scheduleId
일정 상세 조회

```
응답:
Schedule
```

### PUT /schedules/:scheduleId
일정 수정

```
요청:
Partial<CreateScheduleRequest>

응답:
Schedule
```

### DELETE /schedules/:scheduleId
일정 삭제

```
응답: 없음
```

### POST /schedules/:scheduleId/attendances/@me
출석 본인 등록

```
응답: 없음
비고: 중복 출석 시 409 반환
```

### GET /schedules/:scheduleId/attendances
출석자 목록 조회 (운영진)

```
응답:
Attendance[]
```

### DELETE /schedules/:scheduleId/attendances/:userId
출석 삭제 (운영진)

```
응답: 없음
에러:
  404 - 출석한 적 없거나 일정 없음
  403 - 권한 없음
```

### GET /active-schedules
현재 출석 가능한 일정 조회 (인증 필요)

```
응답:
{
  count: number;
  schedules: Schedule[];      // checkCode 필드 미포함
  schedule: Schedule | null;  // 첫 번째 진행 중 일정
}

판단 기준:
  - scheduledAt ≤ now ≤ endAt
  - checkCode가 null이 아닌 일정
  - soft-delete된 일정 제외
```

## 디렉토리 구조

```
├── pages/manage/
│   ├── room-info/
│   │   └── index.tsx                      # 동아리실 소개 페이지
│   └── room-reservation/
│       └── index.tsx                      # 일정 추가 페이지
├── features/manage/RoomReservation/
│   ├── RoomReservationContainer.tsx       # 일정 추가 컨테이너 (405, 410호만)
│   ├── RoomReservationContainer.module.css
│   ├── RoomInfoContainer.tsx              # 동아리실 소개 컨테이너 (읽기 전용)
│   ├── ReservationForm.tsx                # 일정 등록 폼
│   ├── ReservationForm.module.css
│   ├── FloorPlan.tsx                      # 약도 (SVG)
│   ├── FloorPlan.module.css
│   ├── RoomInfoPanel.tsx                  # 방 정보 / 일정 표시
│   ├── RoomInfoPanel.module.css
│   ├── WeeklySchedule.tsx                 # 주간 일정 표시
│   ├── WeeklySchedule.module.css
│   ├── ScheduleDetailModal.tsx            # 일정 상세 모달
│   ├── types.ts                           # TypeScript 타입 정의
│   └── roomData.ts                        # 방 메타데이터
└── api/manage/
    └── roomReservation.ts                 # API 호출 함수
```

## 타입 정의

### Schedule
```typescript
{
  id: number;
  location: string | null;       // 방 ID (405, 410 등), 없을 수 있음
  title: string;
  category: string;              // CLUB, ACADEMIC, EXTERNAL 등
  author: number;                // 등록자 회원 ID
  state: string;
  scheduledAt: string;           // ISO 8601 (2026-05-15T14:00:00Z)
  endAt: string;                 // ISO 8601 (2026-05-15T15:00:00Z)
  checkCode?: string;            // 출석 코드 (GET 응답에서 미포함)
  expoint?: number;
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### Room
```typescript
{
  id: string;
  name: string;
  description: string;
  capacity: number;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isSelectable: boolean;         // 405, 410호만 true (일정 추가)
  status: "available" | "restricted" | "under_construction";
}
```

### ReservationCategory
```typescript
"CLUB" | "ACADEMIC" | "EXTERNAL" | "MANAGEMENT" | "GROUP_ACTIVITY" | "SEMINAR" | "AFTERPARTY" | "OTHER"
```

## 방 정보 (roomData.ts)

| 방 | 상태 | 일정 추가 | 비고 |
|---|------|---------|------|
| 405호 | 이용 가능 | ✅ | 메인 동아리실 |
| 407-1호 | 공사 중 | ❌ | 확장 공사 중 |
| 409호 | 출입금지 | ❌ | 서버실 |
| 410호 | 이용 가능 | ✅ | 다목적실 |

## 마이그레이션 가이드

### App.tsx에 추가할 import
```typescript
import RoomInfoPage from "./pages/manage/room-info";
import RoomReservationPage from "./pages/manage/room-reservation";
```

### App.tsx에 추가할 라우트
```typescript
<Route path="/manage/room-info" element={<RoomInfoPage />} />
<Route path="/manage/room-reservation" element={<RoomReservationPage />} />
```

### 네비게이션 바 업데이트 (menuData.ts)
```typescript
{ label: "동아리실 일정 관리", href: "https://khlug.org/manage/room-reservation" }
```

## 주요 컴포넌트별 역할

### FloorPlan.tsx
- SVG 약도 렌더링
- 방 클릭 이벤트 처리
- 선택 상태 시각화

### ReservationForm.tsx
- 카테고리(8종) 및 호실(405/410) 분리 선택
- 인라인 캘린더 (dayjs 기반)
- 시간 옵션 생성 (30분 단위)
- 폼 유효성 검증
- SEMINAR 선택 시 `isSummerSeason`, `isSpeakAfter` 체크박스 조건부 렌더링

### WeeklySchedule.tsx
- 주간 일정 7일 그리드
- 주 네비게이션
- 일정 블록 렌더링
- 카테고리별 색상 표시
- `location` null 방어 처리

### ScheduleDetailModal.tsx
- 일정 상세 정보 팝업
- Chakra UI Dialog 기반
- 일정 정보 표시

### RoomReservationContainer.tsx
- 전체 레이아웃 조정
- 상태 관리 (모달 상태)
- API 호출 (TanStack Query)
- SEMINAR 여부에 따라 `/schedules/big-seminar` vs `/schedules` 분기
- 토스트 알림

