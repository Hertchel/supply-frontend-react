import { ApiResponse } from "@/types/response/api-response";


export const handleSucess = <T>(response: { data: T }): ApiResponse<T> => {
  return {
    status: "success",
    data: response.data,
  };
};


export const handleError = (error: unknown): ApiResponse<never> => {
  throw error;
};

