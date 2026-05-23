import type { ScheduleCategory } from "../../components/ScheduleCategoryBadge";

export type AttendanceMember = {
  id: number;
  name: string;
  number: string;
};

export type AttendanceSchedule = {
  id: number;
  title: string;
  category: ScheduleCategory;
  scheduledAt: string;
  checkCode: string;
  attendees: string[];
};

const MOCK_MEMBERS_DATA: AttendanceMember[] = [
  { id: 1, name: "김민준", number: "2021123456" },
  { id: 2, name: "이서연", number: "2020234567" },
  { id: 3, name: "박지우", number: "2022345678" },
  { id: 4, name: "최수아", number: "2021456789" },
  { id: 5, name: "정도윤", number: "2023567890" },
  { id: 6, name: "윤하은", number: "2020678901" },
  { id: 7, name: "임지호", number: "2022789012" },
  { id: 8, name: "강서준", number: "2021890123" },
];

// TODO: GET /manager/users 연동으로 교체
export const getMembers = async (): Promise<AttendanceMember[]> => {
  return MOCK_MEMBERS_DATA;
};

// TODO: GET /schedules/open-attendance 연동으로 교체
export const getCurrentAttendanceSchedules = async (): Promise<
  AttendanceSchedule[]
> => {
  return [
    {
      id: 10,
      title: "5월 정기 회의",
      category: "동아리",
      scheduledAt: "2026-05-23T19:00:00",
      checkCode: "4829",
      attendees: [],
    },
    {
      id: 10,
      title: "5월 정기 회의",
      category: "동아리",
      scheduledAt: "2026-05-23T19:00:00",
      checkCode: "4829",
      attendees: [],
    },
    {
      id: 10,
      title: "5월 정기 회의",
      category: "동아리",
      scheduledAt: "2026-05-23T19:00:00",
      checkCode: "4829",
      attendees: [],
    },
    {
      id: 10,
      title: "5월 정기 회의",
      category: "동아리",
      scheduledAt: "2026-05-23T19:00:00",
      checkCode: "4829",
      attendees: [],
    },
  ];
};

type HistoryBase = Omit<AttendanceSchedule, "attendees">;

const MOCK_HISTORY_BASE: HistoryBase[] = [
  {
    id: 9,
    title: "세미나: 클린 아키텍처",
    category: "세미나",
    scheduledAt: "2026-05-16T19:00:00",
    checkCode: "1234",
  },
  {
    id: 8,
    title: "4월 정기 회의",
    category: "동아리",
    scheduledAt: "2026-04-25T19:00:00",
    checkCode: "5678",
  },
  {
    id: 11,
    title: "6월 정기 회의",
    category: "동아리",
    scheduledAt: "2026-06-06T19:00:00",
    checkCode: "9012",
  },
];

// TODO: GET /schedules/{id}/attendances 연동으로 교체
const MOCK_ATTENDEE_IDS: Record<number, number[]> = {
  8: [1, 4, 6, 7, 8],
  9: [1, 2, 3, 5],
  10: [],
  11: [],
};

// TODO: GET /schedules?year={year} (with attendance filter) 연동으로 교체
export const getAttendanceHistory = async (
  year: number,
): Promise<AttendanceSchedule[]> => {
  return MOCK_HISTORY_BASE.filter(
    (s) => new Date(s.scheduledAt).getFullYear() === year,
  ).map((s) => ({
    ...s,
    attendees: (MOCK_ATTENDEE_IDS[s.id] ?? [])
      .map((id) => MOCK_MEMBERS_DATA.find((m) => m.id === id)?.name ?? "")
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "ko")),
  }));
};

type MonthSchedule = { id: number; title: string; scheduledAt: string };

const MOCK_MONTH_SCHEDULES: MonthSchedule[] = [
  { id: 7, title: "스터디 킥오프", scheduledAt: "2026-04-18T18:00:00" },
  { id: 8, title: "4월 정기 회의", scheduledAt: "2026-04-25T19:00:00" },
  { id: 9, title: "세미나: 클린 아키텍처", scheduledAt: "2026-05-16T19:00:00" },
  { id: 10, title: "5월 정기 회의", scheduledAt: "2026-05-23T19:00:00" },
  { id: 11, title: "6월 정기 회의", scheduledAt: "2026-06-06T19:00:00" },
  { id: 12, title: "종강 뒷풀이", scheduledAt: "2026-06-20T18:00:00" },
];

// TODO: GET /schedules 연동으로 교체
export const getSchedulesByMonth = async (
  year: number,
  month: number,
): Promise<MonthSchedule[]> => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return MOCK_MONTH_SCHEDULES.filter((s) => {
    const d = new Date(s.scheduledAt);
    return d >= start && d < end;
  });
};

export const getScheduleAttendeeIds = async (
  scheduleId: number,
): Promise<number[]> => {
  return MOCK_ATTENDEE_IDS[scheduleId] ?? [];
};

// TODO: POST /schedules/{id}/attendances 연동으로 교체
export const grantAttendance = async (
  scheduleId: number,
  userIds: number[],
): Promise<void> => {
  MOCK_ATTENDEE_IDS[scheduleId] = [...userIds];
};
