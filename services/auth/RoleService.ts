const API_URL = "/api/auth/role";

// ====================
// Types
// ====================

export interface Role {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    permissions: number;
  };
}

export interface RoleRequest {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface RoleUpdateRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface RoleListResponse {
  success: boolean;
  message?: string;
  data: Role[];
}

export interface RoleDetailResponse {
  success: boolean;
  message?: string;
  data: Role;
}

export interface RoleMutationResponse {
  success: boolean;
  message: string;
  data?: Role;
}

export interface RoleDeleteResponse {
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
// Role Service
// ====================

const RoleService = {
  /**
   * GET /api/auth/role
   * Mengambil semua role.
   */
  async getAll(): Promise<RoleListResponse> {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    return handleResponse<RoleListResponse>(response);
  },

  /**
   * GET /api/auth/role?id=1
   * Mengambil detail role berdasarkan ID.
   */
  async getById(id: number): Promise<RoleDetailResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid role ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    return handleResponse<RoleDetailResponse>(response);
  },

  /**
   * POST /api/auth/role
   * Membuat role baru.
   */
  async create(payload: RoleRequest): Promise<RoleMutationResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse<RoleMutationResponse>(response);
  },

  /**
   * PUT /api/auth/role?id=1
   * Memperbarui role.
   */
  async update(
    id: number,
    payload: RoleUpdateRequest
  ): Promise<RoleMutationResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid role ID.");
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

    return handleResponse<RoleMutationResponse>(response);
  },

  /**
   * DELETE /api/auth/role?id=1
   * Menghapus role.
   */
  async delete(id: number): Promise<RoleDeleteResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid role ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    return handleResponse<RoleDeleteResponse>(response);
  },
};

export default RoleService;
