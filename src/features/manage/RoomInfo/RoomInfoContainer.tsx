import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import * as RoomReservationApi from "../../../api/manage/roomReservation";
import type { Room, Schedule } from "../RoomReservation/types";
import { ROOMS } from "../RoomReservation/roomData";
import FloorPlan from "../RoomReservation/FloorPlan";
import RoomInfoPanel from "../RoomReservation/RoomInfoPanel";
import ScheduleDetailModal from "../RoomReservation/ScheduleDetailModal";
import styles from "./RoomInfoContainer.module.css";

export default function RoomInfoContainer() {
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

  // 방 선택 핸들러
  const handleSelectRoom = useCallback((room: Room) => {
    setSelectedRoom((prev) => (prev?.id === room.id ? null : room));
  }, []);

  // 일정 클릭 → 상세 모달
  const handleScheduleClick = useCallback((schedule: Schedule) => {
    setDetailSchedule(schedule);
    setIsDetailOpen(true);
  }, []);

  return (
    <div className={styles["room-info-container"]}>
      <div className={styles["container-header"]}>
        <h1 className={styles["container-title"]}>🏢 동아리실 소개</h1>
        <p className={styles["container-subtitle"]}>
          약도에서 방을 클릭하여 동아리실 정보와 일정을 확인하세요.
        </p>
      </div>

      <div className={styles["content-layout"]}>
        <div className={styles["content-left"]}>
          <FloorPlan
            selectedRoomId={selectedRoom?.id || null}
            onSelectRoom={handleSelectRoom}
          />
        </div>

        <div className={styles["content-right"]}>
          <RoomInfoPanel
            selectedRoom={selectedRoom}
            schedules={schedules}
            isLoadingSchedules={isLoadingSchedules}
            onScheduleClick={handleScheduleClick}
            isReadOnly={true}
          />
        </div>
      </div>

      {/* 일정 상세 모달 */}
      <ScheduleDetailModal
        isOpen={isDetailOpen}
        schedule={detailSchedule}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
