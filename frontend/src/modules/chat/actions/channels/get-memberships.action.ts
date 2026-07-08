import { channelsApi } from "@/modules/chat/api/channels.api";
import type { ApiResponse } from "@/shared/interfaces/api.interface";

export const getMembershipsAction = async (): Promise<
  ApiResponse<string[]>
> => {
  try {
    const { data } =
      await channelsApi.get<ApiResponse<string[]>>("/memberships");
    return data;
  } catch (error: any) {
    return (
      error.response?.data ?? {
        success: false,
        data: [],
        message: "Error al obtener memberships",
      }
    );
  }
};
