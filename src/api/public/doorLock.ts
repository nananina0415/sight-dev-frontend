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
  | { success: true; name: string }
  | { success: false; reason: "unauthorized" }
  | { success: false; reason: "timeout" | "network" | "signal_failed"; localNotFound: boolean };

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
  return cache.date === todayString() ? cache.schedules : null;
};

const isCacheStale = (): boolean => {
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return true;
  const cache: ScheduleCache = JSON.parse(raw);
  return cache.date !== todayString() || Date.now() - cache.fetchedAt >= CACHE_TTL_MS;
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
  if (isCacheStale()) {
    await fetchAndCacheSchedules().catch(() => {});
  }
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

const MEMBERS_KEY = "door_lock_members";
const MEMBERS_DATE_KEY = "door_lock_members_date";

export const getMembersDate = (): string | null =>
  localStorage.getItem(MEMBERS_DATE_KEY);

export const sendDaemonDownAlert = (): Promise<void> =>
  apiV2Client
    .post("/internal/door-lock/alert-die", null, {
      headers: { "x-api-key": import.meta.env.VITE_DOOR_LOCK_API_KEY },
    })
    .then(() => {})
    .catch(() => {});

export const syncMembers = async (): Promise<void> => {
  const today = todayString();
  if (localStorage.getItem(MEMBERS_DATE_KEY) === today) return;
  try {
    const resp = await apiV2Client.get<{ members: { studentId: number; name: string }[] }>(
      "/internal/door-lock/members",
      { headers: { "x-api-key": import.meta.env.VITE_DOOR_LOCK_API_KEY } },
    );
    const map: Record<string, string> = {};
    for (const m of resp.data.members) map[String(m.studentId)] = m.name;
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(map));
    localStorage.setItem(MEMBERS_DATE_KEY, today);
  } catch {
    if (!localStorage.getItem(MEMBERS_KEY)) {
      // TODO: 백엔드 API 구현 후 제거
      localStorage.setItem(MEMBERS_KEY, JSON.stringify({ "1111111111": "김김김" }));
      localStorage.setItem(MEMBERS_DATE_KEY, today);
    }
  }
};

const lookupLocal = (studentId: string): { found: boolean; name: string } => {
  const raw = localStorage.getItem(MEMBERS_KEY);
  if (!raw) return { found: false, name: "" };
  const map = JSON.parse(raw) as Record<string, string>;
  if (!(studentId in map)) return { found: false, name: "" };
  return { found: true, name: map[studentId] };
};

const localFallback = (
  studentId: string,
  reason: "timeout" | "network" | "signal_failed",
): AuthResult => {
  const local = lookupLocal(studentId);
  return local.found
    ? { success: true, name: local.name }
    : { success: false, reason, localNotFound: true };
};

export const authenticate = async (studentId: string): Promise<AuthResult> => {
  try {
    const resp = await fetch("http://localhost:8080/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: studentId }),
    });

    if (resp.ok) {
      const data = await resp.json().catch(() => ({})) as { name?: string };
      return { success: true, name: data.name ?? "" };
    }

    const data = await resp.json().catch(() => ({})) as { message?: string };
    if (resp.status === 504 || data.message === "timeout")
      return localFallback(studentId, "timeout");
    if (resp.status === 502 || data.message === "network")
      return localFallback(studentId, "network");
    return { success: false, reason: "unauthorized" };
  } catch {
    return localFallback(studentId, "signal_failed");
  }
};
