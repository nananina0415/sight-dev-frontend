import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getCategoryColor } from "./categoryColors";
import { SchedulePublicApi, type GetScheduleResponseDto } from "../../../api/public/schedule";
import type { ScheduleItem } from "./WeeklySchedule";
import styles from "./ScheduleDetailPopup.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  CLUB: "동아리",
  ACADEMIC: "학사",
  EXTERNAL: "외부",
  MANAGEMENT: "운영",
  GROUP_ACTIVITY: "그룹활동",
  SEMINAR: "세미나",
  AFTERPARTY: "뒷풀이",
  OTHER: "기타",
};

type Props = {
  schedule: ScheduleItem;
  onClose: () => void;
};

export default function ScheduleDetailPopup({ schedule, onClose }: Props) {
  const color = getCategoryColor(schedule.category);
  const start = dayjs(schedule.scheduledAt);
  const end = dayjs(schedule.endAt);

  const [detail, setDetail] = useState<GetScheduleResponseDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    setLoadingDetail(true);
    SchedulePublicApi.getSchedule(schedule.id)
      .then(setDetail)
      .finally(() => setLoadingDetail(false));
  }, [schedule.id]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.colorBar} style={{ backgroundColor: color }} />
        <div className={styles.body}>
          <div className={styles.header}>
            <span className={styles.badge} style={{ backgroundColor: color + "22", color, borderColor: color + "66" }}>
              {CATEGORY_LABEL[schedule.category] ?? schedule.category}
            </span>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <div className={styles.title}>{schedule.title}</div>
          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.rowLabel}>날짜</span>
              <span className={styles.rowValue}>{start.format("YYYY년 M월 D일")}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>시간</span>
              <span className={styles.rowValue}>{start.format("HH:mm")} ~ {end.format("HH:mm")}</span>
            </div>
            {schedule.location && (
              <div className={styles.row}>
                <span className={styles.rowLabel}>장소</span>
                <span className={styles.rowValue}>{schedule.location}</span>
              </div>
            )}
            {loadingDetail ? (
              <div className={styles.detailLoading}>상세 정보 불러오는 중...</div>
            ) : detail && (
              <>
                <div className={styles.divider} />
                <div className={styles.row}>
                  <span className={styles.rowLabel}>경험치</span>
                  <span className={styles.rowValue}>{detail.expoint > 0 ? `+${detail.expoint} XP` : "없음"}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>작성자</span>
                  <span className={styles.rowValue}>{detail.authorName ?? `#${detail.author}`}</span>
                </div>
                {detail.groupTitle && (
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>그룹</span>
                    <span className={styles.rowValue}>{detail.groupTitle}</span>
                  </div>
                )}
                {detail.checkCode && (
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>출석 코드</span>
                    <span className={`${styles.rowValue} ${styles.checkCode}`}>{detail.checkCode}</span>
                  </div>
                )}
                {detail.isSummerSeason !== undefined && (
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>시즌</span>
                    <span className={styles.rowValue}>{detail.isSummerSeason ? "여름" : "겨울"} 빅세미나</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
