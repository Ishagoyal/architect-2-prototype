import { VersionsPage } from "@/components/project/Pages";

export default async function Page({ searchParams }: { searchParams: Promise<{ v?: string; tab?: string }> }) {
  const { v, tab } = await searchParams;
  return <VersionsPage selected={v ? Number(v) : undefined} tab={tab === "files" ? "files" : undefined} />;
}
