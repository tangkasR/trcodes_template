const API_URL = "/api/auth/login";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginPermission {
  id: number;
  roleId: number;
  featureId: number;
  isRead: boolean;
  isAdd: boolean;
  isEdit: boolean;
  isDelete: boolean;
  feature: {
    id: number;
    name: string;
    code: string;
    availableActions: string;
  };
}

export interface LoginRole {
  id: number;
  name: string;
  permissions: LoginPermission[];
}

export interface LoginUser {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role: LoginRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: LoginUser;
  };
}

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

export const LoginService = {
  /**
   * Login user.
   * POST /api/auth/login
   */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse<LoginResponse>(response);
  },
};

export default LoginService;
