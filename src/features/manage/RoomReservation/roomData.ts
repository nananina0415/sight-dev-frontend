import type { Room } from "./types";

/**
 * 동아리실 방 데이터 (학생회관 4층)
 * position은 SVG viewBox(0, 0, 600, 400) 기준 좌표
 * isSelectable: 일정 등록 가능 여부
 * status: "available" | "restricted" | "under-construction"
 */
export const ROOMS: Room[] = [
  // Layout uses two adjacent columns on the right side of the floorplan:
  // leftColumnX = 220, rightColumnX = 380
  {
    id: "407",
    name: "407호",
    description: "세미나실",
    capacity: 15,
    position: { x: 60, y: 20, width: 200, height: 80 },
    isSelectable: false,
    status: "available",
  },
  {
    id: "407-1",
    name: "407-1호",
    description: "수리 중인 공간입니다.",
    capacity: 0,
    position: { x: 340, y: 20, width: 200, height: 80 },
    isSelectable: false,
    status: "under-construction",
  },
  {
    id: "408",
    name: "408호",
    description: "",
    capacity: 0,
    position: { x: 60, y: 120, width: 200, height: 80 },
    isSelectable: false,
    status: "available",
  },
  {
    id: "405",
    name: "405호",
    description: "메인 동아리실. 정기 회의 및 스터디 활동에 사용됩니다.",
    capacity: 20,
    position: { x: 340, y: 120, width: 200, height: 80 },
    isSelectable: true,
    status: "available",
  },
  {
    id: "409",
    name: "409호",
    description: "서버실 (출입 금지)",
    capacity: 0,
    position: { x: 60, y: 220, width: 200, height: 80 },
    isSelectable: false,
    status: "restricted",
  },
  {
    id: "403",
    name: "403호",
    description: "",
    capacity: 0,
    position: { x: 340, y: 220, width: 200, height: 80 },
    isSelectable: false,
    status: "available",
  },
  {
    id: "410",
    name: "410호",
    description: "다목적실. 행사 및 대규모 모임에 사용됩니다.",
    capacity: 30,
    position: { x: 60, y: 320, width: 200, height: 80 },
    isSelectable: true,
    status: "available",
  },
  {
    id: "404",
    name: "404호",
    description: "",
    capacity: 0,
    position: { x: 340, y: 320, width: 200, height: 80 },
    isSelectable: false,
    status: "available",
  },
  // removed 411 (not shown)
];
