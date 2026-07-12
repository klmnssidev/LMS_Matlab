import { authorizePage } from "@/permissions";
import { CourseForm } from "@/features/courses/components/course-form";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("update", "Course");
  const { id } = await params;
  return <CourseForm key={id} initial={{ course_id: Number(id) }} />;
}
