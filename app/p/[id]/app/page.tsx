import { AppPage } from "@/components/project/Pages";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  return <AppPage page={page ? Number(page) : undefined} />;
}
