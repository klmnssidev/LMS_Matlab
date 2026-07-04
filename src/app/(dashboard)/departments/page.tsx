import { authorizePage } from "@/permissions";
import { DepartmentList } from "@/features/departments/components/department-list";

export default async function DepartmentsPage() {
  await authorizePage("read", "Department");
  return <DepartmentList />;
}
