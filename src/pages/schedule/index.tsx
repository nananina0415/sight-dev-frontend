import { useState } from "react";
import SightLayout from "../../layouts/SightLayout";
import Location from "../../components/Location";
import ReservationForm from "../../features/manage/RoomReservation/ReservationForm";

export default function SchedulePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: {
    category: string;
    roomId: string;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
  }) => {
    setIsSubmitting(true);
    console.log("submit", data);
    setIsSubmitting(false);
  };

  return (
    <SightLayout>
      <Location label="일정 예약" />
      <ReservationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </SightLayout>
  );
}
