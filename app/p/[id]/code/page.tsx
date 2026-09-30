import { CodePage } from "@/components/project/Pages";

export default async function Page({ searchParams }: { searchParams: Promise<{ file?: string }> }) {
  const { file } = await searchParams;
  return <CodePage file={file} />;
}
