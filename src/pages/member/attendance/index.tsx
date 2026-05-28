import { useParams, useSearchParams } from "react-router-dom";
import SimpleLogoLayout from "../../../layouts/SimpleLogoLayout";
import AttendanceForm from "../../../features/attendance/AttendanceForm";
import AttendanceResult from "../../../features/attendance/AttendanceResult";

export default function AttendancePage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  if (!scheduleId) return null;

  return (
    <SimpleLogoLayout>
      {code !== null ? (
        <AttendanceResult scheduleId={scheduleId} code={code} />
      ) : (
        <AttendanceForm scheduleId={scheduleId} />
      )}
    </SimpleLogoLayout>
  );
}
