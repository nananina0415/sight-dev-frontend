import { ROOMS } from "./roomData";
import type { Room, Schedule } from "./types";
import WeeklySchedule from "./WeeklySchedule";
import styles from "./RoomInfoPanel.module.css";

type Props = {
  selectedRoom: Room | null;
  schedules: Schedule[];
  isLoadingSchedules: boolean;
  onSelectRoom?: (room: Room) => void;
  onScheduleClick: (schedule: Schedule) => void;
  isReadOnly?: boolean; // 읽기 전용 모드 (일정 조회만, 수정/추가 불가)
};

export default function RoomInfoPanel({
  selectedRoom,
  schedules,
  isLoadingSchedules,
  onSelectRoom,
  onScheduleClick,
  isReadOnly = false,
}: Props) {
  // 방이 선택되지 않은 경우: 우리 동아리실 위주로 설명 표시
  const CLUB_ROOM_IDS = ["405"]; // 우리 동아리실 ID 목록 — 필요하면 확장
  const visibleRooms = ROOMS.filter((r) => CLUB_ROOM_IDS.includes(r.id));

  if (!selectedRoom) {
    return (
      <div className={styles["room-info-panel"]}>
        <div className={styles["room-info-panel__title"]}>
          🏠 동아리실 안내
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
          약도에서 방을 클릭하면 해당 방의 주간 일정을 확인할 수 있습니다. 목록에는 우리 동아리실만 표시됩니다.
        </p>
        <div className={styles["room-card-list"]}>
          {visibleRooms.map((room) => (
            <div
              key={room.id}
              className={styles["room-card"]}
              onClick={() => onSelectRoom?.(room)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectRoom?.(room);
              }}
            >
              <div className={styles["room-card__icon"]}>🚪</div>
              <div className={styles["room-card__info"]}>
                <div className={styles["room-card__name"]}>{room.name}</div>
                <div className={styles["room-card__desc"]}>
                  {room.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 방이 선택된 경우: 주간 일정 표시
  return (
    <div className={styles["room-info-panel"]}>
      <WeeklySchedule
        roomName={selectedRoom.name}
        schedules={schedules}
        isLoading={isLoadingSchedules}
        onScheduleClick={onScheduleClick}
      />
    </div>
  );
}
