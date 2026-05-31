import { useState, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import * as RoomReservationApi from "../../../api/manage/roomReservation";
import {
  ReservationCategory,
  ReservationCategoryLabel,
} from "./types";
import type {
  CreateGroupActivityRequest,
  CreateAdminScheduleRequest,
  CreateSeminarScheduleRequest,
} from "./types";
import styles from "./RoomReservationContainer.module.css";

/* ── 상수 ─────────────────────────────────────── */

type ScheduleType = "GROUP_ACTIVITY" | "ADMIN" | "SEMINAR";

const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  GROUP_ACTIVITY: "일반 그룹 활동",
  ADMIN: "운영진 일반 일정",
  SEMINAR: "빅세미나 / 총회",
};

// 운영진용 카테고리 (SEMINAR, GROUP_ACTIVITY 제외)
const ADMIN_CATEGORIES = [
  ReservationCategory.CLUB,
  ReservationCategory.ACADEMIC,
  ReservationCategory.EXTERNAL,
  ReservationCategory.MANAGEMENT,
  ReservationCategory.AFTERPARTY,
  ReservationCategory.OTHER,
] as const;

// 장소 옵션
const ROOM_OPTIONS = [
  { value: "405", label: "405호" },
  { value: "407-1", label: "407-1호" },
  { value: "410", label: "410호" },
  { value: "외부", label: "외부" },
] as const;
type RoomOption = typeof ROOM_OPTIONS[number]["value"];

// 30분 단위 시간 옵션
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return options;
}
const TIME_OPTIONS = generateTimeOptions();

/* ── Props ────────────────────────────────────── */

type Props = {
  pageTitle?: string;
  pageSubtitle?: string;
};

/* ── 컴포넌트 ─────────────────────────────────── */

