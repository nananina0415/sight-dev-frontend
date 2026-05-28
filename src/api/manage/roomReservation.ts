import apiV2Client from "../client/v2";
import type {
  Schedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from "../../features/manage/RoomReservation/types";

/** 전체 일정 조회: GET /schedules */
export const getSchedules = async () => {
  const response = await apiV2Client.get<Schedule[]>("/schedules");
  return response.data;
};

/** 특정 일정 조회: GET /schedules/{id} */
export const getScheduleById = async (scheduleId: number) => {
  const response = await apiV2Client.get<Schedule>(`/schedules/${scheduleId}`);
  return response.data;
};

/** 일정 생성: POST /schedules */
export const createSchedule = async (request: CreateScheduleRequest) => {
  const response = await apiV2Client.post<Schedule>("/schedules", request);
  return response.data;
};

/** 일정 수정: PUT /schedules/{id} */
export const updateSchedule = async (
  scheduleId: number,
  request: UpdateScheduleRequest,
) => {
  const response = await apiV2Client.put<Schedule>(
    `/schedules/${scheduleId}`,
    request,
  );
  return response.data;
};

/** 일정 삭제: DELETE /schedules/{id} */
export const deleteSchedule = async (scheduleId: number) => {
  await apiV2Client.delete(`/schedules/${scheduleId}`);
};

/** 일정 출석 본인 등록: POST /schedules/{id}/attendances/@me */
export const checkAttendance = async (scheduleId: number) => {
  await apiV2Client.post(`/schedules/${scheduleId}/attendances/@me`);
};

/** 일정 출석 조회 (운영진): GET /schedules/{id}/attendances */
export const getAttendances = async (scheduleId: number) => {
  const response = await apiV2Client.get(`/schedules/${scheduleId}/attendances`);
  return response.data;
};

/** 일정 출석 삭제 (운영진): DELETE /schedules/{id}/attendances/{userId} */
export const deleteAttendance = async (scheduleId: number, userId: string) => {
  await apiV2Client.delete(
    `/schedules/${scheduleId}/attendances/${userId}`,
  );
};

export const RoomReservationApi = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  checkAttendance,
  getAttendances,
  deleteAttendance,
};
