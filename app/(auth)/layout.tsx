import { AppProvider } from "@/contexts/AppContext";
import AuthShell from "@/components/auth/AuthShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <AuthShell>{children}</AuthShell>
    </AppProvider>
  );
}
