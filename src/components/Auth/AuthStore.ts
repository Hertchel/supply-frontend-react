import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import api from "@/api";
import { AxiosError } from "axios";
import { deleteAuthStorage } from "@/utils/deleteCookies";
import {
  forgotPasswordType,
  resetPasswordType,
  userUpdatePasswordType,
  userUpdateType,
  verifyResetOTPType,
} from "@/types/request/user";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}

interface AuthState {
  isLoading: boolean;
  isLoggingOut: boolean;
  isAuthenticated: boolean;
  otpSent: boolean;
  user: User | null;
  email: string | null;
  resetToken: string | null;
  errorMessage: string | null;
  successMessage: string | null;
  checkAuth: () => Promise<void>;

  checkUser: (
    email: string,
    password: string,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;

  forgotPassword: (
    data: forgotPasswordType,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;

  verifyResetOTP: (
    data: verifyResetOTPType,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;

  resetPassword: (
    data: resetPasswordType,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;

  updateUser: (
    id: number,
    data: userUpdateType,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  updateUserPassword: (
    data: userUpdatePasswordType,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  verifyOTP: (
    email: string,
    otp: string,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  resendOTP: (
    email: string,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;
  logout: (
    onSuccess?: (succes: string) => void,
    onError?: (error: string) => void
  ) => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set,) => ({
      isLoading: false,
      isLoggingOut: false,
      isAuthenticated: false,
      otpSent: false,
      user: null,
      email: null,
      resetToken: null,
      errorMessage: null,
      successMessage: null,

      checkAuth: async () => {
        set({ isLoading: true });

        try {
          console.log("Checking authentication...");
          const response = await api.get("/api/user/check_auth");
          console.log("Authenticated user:", response.data);
          set({
            isAuthenticated: true,
            user: response.data,
          });
        } catch (error) {
          set({
            isAuthenticated: false,
            user: null,
          });

          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("refresh_token");
          sessionStorage.removeItem("auth-storage");

          console.error("Authentication check failed:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      checkUser: async (email, password, onSuccess, onError) => {
        set({
          isLoading: true,
          errorMessage: null,
          successMessage: null,
        });

        deleteAuthStorage();

        // Clear only this tab's tokens
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");

        try {
          const response = await api.post("/api/user/login_token/", {
            email,
            password,
          });

          const {
            user,
            access_token,
            refresh_token,
          } = response.data;

          if (!access_token || !refresh_token) {
            throw new Error("Login response did not contain authentication tokens.");
          }

          // Store tokens for THIS TAB
          sessionStorage.setItem(
            "access_token",
            access_token
          );

          sessionStorage.setItem(
            "refresh_token",
            refresh_token
          );

          set({
            isAuthenticated: true,
            otpSent: false,
            user,
            email: user.email,
            successMessage: response.data.message,
          });

          onSuccess?.(response.data.message);

        } catch (error) {
          const axiosError = error as AxiosError;

          const errorMsg =
            (axiosError.response?.data as { error?: string })?.error ||
            (error instanceof Error
              ? error.message
              : "Failed to check user. Please try again.");

          set({
            otpSent: false,
            errorMessage: errorMsg,
          });

          onError?.(errorMsg);

        } finally {
          set({ isLoading: false });
        }
      },

      forgotPassword: async (data, onSuccess, onError) => {
        set({
          isLoading: true,
          errorMessage: null,
          successMessage: null,
        });

        try {
          const response = await api.post(
            "/api/user/forgot-password/",
            data
          );

          set({
            email: data.email,
            successMessage: response.data.message,
          });

          onSuccess?.(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;

          const errorMsg =
            (axiosError.response?.data as { error?: string })?.error ||
            "Failed to send password reset OTP. Please try again.";

          set({
            errorMessage: errorMsg,
          });

          onError?.(errorMsg);
        } finally {
          set({ isLoading: false });
        }
      },

      verifyResetOTP: async (data, onSuccess, onError) => {
        set({
          isLoading: true,
          errorMessage: null,
          successMessage: null,
        });

        try {
          const response = await api.post(
            "/api/user/verify-reset-otp/",
            data
          );

          set({
            email: data.email,
            resetToken: response.data.reset_token,
            successMessage: response.data.message,
          });

          onSuccess?.(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;

          const errorMsg =
            (axiosError.response?.data as { error?: string })?.error ||
            "Failed to verify the OTP. Please try again.";

          set({
            errorMessage: errorMsg,
          });

          onError?.(errorMsg);
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (data, onSuccess, onError) => {
        set({
          isLoading: true,
          errorMessage: null,
          successMessage: null,
        });

        try {
          const response = await api.post(
            "/api/user/reset-password/",
            {
              reset_token: data.reset_token,
              new_password: data.new_password,
            }
          );

          set({
            resetToken: null,
            email: null,
            successMessage: response.data.message,
          });

          onSuccess?.(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;

          const errorData = axiosError.response?.data as {
            error?: string | string[];
          };

          const errorMsg = Array.isArray(errorData?.error)
            ? errorData.error.join(" ")
            : errorData?.error ||
              "Failed to reset password. Please try again.";

          set({
            errorMessage: errorMsg,
          });

          onError?.(errorMsg);
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: async (id, data, onSuccess, onError) => {
        set({ isLoading: true, errorMessage: null, successMessage: null });
        try {
          const response = await api.put(`/api/user/${id}/edit/`, data);
          set({
            user: response.data.user,
            successMessage: response.data.message,
          });
          onSuccess?.(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;
          const errorMsg =
            (axiosError.response?.data as { error?: string })?.error ||
            "Something went wrong. Please try again.";
          set({ otpSent: false, errorMessage: errorMsg });
          onError?.(errorMsg);
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserPassword: async (data, onSuccess, onError) => {
        set({ isLoading: true, errorMessage: null, successMessage: null });
        try {
          const response = await api.post(`/api/user/change-password/`, data);
          onSuccess?.(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;
          const errorMsg =
            (axiosError.response?.data as { error?: string })?.error ||
            "Something went wrong. Please try again.";
          set({ otpSent: false, errorMessage: errorMsg });
          onError?.(errorMsg);
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOTP: async (email, otp_code, onSuccess, onError) => {
        set({
          isLoading: true,
          errorMessage: null,
          successMessage: null,
        });

        try {
          const response = await api.post("/api/user/login_verify_otp/", {
            email,
            otp_code,
          });

          const {
            user,
            access_token,
            refresh_token,
          } = response.data;

          if (!access_token || !refresh_token) {
            throw new Error(
              "OTP verification response did not contain authentication tokens."
            );
          }

          // Store tokens for THIS TAB
          sessionStorage.setItem(
            "access_token",
            access_token
          );

          sessionStorage.setItem(
            "refresh_token",
            refresh_token
          );

          console.log("Authenticated user:", user);

          set({
            isAuthenticated: true,
            otpSent: false,
            user,
            email: user.email,
            successMessage: response.data.message,
          });

          onSuccess?.(response.data.message);

        } catch (error) {
          const axiosError = error as AxiosError;

          const errorMsg =
            (axiosError.response?.data as { error?: string })?.error ||
            (error instanceof Error
              ? error.message
              : "Failed to verify the token. Please try again.");

          set({
            errorMessage: errorMsg,
          });

          onError?.(errorMsg);

        } finally {
          set({ isLoading: false });
        }
      },
      resendOTP: async (
        email: string,
        onSuccess?: (message: string) => void,
        onError?: (error: string) => void
      ) => {
        set({ isLoading: true, errorMessage: null, successMessage: null });
        try {
          const response = await api.post("api/user/login_resend_otp/", {
            email,
          });
          set({ successMessage: response.data.message });
          onSuccess?.(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError;
          const errorMsg =
            (axiosError.response?.data as { error?: string })?.error ||
            "Failed to resend OTP. Please try again.";
          set({ errorMessage: errorMsg });
          onError?.(errorMsg);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async (
        onSuccess?: (success: string) => void,
        onError?: (error: string) => void
      ) => {
        set({ isLoggingOut: true });

        // Get the refresh token belonging to THIS TAB
        const refreshToken = sessionStorage.getItem("refresh_token");

        const clearState = () => {
          set({
            isAuthenticated: false,
            otpSent: false,
            user: null,
            email: null,
            resetToken: null,
            errorMessage: null,
            successMessage: null,
            isLoggingOut: false,
          });

          // Clear only THIS TAB
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("refresh_token");
          sessionStorage.removeItem("auth-storage");
        };

        try {
          const response = await api.post(
            "/api/user/logout/",
            {
              refresh_token: refreshToken,
            }
          );

          clearState();

          onSuccess?.(response?.data?.message);

          window.location.href = "/login";

        } catch (error) {
          console.error("Logout error:", error);

          const errorMsg =
            error instanceof Error
              ? error.message
              : "An unknown error occurred during logout";

          onError?.(errorMsg);

          clearState();
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useAuthStore;
