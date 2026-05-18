import apiV2Client from "../client/v2";
import type { ScheduleCategory } from "../../components/ScheduleCategoryBadge";

export type DoorLockSchedule = {
  category: Exclude<ScheduleCategory, "일정없음"> | null;
  title: string;
  scheduledAt: string; // ISO 8601
  endAt: string | null; // ISO 8601
};

export type DoorLockStatus = {
  todayVisitorCount: number;
  currentRoomCount: number;
};

export type AuthResult = { success: true } | { success: false };

export const getCurrentSchedule =
  async (): Promise<DoorLockSchedule | null> => {
    // TODO: replace with real API call
    const start = new Date(Date.now() - 23 * 60 * 1000);
    const end = new Date(Date.now() + 97 * 60 * 1000);
    return {
      category: "동아리",
      title: "정기 회의",
      scheduledAt: start.toISOString(),
      endAt: end.toISOString(),
    };
    // return null;
  };

export const getNextSchedule = async (): Promise<DoorLockSchedule | null> => {
  // TODO: replace with real API call
  const start = new Date(Date.now() + (97 + 30) * 60 * 1000);
  const end = new Date(Date.now() + (97 + 30 + 120) * 60 * 1000);
  return {
    category: "세미나",
    title: "Git 입문 세미나",
    scheduledAt: start.toISOString(),
    endAt: end.toISOString(),
  };
  // return null;
};

export const getDoorLockStatus = async (): Promise<DoorLockStatus> => {
  // TODO: replace with real API call
  return {
    todayVisitorCount: 12,
    currentRoomCount: 3,
  };
};

export const authenticate = async (studentId: string): Promise<AuthResult> => {
  try {
    await apiV2Client.post(
      "/internal/door-lock/accesses",
      { studentId: Number(studentId) },
      { headers: { "x-api-key": import.meta.env.VITE_DOOR_LOCK_API_KEY } },
    );
    return { success: true };
  } catch {
    return { success: false };
  }
};
