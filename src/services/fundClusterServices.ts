import api from "@/api";
import { ApiResponse } from "@/types/response/api-response";

export interface FundCluster {
  id: number;
  code: string;
  name: string;
  description: string;
}

/**
 * Get all active fund clusters
 * @returns Promise with array of fund clusters
 */
export const getAllFundClusters = async (): Promise<ApiResponse<FundCluster[]>> => {
  try {
    const response = await api.get<FundCluster[]>("/api/fund-clusters/");
    return {
      status: "success",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error fetching fund clusters:", error);
    return {
      status: "error",
      error: error,
    };
  }
};

/**
 * Get a single fund cluster by ID
 * @param id - Fund cluster ID
 * @returns Promise with fund cluster data
 */
export const getFundClusterById = async (id: number): Promise<ApiResponse<FundCluster>> => {
  try {
    const response = await api.get<FundCluster>(`/api/fund-clusters/${id}/`);
    return {
      status: "success",
      data: response.data,
    };
  } catch (error: any) {
    console.error("Error fetching fund cluster:", error);
    return {
      status: "error",
      error: error,
    };
  }
};

/**
 * Format fund clusters for dropdown/select components
 * @param clusters - Array of fund clusters
 * @returns Array of options for Select component
 */
export const formatFundClusterOptions = (clusters: FundCluster[]) => {
  return clusters.map((cluster) => ({
    value: cluster.id.toString(),
    label: `${cluster.code} - ${cluster.name}`,
  }));
};