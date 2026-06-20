import { useState } from "react";
import { useIsManager } from "../../../hooks/user/useIsManager";
import { useMyGroups } from "../../../hooks/group/useMyGroups";
import styles from "./ScheduleForm.module.css";

const MANAGER_CATEGORIES = [
  { code: "CLUB", label: "동아리" },
  { code: "ACADEMIC", label: "학사" },
  { code: "EXTERNAL", label: "외부" },
  { code: "MANAGEMENT", label: "운영" },
  { code: "GROUP_ACTIVITY", label: "그룹활동" },
  { code: "SEMINAR", label: "세미나" },
  { code: "BIG_SEMINAR", label: "총회" },
  { code: "AFTERPARTY", label: "뒷풀이" },
  { code: "OTHER", label: "기타" },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const EXPOINT_DEFAULTS: Record<string, string> = {
  CLUB: "60",
  MANAGEMENT: "60",
  EXTERNAL: "60",
  SEMINAR: "60",
  BIG_SEMINAR: "80",
  AFTERPARTY: "40",
};

type Props = {
  anchorDate: string;
  onDateChange: (date: string) => void;
  onClose: () => void;
};

export default function ScheduleForm({
  anchorDate,
  onDateChange,
  onClose,
}: Props) {
  const { isManager } = useIsManager();
  const { data: myGroups = [] } = useMyGroups();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("CLUB");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [location, setLocation] = useState("405");
  const [customLocation, setCustomLocation] = useState("");
  const [groupId, setGroupId] = useState("");
  const [expoint, setExpoint] = useState("");
  const [generateCheckCode, setGenerateCheckCode] = useState(true);
  const [isSummerSeason, setIsSummerSeason] = useState("");
  const [isSpeakAfter, setIsSpeakAfter] = useState("");

  const effectiveCategory = isManager ? category : "GROUP_ACTIVITY";
  const isOther = location === "기타";
  const isBigSeminar = effectiveCategory === "BIG_SEMINAR";
  const isGroupActivity = effectiveCategory === "GROUP_ACTIVITY";

  const expointPlaceholder = EXPOINT_DEFAULTS[effectiveCategory] ?? "";

  const canSubmit =
    title.trim() !== "" &&
    (!isOther || customLocation.trim() !== "") &&
    (!isGroupActivity || groupId !== "") &&
    (!isBigSeminar || (isSummerSeason !== "" && isSpeakAfter !== ""));

  const handleSubmit = () => {
    if (!canSubmit) return;
    const payload: Record<string, unknown> = {
      title,
      category: effectiveCategory,
      date: anchorDate,
      startTime,
      endTime,
      location: isOther ? customLocation : location,
    };
    if (isGroupActivity) {
      payload.groupId = Number(groupId);
    }
    if (isManager && !isGroupActivity) {
      payload.expoint =
        expoint !== "" ? Number(expoint) : Number(expointPlaceholder || 0);
      payload.generateCheckCode = generateCheckCode;
      if (isBigSeminar) {
        payload.isSummerSeason = isSummerSeason === "true";
        payload.isSpeakAfter = isSpeakAfter === "true";
      }
    }
    const backendCategory = isBigSeminar ? "SEMINAR" : effectiveCategory;
    payload.category = backendCategory;
    const endpoint = isGroupActivity
      ? "POST /schedules/group-activity"
      : isBigSeminar
        ? "POST /schedules/big-seminar"
        : "POST /schedules";
    // TODO: API 연동
    console.log(endpoint, payload);
    onClose();
  };

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        {/* 제목 */}
        <div className={`${styles.field} ${styles.fieldTitle}`}>
          <label className={styles.label}>제목</label>
          <input
            className={styles.input}
            type="text"
            placeholder="일정 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 카테고리 */}
        <div className={styles.field}>
          <label className={styles.label}>카테고리</label>
          {isManager ? (
            <select
              className={styles.select}
              value={category}
              onChange={(e) => {
                const next = e.target.value;
                setCategory(next);
                setGenerateCheckCode(next in EXPOINT_DEFAULTS);
                if (next !== "BIG_SEMINAR") {
                  setIsSummerSeason("");
                  setIsSpeakAfter("");
                }
              }}
            >
              {MANAGER_CATEGORIES.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          ) : (
            <div className={styles.fixedValue}>그룹활동</div>
          )}
        </div>

        {/* 그룹 선택 (GROUP_ACTIVITY) */}
        {isGroupActivity && (
          <div className={styles.field}>
            <label className={styles.label}>
              그룹 <span className={styles.required}>*</span>
            </label>
            <select
              className={styles.select}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">그룹 선택</option>
              {myGroups.map((g) => (
                <option key={g.id} value={String(g.id)}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 날짜 */}
        <div className={styles.field}>
          <label className={styles.label}>날짜</label>
          <input
            className={styles.input}
            type="date"
            value={anchorDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        {/* 시작 시간 */}
        <div className={styles.field}>
          <label className={styles.label}>시작</label>
          <select
            className={styles.select}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 종료 시간 */}
        <div className={styles.field}>
          <label className={styles.label}>종료</label>
          <select
            className={styles.select}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 장소 */}
        <div className={styles.field}>
          <label className={styles.label}>장소</label>
          <select
            className={styles.select}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="405">405호</option>
            <option value="406">406호</option>
            <option value="410">410호</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 기타 장소 입력 */}
        {isOther && (
          <div className={styles.field}>
            <label className={styles.label}>장소 입력</label>
            <input
              className={styles.input}
              type="text"
              placeholder="장소를 입력하세요"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
            />
          </div>
        )}

        {/* 총회 전용: 학기 / 말하기 순서 */}
        {isManager && isBigSeminar && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>학기</label>
              <select
                className={styles.select}
                value={isSummerSeason}
                onChange={(e) => setIsSummerSeason(e.target.value)}
              >
                <option value="">선택</option>
                <option value="true">1학기(여름)</option>
                <option value="false">2학기(겨울)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>발표</label>
              <select
                className={styles.select}
                value={isSpeakAfter}
                onChange={(e) => setIsSpeakAfter(e.target.value)}
              >
                <option value="">선택</option>
                <option value="false">먼저말하기</option>
                <option value="true">나중에말하기</option>
              </select>
            </div>
          </>
        )}

        {/* 경험치 (운영진, GROUP_ACTIVITY 제외) */}
        {isManager && !isGroupActivity && (
          <div className={styles.field}>
            <label className={styles.label}>경험치</label>
            <input
              className={`${styles.input} ${styles.inputNarrow}`}
              type="number"
              min="0"
              placeholder={expointPlaceholder}
              value={expoint}
              onChange={(e) => setExpoint(e.target.value)}
            />
          </div>
        )}

        {/* 출석 코드 생성 (운영진, GROUP_ACTIVITY 제외) */}
        {isManager && !isGroupActivity && (
          <div className={`${styles.field} ${styles.fieldCheckbox}`}>
            <label className={styles.label}>출석 체크</label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={generateCheckCode}
                onChange={(e) => setGenerateCheckCode(e.target.checked)}
              />
              <span className={styles.toggleLabel}>
                {generateCheckCode ? "출석 체크 함" : "출석 체크 안 함"}
              </span>
            </label>
          </div>
        )}

        {/* 버튼 */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.submitBtn}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            등록
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
