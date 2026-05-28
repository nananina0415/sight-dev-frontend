import RoomReservationContainer from "../../../features/manage/RoomReservation/RoomReservationContainer";
import SightLayout from "../../../layouts/SightLayout";
import Location from "../../../components/Location";

import styles from "./style.module.css";

export default function RoomReservationPage() {
  return (
    <SightLayout>
      <Location label="일정 등록" />
      <main className={styles.content}>
        <RoomReservationContainer />
      </main>
    </SightLayout>
  );
}
