import type { Metadata } from "next";
import { AuthScreen } from "@/components/AuthScreen";

export const metadata: Metadata = { title: "Sign in · Architect 2.0" };

export default function SignIn() {
  return <AuthScreen mode="sign-in" />;
}
