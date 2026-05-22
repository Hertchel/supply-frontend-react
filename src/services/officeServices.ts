import api from "@/api";
import { ApiResponse } from "@/types/response/api-response";

export interface Office {
  id: number;
  code: string;
  name: string;
  department: string;
}

/**
 * Get all active offices
 * @returns Promise with array of offices
 */
export const getAllOffices = async (): Promise<ApiResponse<Office[]>> => {
  try {
    const response = await api.get<Office[]>("/api/offices/");
    return {
      status: "success",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error fetching offices:", error);
    return {
      status: "error",
      error: error,
    };
  }
};

/**
 * Get a single office by ID
 * @param id - Office ID
 * @returns Promise with office data
 */
export const getOfficeById = async (id: number): Promise<ApiResponse<Office>> => {
  try {
    const response = await api.get<Office>(`/api/offices/${id}/`);
    return {
      status: "success",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error fetching office:", error);
    return {
      status: "error",
      error: error,
    };
  }
};

export const addOffice = async (
  data: Omit<Office, "id">
): Promise<ApiResponse<Office>> => {
  try {
    const response = await api.post<Office>(
      "/api/offices/",
      data
    );

    return {
      status: "success",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error adding office:", error);

    return {
      status: "error",
      error,
    };
  }
};

export const updateOffice = async (
  id: number,
  data: Omit<Office, "id">
): Promise<ApiResponse<Office>> => {
  try {
    const response = await api.put<Office>(
      `/api/offices/${id}/`,
      data
    );

    return {
      status: "success",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error updating office:", error);

    return {
      status: "error",
      error,
    };
  }
};

export const deleteOffice = async (
  id: number
): Promise<ApiResponse<null>> => {
  try {
    await api.delete(`/api/offices/${id}/`);

    return {
      status: "success",
      data: null,
    };
  } catch (error: any) {
    console.error("Error deleting office:", error);

    return {
      status: "error",
      error,
    };
  }
};

/**
 * Format offices for dropdown/select components
 * @param offices - Array of offices
 * @returns Array of options for Select component
 */
export const formatOfficeOptions = (offices: Office[]) => {
  return offices.map((office) => ({
    value: office.id.toString(),
    label: `${office.code} - ${office.name}`,
  }));
};