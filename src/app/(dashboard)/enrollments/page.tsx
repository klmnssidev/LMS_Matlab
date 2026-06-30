import { authorizePage } from "@/permissions";
import { EnrollmentList } from "@/features/enrollments/enrollment-list";

export default async function EnrollmentsPage() {
  await authorizePage("read", "Enrollment");
  return <EnrollmentList />;
}
