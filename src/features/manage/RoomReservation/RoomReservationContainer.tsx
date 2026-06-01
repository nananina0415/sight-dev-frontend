import { useState, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useIsManager } from "../../../hooks/user/useIsManager";



import * as RoomReservationApi from "../../../api/manage/roomReservation";
import {
  ReservationCategory,
  ReservationCategoryLabel,
  getReservationCategoryColor,
} from "./types";
import type {
  Schedule,
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

const ADMIN_CATEGORIES = [
  ReservationCategory.CLUB,
  ReservationCategory.ACADEMIC,
  ReservationCategory.EXTERNAL,
  ReservationCategory.MANAGEMENT,
  ReservationCategory.AFTERPARTY,
  ReservationCategory.OTHER,
] as const;

const ROOM_OPTIONS = [
  { value: "405", label: "405호" },
  { value: "407-1", label: "407-1호" },
  { value: "410", label: "410호" },
  { value: "외부", label: "외부" },
] as const;
type RoomOption = typeof ROOM_OPTIONS[number]["value"];

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

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

/* ── Props ────────────────────────────────────── */

type Props = {
  pageTitle?: string;
  pageSubtitle?: string;
  isManager?: boolean; // 추가
};

/* ── 컴포넌트 ─────────────────────────────────── */

export default function RoomReservationContainer({
  pageTitle = "동아리실 일정 관리",
  pageSubtitle = "일정 및 대관 내역을 등록할 수 있습니다.",
  isManager = false,
}: Props) {
  const queryClient = useQueryClient();

  /* 캘린더 주간 오프셋 */
  const [weekOffset, setWeekOffset] = useState(0);

  /* 공통 필드 */
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState<RoomOption>("405");

  /* 대분류 */
  const [scheduleType, setScheduleType] = useState<ScheduleType>("ADMIN");

  /* 운영진 전용 */
  const [adminCategory, setAdminCategory] = useState<string>(ReservationCategory.CLUB);
  const [expoint, setExpoint] = useState<number>(0);
  const [generateCheckCode, setGenerateCheckCode] = useState(false);

  /* 세미나 전용 */
  const [isSummerSeason, setIsSummerSeason] = useState(false);
  const [isSpeakAfter, setIsSpeakAfter] = useState(false);

  /* ── 주간 캘린더 날짜 계산 ── */
  const weekDays = useMemo(() => {
    const startOfWeek = dayjs().add(weekOffset, "week").startOf("week").add(1, "day");
    return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    return `${weekDays[0].format("M/D")} ~ ${weekDays[6].format("M/D")}`;
  }, [weekDays]);

  const today = dayjs().format("YYYY-MM-DD");

  /* ── 전체 일정 조회 ── */
  const { data: allSchedules = [], isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => RoomReservationApi.getSchedules(),
  });

  const getSchedulesForDay = useCallback((date: dayjs.Dayjs): Schedule[] => {
    const dateStr = date.format("YYYY-MM-DD");
    return allSchedules
      .filter((s) => dayjs(s.scheduledAt).format("YYYY-MM-DD") === dateStr)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [allSchedules]);

  /* ── 유효성 ── */
  const canSubmit = title.trim() && selectedDate && startTime && endTime && location;

  /* ── 뮤테이션 ── */
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
    onSuccess, onError,
  });

  const adminMutation = useMutation({
    mutationFn: ({ data, gc }: { data: CreateAdminScheduleRequest; gc: boolean }) =>
      RoomReservationApi.createAdminSchedule(data, gc),
    onSuccess, onError,
  });

  const seminarMutation = useMutation({
    mutationFn: ({ data, gc }: { data: CreateSeminarScheduleRequest; gc: boolean }) =>
      RoomReservationApi.createSeminarSchedule(data, gc),
    onSuccess, onError,
  });

  const isSubmitting = groupMutation.isPending || adminMutation.isPending || seminarMutation.isPending;

  /* ── 제출 ── */
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const scheduledAt = dayjs(`${selectedDate} ${startTime}`, "YYYY-MM-DD HH:mm").toISOString();
    const endAt = dayjs(`${selectedDate} ${endTime}`, "YYYY-MM-DD HH:mm").toISOString();

    if (scheduleType === "GROUP_ACTIVITY") {
      groupMutation.mutate({
        title: title.trim(),
        scheduledAt, endAt,
        category: ReservationCategory.GROUP_ACTIVITY,
        location: location as "405" | "407-1" | "410",
      });
    } else if (scheduleType === "ADMIN") {
      adminMutation.mutate({
        data: {
          title: title.trim(),
          scheduledAt, endAt,
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
          scheduledAt, endAt,
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

  /* ── 렌더 ── */
  return (
    <>
      <div className={styles["page-header"]}>
        <h2 className={styles["page-title"]}>{pageTitle}</h2>
        <p className={styles["page-subtitle"]}>{pageSubtitle}</p>
      </div>

      <div className={styles["container"]}>
        {/* 좌측: 주간 캘린더 */}
        <div className={styles["left-panel"]}>
          <div className={styles["calendar-header"]}>
            <h3 className={styles["calendar-title"]}>📅 주간 일정</h3>
            <div className={styles["calendar-nav"]}>
              <button type="button" onClick={() => setWeekOffset((v) => v - 1)}>◀</button>
              <span>{weekLabel}</span>
              <button type="button" onClick={() => setWeekOffset((v) => v + 1)}>▶</button>
            </div>
          </div>

          {isLoading ? (
            <div className={styles["loading-box"]}>일정을 불러오는 중...</div>
          ) : (
            <div className={styles["calendar-grid"]}>
              {weekDays.map((date, idx) => {
                const dateStr = date.format("YYYY-MM-DD");
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const daySchedules = getSchedulesForDay(date);

                let colClass = styles["calendar-day-col"];
                if (isToday) colClass += ` ${styles["today-highlight"]}`;

                return (
                  <div
                    key={dateStr}
                    className={colClass}
                    onClick={() => setSelectedDate(dateStr)}
                    style={isSelected ? { borderColor: "#0077b6", borderWidth: 2 } : undefined}
                  >
                    <div className={styles["day-header"]}>
                      {date.format("D")}
                      <span className={styles["day-label"]}>{DAY_LABELS[idx]}</span>
                    </div>
                    <div className={styles["day-events-list"]}>
                      {daySchedules.length === 0 ? (
                        <div className={styles["no-event"]}>-</div>
                      ) : (
                        daySchedules.map((s) => {
                          const st = dayjs(s.scheduledAt).format("HH:mm");
                          const et = dayjs(s.endAt).format("HH:mm");
                          return (
                            <div
                              key={s.id}
                              className={styles["event-block"]}
                              data-category={s.category}
                              style={{ backgroundColor: getReservationCategoryColor(s.category) }}
                              title={`${s.title} (${st}~${et})${s.location ? ` · ${s.location}` : ""}`}
                            >
                              <div className={styles["event-time"]}>{st}~{et}</div>
                              <div className={styles["event-name"]}>{s.title}</div>
                              {s.location && (
                                <div className={styles["event-loc"]}>{s.location}</div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 우측: 등록 폼 */}
        <div className={styles["right-panel"]}>
          <div className={styles["panel-title"]}>📝 일정 등록</div>

          {/* 제목 */}
          <div className={styles["form-field"]}>
            <label className={styles["form-field__label"]}>
              제목 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
            />
          </div>

          {/* 시간 */}
          <div className={styles["form-field"]}>
            <label className={styles["form-field__label"]}>
              시간 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className={styles["time-range-row"]}>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                {TIME_OPTIONS.map((t) => <option key={`s-${t}`} value={t}>{t}</option>)}
              </select>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                {TIME_OPTIONS.map((t) => <option key={`e-${t}`} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 호실 */}
          <div className={styles["form-field"]}>
            <label className={styles["form-field__label"]}>
              호실 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as RoomOption)}
            >
              {ROOM_OPTIONS
                .filter((opt) => scheduleType === "GROUP_ACTIVITY" ? opt.value !== "외부" : true)
                .map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
          </div>

          {/* 일정 종류 */}
          <div className={styles["form-field"]}>
            <label className={styles["form-field__label"]}>
              일정 종류 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={scheduleType}
              onChange={(e) => {
                const t = e.target.value as ScheduleType;
                setScheduleType(t);
                if (t === "GROUP_ACTIVITY" && location === "외부") setLocation("405");
              }}
            >
              {(["GROUP_ACTIVITY", "ADMIN", "SEMINAR"] as ScheduleType[]).map((t) => (
                <option key={t} value={t}>{SCHEDULE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* 운영진 이상 확장 필드 */}
          {(scheduleType === "ADMIN" || scheduleType === "SEMINAR") && (
            <>
              <div className={styles["form-field"]}>
                <label className={styles["form-field__label"]}>세부 카테고리</label>
                <select
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                >
                  {ADMIN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{ReservationCategoryLabel[cat]}</option>
                  ))}
                </select>
              </div>

              <div className={styles["form-field"]}>
                <label className={styles["form-field__label"]}>경험치 (ExPoint)</label>
                <input
                  type="number"
                  value={expoint}
                  min={0}
                  onChange={(e) => setExpoint(Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div className={styles["form-field"]}>
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

          {/* 세미나 전용 추가 필드 */}
          {scheduleType === "SEMINAR" && (
            <>
              <div className={styles["form-field"]}>
                <label className={styles["toggle-label"]}>
                  <input
                    type="checkbox"
                    className={styles["toggle-checkbox"]}
                    checked={isSummerSeason}
                    onChange={(e) => setIsSummerSeason(e.target.checked)}
                  />
                  계절학기 세미나
                </label>
              </div>
              <div className={styles["form-field"]}>
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
            </>
          )}

          {/* ── 제출 버튼 및 권한 체크 ── */}
          {isManager ? (
            <button
              type="button"
              className={styles["submit-btn"]}
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "등록 중..." : "일정 등록"}
            </button>
          ) : (
            <div className={styles["permission-message"]}>
              일정 등록은 운영진만 가능합니다.
            </div>
          )}

        </div>
      </div>
    </>
  );
}
