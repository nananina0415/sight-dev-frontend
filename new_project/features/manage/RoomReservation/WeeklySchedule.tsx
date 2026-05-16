import { useState, useMemo } from "react";
import dayjs from "dayjs";
import type { Schedule } from "./types";
import { ReservationCategoryColor } from "./types";
import styles from "./WeeklySchedule.module.css";

type Props = {
  roomName: string;
  schedules: Schedule[];
  isLoading: boolean;
  onScheduleClick: (schedule: Schedule) => void;
};

export default function WeeklySchedule({
  roomName,
  schedules,
  isLoading,
  onScheduleClick,
}: Props) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const startOfWeek = dayjs()
      .add(weekOffset, "week")
      .startOf("week")
      .add(1, "day"); // 월요일 시작
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.format("M/D")} ~ ${end.format("M/D")}`;
  }, [weekDays]);

  const today = dayjs().format("YYYY-MM-DD");
  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

  const getSchedulesForDay = (date: dayjs.Dayjs): Schedule[] => {
    const dateStr = date.format("YYYY-MM-DD");
    return schedules
      .filter((s) => {
        // scheduledAt (ISO 8601)을 날짜로 변환해서 비교
        const scheduleDate = dayjs(s.scheduledAt).format("YYYY-MM-DD");
        return scheduleDate === dateStr;
      })
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  };

  if (isLoading) {
    return (
      <div className={styles["weekly-schedule__loading"]}>
        일정을 불러오는 중...
      </div>
    );
  }

  return (
    <div className={styles["weekly-schedule"]}>
      <div className={styles["weekly-schedule__header"]}>
        <div className={styles["weekly-schedule__title"]}>
          📅 {roomName} 주간 일정
        </div>
        <div className={styles["weekly-schedule__week-nav"]}>
          <button
            className={styles["weekly-schedule__nav-btn"]}
            onClick={() => setWeekOffset((v) => v - 1)}
          >
            ◀
          </button>
          <span className={styles["weekly-schedule__week-label"]}>
            {weekLabel}
          </span>
          <button
            className={styles["weekly-schedule__nav-btn"]}
            onClick={() => setWeekOffset((v) => v + 1)}
          >
            ▶
          </button>
        </div>
      </div>

      <div className={styles["weekly-schedule__grid"]}>
        {weekDays.map((date, idx) => {
          const dateStr = date.format("YYYY-MM-DD");
          const isToday = dateStr === today;
          const daySchedules = getSchedulesForDay(date);

          let dayHeaderClass = styles["weekly-schedule__day-header"];
          if (isToday)
            dayHeaderClass += ` ${styles["weekly-schedule__day-header--today"]}`;
          if (idx === 5)
            dayHeaderClass += ` ${styles["weekly-schedule__day-header--sat"]}`;
          if (idx === 6)
            dayHeaderClass += ` ${styles["weekly-schedule__day-header--sun"]}`;

          return (
            <div key={dateStr} className={styles["weekly-schedule__day-col"]}>
              <div className={dayHeaderClass}>
                {dayLabels[idx]} {date.format("D")}
                {isToday && " •"}
              </div>
              {daySchedules.length === 0 ? (
                <div className={styles["weekly-schedule__empty"]}>-</div>
              ) : (
                daySchedules.map((schedule) => {
                  const startTime = dayjs(schedule.scheduledAt).format("HH:mm");
                  const endTime = dayjs(schedule.endAt).format("HH:mm");
                  return (
                    <div
                      key={schedule.id}
                      className={styles["schedule-block"]}
                      style={{
                        backgroundColor:
                          ReservationCategoryColor[schedule.category] || "#00a0e9",
                      }}
                      onClick={() => onScheduleClick(schedule)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          onScheduleClick(schedule);
                      }}
                      title={`${schedule.title} (${startTime}~${endTime})`}
                    >
                      <div className={styles["schedule-block__time"]}>
                        {startTime}~{endTime}
                      </div>
                      <div className={styles["schedule-block__title"]}>
                        {schedule.title}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
