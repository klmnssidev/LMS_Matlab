import { authorizePage } from "@/permissions";
import { CourseOfferingForm } from "@/features/course-offerings/components/course-offering-form";

export default async function EditCourseOfferingPage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("update", "CourseOffering");
  const { id } = await params;
  return <CourseOfferingForm key={id} initial={{ offering_id: Number(id) }} />;
}
