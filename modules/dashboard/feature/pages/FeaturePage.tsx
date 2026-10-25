import { Layers3 } from "lucide-react";
import PageHeader from "@/common/components/PageHeader";
import { requirePageAccess } from "@/common/lib/auth";
import FeatureTable from "../components/FeatureTable";

export default async function FeaturesPage() {
  await requirePageAccess("feature", "read");

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Layers3}
        title="Fitur"
        description="Kelola fitur dan aksi yang tersedia untuk tiap fitur."
        eyebrow="Akses"
      />
      <FeatureTable />
    </div>
  );
}
