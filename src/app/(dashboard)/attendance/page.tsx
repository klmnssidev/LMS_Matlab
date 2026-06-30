import { authorizePage } from "@/permissions";
import { AttendanceList } from "@/features/attendance/attendance-list";

export default async function AttendancePage() {
  await authorizePage("read", "Attendance");
  return <AttendanceList />;
}
