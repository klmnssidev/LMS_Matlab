import { authorizePage } from "@/permissions";
import { Notifications } from "@/features/notifications/notifications";

export default async function NotificationsPage() {
  await authorizePage("read", "MyNotifications");
  return <Notifications />;
}
