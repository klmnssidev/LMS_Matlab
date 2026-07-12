import { notFound } from "next/navigation";
import { authorizePage } from "@/permissions";
import { CourseForm } from "@/features/courses/components/course-form";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("update", "Course");
  const raw = (await params).id.trim();
  if (!/^\d+$/.test(raw) || raw === "0") notFound();
  const courseId = Number(raw);
  if (!Number.isSafeInteger(courseId) || courseId < 1) notFound();
  return <CourseForm key={courseId} initial={{ course_id: courseId }} />;
}
