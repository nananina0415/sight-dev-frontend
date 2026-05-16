import { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  ReservationCategoryLabel,
  ReservationCategoryColor,
  ReservationCategory,
} from "./types";
import styles from "./ReservationForm.module.css";

type Props = {
  onSubmit: (data: {
    category: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    description: string;
  }) => void;
  isSubmitting: boolean;
};

/** 30분 단위 시간 옵션 생성 */
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      options.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      );
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();
const CATEGORIES = [
  ReservationCategory.CLUB,
  ReservationCategory.ACADEMIC,
  ReservationCategory.EXTERNAL,
  ReservationCategory.ROOM_405,
  ReservationCategory.ROOM_410,
] as const;

export default function ReservationForm({
  onSubmit,
  isSubmitting,
}: Props) {
  const [category, setCategory] = useState<string>(ReservationCategory.CLUB);
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(dayjs().startOf("month"));

  // 캘린더 데이터 계산
  const calendarDays = useMemo(() => {
    const startOfMonth = calendarMonth.startOf("month");
    const endOfMonth = calendarMonth.endOf("month");

    // 월요일 기준 시작
    let startDay = startOfMonth.day() - 1;
    if (startDay < 0) startDay = 6;
    const calendarStart = startOfMonth.subtract(startDay, "day");

    const days: dayjs.Dayjs[] = [];
    let current = calendarStart;
    // 최소 35일 (5주) 또는 필요 시 42일 (6주)
    const totalDays =
      startDay + endOfMonth.date() > 35 ? 42 : 35;
    for (let i = 0; i < totalDays; i++) {
      days.push(current);
      current = current.add(1, "day");
    }
    return days;
  }, [calendarMonth]);

  const today = dayjs().format("YYYY-MM-DD");

  const canSubmit =
    category &&
    selectedDate &&
    startTime &&
    endTime &&
    title.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      category,
      date: selectedDate,
      startTime,
      endTime,
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className={styles["reservation-form"]}>
      <div className={styles["reservation-form__title"]}>📝 일정 등록</div>

      {/* 1. 분류 선택 */}
      <div className={styles["form-field"]}>
        <label className={styles["form-field__label"]}>
          분류
          <span className={styles["form-field__required"]}>*</span>
        </label>
        <div className={styles["category-group"]}>
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className={`${styles["category-label"]} ${category === cat ? styles["category-label--selected"] : ""}`}
              style={
                category === cat
                  ? { backgroundColor: ReservationCategoryColor[cat] }
                  : undefined
              }
            >
              <input
                type="radio"
                name="category"
                value={cat}
                checked={category === cat}
                onChange={() => setCategory(cat)}
                className={styles["category-radio"]}
              />
              {ReservationCategoryLabel[cat]}
            </label>
          ))}
        </div>
      </div>

      {/* 2. 날짜 선택 — 인라인 캘린더 */}
      <div className={styles["form-field"]}>
        <label className={styles["form-field__label"]}>
          날짜
          <span className={styles["form-field__required"]}>*</span>
        </label>
        <div className={styles["calendar"]}>
          <div className={styles["calendar__header"]}>
            <button
              className={styles["calendar__nav-btn"]}
              onClick={() =>
                setCalendarMonth((m) => m.subtract(1, "month"))
              }
            >
              ◀
            </button>
            <span className={styles["calendar__month-label"]}>
              {calendarMonth.format("YYYY년 M월")}
            </span>
            <button
              className={styles["calendar__nav-btn"]}
              onClick={() => setCalendarMonth((m) => m.add(1, "month"))}
            >
              ▶
            </button>
          </div>
          <div className={styles["calendar__weekdays"]}>
            {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => {
              let cls = styles["calendar__weekday"];
              if (i === 5) cls += ` ${styles["calendar__weekday--sat"]}`;
              if (i === 6) cls += ` ${styles["calendar__weekday--sun"]}`;
              return (
                <div key={d} className={cls}>
                  {d}
                </div>
              );
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

      {/* 3. 시작 및 끝 시간 */}
      <div className={styles["form-field"]}>
        <label className={styles["form-field__label"]}>
          시간
          <span className={styles["form-field__required"]}>*</span>
        </label>
        <div className={styles["time-row"]}>
          <select
            className={styles["time-select"]}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={`start-${t}`} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span className={styles["time-separator"]}>~</span>
          <select
            className={styles["time-select"]}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={`end-${t}`} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. 제목 */}
      <div className={styles["form-field"]}>
        <label className={styles["form-field__label"]}>
          제목
          <span className={styles["form-field__required"]}>*</span>
        </label>
        <input
          type="text"
          className={styles["text-input"]}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목을 입력하세요"
        />
      </div>

      {/* 5. 설명 */}
      <div className={styles["form-field"]}>
        <label className={styles["form-field__label"]}>설명</label>
        <textarea
          className={styles["textarea-input"]}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="일정 설명 (선택)"
        />
      </div>

      {/* 제출 */}
      <button
        className={styles["submit-btn"]}
        disabled={!canSubmit || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? "등록 중..." : "일정 등록"}
      </button>
    </div>
  );
}
