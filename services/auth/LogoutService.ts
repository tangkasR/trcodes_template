const API_URL = "/api/auth/logout";

export interface LogoutResponse {
  success: boolean;
  message: string;
}

const LogoutService = {
  async logout(): Promise<LogoutResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result: unknown = await response.json().catch(() => null);

    if (
      typeof result !== "object" ||
      result === null ||
      !("success" in result)
    ) {
      throw new Error("Respons server tidak valid.");
    }

    const body = result as LogoutResponse;

    if (!response.ok || !body.success) {
      throw new Error(body.message || "Logout gagal.");
    }

    return body;
  },
};

export default LogoutService;
