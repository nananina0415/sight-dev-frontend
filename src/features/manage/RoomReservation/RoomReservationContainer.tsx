import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import * as RoomReservationApi from "../../../api/manage/roomReservation";
import type { CreateScheduleRequest } from "./types";
import { CategoryLocationMap } from "./types";
import ReservationForm from "./ReservationForm";
import styles from "./RoomReservationContainer.module.css";

type Props = {
  pageTitle?: string;
  pageSubtitle?: string;
};

export default function RoomReservationContainer({
  pageTitle = "일정 등록",
  pageSubtitle = "분류를 선택하고 일정을 등록할 수 있습니다.",
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
      date: string;
      startTime: string;
      endTime: string;
      title: string;
      description: string;
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

      // 카테고리에서 location 매핑 (405호, 410호인 경우)
      const location =
        CategoryLocationMap[data.category as keyof typeof CategoryLocationMap] ?? "";

      createMutation.mutate({
        location,
        title: data.title,
        category: data.category,
        scheduledAt,
        endAt,
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

      <div className={styles["form-wrapper"]}>
        <ReservationForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </>
  );
}
