import { Box, Flex, Text } from "@chakra-ui/react";
import ScheduleCategoryBadge, {
  type ScheduleCategory,
} from "../../components/ScheduleCategoryBadge";

export type TimeLine = { label: string; value: string };

export type ScheduleInfo = {
  category?: ScheduleCategory;
  title?: string;
  timeLines?: TimeLine[];
};

type Props = {
  label: string;
  schedule?: ScheduleInfo;
};

export default function DoorLockScheduleCard({ label, schedule }: Props) {
  const timeLines = schedule?.timeLines ?? [];

  return (
    <Box
      w="100%"
      display="flex"
      flexDirection="column"
      bg="white"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      px={5}
      py={5}
      gap={2}
      overflow="hidden"
    >
      <Flex alignItems="center" justifyContent="space-between">
        {!schedule ? (
          <ScheduleCategoryBadge category="일정없음" />
        ) : schedule.category ? (
          <ScheduleCategoryBadge category={schedule.category} />
        ) : (
          <Box />
        )}
        <Text
          fontWeight="semibold"
          fontSize="xs"
          color="gray.400"
          letterSpacing="widest"
        >
          {label}
        </Text>
      </Flex>

      <Box overflow="hidden">
        {schedule?.title && (
          <Text
            fontWeight="semibold"
            fontSize="lg"
            overflow="hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {schedule.title}
          </Text>
        )}
      </Box>

      <Flex direction="column" gap={2}>
        {Array.from({ length: 2 }, (_, i) => {
          const line = timeLines[i] ?? null;
          return (
            <Flex
              key={i}
              visibility={line ? "visible" : "hidden"}
              bg="gray.50"
              alignItems="center"
              justifyContent="space-between"
              px={4}
              py={2}
              borderRadius="md"
            >
              <Text fontWeight="medium" fontSize="sm" color="gray.400">
                {line?.label}
              </Text>
              <Text fontWeight="semibold" fontSize="sm">
                {line?.value}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
}
