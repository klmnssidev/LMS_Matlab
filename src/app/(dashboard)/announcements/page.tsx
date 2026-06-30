import { authorizePage } from "@/permissions";
import { Announcements } from "@/features/announcements/announcements";

export default async function AnnouncementsPage() {
  await authorizePage("read", "Announcement");
  return <Announcements />;
}
