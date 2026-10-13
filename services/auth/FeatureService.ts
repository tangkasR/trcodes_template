const API_URL = "/api/auth/feature";

// ====================
// Types
// ====================

export type AvailableAction = "r" | "a" | "e" | "d";

export interface Feature {
  id: number;
  name: string;
  code: string;
  description: string | null;
  availableActions: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureRequest {
  name: string;
  code: string;
  description?: string | null;
  availableActions: string;
  isActive?: boolean;
}

export interface FeatureListResponse {
  success: boolean;
  message?: string;
  data: Feature[];
}

export interface FeatureDetailResponse {
  success: boolean;
  message?: string;
  data: Feature;
}

export interface FeatureMutationResponse {
  success: boolean;
  message: string;
  data?: Feature;
}

export interface FeatureDeleteResponse {
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
// Feature Service
// ====================

const FeatureService = {
  /**
   * GET /api/auth/feature
   * Mengambil semua feature.
   */
  async getAll(): Promise<FeatureListResponse> {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    return handleResponse<FeatureListResponse>(response);
  },

  /**
   * GET /api/auth/feature?id=1
   * Mengambil detail feature berdasarkan ID.
   */
  async getById(id: number): Promise<FeatureDetailResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid feature ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    return handleResponse<FeatureDetailResponse>(response);
  },

  /**
   * POST /api/auth/feature
   * Membuat feature baru.
   */
  async create(payload: FeatureRequest): Promise<FeatureMutationResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse<FeatureMutationResponse>(response);
  },

  /**
   * DELETE /api/auth/feature?id=1
   * Menghapus feature.
   */
  async delete(id: number): Promise<FeatureDeleteResponse> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Invalid feature ID.");
    }

    const response = await fetch(
      `${API_URL}?id=${encodeURIComponent(String(id))}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    return handleResponse<FeatureDeleteResponse>(response);
  },
};

export default FeatureService;
