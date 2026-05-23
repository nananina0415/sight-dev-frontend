import type React from "react";
import { ROOMS } from "./roomData";
import type { Room } from "./types";
import styles from "./FloorPlan.module.css";

type Props = {
  selectedRoomId: string | null;
  onSelectRoom: (room: Room) => void;
};

export default function FloorPlan({ selectedRoomId, onSelectRoom }: Props) {
  // 좌측 라인 (위에서 아래로: 407, 408, 409, 410, 411)
  const leftRooms = ROOMS.filter((r) =>
    ["407", "408", "409", "410", "411"].includes(r.id)
  );

  // 우측 라인 (위에서 아래로: 407-1, 405, 403, 404, 402, 401)
  const rightRooms = ROOMS.filter((r) =>
    ["407-1", "405", "403", "404", "402", "401"].includes(r.id)
  );

  const handleRoomClick = (room: Room, e: React.MouseEvent) => {
    if (!room.isSelectable) {
      e.preventDefault();
      return;
    }
    onSelectRoom(room);
  };

  const getRoomClass = (room: Room) => {
    const classes = [styles["room-box"]];
    const isSelected = selectedRoomId === room.id;

    if (room.isSelectable) {
      classes.push(styles["room-box__selectable"]);
    }

    if (isSelected) {
      classes.push(styles["room-box__selected"]);
    } else {
      if (room.status === "available") {
        classes.push(styles["room-box__available"]);
      } else if (room.status === "restricted") {
        if (room.id === "409") {
          classes.push(styles["room-box__restricted-server"]);
        } else {
          classes.push(styles["room-box__restricted"]);
        }
      } else if (room.status === "under_construction") {
        classes.push(styles["room-box__under_construction"]);
      }
    }

    return classes.join(" ");
  };

  return (
    <div className={styles["floorplan-wrapper"]}>
      <div className={styles["floorplan-title"]}>🏢 학생회관 4층 약도</div>
      <div className={styles["floorplan-grid"]}>
        {/* 좌측 라인 */}
        <div className={styles["room-column"]}>
          {leftRooms.map((room) => (
            <div
              key={room.id}
              className={getRoomClass(room)}
              onClick={(e) => handleRoomClick(room, e)}
              role="button"
              tabIndex={room.isSelectable ? 0 : -1}
              aria-label={room.name}
              title={
                room.id === "409"
                  ? "서버실 (출입 통제 구역 - 일반 예약 불가)"
                  : room.status === "under_construction"
                  ? "공사 중 (현재 이용 불가)"
                  : room.isSelectable
                  ? `${room.name} (예약 가능)`
                  : `${room.name} (예약 불가)`
              }
            >
              <div className={styles["room-name"]}>{room.name}</div>
              {room.status === "restricted" && room.id === "409" && (
                <span className={`${styles["room-status-badge"]} ${styles["badge__restricted"]}`}>
                  출입 통제
                </span>
              )}
              {room.status === "under_construction" && (
                <span className={`${styles["room-status-badge"]} ${styles["badge__under_construction"]}`}>
                  공사 중
                </span>
              )}
              {room.status === "available" && room.capacity > 0 && (
                <span className={styles["room-capacity"]}>
                  👤 {room.capacity}명
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 중앙 복도 */}
        <div className={styles["corridor"]}>
          <div className={styles["corridor-text"]}>복도</div>
        </div>

        {/* 우측 라인 */}
        <div className={styles["room-column"]}>
          {rightRooms.map((room) => (
            <div
              key={room.id}
              className={getRoomClass(room)}
              onClick={(e) => handleRoomClick(room, e)}
              role="button"
              tabIndex={room.isSelectable ? 0 : -1}
              aria-label={room.name}
              title={
                room.status === "under_construction"
                  ? "공사 중 (현재 이용 불가)"
                  : room.isSelectable
                  ? `${room.name} (예약 가능)`
                  : `${room.name} (예약 불가)`
              }
            >
              <div className={styles["room-name"]}>{room.name}</div>
              {room.status === "under_construction" && (
                <span className={`${styles["room-status-badge"]} ${styles["badge__under_construction"]}`}>
                  공사 중
                </span>
              )}
              {room.status === "available" && room.capacity > 0 && (
                <span className={styles["room-capacity"]}>
                  👤 {room.capacity}명
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
