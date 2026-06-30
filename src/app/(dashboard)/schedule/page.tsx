import { authorizePage } from "@/permissions";
import { Schedule } from "@/features/schedule/schedule";

export default async function SchedulePage() {
  await authorizePage("read", "MySchedule");
  return <Schedule />;
}
