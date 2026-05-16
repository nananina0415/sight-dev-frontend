import type { Room } from "./types";

/**
 * 동아리실 방 데이터 (학생회관 4층 기준)
 * position은 SVG viewBox(0, 0, 600, 400) 기준 좌표
 */
export const ROOMS: Room[] = [
  {
    id: "405",
    name: "405호",
    description: "메인 동아리실. 정기 회의 및 스터디 활동에 사용됩니다.",
    capacity: 20,
    position: { x: 20, y: 20, width: 170, height: 160 },
  },
  {
    id: "406",
    name: "406호",
    description: "소규모 회의실. 팀 프로젝트 미팅에 적합합니다.",
    capacity: 8,
    position: { x: 210, y: 20, width: 170, height: 160 },
  },
  {
    id: "407",
    name: "407호",
    description: "세미나실. 발표 및 교육 세션에 사용됩니다.",
    capacity: 15,
    position: { x: 400, y: 20, width: 180, height: 160 },
  },
  {
    id: "408",
    name: "408호",
    description: "작업실. 개인 개발 및 공동 작업 공간입니다.",
    capacity: 10,
    position: { x: 20, y: 220, width: 270, height: 160 },
  },
  {
    id: "410",
    name: "410호",
    description: "다목적실. 행사 및 대규모 모임에 사용됩니다.",
    capacity: 30,
    position: { x: 310, y: 220, width: 270, height: 160 },
  },
];
