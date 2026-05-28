import { getRoomInfoPanelRooms } from "./roomData";
import type { Room, Schedule } from "./types";
import WeeklySchedule from "./WeeklySchedule";
import styles from "./RoomInfoPanel.module.css";

type Props = {
  selectedRoom: Room | null;
  schedules: Schedule[];
  isLoadingSchedules: boolean;
  onSelectRoom?: (room: Room) => void;
  onScheduleClick: (schedule: Schedule) => void;
  isReadOnly?: boolean;
};

export default function RoomInfoPanel({
  selectedRoom,
  schedules,
  isLoadingSchedules,
  onSelectRoom,
  onScheduleClick,
  isReadOnly = false,
}: Props) {
  // 방이 선택되지 않은 경우: 각 방의 설명 표시
  if (!selectedRoom) {
    return (
      <div className={styles["room-info-panel"]}>
        <div className={styles["room-info-panel__title"]}>
          🏠 동아리실 안내
        </div>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
          약도에서 방을 클릭하면 해당 방의 주간 일정을 확인할 수 있습니다.
        </p>
        <div className={styles["room-card-list"]}>
          {getRoomInfoPanelRooms().map((room) => {
            const isDisabled = !isReadOnly && !room.isSelectable;
            const cardClasses = [styles["room-card"]];
            if (isDisabled) {
              cardClasses.push(styles["room-card__disabled"]);
            }

            return (
              <div
                key={room.id}
                className={cardClasses.join(" ")}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                    return;
                  }
                  onSelectRoom?.(room);
                }}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                onKeyDown={(e) => {
                  if (isDisabled) return;
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectRoom?.(room);
                  }
                }}
              >
                <div className={styles["room-card__icon"]}>🚪</div>
                <div className={styles["room-card__info"]}>
                  <div className={styles["room-card__name"]}>{room.name}</div>
                  <div className={styles["room-card__desc"]}>
                    {room.description}
                  </div>
                  {room.capacity > 0 && (
                    <div className={styles["room-card__capacity"]}>
                      수용 인원: {room.capacity}명
                    </div>
                  )}
                  {room.status === "restricted" && room.id === "409" && (
                    <span className={`${styles["room-card-badge"]} ${styles["badge__restricted"]}`}>
                      출입 통제
                    </span>
                  )}
                  {room.status === "under_construction" && (
                    <span className={`${styles["room-card-badge"]} ${styles["badge__under_construction"]}`}>
                      공사 중
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
