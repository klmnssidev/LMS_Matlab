import { authorizePage } from "@/permissions";
import { MyAttendance } from "@/features/attendance/my-attendance";

export default async function MyAttendancePage() {
  await authorizePage("read", "MyAttendance");
  return <MyAttendance />;
}
