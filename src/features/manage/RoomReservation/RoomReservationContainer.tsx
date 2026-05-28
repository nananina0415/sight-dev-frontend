import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import * as RoomReservationApi from "../../../api/manage/roomReservation";
import type { CreateScheduleRequest } from "./types";
import ReservationForm from "./ReservationForm";
import styles from "./RoomReservationContainer.module.css";

type Props = {
  pageTitle?: string;
  pageSubtitle?: string;
};

export default function RoomReservationContainer({
  pageTitle = "동아리실 일정 관리",
  pageSubtitle = "일정 및 대관 내역을 등록할 수 있습니다.",
}: Props) {
  const queryClient = useQueryClient();

  // 일정 등록 뮤테이션
  const createMutation = useMutation({
    mutationFn: (data: CreateScheduleRequest) =>
      RoomReservationApi.createSchedule(data),
    onSuccess: () => {
      toast.success("일정이 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: () => {
      toast.error("일정 등록에 실패했습니다.");
    },
  });

  // 일정 등록 제출
  const handleSubmit = useCallback(
    (data: {
      category: string;
      roomId: string;
      date: string;
      startTime: string;
      endTime: string;
      title: string;
    }) => {
      // 날짜와 시간을 ISO 8601 형식으로 변환
      const scheduledAt = dayjs(
        `${data.date} ${data.startTime}`,
        "YYYY-MM-DD HH:mm",
      ).toISOString();
      const endAt = dayjs(
        `${data.date} ${data.endTime}`,
        "YYYY-MM-DD HH:mm",
      ).toISOString();

      createMutation.mutate({
        location: data.roomId, // roomId → location
        title: data.title,
        category: data.category, // string 타입으로 유지
        scheduledAt, // ISO 8601
        endAt, // ISO 8601
      });
    },
    [createMutation],
  );

  return (
    <>
      <div className={styles["page-header"]}>
        <h2 className={styles["page-title"]}>{pageTitle}</h2>
        <p className={styles["page-subtitle"]}>{pageSubtitle}</p>
      </div>

      <div className={styles["full-width-wrapper"]}>
        <ReservationForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </>
  );
}
