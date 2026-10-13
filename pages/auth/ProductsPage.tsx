"use client";

import { useCallback, useEffect, useState } from "react";
import ProductService, {
  type Product,
} from "@/services/product/ProductService";
import AddButton from "@/components/button/AddButton";
import SecondaryButton from "@/components/button/SecondaryButton";
import EditButton from "@/components/button/EditButton";
import DeleteButton from "@/components/button/DeleteButton";
import { useApp } from "@/contexts/AppContext";

type ProductRow = Product & {
  _key: string;
};

const createKey = () => `${Date.now()}-${Math.random()}`;

const createEmptyProduct = (): ProductRow => ({
  id: 0,
  _key: createKey(),
  name: "",
  price: 0,
  stock: 0,
  isActive: true,
  createdAt: "",
  updatedAt: "",
});

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ==========================================
  // Setting Permission
  // ==========================================
  const { hasPermission, authLoading } = useApp();
  const featureCode = "PRODUCT";
  const canRead = hasPermission(featureCode, "isRead");
  const canAdd = hasPermission(featureCode, "isAdd");
  const canEdit = hasPermission(featureCode, "isEdit");
  const canDelete = hasPermission(featureCode, "isDelete");

  // ==========================================
  // Load products
  // ==========================================

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setNotice(null);

    try {
      const response = await ProductService.getAll();

      setProducts(
        response.data.map((product) => ({
          ...product,
          _key: `product-${product.id}`,
        }))
      );
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data product.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canRead) {
      void loadProducts();
    }
  }, [canRead, loadProducts]);

  // ==========================================
  // Update row
  // ==========================================

  const updateProduct = (
    key: string,
    field: keyof ProductRow,
    value: string | number | boolean
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product._key === key ? { ...product, [field]: value } : product
      )
    );
  };

  // ==========================================
  // Add product
  // ==========================================

  const handleAdd = () => {
    setNotice(null);
    setProducts((current) => [createEmptyProduct(), ...current]);
  };

  // ==========================================
  // Save product
  // ==========================================

  const handleSave = async (product: ProductRow) => {
    const name = product.name.trim();
    const price = Number(product.price);
    const stock = Number(product.stock);

    if (!name) {
      setNotice({
        type: "error",
        message: "Nama product wajib diisi.",
      });
      return;
    }

    if (!Number.isFinite(price) || price < 0 || price > 9999999999.99) {
      setNotice({
        type: "error",
        message: "Harga harus berupa angka nonnegatif yang valid.",
      });
      return;
    }

    if (!Number.isSafeInteger(stock) || stock < 0) {
      setNotice({
        type: "error",
        message: "Stok harus berupa bilangan bulat nonnegatif.",
      });
      return;
    }

    setSavingKey(product._key);
    setNotice(null);

    try {
      const payload = {
        name,
        price,
        stock,
        isActive: product.isActive,
      };

      if (product.id > 0) {
        await ProductService.update(product.id, payload);
      } else {
        await ProductService.create(payload);
      }

      setNotice({
        type: "success",
        message: "Product berhasil disimpan.",
      });

      await loadProducts();
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal menyimpan product.",
      });
    } finally {
      setSavingKey(null);
    }
  };

  // ==========================================
  // Delete product
  // ==========================================
  const cancelNewProduct = (product: ProductRow) => {
    if (product.id !== 0) return;

    setProducts((current) =>
      current.filter((item) => item._key !== product._key)
    );
  };

  const handleDelete = async (product: ProductRow) => {
    if (product.id <= 0) {
      setProducts((current) =>
        current.filter((item) => item._key !== product._key)
      );
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus product "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingKey(product._key);
    setNotice(null);

    try {
      await ProductService.delete(product.id);

      setNotice({
        type: "success",
        message: "Product berhasil dihapus.",
      });

      await loadProducts();
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Gagal menghapus product.",
      });
    } finally {
      setDeletingKey(null);
    }
  };

  // ==========================================
  // Render
  // ==========================================
  if (authLoading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Memuat halaman produk
        </h1>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-gray-900">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-gray-500">
          Kamu tidak memiliki izin untuk melihat halaman produk.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Manajemen Produk
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola nama, harga, stok, dan status produk.
          </p>
        </div>

        {canAdd && (
          <AddButton type="button" onClick={handleAdd}>
            <span className="text-lg leading-none">+</span>
            Tambah Produk
          </AddButton>
        )}
      </div>

      {/* Notification */}
      {notice && (
        <div
          role="status"
          className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{notice.message}</span>

          <SecondaryButton
            aria-label="Tutup notifikasi"
            type="button"
            onClick={() => setNotice(null)}
          >
            ×
          </SecondaryButton>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Produk</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {products.filter((product) => product.id > 0).length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Produk Aktif</p>
          <p className="mt-2 text-2xl font-semibold text-green-600">
            {
              products.filter((product) => product.id > 0 && product.isActive)
                .length
            }
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Produk Tidak Aktif</p>
          <p className="mt-2 text-2xl font-semibold text-gray-500">
            {
              products.filter((product) => product.id > 0 && !product.isActive)
                .length
            }
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Daftar Produk</h2>
            <p className="mt-1 text-xs text-gray-500">
              Kelola nama, harga, dan stok produk
            </p>
          </div>

          <SecondaryButton
            type="button"
            onClick={() => void loadProducts()}
            disabled={loading}
          >
            ↻
          </SecondaryButton>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Memuat data product...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr className="text-center">
                  <th className="w-16 px-4 py-3">#</th>
                  <th className="min-w-56 px-4 py-3">Produk</th>
                  <th className="min-w-44 px-4 py-3">Harga (IDR)</th>
                  <th className="w-32 px-4 py-3">Stok</th>
                  <th className="w-24 px-4 py-3 text-center">Aktif</th>
                  <th className="min-w-64 px-4 py-3"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((product, index) => (
                  <tr key={product._key} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3 text-gray-500 text-right">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className={
                          "w-full min-w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }
                        value={product.name}
                        onChange={(event) =>
                          updateProduct(
                            product._key,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Product name"
                        disabled={product.id > 0 ? !canEdit : !canAdd}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="9999999999.99"
                        step="0.01"
                        className={
                          "w-full min-w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }
                        value={product.price}
                        onChange={(event) =>
                          updateProduct(
                            product._key,
                            "price",
                            event.target.value === ""
                              ? 0
                              : Number(event.target.value)
                          )
                        }
                        disabled={product.id > 0 ? !canEdit : !canAdd}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={
                          "w-full min-w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        }
                        value={product.stock}
                        onChange={(event) =>
                          updateProduct(
                            product._key,
                            "stock",
                            event.target.value === ""
                              ? 0
                              : Number(event.target.value)
                          )
                        }
                        disabled={product.id > 0 ? !canEdit : !canAdd}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={product.isActive}
                          onChange={(event) =>
                            updateProduct(
                              product._key,
                              "isActive",
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-blue-600"
                          disabled={product.id > 0 ? !canEdit : !canAdd}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {(product.id > 0 ? canEdit : canAdd) && (
                          <EditButton
                            type="button"
                            onClick={() => void handleSave(product)}
                            disabled={
                              savingKey === product._key ||
                              deletingKey === product._key
                            }
                          >
                            {savingKey === product._key
                              ? "Menyimpan..."
                              : "Simpan"}
                          </EditButton>
                        )}
                        {product.id === 0 ? (
                          <SecondaryButton
                            type="button"
                            onClick={() => cancelNewProduct(product)}
                            disabled={savingKey === product._key}
                            aria-label="Batal"
                          >
                            Batal
                          </SecondaryButton>
                        ) : (
                          canDelete && (
                            <DeleteButton
                              type="button"
                              onClick={() => void handleDelete(product)}
                              disabled={
                                savingKey === product._key ||
                                deletingKey === product._key
                              }
                            >
                              {deletingKey === product._key
                                ? "Menghapus..."
                                : "Hapus"}
                            </DeleteButton>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      Belum ada product. Klik Add Product untuk menambahkan data
                      baru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          Total {products.length} baris data.
        </div>
      </div>
    </div>
  );
}
