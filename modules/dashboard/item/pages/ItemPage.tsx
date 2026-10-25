import "server-only";
import { requirePageAccess } from "@/common/lib/auth";
import { getItemList } from "../item.queries";
import ItemTable from "../components/ItemTable";

import { Package } from "lucide-react";
import PageHeader from "@/common/components/PageHeader";

export default async function ItemPage() {
  await requirePageAccess("item");
  const { data, total, page, pageSize } = await getItemList({ page: 1, pageSize: 10 });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="Data Item"
        description="Kelola data item contoh referensi CRUD dan status publikasinya di sistem."
        eyebrow="Master Data"
      />

      <ItemTable
        initialData={data}
        total={total}
        initialPage={page}
        initialPageSize={pageSize}
      />
    </div>
  );
}
