export type MePermission = {
  id: number;
  featureId: number;
  featureName: string;
  featureCode: string;
  description: string | null;
  availableActions: string;
  isRead: boolean;
  isAdd: boolean;
  isEdit: boolean;
  isDelete: boolean;
};

export type MeUser = {
  id: number;
  name: string;
  email: string;
};

export type MeRole = {
  id: number;
  name: string;
  description: string | null;
};

export type MeResponse = {
  user: MeUser;
  role: MeRole;
  permissions: MePermission[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

const MeService = {
  async getMe(): Promise<ApiResponse<MeResponse>> {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const result = (await response.json()) as ApiResponse<MeResponse>;

    if (!response.ok || !result.success || !result.data) {
      throw new Error(result.message || "Gagal mengambil data user.");
    }

    return result;
  },
};

export default MeService;
