import { CourseOfferingForm } from "@/features/course-offerings/components/course-offering-form";

export default async function EditCourseOfferingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseOfferingForm key={id} initial={{ offering_id: Number(id) }} />;
}
