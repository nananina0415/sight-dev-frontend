import { useState, useMemo } from "react";
import dayjs from "dayjs";
import styles from "./ReservationForm.module.css";

type Props = {
  onSubmit: (data: {
    category: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
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

type ReservationOption = "동아리" | "학사" | "외부" | "405" | "410";

const RESERVATION_CHIPS: { value: ReservationOption; label: string }[] = [
  { value: "동아리", label: "동아리" },
  { value: "학사", label: "학사" },
  { value: "외부", label: "외부" },
  { value: "405", label: "405호" },
  { value: "410", label: "410호" },
];

/** 단일 선택값 → API 제출용 category / roomId 매핑 */
function mapOptionToSubmit(option: ReservationOption): {
  category: string;
  roomId: string;
} {
  switch (option) {
    case "동아리":
      return { category: "CLUB", roomId: "405" };
    case "학사":
      return { category: "ACADEMIC", roomId: "405" };
    case "외부":
      return { category: "EXTERNAL", roomId: "405" };
    case "405":
      return { category: "CLUB", roomId: "405" };
    case "410":
      return { category: "CLUB", roomId: "410" };
  }
}

export default function ReservationForm({
  onSubmit,
  isSubmitting,
}: Props) {
  const [selectedOption, setSelectedOption] =
    useState<ReservationOption>("동아리");

  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD"),
  );
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [title, setTitle] = useState("");
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
    const totalDays = startDay + endOfMonth.date() > 35 ? 42 : 35;
    for (let i = 0; i < totalDays; i++) {
      days.push(current);
      current = current.add(1, "day");
    }
    return days;
  }, [calendarMonth]);

  const today = dayjs().format("YYYY-MM-DD");

  const canSubmit =
    selectedOption &&
    selectedDate &&
    startTime &&
    endTime &&
    title.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    const { category, roomId } = mapOptionToSubmit(selectedOption);

    onSubmit({
      category,
      roomId,
      date: selectedDate,
      startTime,
      endTime,
      title: title.trim(),
    });
  };

  return (
    <div className={styles["reservation-form"]}>
      <div className={styles["reservation-form__title"]}>📝 일정 등록</div>

      <div className={styles["form-body"]}>
        {/* 좌측 Column: 날짜 선택 달력 */}
        <div className={styles["left-col"]}>
          <div className={styles["form-field"]}>
            <label className={styles["form-field__label"]}>
              날짜 선택
              <span className={styles["form-field__required"]}>*</span>
            </label>
            <div className={styles["calendar"]}>
              <div className={styles["calendar__header"]}>
                <button
                  type="button"
                  className={styles["calendar__nav-btn"]}
                  onClick={() => setCalendarMonth((m) => m.subtract(1, "month"))}
                >
                  ◀
                </button>
                <span className={styles["calendar__month-label"]}>
                  {calendarMonth.format("YYYY년 M월")}
                </span>
                <button
                  type="button"
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

        {/* 우측 Column: 예약 목적 및 기타 정보 입력 */}
        <div className={styles["right-col"]}>
          <div className={styles["form-field"]}>
            <label className={styles["form-field__label"]}>
              예약 목적 및 호실 선택
              <span className={styles["form-field__required"]}>*</span>
            </label>
            <div
              className={styles["chip-group"]}
              role="radiogroup"
              aria-label="예약 목적 및 호실 선택"
            >
              {RESERVATION_CHIPS.map((chip) => {
                const isSelected = selectedOption === chip.value;
                return (
                  <button
                    key={chip.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`${styles["chip"]} ${
                      isSelected ? styles["chip--selected"] : ""
                    }`}
                    onClick={() => setSelectedOption(chip.value)}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 시간 선택 */}
          <div className={styles["form-field"]}>
            <label className={styles["form-field__label"]}>
              시간 선택
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

          {/* 제목 */}
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

          {/* 제출 */}
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
  );
}
