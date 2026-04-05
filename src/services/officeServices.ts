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