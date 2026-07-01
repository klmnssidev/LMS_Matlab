import { authorizePage } from "@/permissions";
import { Transcript } from "@/features/transcript/transcript";

export default async function TranscriptPage() {
  await authorizePage("read", "MyGrades");
  return <Transcript />;
}
