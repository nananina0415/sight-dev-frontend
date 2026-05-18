import axios from "axios";
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

export type AuthResult =
  | { success: true }
  | { success: false; reason: "unauthorized" | "timeout" | "network" };

type RawSchedule = {
  title: string;
  category: string | null;
  scheduledAt: string;
  endAt: string | null;
};

type ScheduleCache = {
  schedules: RawSchedule[];
  fetchedAt: number;
  date: string; // YYYY-MM-DD
};

const CACHE_KEY = "door_lock_schedules";
const CACHE_TTL_MS = 60 * 60 * 1000;

const todayString = () => new Date().toISOString().slice(0, 10);

let inflightFetch: Promise<void> | null = null;

const readCache = (): RawSchedule[] | null => {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  const cache: ScheduleCache = JSON.parse(raw);
  if (cache.date !== todayString() || Date.now() - cache.fetchedAt >= CACHE_TTL_MS) return null;
  return cache.schedules;
};

export const fetchAndCacheSchedules = (): Promise<void> => {
  if (inflightFetch) return inflightFetch;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  inflightFetch = apiV2Client
    .get<{ schedules: RawSchedule[] }>("/schedules", {
      params: { from: startOfDay.toISOString(), limit: 50 },
      headers: { "x-api-key": import.meta.env.VITE_DOOR_LOCK_API_KEY },
    })
    .then((res) => {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        schedules: res.data.schedules,
        fetchedAt: Date.now(),
        date: todayString(),
      } satisfies ScheduleCache));
    })
    .finally(() => {
      inflightFetch = null;
    });

  return inflightFetch;
};

const toSchedule = (s: RawSchedule): DoorLockSchedule => ({
  category: s.category as DoorLockSchedule["category"],
  title: s.title,
  scheduledAt: s.scheduledAt,
  endAt: s.endAt,
});

const ensureCache = async (): Promise<RawSchedule[]> => {
  const cached = readCache();
  if (cached) return cached;
  await fetchAndCacheSchedules();
  return readCache() ?? [];
};

export const getCurrentSchedule =
  async (): Promise<DoorLockSchedule | null> => {
    const now = new Date();
    const schedules = await ensureCache();
    const current = schedules.find((s: RawSchedule) => {
      const start = new Date(s.scheduledAt);
      const end = s.endAt ? new Date(s.endAt) : null;
      return start <= now && (end === null || end >= now);
    });
    return current ? toSchedule(current) : null;
  };

export const getNextSchedule = async (): Promise<DoorLockSchedule | null> => {
  const now = new Date();
  const schedules = await ensureCache();
  const next = schedules.find((s: RawSchedule) => new Date(s.scheduledAt) > now);
  return next ? toSchedule(next) : null;
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
      {
        headers: { "x-api-key": import.meta.env.VITE_DOOR_LOCK_API_KEY },
        timeout: 5000,
      },
    );
    return { success: true };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.code === "ECONNABORTED") return { success: false, reason: "timeout" };
      if (e.response) return { success: false, reason: "unauthorized" };
    }
    return { success: false, reason: "network" };
  }
};
