import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import * as RoomReservationApi from "../../../api/manage/roomReservation";
import type { Room, Schedule, CreateScheduleRequest } from "./types";
import { ROOMS } from "./roomData";
import FloorPlan from "./FloorPlan";
import RoomInfoPanel from "./RoomInfoPanel";
import ReservationForm from "./ReservationForm";
import ScheduleDetailModal from "./ScheduleDetailModal";
import styles from "./RoomReservationContainer.module.css";

type Props = {
  pageTitle?: string;
  pageSubtitle?: string;
};

// 일정 추가 가능한 방 (405호, 410호만)
const EDITABLE_ROOMS = ROOMS.filter((room) => room.isSelectable && room.id !== "407");

export default function RoomReservationContainer({
  pageTitle = "동아리실 일정 관리",
  pageSubtitle = "방을 선택하여 일정을 확인하고, 새 일정을 등록할 수 있습니다.",
}: Props) {
  const queryClient = useQueryClient();

  // 상태 관리
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailSchedule, setDetailSchedule] = useState<Schedule | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 전체 일정 조회
  const { data: allSchedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => RoomReservationApi.getSchedules(),
  });

  // 선택된 방의 일정만 필터링
  const schedules = selectedRoom
    ? allSchedules.filter((s) => s.location === selectedRoom.id)
    : [];

  // 일정 등록 뮤테이션
  const createMutation = useMutation({
    mutationFn: (data: CreateScheduleRequest) =>
      RoomReservationApi.createSchedule(data),
    onSuccess: () => {
      toast.success("일정이 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: () => {
      toast.error("일정 등록에 실패했습니다.");
    },
  });

  // 방 선택 핸들러 (405, 410호만 선택 가능)
  const handleSelectRoom = useCallback((room: Room) => {
    if (!room.isSelectable || (room.id !== "405" && room.id !== "410")) {
      return;
    }
    setSelectedRoom((prev) => (prev?.id === room.id ? null : room));
  }, []);

  // 일정 클릭 → 상세 모달
  const handleScheduleClick = useCallback((schedule: Schedule) => {
    setDetailSchedule(schedule);
    setIsDetailOpen(true);
  }, []);

  // 일정 등록 제출
  const handleSubmit = useCallback(
    (data: {
      category: string;
      roomId: string;
      date: string;
      startTime: string;
      endTime: string;
      title: string;
      description: string;
    }) => {
      // 날짜와 시간을 ISO 8601 형식으로 변환
      const scheduledAt = dayjs(
        `${data.date} ${data.startTime}`,
        "YYYY-MM-DD HH:mm",
      ).toISOString();
      const endAt = dayjs(
        `${data.date} ${data.endTime}`,
        "YYYY-MM-DD HH:mm",
      ).toISOString();

      createMutation.mutate({
        location: data.roomId, // roomId → location
        title: data.title,
        category: data.category, // string 타입으로 유지
        scheduledAt, // ISO 8601
        endAt, // ISO 8601
      });
    },
    [createMutation],
  );

  // 약도에서도 방 선택 가능 (RoomInfoPanel의 카드에서도)
  const handleSelectRoomFromPanel = useCallback((room: Room) => {
    // 405호, 410호만 선택 가능
    if (!room.isSelectable || (room.id !== "405" && room.id !== "410")) {
      return;
    }
    setSelectedRoom(room);
  }, []);

  return (
    <>
      <div className={styles["page-header"]}>
        <h2 className={styles["page-title"]}>{pageTitle}</h2>
        <p className={styles["page-subtitle"]}>{pageSubtitle}</p>
      </div>

      <div className={styles["container"]}>
        {/* 좌측: 약도 + 방 정보/일정 */}
        <div className={styles["left-panel"]}>
          <FloorPlan
            selectedRoomId={selectedRoom?.id ?? null}
            onSelectRoom={handleSelectRoom}
          />
          <RoomInfoPanel
            selectedRoom={selectedRoom}
            schedules={schedules}
            isLoadingSchedules={isLoadingSchedules}
            onSelectRoom={handleSelectRoomFromPanel}
            onScheduleClick={handleScheduleClick}
          />
        </div>

        {/* 우측: 등록 폼 */}
        <div className={styles["right-panel"]}>
          <ReservationForm
            selectedRoom={selectedRoom}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
          />
        </div>
      </div>

      {/* 일정 상세 모달 */}
      <ScheduleDetailModal
        isOpen={isDetailOpen}
        schedule={detailSchedule}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailSchedule(null);
        }}
      />
    </>
  );
}
