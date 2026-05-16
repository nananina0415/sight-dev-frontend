import { ROOMS } from "./roomData";
import type { Room } from "./types";
import styles from "./FloorPlan.module.css";

type Props = {
  selectedRoomId: string | null;
  onSelectRoom: (room: Room) => void;
};

export default function FloorPlan({ selectedRoomId, onSelectRoom }: Props) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "restricted":
        return "출입금지";
      case "under-construction":
        return "공사중";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "restricted":
        return "#ef4444"; // 빨강
      case "under-construction":
        return "#f59e0b"; // 주황
      default:
        return "#e0f2fe"; // 파랑
    }
  };

  return (
    <div className={styles["floorplan-wrapper"]}>
      <div className={styles["floorplan-title"]}>🏢 학생회관 4층 약도</div>
      <svg
        viewBox="0 0 600 400"
        className={styles["floorplan-svg"]}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 건물 외벽 */}
        <rect
          x="10"
          y="10"
          width="580"
          height="380"
          rx="6"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="6 3"
        />

        {/* 중앙 복도 (세로) */}
        <rect
          x={280}
          y={10}
          width={40}
          height={380}
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth={1}
        />
        <text
          x={300}
          y={30}
          textAnchor="middle"
          className={styles["corridor-label"]}
        >
          복 도
        </text>

        {/* 방 렌더링 */}
        {ROOMS.map((room) => {
          const isSelected = selectedRoomId === room.id;
          const isSelectable = room.isSelectable;
          const { x, y, width, height } = room.position;
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const statusLabel = getStatusLabel(room.status);
          const bgColor = getStatusColor(room.status);

          return (
            <g
              key={room.id}
              onClick={() => {
                if (isSelectable) onSelectRoom(room);
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && isSelectable) {
                  onSelectRoom(room);
                }
              }}
              role="button"
              tabIndex={isSelectable ? 0 : -1}
              aria-label={`${room.name} ${statusLabel} (${room.capacity}명)`}
              style={{ cursor: isSelectable ? "pointer" : "not-allowed" }}
            >
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx="6"
                fill={bgColor}
                stroke={isSelected ? "#0077b6" : "#cbd5e1"}
                strokeWidth={isSelected ? 3 : 1}
                opacity={isSelectable ? 1 : 0.6}
              />
              <text
                x={centerX}
                y={centerY - 8}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles["room-label"]}
                fill={isSelected ? "#0077b6" : "#475569"}
                fontWeight={isSelected ? "bold" : "normal"}
              >
                {room.name}
              </text>
              {statusLabel && (
                <text
                  x={centerX}
                  y={centerY + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fill={room.status === "restricted" ? "#dc2626" : "#d97706"}
                  fontWeight="bold"
                >
                  {statusLabel}
                </text>
              )}
              {isSelectable && room.capacity > 0 && (
                <text
                  x={centerX}
                  y={centerY + 24}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={styles["capacity-badge"]}
                >
                  👤 {room.capacity}명
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
