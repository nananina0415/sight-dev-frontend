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
- 동아리방 약도 (405호, 410호만 선택 가능)
- 인라인 캘린더로 날짜 선택
- 분류 선택: 동아리 / 학사 / 외부
- 시간 선택: 시작 시간 ~ 종료 시간 (30분 단위)
- 제목 입력
- 선택한 방의 주간 일정 실시간 확인
- 일정 상세 모달 (읽기 전용)

## API 규약 (Notion 스펙)

### GET /schedules
모든 일정 조회

```
요청:
GET /schedules

응답:
Schedule[]
```

### POST /schedules
새 일정 등록 (405호, 410호만)

```
요청:
{
  location: string;           // 방 ID (405, 410)
  title: string;              // 일정명
  category: string;           // 분류 (동아리, 학사, 외부)
  scheduledAt: string;        // ISO 8601 (2026-05-15T14:00:00Z)
  endAt: string;              // ISO 8601 (2026-05-15T15:00:00Z)
  checkCode?: string;         // 선택사항
  expoint?: number;           // 선택사항
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

### DELETE /schedules/:scheduleId
일정 삭제

```
응답: 없음
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
│   ├── types.ts                           # TypeScript 타입 정의 (Notion 스펙)
│   └── roomData.ts                        # 방 메타데이터
└── api/manage/
    └── roomReservation.ts                 # API 호출 함수
```

## 타입 정의 (Notion 스펙)

### Schedule
```typescript
{
  id: string;
  location: string;              // 방 ID (405, 407, 407-1, 409, 410)
  title: string;
  category: string;              // 동아리, 학사, 외부
  author: string;
  state: string;
  scheduledAt: string;           // ISO 8601 (2026-05-15T14:00:00Z)
  endAt: string;                 // ISO 8601 (2026-05-15T15:00:00Z)
  checkCode?: string;
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
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isSelectable: boolean;         // 405, 410호만 true (일정 추가)
  status: "available" | "restricted" | "under-construction";
}
```

## 방 정보 (roomData.ts)

| 방 | 상태 | 일정 추가 | 비고 |
|---|------|---------|------|
| 405호 | 이용 가능 | ✅ | 메인 동아리실 |
| 406호 | 이용 가능 | ❌ | 소규모 회의실 |
| 407호 | 이용 가능 | ❌ | 세미나실 |
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
- 일정 입력 폼
- 인라인 캘린더 (dayjs 기반)
- 시간 옵션 생성 (30분 단위)
- 폼 유효성 검증

### WeeklySchedule.tsx
- 주간 일정 7일 그리드
- 주 네비게이션
- 일정 블록 렌더링
- 카테고리별 색상 표시

### ScheduleDetailModal.tsx
- 일정 상세 정보 팝업
- Chakra UI Dialog 기반
- 일정 정보 표시

### RoomReservationContainer.tsx
- 전체 레이아웃 조정
- 상태 관리 (선택된 방, 모달 상태)
- API 호출 (TanStack Query)
- 토스트 알림

## 추후 확장 계획

1. **일정 수정/삭제** - ScheduleDetailModal에 수정/삭제 버튼 추가
2. **출석 체크** - checkCode 입력받아 attendance 테이블 생성
3. **참석자 관리** - 참석자 목록 조회 및 관리
4. **세미나 통합** - seminar 테이블 연동
5. **포인트 시스템** - expoint 자동 부여
