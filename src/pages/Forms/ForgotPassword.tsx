import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  forgotPasswordType,
} from "@/types/request/user";
import useAuthStore from "@/components/Auth/AuthStore";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const { forgotPassword, isLoading, errorMessage } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<forgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: forgotPasswordType) => {
    await forgotPassword(
      data,
      (message) => {
        console.log("FORGOT PASSWORD SUCCESS:", message);
        navigate("/verify-reset-otp");
      },
      (error) => {
        console.error("FORGOT PASSWORD ERROR:", error);
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
                Forgot Password?
                </p>

                <p className="text-sm text-gray-500 text-center mb-6">
                Enter your email address and we'll send you a verification code.
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
                <div className="w-full">
                    <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    >
                    Email
                    </label>

                    <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    />

                    {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.email.message}
                    </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#F5A15D] hover:bg-[#E99450] text-white rounded-md py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? "Sending..." : "Send OTP"}
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

export default ForgotPassword;