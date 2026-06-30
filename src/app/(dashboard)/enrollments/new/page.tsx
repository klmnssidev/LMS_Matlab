import { authorizePage } from "@/permissions";
import { EnrollmentForm } from "@/features/enrollments/components/enrollment-form";

export default async function NewEnrollmentPage() {
  await authorizePage("create", "Enrollment");
  return <EnrollmentForm />;
}
