import PublicFooter from "@/common/components/PublicFooter";
import PublicHeader from "@/common/components/PublicHeader";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
