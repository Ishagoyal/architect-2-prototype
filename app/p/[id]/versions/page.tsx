import { VersionsPage } from "@/components/project/Pages";

export default async function Page({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams;
  return <VersionsPage selected={v ? Number(v) : undefined} />;
}
