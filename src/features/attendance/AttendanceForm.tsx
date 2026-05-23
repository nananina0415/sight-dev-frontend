import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, chakra } from "@chakra-ui/react";
import Button from "../../components/Button";
import ScheduleCategoryBadge from "../../components/ScheduleCategoryBadge";
import type { ScheduleCategory } from "../../components/ScheduleCategoryBadge";

// TODO: 실제 API 연동 후 교체
const mockSchedule = {
  title: "정기 회의",
  category: "동아리" as ScheduleCategory,
};

export default function AttendanceForm() {
  const schedule = mockSchedule;
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (code.length !== 4) return;
    navigate(`/attendance?password=${code}`);
  };

  if (!schedule) {
    return (
      <Flex direction="column" align="center" pt={16} px={6} gap={3}>
        <Text fontSize="3xl">🔒</Text>
        <Text fontSize="lg" fontWeight="semibold" color="gray.600">
          현재 열린 출석체크가 없습니다
        </Text>
        <Text fontSize="sm" color="gray.400">
          출석체크가 시작되면 이 페이지에서 참여할 수 있습니다.
        </Text>
      </Flex>
    );
  }

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
      >
        <Flex direction="column" gap={4}>
          <Box>
            {schedule.category && (
              <Box mb={2}>
                <ScheduleCategoryBadge category={schedule.category} />
              </Box>
            )}
            <Text fontWeight="bold" fontSize="xl">
              {schedule.title}
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.500" mb={2}>
              출석 코드 4자리
            </Text>
            <chakra.input
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setCode(val);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              type="text"
              inputMode="numeric"
              placeholder="0000"
              maxLength={4}
              fontSize="3xl"
              fontWeight="bold"
              letterSpacing="widest"
              fontVariantNumeric="tabular-nums"
              textAlign="center"
              w="100%"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              py={3}
              bg="gray.50"
              outline="none"
              _focus={{ borderColor: "brand.400", bg: "white" }}
              _placeholder={{ color: "gray.300", letterSpacing: "widest" }}
            />
          </Box>

          <Button
            w="100%"
            onClick={handleSubmit}
            disabled={code.length !== 4}
            fontSize="md"
            fontWeight="bold"
            h="48px"
          >
            출석하기
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
