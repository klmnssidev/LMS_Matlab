import { authorizePage } from "@/permissions";
import { CourseForm } from "@/features/courses/components/course-form";

export default async function NewCoursePage() {
  await authorizePage("create", "Course");
  return <CourseForm />;
}
