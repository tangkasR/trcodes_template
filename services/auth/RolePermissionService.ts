const API_URL = "/api/auth/role_permission";

// ====================
// Types
// ====================

export interface RolePermissionRole {
  id: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface RolePermissionFeature {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  availableActions: string;
  isActive?: boolean;
}

export interface RolePermission {
  id: number;
  roleId: number;
  featureId: number;
  isRead: boolean;
  isAdd: boolean;
  isEdit: boolean;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
  role?: RolePermissionRole;
  feature?: RolePermissionFeature;
}

export interface RolePermissionRequest {
  roleId: number;
  featureId: number;
  isRead?: boolean;
  isAdd?: boolean;
  isEdit?: boolean;
  isDelete?: boolean;
}

export interface RolePermissionUpdateRequest {
  roleId?: number;
  featureId?: number;
  isRead?: boolean;
  isAdd?: boolean;
  isEdit?: boolean;
  isDelete?: boolean;
}

export interface RolePermissionListResponse {
  success: boolean;
  message?: string;
  data: RolePermission[];
}

export interface RolePermissionDetailResponse {
  success: boolean;
  message?: string;
  data: RolePermission;
}

export interface RolePermissionMutationResponse {
  success: boolean;
  message: string;
  data?: RolePermission;
}

export interface RolePermissionDeleteResponse {
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
// Role Permission Service
// ====================

const RolePermissionService = {
  /**
   * GET /api/auth/role_permission
   * Mengambil semua role permission.
   */
  async getAll(): Promise<RolePermissionListResponse> {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    return handleResponse<RolePermissionListResponse>(response);
  },

  /**
   * GET /api/auth/role_permission?id=1
   * Mengambil detail permission berdasarkan ID.
   */
  async getById(id: number): Promise<RolePermissionDetailResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid role permission ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    return handleResponse<RolePermissionDetailResponse>(response);
  },

  /**
   * GET /api/auth/role_permission?roleId=1
   * Mengambil semua permission untuk role tertentu.
   */
  async getByRoleId(roleId: number): Promise<RolePermissionListResponse> {
    if (!Number.isSafeInteger(roleId) || roleId <= 0) {
      throw new Error("Invalid role ID.");
    }

    const response = await fetch(
      `${API_URL}?roleId=${encodeURIComponent(String(roleId))}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    return handleResponse<RolePermissionListResponse>(response);
  },

  /**
   * GET /api/auth/role_permission?featureId=1
   * Mengambil semua permission untuk feature tertentu.
   */
  async getByFeatureId(featureId: number): Promise<RolePermissionListResponse> {
    if (!Number.isSafeInteger(featureId) || featureId <= 0) {
      throw new Error("Invalid feature ID.");
    }

    const response = await fetch(
      `${API_URL}?featureId=${encodeURIComponent(String(featureId))}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    return handleResponse<RolePermissionListResponse>(response);
  },

  /**
   * POST /api/auth/role_permission
   * Membuat permission baru.
   */
  async create(
    payload: RolePermissionRequest
  ): Promise<RolePermissionMutationResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse<RolePermissionMutationResponse>(response);
  },

  /**
   * PUT /api/auth/role_permission?id=1
   * Memperbarui permission.
   */
  async update(
    id: number,
    payload: RolePermissionUpdateRequest
  ): Promise<RolePermissionMutationResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid role permission ID.");
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

    return handleResponse<RolePermissionMutationResponse>(response);
  },

  /**
   * DELETE /api/auth/role_permission?id=1
   * Menghapus permission.
   */
  async delete(id: number): Promise<RolePermissionDeleteResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid role permission ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    return handleResponse<RolePermissionDeleteResponse>(response);
  },
};

export default RolePermissionService;
