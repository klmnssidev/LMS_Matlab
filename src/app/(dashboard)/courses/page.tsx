import { authorizePage } from "@/permissions";
import { CourseList } from "@/features/courses/course-list";

export default async function CoursesPage() {
  await authorizePage("read", "Course");
  return <CourseList />;
}