export default function RoomReservationContainer({
  pageTitle = "동아리실 일정 관리",
  pageSubtitle = "일정 및 대관 내역을 등록할 수 있습니다.",
}: Props) {
  const queryClient = useQueryClient();

  /* 공통 필드 */
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState<RoomOption>("405");
  const [calendarMonth, setCalendarMonth] = useState(dayjs().startOf("month"));

  /* 대분류 */
  const [scheduleType, setScheduleType] = useState<ScheduleType>("ADMIN");

  /* 운영진 전용 필드 */
  const [adminCategory, setAdminCategory] = useState<string>(ReservationCategory.CLUB);
  const [expoint, setExpoint] = useState<number>(0);
  const [generateCheckCode, setGenerateCheckCode] = useState(false);

  /* 세미나 전용 필드 */
  const [isSummerSeason, setIsSummerSeason] = useState(false);
  const [isSpeakAfter, setIsSpeakAfter] = useState(false);

  /* 캘린더 */
  const calendarDays = useMemo(() => {
    const startOfMonth = calendarMonth.startOf("month");
    const endOfMonth = calendarMonth.endOf("month");
    let startDay = startOfMonth.day() - 1;
    if (startDay < 0) startDay = 6;
    const calendarStart = startOfMonth.subtract(startDay, "day");
    const totalDays = startDay + endOfMonth.date() > 35 ? 42 : 35;
    const days: dayjs.Dayjs[] = [];
    let current = calendarStart;
    for (let i = 0; i < totalDays; i++) {
      days.push(current);
      current = current.add(1, "day");
    }
    return days;
  }, [calendarMonth]);

  const today = dayjs().format("YYYY-MM-DD");

  /* 유효성 */
  const canSubmit = title.trim() && selectedDate && startTime && endTime && location;

  /* 뮤테이션 */
  const onSuccess = useCallback(() => {
    toast.success("일정이 등록되었습니다.");
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
    setTitle("");
    setExpoint(0);
    setGenerateCheckCode(false);
    setIsSummerSeason(false);
    setIsSpeakAfter(false);
  }, [queryClient]);

  const onError = useCallback(() => {
    toast.error("일정 등록에 실패했습니다.");
  }, []);

  const groupMutation = useMutation({
    mutationFn: (data: CreateGroupActivityRequest) =>
      RoomReservationApi.createGroupActivitySchedule(data),
    onSuccess,
    onError,
  });

  const adminMutation = useMutation({
    mutationFn: ({ data, gc }: { data: CreateAdminScheduleRequest; gc: boolean }) =>
      RoomReservationApi.createAdminSchedule(data, gc),
    onSuccess,
    onError,
  });

  const seminarMutation = useMutation({
    mutationFn: ({ data, gc }: { data: CreateSeminarScheduleRequest; gc: boolean }) =>
      RoomReservationApi.createSeminarSchedule(data, gc),
    onSuccess,
    onError,
  });

  const isSubmitting =
    groupMutation.isPending || adminMutation.isPending || seminarMutation.isPending;

  /* 제출 */
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;

    const scheduledAt = dayjs(`${selectedDate} ${startTime}`, "YYYY-MM-DD HH:mm").toISOString();
    const endAt = dayjs(`${selectedDate} ${endTime}`, "YYYY-MM-DD HH:mm").toISOString();

    if (scheduleType === "GROUP_ACTIVITY") {
      groupMutation.mutate({
        title: title.trim(),
        scheduledAt,
        endAt,
        category: ReservationCategory.GROUP_ACTIVITY,
        location: location as "405" | "407-1" | "410",
      });
    } else if (scheduleType === "ADMIN") {
      adminMutation.mutate({
        data: {
          title: title.trim(),
          scheduledAt,
          endAt,
          category: adminCategory as CreateAdminScheduleRequest["category"],
          location,
          expoint,
        },
        gc: generateCheckCode,
      });
    } else {
      seminarMutation.mutate({
        data: {
          title: title.trim(),
          scheduledAt,
          endAt,
          category: ReservationCategory.SEMINAR,
          location,
          expoint,
          isSummerSeason,
          isSpeakAfter,
        },
        gc: generateCheckCode,
      });
    }
  }, [
    canSubmit, scheduleType, title, selectedDate, startTime, endTime,
    location, adminCategory, expoint, generateCheckCode, isSummerSeason,
    isSpeakAfter, groupMutation, adminMutation, seminarMutation,
  ]);

  return (
    <>
      <div className={styles["page-header"]}>
        <h2 className={styles["page-title"]}>{pageTitle}</h2>
        <p className={styles["page-subtitle"]}>{pageSubtitle}</p>
      </div>

      <div className={styles["full-width-wrapper"]}>
        <div className={styles["reservation-form"]}>
          <div className={styles["reservation-form__title"]}>📝 일정 등록</div>

          <div className={styles["form-body"]}>
            {/* 좌측: 달력 */}
            <div className={styles["left-col"]}>
              <div className={styles["form-field"]}>
                <label className={styles["form-field__label"]}>
                  날짜 선택 <span className={styles["form-field__required"]}>*</span>
                </label>
                <div className={styles["calendar"]}>
                  <div className={styles["calendar__header"]}>
                    <button
                      type="button"
                      className={styles["calendar__nav-btn"]}
                      onClick={() => setCalendarMonth((m) => m.subtract(1, "month"))}
                    >◀</button>
                    <span className={styles["calendar__month-label"]}>
                      {calendarMonth.format("YYYY년 M월")}
                    </span>
                    <button
                      type="button"
                      className={styles["calendar__nav-btn"]}
                      onClick={() => setCalendarMonth((m) => m.add(1, "month"))}
                    >▶</button>
                  </div>
                  <div className={styles["calendar__weekdays"]}>
                    {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => {
                      let cls = styles["calendar__weekday"];
                      if (i === 5) cls += ` ${styles["calendar__weekday--sat"]}`;
                      if (i === 6) cls += ` ${styles["calendar__weekday--sun"]}`;
                      return <div key={d} className={cls}>{d}</div>;
                    })}
                  </div>
                  <div className={styles["calendar__days"]}>
                    {calendarDays.map((day) => {
                      const dateStr = day.format("YYYY-MM-DD");
                      const isOtherMonth = !day.isSame(calendarMonth, "month");
                      const isToday = dateStr === today;
                      const isSelected = dateStr === selectedDate;
                      let cls = styles["calendar__day"];
                      if (isOtherMonth) cls += ` ${styles["calendar__day--other-month"]}`;
                      if (isToday) cls += ` ${styles["calendar__day--today"]}`;
                      if (isSelected) cls += ` ${styles["calendar__day--selected"]}`;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          className={cls}
                          onClick={() => setSelectedDate(dateStr)}
                        >
                          {day.date()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 폼 */}
            <div className={styles["right-col"]}>

              {/* [1구역] 공통 필드 */}
              <div className={styles["form-field"]}>
                <label className={styles["form-field__label"]}>
                  제목 <span className={styles["form-field__required"]}>*</span>
                </label>
                <input
                  type="text"
                  className={styles["text-input"]}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="일정 제목을 입력하세요"
                />
              </div>

              <div className={styles["form-field"]}>
                <label className={styles["form-field__label"]}>
                  시간 <span className={styles["form-field__required"]}>*</span>
                </label>
                <div className={styles["time-row"]}>
                  <select
                    className={styles["time-select"]}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={`s-${t}`} value={t}>{t}</option>
                    ))}
                  </select>
                  <span className={styles["time-separator"]}>~</span>
                  <select
                    className={styles["time-select"]}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={`e-${t}`} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles["form-field"]}>
                <label className={styles["form-field__label"]}>
                  호실 <span className={styles["form-field__required"]}>*</span>
                </label>
                <div className={styles["chip-group"]}>
                  {ROOM_OPTIONS
                    .filter((opt) =>
                      scheduleType === "GROUP_ACTIVITY" ? opt.value !== "외부" : true
                    )
                    .map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={location === opt.value}
                        className={`${styles["chip"]} ${location === opt.value ? styles["chip--selected"] : ""}`}
                        onClick={() => setLocation(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* [2구역] 대분류 선택 */}
              <div className={styles["form-field"]}>
                <label className={styles["form-field__label"]}>
                  일정 종류 <span className={styles["form-field__required"]}>*</span>
                </label>
                <div className={styles["type-group"]}>
                  {(["GROUP_ACTIVITY", "ADMIN", "SEMINAR"] as ScheduleType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`${styles["type-btn"]} ${scheduleType === type ? styles["type-btn--selected"] : ""}`}
                      onClick={() => {
                        setScheduleType(type);
                        // GROUP_ACTIVITY는 외부 장소 불가 → 405로 초기화
                        if (type === "GROUP_ACTIVITY" && location === "외부") {
                          setLocation("405");
                        }
                      }}
                    >
                      {SCHEDULE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* [3구역] 운영진 이상 공통 확장 필드 */}
              {(scheduleType === "ADMIN" || scheduleType === "SEMINAR") && (
                <>
                  <div className={styles["form-field"]}>
                    <label className={styles["form-field__label"]}>세부 카테고리</label>
                    <div className={styles["chip-group"]}>
                      {ADMIN_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          role="radio"
                          aria-checked={adminCategory === cat}
                          className={`${styles["chip"]} ${adminCategory === cat ? styles["chip--selected"] : ""}`}
                          onClick={() => setAdminCategory(cat)}
                        >
                          {ReservationCategoryLabel[cat]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles["form-field"]}>
                    <label className={styles["form-field__label"]}>경험치 (ExPoint)</label>
                    <input
                      type="number"
                      className={styles["text-input"]}
                      value={expoint}
                      min={0}
                      onChange={(e) => setExpoint(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className={styles["form-field"]}>
                    <label className={styles["form-field__label"]}>출석 체크 코드</label>
                    <label className={styles["toggle-label"]}>
                      <input
                        type="checkbox"
                        className={styles["toggle-checkbox"]}
                        checked={generateCheckCode}
                        onChange={(e) => setGenerateCheckCode(e.target.checked)}
                      />
                      출석 체크 코드 자동 생성
                    </label>
                  </div>
                </>
              )}

              {/* [3구역] 세미나 전용 추가 필드 */}
              {scheduleType === "SEMINAR" && (
                <div className={styles["form-field"]}>
                  <label className={styles["form-field__label"]}>세미나 옵션</label>
                  <label className={styles["toggle-label"]}>
                    <input
                      type="checkbox"
                      className={styles["toggle-checkbox"]}
                      checked={isSummerSeason}
                      onChange={(e) => setIsSummerSeason(e.target.checked)}
                    />
                    계절학기 세미나
                  </label>
                  <label className={styles["toggle-label"]}>
                    <input
                      type="checkbox"
                      className={styles["toggle-checkbox"]}
                      checked={isSpeakAfter}
                      onChange={(e) => setIsSpeakAfter(e.target.checked)}
                    />
                    뒷풀이 발표 여부
                  </label>
                </div>
              )}

              <button
                type="button"
                className={styles["submit-btn"]}
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "등록 중..." : "일정 등록"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
