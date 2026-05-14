import api from "@/api";
import { RegisterInputData } from "@/types/request/input";
import { ApiResponse } from "@/types/response/api-response";
import { handleError, handleSucess } from "@/utils/apiHelper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserResponse } from "@/types/request/user";

export const registerUser = async (
  data: RegisterInputData
): Promise<ApiResponse<UserResponse>> => {
  try {
    const response = await api.post<UserResponse>(
      "api/user/register/ ",
      data
    );
    return handleSucess(response);
  } catch (error) {
    console.log(error)
    return handleError(error);
  }
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<UserResponse>, Error, RegisterInputData>({
    mutationFn: (data) => registerUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
