import { useSearchParams } from "react-router-dom";
import SimpleLogoLayout from "../../../layouts/SimpleLogoLayout";
import AttendanceForm from "../../../features/attendance/AttendanceForm";
import AttendanceResult from "../../../features/attendance/AttendanceResult";

export default function AttendancePage() {
  const [searchParams] = useSearchParams();
  const password = searchParams.get("password");

  return (
    <SimpleLogoLayout>
      {password !== null ? (
        <AttendanceResult code={password} />
      ) : (
        <AttendanceForm />
      )}
    </SimpleLogoLayout>
  );
}
