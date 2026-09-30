import { HomeShell } from "@/components/HomeShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <HomeShell>{children}</HomeShell>;
}
