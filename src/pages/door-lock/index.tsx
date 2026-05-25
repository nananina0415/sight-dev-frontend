import { useEffect, useState } from "react";
import DoorLockContainer from "../../features/door-lock/DoorLockContainer";
import "../../features/door-lock/doorLockDark.css";
import styles from "./style.module.css";

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={styles.clock}>
      {`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${"일월화수목금토"[now.getDay()]}요일 ${now.getHours()}시 ${String(now.getMinutes()).padStart(2, "0")}분`}
    </span>
  );
}

export default function DoorLockPage() {
  return (
    <div className={`${styles.page} door-lock-dark`}>
      <header className={styles.header}>
        <img
          src="/logo/logo-dark.png"
          alt="KHLUG Logo"
          className={styles.logo}
        />
        <Clock />
      </header>
      <main className={styles.main}>
        <DoorLockContainer />
      </main>
    </div>
  );
}
