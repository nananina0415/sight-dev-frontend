import { Dialog, Portal } from "@chakra-ui/react";
import dayjs from "dayjs";
import type { Schedule } from "./types";
import {
  getReservationCategoryLabel,
  getReservationCategoryColor,
} from "./types";

type Props = {
  isOpen: boolean;
  schedule: Schedule | null;
  onClose: () => void;
};

export default function ScheduleDetailModal({
  isOpen,
  schedule,
  onClose,
}: Props) {
  if (!schedule) return null;

  const scheduledDate = dayjs(schedule.scheduledAt).format("YYYY-MM-DD");
  const scheduledTime = dayjs(schedule.scheduledAt).format("HH:mm");
  const endTime = dayjs(schedule.endAt).format("HH:mm");

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            p="28px"
            maxW="440px"
            boxShadow="0px 0px 8px #00000018"
            borderRadius="8px"
          >
            <Dialog.Header p="0" mb="16px">
              <Dialog.Title fontSize="18px" fontWeight="700" color="#1e293b">
                {schedule.title}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body p="0">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {/* 분류 뱃지 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b", width: "60px" }}>
                    분류
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#fff",
                      backgroundColor: getReservationCategoryColor(
                        schedule.category,
                      ),
                    }}
                  >
                    {getReservationCategoryLabel(schedule.category)}
                  </span>
                </div>

                {/* 날짜 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b", width: "60px" }}>
                    날짜
                  </span>
                  <span style={{ fontSize: "14px", color: "#1e293b" }}>
                    {scheduledDate}
                  </span>
                </div>

                {/* 시간 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b", width: "60px" }}>
                    시간
                  </span>
                  <span style={{ fontSize: "14px", color: "#1e293b" }}>
                    {scheduledTime} ~ {endTime}
                  </span>
                </div>

                {/* 등록자 */}
                {schedule.author && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", width: "60px" }}>
                      등록자
                    </span>
                    <span style={{ fontSize: "14px", color: "#1e293b" }}>
                      {schedule.author}
                    </span>
                  </div>
                )}

                {/* 출석 코드 */}
                {schedule.checkCode && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", width: "60px" }}>
                      출석코드
                    </span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>
                      {schedule.checkCode}
                    </span>
                  </div>
                )}
              </div>
            </Dialog.Body>

            <Dialog.Footer p="0" mt="20px" display="flex" justifyContent="flex-end">
              <button
                onClick={onClose}
                style={{
                  padding: "8px 20px",
                  borderRadius: "4px",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#475569",
                }}
              >
                닫기
              </button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
