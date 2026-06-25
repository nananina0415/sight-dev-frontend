import { Badge } from "@chakra-ui/react";

export type ScheduleCategory =
  | "동아리"
  | "학사"
  | "외부"
  | "운영"
  | "총회"
  | "그룹활동"
  | "뒷풀이"
  | "기타"
  | "일정없음";

const CATEGORY_PALETTE: Record<ScheduleCategory, string> = {
  동아리: "blue",
  학사: "red",
  외부: "purple",
  운영: "green",
  그룹활동: "orange",
  총회: "blue",
  뒷풀이: "yellow",
  기타: "gray",
  일정없음: "gray",
};

type Props = {
  category: ScheduleCategory;
};

export default function ScheduleCategoryBadge({ category }: Props) {
  return (
    <Badge colorPalette={CATEGORY_PALETTE[category]} size="sm">
      {category}
    </Badge>
  );
}
