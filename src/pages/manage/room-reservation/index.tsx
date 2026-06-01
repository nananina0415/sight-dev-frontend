import RoomReservationContainer from "../../../features/manage/RoomReservation/RoomReservationContainer";
import SightLayout from "../../../layouts/SightLayout";
import Location from "../../../components/Location";

import styles from "./style.module.css";
import { useIsManager } from "../../../hooks/user/useIsManager";

export default function RoomReservationPage() {
  const { isManager } = useIsManager();

  return (
    <SightLayout>
      <Location label="일정 등록" />
      <main className={styles.content}>
        {/* 여기서 isManager를 전달해서 하나만 렌더링하도록 수정 */}
        <RoomReservationContainer isManager={isManager} />
      </main>
    </SightLayout>
  );
}