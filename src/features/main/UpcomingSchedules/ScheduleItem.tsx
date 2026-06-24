import type { ScheduleListItemDto } from "../../../api/public/schedule";
import { Box, Text, Badge } from "@chakra-ui/react";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import "dayjs/locale/ko";

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.locale("ko");

type Props = {
  schedule: ScheduleListItemDto;
};

const CATEGORY_LABEL: Record<string, string> = {
  CLUB: "동아리",
  ACADEMIC: "학사",
  EXTERNAL: "외부",
  MANAGEMENT: "운영",
  GROUP_ACTIVITY: "그룹활동",
  BIG_SEMINAR: "총회",
  AFTERPARTY: "뒷풀이",
  OTHER: "기타",
};

const CATEGORY_COLOR: Record<string, string> = {
  CLUB: "orange",
  ACADEMIC: "red",
  EXTERNAL: "gray",
  MANAGEMENT: "purple",
  GROUP_ACTIVITY: "green",
  BIG_SEMINAR: "blue",
  AFTERPARTY: "pink",
  OTHER: "gray",
};

const getRelativeDate = (dateTime: dayjs.Dayjs): string => {
  if (dateTime.isToday()) return "오늘";
  if (dateTime.isTomorrow()) return "내일";
  return dateTime.format("M/D");
};

export default function ScheduleItem({ schedule }: Props) {
  const dateTime = dayjs(schedule.scheduledAt);
  const relativeDate = getRelativeDate(dateTime);
  const time = dateTime.format("HH:mm");
  const categoryLabel = CATEGORY_LABEL[schedule.category] ?? "기타";
  const categoryColor = CATEGORY_COLOR[schedule.category] ?? "gray";

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12px"
      padding="12px"
      borderRadius="md"
      _hover={{ backgroundColor: "gray.50" }}
      transition="background-color 0.2s"
    >
      <Box minWidth="60px" textAlign="center">
        <Text fontSize="xs" color="gray.500">
          {relativeDate}
        </Text>
        <Text fontSize="sm" fontWeight="bold">
          {time}
        </Text>
      </Box>

      <Box flex="1">
        <Box display="flex" alignItems="center" gap="8px" marginBottom="4px">
          <Badge colorPalette={categoryColor} size="sm">
            {categoryLabel}
          </Badge>
        </Box>
        <Text fontSize="md">{schedule.title}</Text>
      </Box>
    </Box>
  );
}
