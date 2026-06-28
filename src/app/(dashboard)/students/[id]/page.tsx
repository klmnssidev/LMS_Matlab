export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div><h1 className="text-3xl font-bold">Student #{id}</h1></div>;
}
