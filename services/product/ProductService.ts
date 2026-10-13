const API_URL = "/api/product";

// ====================
// Types
// ====================

export interface Product {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  price: number;
  stock?: number;
  isActive?: boolean;
}

export interface ProductUpdateRequest {
  name?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

export interface ProductListResponse {
  success: boolean;
  message?: string;
  data: Product[];
}

export interface ProductDetailResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export interface ProductMutationResponse {
  success: boolean;
  message: string;
  data?: Product;
}

export interface ProductDeleteResponse {
  success: boolean;
  message: string;
}

// ====================
// Response Handler
// ====================

async function handleResponse<T>(response: Response): Promise<T> {
  const result: unknown = await response.json().catch(() => null);

  if (typeof result !== "object" || result === null || !("success" in result)) {
    throw new Error("Invalid response from server.");
  }

  const body = result as {
    success: boolean;
    message?: string;
  };

  if (!response.ok || !body.success) {
    throw new Error(
      body.message || "An error occurred while processing the request."
    );
  }

  return result as T;
}

// ====================
// Product Service
// ====================

const ProductService = {
  /**
   * GET /api/product
   * Mengambil semua product.
   */
  async getAll(): Promise<ProductListResponse> {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    return handleResponse<ProductListResponse>(response);
  },

  /**
   * GET /api/product?id=1
   * Mengambil detail product berdasarkan ID.
   */
  async getById(id: number): Promise<ProductDetailResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid product ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    return handleResponse<ProductDetailResponse>(response);
  },

  /**
   * POST /api/product
   * Membuat product baru.
   */
  async create(payload: ProductRequest): Promise<ProductMutationResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse<ProductMutationResponse>(response);
  },

  /**
   * PUT /api/product?id=1
   * Memperbarui product.
   */
  async update(
    id: number,
    payload: ProductUpdateRequest
  ): Promise<ProductMutationResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid product ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    return handleResponse<ProductMutationResponse>(response);
  },

  /**
   * DELETE /api/product?id=1
   * Menghapus product.
   */
  async delete(id: number): Promise<ProductDeleteResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid product ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    return handleResponse<ProductDeleteResponse>(response);
  },
};

export default ProductService;
