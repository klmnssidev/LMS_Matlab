export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div><h1 className="text-3xl font-bold">Course #{id}</h1></div>;
}
