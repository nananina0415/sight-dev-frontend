import apiV2Client from "../client/v2";
import type {
  Schedule,
  ScheduleListResponse,
  GetSchedulesParams,
  CreateGroupActivityRequest,
  CreateAdminScheduleRequest,
  CreateSeminarScheduleRequest,
  UpdateGroupActivityRequest,
  UpdateAdminScheduleRequest,
  UpdateSeminarScheduleRequest,
  UpdateScheduleCategoryRequest,
} from "../../features/manage/RoomReservation/types";

/* ==========================================================================
   조회
   ========================================================================== */

/** 일정 목록 조회: GET /schedules */
export const getSchedules = async (params?: GetSchedulesParams): Promise<Schedule[]> => {
  const response = await apiV2Client.get<ScheduleListResponse>("/schedules", { params });
  return response.data.schedules;
};

/** 특정 일정 조회: GET /schedules/{id} */
export const getScheduleById = async (scheduleId: number): Promise<Schedule> => {
  const response = await apiV2Client.get<Schedule>(`/schedules/${scheduleId}`);
  return response.data;
};

/* ==========================================================================
   생성
   ========================================================================== */

/** 일반 그룹 활동 생성: POST /schedules/group-activity */
export const createGroupActivitySchedule = async (
  data: CreateGroupActivityRequest,
): Promise<Schedule> => {
  const response = await apiV2Client.post<Schedule>("/schedules/group-activity", data);
  return response.data;
};

/** 운영진 일반 일정 생성: POST /schedules
 *  generateCheckCode=true 시 쿼리스트링으로 전달
 */
export const createAdminSchedule = async (
  data: CreateAdminScheduleRequest,
  generateCheckCode?: boolean,
): Promise<Schedule> => {
  const params = generateCheckCode ? { generateCheckCode: true } : undefined;
  const response = await apiV2Client.post<Schedule>("/schedules", data, { params });
  return response.data;
};

/** 세미나(빅세미나/총회) 생성: POST /schedules/big-seminar */
export const createSeminarSchedule = async (
  data: CreateSeminarScheduleRequest,
  generateCheckCode?: boolean,
): Promise<Schedule> => {
  const params = generateCheckCode ? { generateCheckCode: true } : undefined;
  const response = await apiV2Client.post<Schedule>("/schedules/big-seminar", data, { params });
  return response.data;
};

/* ==========================================================================
   수정
   ========================================================================== */

/** 일반 그룹 활동 수정: PATCH /schedules/group-activity/{scheduleId} */
export const updateGroupActivitySchedule = async (
  scheduleId: number,
  data: UpdateGroupActivityRequest,
): Promise<Schedule> => {
  const response = await apiV2Client.patch<Schedule>(
    `/schedules/group-activity/${scheduleId}`,
    data,
  );
  return response.data;
};

/** 운영진 일반 일정 수정: PATCH /schedules/{scheduleId} */
export const updateAdminSchedule = async (
  scheduleId: number,
  data: UpdateAdminScheduleRequest,
): Promise<Schedule> => {
  const response = await apiV2Client.patch<Schedule>(`/schedules/${scheduleId}`, data);
  return response.data;
};

/** 세미나 일정 수정: PATCH /schedules/big-seminar/{scheduleId} */
export const updateSeminarSchedule = async (
  scheduleId: number,
  data: UpdateSeminarScheduleRequest,
): Promise<Schedule> => {
  const response = await apiV2Client.patch<Schedule>(
    `/schedules/big-seminar/${scheduleId}`,
    data,
  );
  return response.data;
};

/** 카테고리 변경: PATCH /schedules/{scheduleId}/category (운영진 권한) */
export const updateScheduleCategory = async (
  scheduleId: number,
  data: UpdateScheduleCategoryRequest,
): Promise<Schedule> => {
  const response = await apiV2Client.patch<Schedule>(
    `/schedules/${scheduleId}/category`,
    data,
  );
  return response.data;
};

/* ==========================================================================
   삭제
   ========================================================================== */

/** 일정 삭제: DELETE /schedules/{id} */
export const deleteSchedule = async (scheduleId: number): Promise<void> => {
  await apiV2Client.delete(`/schedules/${scheduleId}`);
};

/* ==========================================================================
   출석
   ========================================================================== */

/** 출석 본인 등록: POST /schedules/{id}/attendances/@me */
export const checkAttendance = async (scheduleId: number): Promise<void> => {
  await apiV2Client.post(`/schedules/${scheduleId}/attendances/@me`);
};

/** 출석자 목록 조회 (운영진): GET /schedules/{id}/attendances */
export const getAttendances = async (scheduleId: number) => {
  const response = await apiV2Client.get(`/schedules/${scheduleId}/attendances`);
  return response.data;
};

/** 출석 삭제 (운영진): DELETE /schedules/{id}/attendances/{userId} */
export const deleteAttendance = async (
  scheduleId: number,
  userId: string,
): Promise<void> => {
  await apiV2Client.delete(`/schedules/${scheduleId}/attendances/${userId}`);
};

export const RoomReservationApi = {
  getSchedules,
  getScheduleById,
  createGroupActivitySchedule,
  createAdminSchedule,
  createSeminarSchedule,
  updateGroupActivitySchedule,
  updateAdminSchedule,
  updateSeminarSchedule,
  updateScheduleCategory,
  deleteSchedule,
  checkAttendance,
  getAttendances,
  deleteAttendance,
};
