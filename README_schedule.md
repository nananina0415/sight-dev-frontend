# 동아리실 소개 & 일정 추가 페이지

운영진용 동아리실 약도 조회 및 일정 등록 기능입니다. 두 개의 독립적인 페이지로 구성됩니다.

## 📄 페이지 구성

### 1️⃣ 동아리실 소개 페이지 (`/manage/room-info`)
**읽기 전용 모드** - 동아리방 조회 및 일정 확인만 가능

**기능:**
- 동아리방 약도 시각화 (SVG)
- 방 선택 시 주간 일정 조회
- 일정 상세 정보 모달 (수정 불가)
- 방: 401~411호 전체 조회 가능 (roomData.ts 기준)

### 2️⃣ 일정 추가 페이지 (`/manage/room-reservation`)
**편집 모드** - 일정 등록 가능

**기능:**
- 날짜 선택 (인라인 캘린더, dayjs 기반)
- 제목 입력
- 시간 선택: 시작 시간 ~ 종료 시간 (30분 단위)
- 호실 선택: 405호 / 407-1호 / 410호 / 외부 (일정 종류에 따라 외부 노출 여부 다름)
- **일정 종류 3단계 계단식 폼:**
  1. 일반 그룹 활동 → 추가 필드 없음, 호실은 405/407-1/410만 선택 가능
  2. 운영진 일반 일정 → 세부 카테고리 + 경험치 + 출석 체크 코드 토글
  3. 빅세미나 / 총회 → 운영진 필드 포함 + 계절학기 여부 + 뒷풀이 발표 여부

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

### POST /schedules/group-activity
일반 그룹 활동 일정 등록 (일반 회원용)

```
요청:
{
  title: string;
  scheduledAt: string;        // ISO 8601
  endAt: string;              // ISO 8601
  category: "GROUP_ACTIVITY"; // 고정
  location: "405" | "407-1" | "410";
}

응답:
Schedule
```

### POST /schedules
운영진 일반 일정 등록 (SEMINAR, GROUP_ACTIVITY 제외)

```
요청:
{
  title: string;
  scheduledAt: string;        // ISO 8601
  endAt: string;              // ISO 8601
  category: string;           // CLUB, ACADEMIC, EXTERNAL, MANAGEMENT, AFTERPARTY, OTHER
  location: "405" | "407-1" | "410" | "외부";
  expoint: number;            // 경험치
  useCheckCode?: boolean;
}

쿼리 파라미터:
  generateCheckCode=true : 출석 체크 코드 자동 생성 요청

응답:
Schedule
```

### POST /schedules/big-seminar
세미나 일정 등록

```
요청:
{
  title: string;
  scheduledAt: string;        // ISO 8601
  endAt: string;              // ISO 8601
  category: "SEMINAR";        // 고정
  location: "405" | "407-1" | "410" | "외부";
  expoint: number;
  useCheckCode?: boolean;
  isSummerSeason: boolean;    // 계절학기 세미나 여부 (필수)
  isSpeakAfter: boolean;      // 뒷풀이 발표 여부 (필수)
}

쿼리 파라미터:
  generateCheckCode=true : 출석 체크 코드 자동 생성 요청

응답:
Schedule
```

### GET /schedules/:scheduleId
일정 상세 조회

```
응답:
Schedule
```

### PATCH /schedules/:scheduleId
운영진 일반 일정 수정

```
요청:
Partial<Omit<CreateAdminScheduleRequest, 'category'>>

응답:
Schedule
```

### PATCH /schedules/group-activity/:scheduleId
일반 그룹 활동 수정

```
요청:
Partial<Omit<CreateGroupActivityRequest, 'category'>>

응답:
Schedule
```

### PATCH /schedules/big-seminar/:scheduleId
세미나 일정 수정

```
요청:
Partial<Omit<CreateSeminarScheduleRequest, 'category'>>

응답:
Schedule
```

### PATCH /schedules/:scheduleId/category
카테고리 변경 (운영진 권한)

