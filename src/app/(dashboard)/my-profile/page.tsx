import { authorizePage } from "@/permissions";
import { MyProfile } from "@/features/profile/my-profile";

export default async function MyProfilePage() {
  await authorizePage("read", "MyProfile");
  return <MyProfile />;
}
