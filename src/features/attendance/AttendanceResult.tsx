import { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

type Status = "submitting" | "success" | "already" | "wrong_code" | "not_open" | "rate_limit" | "error";

// TODO: 실제 API 연동 후 교체
const mockScheduleTitle = "정기 회의";

type Props = {
  code: string;
};

export default function AttendanceResult({ code }: Props) {
  const scheduleTitle = mockScheduleTitle;
  const [status, setStatus] = useState<Status>("submitting");
  const [expointGranted, setExpointGranted] = useState<number | null>(null);

  useEffect(() => {
    // TODO: 실제 API 연동
    const t = setTimeout(() => {
      if (code === "0000") {
        setStatus("wrong_code");
      } else {
        setStatus("success");
        setExpointGranted(10);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [code]);

  if (status === "submitting") {
    return (
      <Flex direction="column" align="center" pt={16} gap={3}>
        <Text fontSize="2xl">⏳</Text>
        <Text fontSize="lg" color="gray.500">출석 처리 중...</Text>
      </Flex>
    );
  }

  const content: Record<Status, { icon: string; title: string; sub?: string; color: string }> = {
    submitting: { icon: "⏳", title: "처리 중", color: "gray.500" },
    success: {
      icon: "✅",
      title: "출석 완료!",
      sub: expointGranted ? `ExPoint +${expointGranted} 획득` : undefined,
      color: "green.600",
    },
    already: {
      icon: "✅",
      title: "이미 출석 완료된 일정입니다",
      color: "green.600",
    },
    wrong_code: {
      icon: "❌",
      title: "코드가 올바르지 않습니다",
      sub: "운영진에게 코드를 다시 확인해주세요.",
      color: "red.500",
    },
    not_open: {
      icon: "⏰",
      title: "출석 시간이 아닙니다",
      sub: "출석 가능한 시간에 다시 시도해주세요.",
      color: "orange.500",
    },
    rate_limit: {
      icon: "⚠️",
      title: "너무 많이 시도했습니다",
      sub: "잠시 후 다시 시도해주세요.",
      color: "orange.500",
    },
    error: {
      icon: "❗",
      title: "오류가 발생했습니다",
      sub: "잠시 후 다시 시도해주세요.",
      color: "red.500",
    },
  };

  const { icon, title, sub, color } = content[status];

  return (
    <Flex direction="column" align="center" px={6} pt={4}>
      <Box
        w="100%"
        maxW="360px"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        p={6}
        textAlign="center"
      >
        <Text fontSize="4xl" mb={3}>{icon}</Text>
        {scheduleTitle && (
          <Text fontSize="sm" color="gray.400" mb={1}>{scheduleTitle}</Text>
        )}
        <Text fontSize="xl" fontWeight="bold" color={color} mb={sub ? 1 : 0}>
          {title}
        </Text>
        {sub && (
          <Text fontSize="sm" color="gray.500">{sub}</Text>
        )}
      </Box>
    </Flex>
  );
}
