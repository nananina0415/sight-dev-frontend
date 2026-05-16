import RoomInfoContainer from "../../../features/manage/RoomInfo/RoomInfoContainer";
import SightLayout from "../../../layouts/SightLayout";
import Location from "../../../components/Location";

import styles from "./style.module.css";

export default function RoomInfoPage() {
  return (
    <SightLayout>
      <Location label="동아리실 소개" />
      <main className={styles.content}>
        <RoomInfoContainer />
      </main>
    </SightLayout>
  );
}
