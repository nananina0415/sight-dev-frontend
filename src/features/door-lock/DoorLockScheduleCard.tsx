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
      py={2}
      gap={2}
      overflow="hidden"
    >
      <Text
        fontWeight="semibold"
        fontSize="xs"
        color="gray.400"
        letterSpacing="widest"
        textAlign="right"
      >
        {label}
      </Text>

      <Box overflow="hidden">
        {!schedule ? (
          <ScheduleCategoryBadge category="일정없음" />
        ) : (
          <>
            {schedule.category && (
              <Box mb={2}>
                <ScheduleCategoryBadge category={schedule.category} />
              </Box>
            )}
            {schedule.title && (
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
          </>
        )}
      </Box>

      {timeLines.length > 0 && (
        <Flex direction="column" gap={2}>
          {timeLines.map((line, i) => (
            <Flex
              key={i}
              bg="gray.50"
              alignItems="center"
              justifyContent="space-between"
              px={4}
              py={2}
              borderRadius="md"
            >
              <Text fontWeight="medium" fontSize="sm" color="gray.400">
                {line.label}
              </Text>
              <Text fontWeight="semibold" fontSize="sm">
                {line.value}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
}
