import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  resetPasswordType,
} from "@/types/request/user";
import useAuthStore from "@/components/Auth/AuthStore";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {

    const navigate = useNavigate();
  const {
    resetPassword,
    resetToken,
    isLoading,
    errorMessage,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<resetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      reset_token: resetToken ?? "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: resetPasswordType) => {
    await resetPassword(
      data,
      (message) => {
        console.log("RESET PASSWORD SUCCESS:", message);
        navigate("/login");
        },
      (error) => {
        console.error("RESET PASSWORD ERROR:", error);
      }
    );
  };

  return (
    <div className="relative flex min-h-screen justify-center items-center p-4">
        {/* Background */}
        <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{
            backgroundImage: "url('/image2.jpg')",
            filter: "blur(8px)",
        }}
        />

        {/* Container */}
        <div className="relative flex flex-col lg:flex-row border border-[#FDE3CF] rounded-lg w-full max-w-[800px] shadow-lg bg-white z-10">

        {/* Logo - Small Screens */}
        <div className="flex lg:hidden justify-center items-center p-4 border-b border-[#FDE3CF] bg-blue-50">
            <img
            src="/CTU_new_logotransparent.svg"
            alt="CTU Logo"
            className="w-32 h-auto object-contain"
            />
        </div>

        {/* Left Side - Large Screens */}
        <div className="hidden lg:flex justify-center items-center w-1/2 border-r border-[#FDE3CF] p-5 bg-blue-50">
            <img
            src="/CTU_new_logotransparent.svg"
            alt="CTU Logo"
            className="w-full h-auto object-contain"
            />
        </div>

        {/* Right Side */}
        <div className="flex justify-center items-center w-full lg:w-1/2 p-5 sm:p-7">
            <div className="w-full flex flex-col space-y-5">

            <div>
                <p className="text-2xl sm:text-3xl font-normal text-gray-900 text-center mb-2">
                Reset Password
                </p>

                <p className="text-sm text-gray-500 text-center mb-6">
                Enter your new password below.
                </p>

                {errorMessage && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-600">
                    {errorMessage}
                    </p>
                </div>
                )}

                <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                >
                {/* Reset Token */}
                <input
                    type="hidden"
                    {...register("reset_token")}
                />

                {/* New Password */}
                <div className="w-full">
                    <label
                    htmlFor="new_password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    >
                    New Password
                    </label>

                    <input
                    id="new_password"
                    type="password"
                    {...register("new_password")}
                    placeholder="Enter your new password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    />

                    {errors.new_password && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.new_password.message}
                    </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="w-full">
                    <label
                    htmlFor="confirm_password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    >
                    Confirm Password
                    </label>

                    <input
                    id="confirm_password"
                    type="password"
                    {...register("confirm_password")}
                    placeholder="Confirm your new password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    />

                    {errors.confirm_password && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.confirm_password.message}
                    </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#F5A15D] hover:bg-[#E99450] text-white rounded-md py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? "Resetting..." : "Reset Password"}
                </button>
                </form>
            </div>

            {/* Back to Login */}
            <div className="text-center">
                <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-orange-300 hover:underline"
                >
                Back to Login
                </button>
            </div>

            </div>
        </div>
        </div>
    </div>
    );
};

export default ResetPassword;