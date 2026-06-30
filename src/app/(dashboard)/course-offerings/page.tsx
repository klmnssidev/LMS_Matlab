import { authorizePage } from "@/permissions";
import { CourseOfferingList } from "@/features/course-offerings/components/course-offering-list";

export default async function CourseOfferingsPage() {
  await authorizePage("read", "CourseOffering");
  return <CourseOfferingList />;
}
