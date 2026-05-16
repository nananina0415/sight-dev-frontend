import RoomReservationContainer from "../../../features/manage/RoomReservation/RoomReservationContainer";
import SightLayout from "../../../layouts/SightLayout";
import Location from "../../../components/Location";

import styles from "./style.module.css";

export default function AttendancePage() {
  return (
    <SightLayout>
      <Location label="출석 체크 일정 관리" />
      <main className={styles.content}>
        <RoomReservationContainer
          pageTitle="출석 체크 일정 관리"
          pageSubtitle="운영진용 동아리실 일정 등록 및 주간 일정 확인 페이지입니다."
        />
      </main>
    </SightLayout>
  );
}
