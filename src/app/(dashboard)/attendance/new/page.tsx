import { authorizePage } from "@/permissions";
import { BulkAttendanceForm } from "@/features/attendance/components/attendance-form";

export default async function NewAttendancePage() {
  await authorizePage("create", "Attendance");
  return <BulkAttendanceForm />;
}
