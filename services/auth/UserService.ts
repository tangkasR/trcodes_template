const API_URL = "/api/auth/user";

// ====================
// Types
// ====================

export interface UserRole {
  id: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: UserRole;
}

export interface UserRequest {
  name: string;
  email: string;
  password: string;
  roleId: number;
  isActive?: boolean;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
  isActive?: boolean;
}

export interface UserListResponse {
  success: boolean;
  message?: string;
  data: User[];
}

export interface UserDetailResponse {
  success: boolean;
  message?: string;
  data: User;
}

export interface UserMutationResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface UserDeleteResponse {
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
// User Service
// ====================

const UserService = {
  /**
   * GET /api/auth/user
   * Mengambil semua user.
   */
  async getAll(): Promise<UserListResponse> {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    return handleResponse<UserListResponse>(response);
  },

  /**
   * GET /api/auth/user?id=1
   * Mengambil detail user berdasarkan ID.
   */
  async getById(id: number): Promise<UserDetailResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid user ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    return handleResponse<UserDetailResponse>(response);
  },

  /**
   * POST /api/auth/user
   * Membuat user baru.
   */
  async create(payload: UserRequest): Promise<UserMutationResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse<UserMutationResponse>(response);
  },

  /**
   * PUT /api/auth/user?id=1
   * Memperbarui data user.
   */
  async update(
    id: number,
    payload: UserUpdateRequest
  ): Promise<UserMutationResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid user ID.");
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

    return handleResponse<UserMutationResponse>(response);
  },

  /**
   * DELETE /api/auth/user?id=1
   * Menghapus user.
   */
  async delete(id: number): Promise<UserDeleteResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid user ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    return handleResponse<UserDeleteResponse>(response);
  },
};

export default UserService;
