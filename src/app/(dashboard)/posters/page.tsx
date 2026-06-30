import { authorizePage } from "@/permissions";
import { PosterGallery } from "@/features/posters/poster-gallery";

export default async function PostersPage() {
  await authorizePage("read", "Poster");
  return <PosterGallery />;
}
