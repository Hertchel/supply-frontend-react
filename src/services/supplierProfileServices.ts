import api from "@/api";
import { ApiResponse } from "@/types/response/api-response";
import { handleError, handleSucess } from "@/utils/apiHelper";
import { useQuery } from "@tanstack/react-query";

export interface SupplierProfileType {
  supplier_profile_id: string;
  name: string;
  address: string;
  contact_person?: string | null;
  contact_number?: string | null;
  tin?: string | null;
  is_VAT?: boolean;
}

export const getAllSupplierProfiles = async (): Promise<
  ApiResponse<SupplierProfileType[]>
> => {
  try {
    const response = await api.get<SupplierProfileType[]>(
      "/api/supplier-profile/"
    );

    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const createSupplierProfile = async (
  data: Omit<SupplierProfileType, "supplier_profile_id">
): Promise<ApiResponse<SupplierProfileType>> => {
  try {
    const response = await api.post<SupplierProfileType>(
      "/api/supplier-profile/",
      data
    );

    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const updateSupplierProfile = async (
  supplier_profile_id: string,
  data: Omit<SupplierProfileType, "supplier_profile_id">
): Promise<ApiResponse<SupplierProfileType>> => {
  try {
    const response = await api.put<SupplierProfileType>(
      `/api/supplier-profile/${supplier_profile_id}`,
      data
    );

    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useSupplierProfiles = () => {
  return useQuery<ApiResponse<SupplierProfileType[]>, Error>({
    queryFn: getAllSupplierProfiles,
    queryKey: ["supplier-profiles"],
  });
};