const API_URL = "/api/auth/registration";

export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegistrationUser {
  id: number;
  name: string;
  email: string;
  roleId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: number;
    name: string;
  };
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    user: RegistrationUser;
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
    throw new Error(body.message || "Registration failed.");
  }

  return result as T;
}

const RegistrationService = {
  async register(payload: RegistrationRequest): Promise<RegistrationResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    return handleResponse<RegistrationResponse>(response);
  },
};

export default RegistrationService;
