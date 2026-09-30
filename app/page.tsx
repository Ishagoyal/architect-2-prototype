import { AuthScreen } from "@/components/AuthScreen";

export default async function SignUp({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthScreen mode="sign-up" linkError={error === "link"} />;
}
