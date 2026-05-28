import apiV2Client from "../client/v2";
import type { ScheduleCategory } from "../../components/ScheduleCategoryBadge";

export type AttendanceSchedule = {
  id: number;
  title: string;
  category: Exclude<ScheduleCategory, "일정없음"> | null;
  scheduledAt: string;
  endAt: string | null;
};

export type CheckAttendanceResult =
  | { status: "success"; expointGranted: number }
  | { status: "already" }
  | { status: "wrong_code" }
  | { status: "not_open" }
  | { status: "not_found" }
  | { status: "error" };

export const getSchedule = async (scheduleId: string): Promise<AttendanceSchedule | null> => {
  try {
    const resp = await apiV2Client.get<AttendanceSchedule>(`/schedules/${scheduleId}`);
    return resp.data;
  } catch {
    return null;
  }
};

export const checkAttendance = async (
  scheduleId: string,
  code: string,
): Promise<CheckAttendanceResult> => {
  try {
    const resp = await apiV2Client.post<{ expointGranted: number }>(
      `/schedules/${scheduleId}/attendances/@me`,
      { code },
    );
    return { status: "success", expointGranted: resp.data.expointGranted };
  } catch (err: unknown) {
    const e = err as { response?: { status: number; data?: { message?: string } } };
    const status = e.response?.status;
    if (status === 409) return { status: "already" };
    if (status === 401) return { status: "wrong_code" };
    if (status === 400) return { status: "not_open" };
    if (status === 404) return { status: "not_found" };
    return { status: "error" };
  }
};
