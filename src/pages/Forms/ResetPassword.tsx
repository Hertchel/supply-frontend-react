
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  resetPasswordType,
} from "@/types/request/user";
import useAuthStore from "@/components/Auth/AuthStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="min-h-screen w-full bg-white">
      <div className="flex min-h-screen w-full overflow-hidden bg-white">

        {/* LEFT PANEL */}
        <div className="relative hidden min-h-screen w-[50%] flex-col justify-between overflow-hidden bg-orange-300 p-10 text-gray-800 lg:flex xl:p-14">

          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/image2.jpg')",
            }}
          />

          {/* Orange Overlay */}
          <div className="absolute inset-0 bg-orange-300/85" />

          {/* Branding */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-1.5 shadow-md">
              <img
                src="/CTU_new_logotransparent.svg"
                alt="Cebu Technological University Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-800">
                CTU Supply Office
              </h1>
              <p className="text-xs text-gray-800">
                Cebu Technological University
              </p>
            </div>
          </div>

          {/* Main Introduction */}
          <div className="relative z-10 max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white px-4 py-2 text-xs font-semibold tracking-wide text-gray-800">
              <ShieldCheck className="h-4 w-4" />
              SECURE INSTITUTIONAL ACCESS
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-800 xl:text-[44px]">
                Protect Your
                <br />
                Account.
                <br />
                Stay Secure.
              </h2>

              <p className="max-w-md text-sm leading-7 text-gray-800 xl:text-base">
                Create a new password to restore access to your
                institutional account and continue using the
                CTU Supply Management System.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white pt-5">
            <div className="flex items-center gap-3">
              <img
                src="/CTU_new_logotransparent.svg"
                alt="CTU"
                className="h-8 w-8 rounded-full bg-white p-1 object-contain"
              />

              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Cebu Technological University
                </p>
                <p className="text-[10px] text-gray-800">
                  Argao Campus
                </p>
              </div>
            </div>

            <p className="text-[10px] text-gray-800">
              © {new Date().getFullYear()} CTU
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex min-h-screen w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-[50%] lg:px-16 xl:px-24">

          {/* Mobile Branding */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <img
              src="/CTU_new_logotransparent.svg"
              alt="CTU Logo"
              className="h-12 w-12 object-contain"
            />

            <div>
              <h1 className="text-lg font-bold text-gray-800">
                CTU Supply Office
              </h1>
              <p className="text-xs text-slate-500">
                Cebu Technological University
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[390px]">

            {/* Security Icon */}
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-300">
              <KeyRound className="h-7 w-7 text-gray-800" />
            </div>

            {/* Heading */}
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-[34px]">
                Reset Your Password
              </h2>

              <p className="text-sm leading-6 text-slate-500">
                Create a new password for your account.
                Make sure it is secure and that you can remember it.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <Alert
                variant="destructive"
                className="mb-5 border-red-200 bg-red-50"
              >
                <AlertDescription className="text-sm text-red-700">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Reset Password Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Hidden Reset Token */}
              <input
                type="hidden"
                {...register("reset_token")}
              />

              {/* New Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="new_password"
                  className="text-sm font-semibold text-gray-800"
                >
                  New Password
                </Label>

                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <LockKeyhole className="h-[17px] w-[17px]" />
                  </div>

                  <Input
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    {...register("new_password")}
                    className={`h-12 rounded-lg border-slate-200 bg-slate-100 pl-11 pr-11 text-sm placeholder:text-slate-500 transition-all focus-visible:border-orange-300 focus-visible:ring-orange-300/20 ${
                      errors.new_password ? "border-red-400" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-gray-800"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>

                {errors.new_password && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.new_password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirm_password"
                  className="text-sm font-semibold text-gray-800"
                >
                  Confirm New Password
                </Label>

                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <LockKeyhole className="h-[17px] w-[17px]" />
                  </div>

                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    {...register("confirm_password")}
                    className={`h-12 rounded-lg border-slate-200 bg-slate-100 pl-11 pr-11 text-sm placeholder:text-slate-500 transition-all focus-visible:border-orange-300 focus-visible:ring-orange-300/20 ${
                      errors.confirm_password ? "border-red-400" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-gray-800"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </div>

                {errors.confirm_password && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              {/* Reset Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-lg bg-orange-300 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-200 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-gray-800 transition-colors hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>

            {/* Mobile Footer */}
            <p className="mt-10 text-center text-xs text-slate-500 lg:hidden">
              © {new Date().getFullYear()} Cebu Technological University
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
