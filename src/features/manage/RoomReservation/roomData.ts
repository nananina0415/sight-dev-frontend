import type { Room } from "./types";

/**
 * 동아리실 방 데이터 (학생회관 4층 기준)
 * 405, 410호만 이용 가능 및 예약 가능(isSelectable: true, status: 'available')
 * 409호는 서버실로 예약 통제(isSelectable: false, status: 'restricted')
 * 407-1호는 공사 중(isSelectable: false, status: 'under_construction')
 * 그 외 호실들은 일반 동아리방으로 예약 불가(isSelectable: false, status: 'restricted')
 */
export const ROOMS: Room[] = [
  // 좌측 라인 (위에서 아래로: 407, 408, 409, 410, 411)
  {
    id: "407",
    name: "407호",
    description: "",
    capacity: 15,
    isSelectable: false,
    status: "restricted",
  },
  {
    id: "408",
    name: "408호",
    description: "",
    capacity: 10,
    isSelectable: false,
    status: "restricted",
  },
  {
    id: "409",
    name: "409호",
    description: "서버실 (출입 통제 구역 - 일반 예약 불가)",
    capacity: 0,
    isSelectable: false,
    status: "restricted",
  },
  {
    id: "410",
    name: "410호",
    description: "다목적실. 행사 및 총회 등에 사용됩니다.",
    capacity: 15,
    isSelectable: true,
    status: "available",
  },
  {
    id: "411",
    name: "411호",
    description: "",
    capacity: 10,
    isSelectable: false,
    status: "restricted",
  },

  // 우측 라인 (위에서 아래로: 407-1, 405, 403, 404, 402, 401)
  {
    id: "407-1",
    name: "407-1호",
    description: "공사 중 (현재 이용 불가)",
    capacity: 0,
    isSelectable: false,
    status: "under_construction",
  },
  {
    id: "405",
    name: "405호",
    description: "소규모 회의/스터디실. 정기 회의/스터디에 사용됩니다.",
    capacity: 7,
    isSelectable: true,
    status: "available",
  },
  {
    id: "403",
    name: "403호",
    description: "",
    capacity: 12,
    isSelectable: false,
    status: "restricted",
  },
  {
    id: "404",
    name: "404호",
    description: "",
    capacity: 8,
    isSelectable: false,
    status: "restricted",
  },
  {
    id: "402",
    name: "402호",
    description: "",
    capacity: 10,
    isSelectable: false,
    status: "restricted",
  },
  {
    id: "401",
    name: "401호",
    description: "",
    capacity: 10,
    isSelectable: false,
    status: "restricted",
  },
];

/** 하단 '동아리실 안내' 패널에 표시할 호실 ID (약도 FloorPlan은 ROOMS 전체 사용) */
export const ROOM_INFO_PANEL_IDS = ["405", "407-1", "409", "410"] as const;

export function getRoomInfoPanelRooms(): Room[] {
  return ROOM_INFO_PANEL_IDS.map((id) =>
    ROOMS.find((room) => room.id === id),
  ).filter((room): room is Room => room != null);
}
