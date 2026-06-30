import { authorizePage } from "@/permissions";
import { CourseOfferingForm } from "@/features/course-offerings/components/course-offering-form";

export default async function NewCourseOfferingPage() {
  await authorizePage("create", "CourseOffering");
  return <CourseOfferingForm />;
}
