import apiV2Client from "../client/v2";
import type { ScheduleCategory } from "../../components/ScheduleCategoryBadge";

export type AttendanceMember = {
  id: number;
  name: string;
  number: string;
};

export type CurrentSchedule = {
  id: number;
  title: string;
  category: ScheduleCategory;
  scheduledAt: string;
  checkCode: string;
};

export type HistorySchedule = {
  id: number;
  title: string;
  category: ScheduleCategory | null;
  scheduledAt: string;
};

export type ScheduleAttendee = {
  userId: number;
  isChecked: boolean;
};

const CATEGORY_MAP: Partial<Record<string, ScheduleCategory>> = {
  CLUB: "동아리",
  ACADEMIC: "학사",
  EXTERNAL: "외부",
  MANAGEMENT: "운영",
  GROUP_ACTIVITY: "그룹활동",
  BIG_SEMINAR: "총회",
  AFTERPARTY: "뒷풀이",
  OTHER: "기타",
};

function toCategory(raw: string | null | undefined): ScheduleCategory | null {
  if (!raw) return null;
  return CATEGORY_MAP[raw] ?? null;
}

type RawScheduleDto = {
  id: number;
  title: string;
  category: string;
  scheduledAt: string;
};

type RawGetScheduleResponse = {
  id: number;
  title: string;
  category: string;
  scheduledAt: string;
  checkCode: string | null;
};

export const getMembers = async (): Promise<AttendanceMember[]> => {
  const res = await apiV2Client.get<{
    users: { id: number; profile: { name: string; number: number | null } }[];
  }>("/manager/users", { params: { limit: 200, offset: 0 } });
  return res.data.users.map((u) => ({
    id: u.id,
    name: u.profile.name,
    number: u.profile.number?.toString() ?? "",
  }));
};

export const getCurrentAttendanceSchedules = async (): Promise<CurrentSchedule[]> => {
  const res = await apiV2Client.get<{ schedules: RawScheduleDto[] }>("/active-schedules");
  const detailed = await Promise.all(
    res.data.schedules.map((s) =>
      apiV2Client.get<RawGetScheduleResponse>(`/schedules/${s.id}`)
    )
  );
  return detailed
    .map((r) => r.data)
    .filter((s) => s.checkCode !== null)
    .map((s) => ({
      id: s.id,
      title: s.title,
      category: toCategory(s.category) ?? "기타",
      scheduledAt: s.scheduledAt,
      checkCode: s.checkCode!,
    }));
};

export const getSchedulesByMonth = async (
  year: number,
  month: number
): Promise<{ id: number; title: string; scheduledAt: string }[]> => {
  const from = new Date(year, month - 1, 1).toISOString().slice(0, 19);
  const res = await apiV2Client.get<{ schedules: RawScheduleDto[] }>("/schedules", {
    params: { from, limit: 50 },
  });
  const end = new Date(year, month, 1).getTime();
  return res.data.schedules
    .filter((s) => new Date(s.scheduledAt).getTime() < end)
    .map((s) => ({ id: s.id, title: s.title, scheduledAt: s.scheduledAt }));
};

export const getScheduleAttendees = async (
  scheduleId: number
): Promise<ScheduleAttendee[]> => {
  const res = await apiV2Client.get<{ attendances: ScheduleAttendee[] }>(
    `/schedules/${scheduleId}/attendances`
  );
  return res.data.attendances;
};

export const getAttendanceHistory = async (year: number): Promise<HistorySchedule[]> => {
  const from = `${year}-01-01T00:00:00`;
  const res = await apiV2Client.get<{ schedules: RawScheduleDto[] }>("/schedules", {
    params: { from, limit: 50 },
  });
  const end = new Date(year + 1, 0, 1).getTime();
  return res.data.schedules
    .filter((s) => new Date(s.scheduledAt).getTime() < end)
    .map((s) => ({
      id: s.id,
      title: s.title,
      category: toCategory(s.category),
      scheduledAt: s.scheduledAt,
    }));
};

export const addAttendances = async (
  scheduleId: number,
  userIds: number[]
): Promise<void> => {
  if (userIds.length === 0) return;
  await apiV2Client.post(`/schedules/${scheduleId}/attendances`, { userIds });
};

export const removeAttendance = async (
  scheduleId: number,
  userId: number
): Promise<void> => {
  await apiV2Client.delete(`/schedules/${scheduleId}/attendances/${userId}`);
};
