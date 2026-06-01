import api from "@/api";
import { ApiResponse } from "@/types/response/api-response";
import { UsersType } from "@/types/response/users";
import { handleError, handleSucess } from "@/utils/apiHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


// Step 2 define the request

export const GetUsers = async (): Promise<
  ApiResponse<UsersType[]>
> => {
  try {
    const response = await api.get<UsersType[]>(
      "/api/users/"
    )
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const getUsers = async (): Promise<ApiResponse<UsersType[]>> => {
  try {
    const response = await api.get<UsersType[]>("api/users/");
    console.log(response);
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useGetUsers = () => {
  return useQuery<ApiResponse<UsersType[]>>({
    queryKey: ["users"],
    queryFn: getUsers,
    refetchInterval: 5000,
  });
};

export const activateUser = async ({
  id,
  status,
}: {
  id: string;
  status: boolean;
}): Promise<ApiResponse<UsersType>> => {
  try {
    const response = await api.patch(`/api/user/${id}`, {
      is_active: status,
    });
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const deleteUser = async (
  id: string
): Promise<ApiResponse<UsersType>> => {

  try {

    const response = await api.delete(
      `/api/user/${id}`
    );

    return handleSucess(response);

  } catch (error) {

    return handleError(error);

  }

};

export const useActivateUser = (action: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["users"]})
      toast.success(`Successfully ${action}!`, {
        description: `Users successfully ${action}`
      });
    }
    
  })
}

export const useDeleteUser = () => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: deleteUser,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      toast.success("Successfully Deleted!", {
        description: "User deleted successfully",
      });

    },

  });

};

export const useUser = () => {
  return useQuery<ApiResponse<UsersType[]>, Error>({
    queryKey: ["users"],
    queryFn: GetUsers,
    refetchInterval: 5000,
  });
};

export const useUserCount = () => {
  const { data, isLoading } = useUser();
  const UserCount = data?.data?.length;
  return { UserCount, isLoading };
};

export const getReviewers = async (): Promise<ApiResponse<UsersType[]>> => {
  try {
    const response = await api.get<UsersType[]>("/api/reviewers/");
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useGetReviewers = () => {

  return useQuery<ApiResponse<UsersType[]>>({

    queryKey: ["reviewers"],

    queryFn: getReviewers,

    refetchInterval: 5000,

  });

};
export const deleteReviewer = async (
  id: string
): Promise<ApiResponse<UsersType>> => {

  try {

    const response = await api.delete(
      `/api/reviewers/${id}`
    );

    return handleSucess(response);

  } catch (error) {

    return handleError(error);

  }

};
export const useDeleteReviewer = () => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: deleteReviewer,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["reviewers"],
      });

      toast.success("Reviewer Deleted!", {
        description: "Reviewer deleted successfully",
      });

    },

  });

};

export const addReviewer = async (
  data: UsersType
): Promise<ApiResponse<UsersType>> => {

  try {

    const response = await api.post(
      "/api/reviewers/",
      {
        ...data,
        is_reviewer: true,
      }
    );

    return handleSucess(response);

  } catch (error) {

    return handleError(error);

  }

};
export const useAddReviewer = () => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: addReviewer,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["reviewers"],
      });

      toast.success("Reviewer Added!", {
        description: "Reviewer created successfully",
      });

    },

  });

};