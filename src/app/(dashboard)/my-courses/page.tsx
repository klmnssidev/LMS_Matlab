import { authorizePage } from "@/permissions";
import { MyCourses } from "@/features/courses/my-courses";

export default async function MyCoursesPage() {
  await authorizePage("read", "MyEnrollments");
  return <MyCourses />;
}
