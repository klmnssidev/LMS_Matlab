export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div><h1 className="text-3xl font-bold">Teacher #{id}</h1></div>;
}
