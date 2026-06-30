import { authorizePage } from "@/permissions";
import { CourseDetail } from "@/features/courses/course-detail";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("read", "Course");
  const { id } = await params;
  return <CourseDetail id={Number(id)} />;
}