```
요청:
{
  category: ReservationCategory;
  isSummerSeason?: boolean;   // SEMINAR로 변경 시 필요
  isSpeakAfter?: boolean;     // SEMINAR로 변경 시 필요
}

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
에러: 중복 출석 시 409
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
│   ├── RoomReservationContainer.tsx       # 일정 추가 컨테이너 (동적 폼 포함)
│   ├── RoomReservationContainer.module.css
│   ├── RoomInfoContainer.tsx              # 동아리실 소개 컨테이너 (읽기 전용)
│   ├── RoomInfoContainer.module.css
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

> ⚠️ `ReservationForm.tsx`는 더 이상 사용되지 않습니다.
> `RoomReservationContainer.tsx`가 폼을 직접 포함하는 구조로 변경되었습니다.

## 타입 정의

### Schedule
```typescript
{
  id: number;
  location: string | null;       // 방 ID (405, 410, 외부 등), 없을 수 있음
  title: string;
  category: string;              // ReservationCategory 값
  author: number;                // 등록자 회원 ID
  state: string;
  scheduledAt: string;           // ISO 8601
  endAt: string;                 // ISO 8601
  checkCode?: string;            // 출석 코드 (GET 응답에서 미포함)
  expoint?: number;
  createdAt: string;
  updatedAt: string;
}
```

### ReservationCategory
```typescript
"CLUB" | "ACADEMIC" | "EXTERNAL" | "MANAGEMENT" | "GROUP_ACTIVITY" | "SEMINAR" | "AFTERPARTY" | "OTHER"
```

### 생성 요청 DTO 포함관계
```
BaseCreateScheduleRequest (title, scheduledAt, endAt, useCheckCode?)
  └─ CreateGroupActivityRequest  (+category 고정, +location 405/407-1/410)
  └─ CreateAdminScheduleRequest  (+category 운영진용, +location 외부 포함, +expoint)
       └─ CreateSeminarScheduleRequest  (+category 고정 SEMINAR, +isSummerSeason, +isSpeakAfter)
```

### Room
```typescript
{
  id: string;
  name: string;
  description: string;
  capacity: number;
  position?: { x: number; y: number; width: number; height: number; };
  isSelectable: boolean;
  status: "available" | "restricted" | "under_construction";
}
```

## 방 정보 (roomData.ts)

| 방 | 상태 | isSelectable | 비고 |
|---|------|-------------|------|
| 405호 | 이용 가능 | ✅ | 소규모 회의/스터디실 |
| 407-1호 | 공사 중 | ❌ | 확장 공사 중 |
| 409호 | 출입금지 | ❌ | 서버실 |
| 410호 | 이용 가능 | ✅ | 다목적실 |
| 그 외 | 출입금지 | ❌ | 일반 동아리방 |

> 일정 등록 시 호실 선택은 코드 내 `ROOM_OPTIONS` 상수로 별도 관리 (405, 407-1, 410, 외부).
> `isSelectable`은 약도(FloorPlan) 클릭 가능 여부에만 영향.

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

### RoomReservationContainer.tsx
- 날짜 캘린더, 제목/시간/호실 공통 필드
- 일정 종류 탭 (GROUP_ACTIVITY / ADMIN / SEMINAR) 선택에 따른 계단식 폼 확장
- 종류별 API 분기 호출 (TanStack Query useMutation)
- 출석 체크 코드 생성은 쿼리스트링 `generateCheckCode=true`로 전달
- 토스트 알림 (react-toastify)

### RoomInfoContainer.tsx
- 전체 일정 `GET /schedules` 조회 후 선택 방 기준 프론트 필터링
- 약도(FloorPlan) + 방 정보 패널(RoomInfoPanel) 레이아웃
- 일정 클릭 시 상세 모달 (읽기 전용)

### FloorPlan.tsx
- SVG 약도 렌더링
- 방 클릭 이벤트 처리
- 선택 상태 시각화

### WeeklySchedule.tsx
- 주간 일정 7일 그리드
- 주 네비게이션
- 카테고리별 색상 표시
- `location` null 방어 처리

### ScheduleDetailModal.tsx
- 일정 상세 정보 팝업 (Chakra UI Dialog 기반)
- 읽기 전용

## 추후 확장 계획

1. **일정 수정/삭제 UI** — ScheduleDetailModal에 버튼 추가 (API 함수는 구현 완료)
2. **카테고리 변경 UI** — `PATCH /schedules/:id/category` 연동
3. **출석 체크 UI** — 중복 출석 409 에러 핸들링 포함 (API 함수는 구현 완료)
4. **GET /active-schedules 연동** — 현재 진행 중 일정 조회 UI
5. **포인트 시스템** — expoint 자동 부여 연동
