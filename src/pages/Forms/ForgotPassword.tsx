
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  forgotPasswordType,
} from "@/types/request/user";
import useAuthStore from "@/components/Auth/AuthStore";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-0 sm:p-5 lg:p-8">
      <div className="flex min-h-screen w-full max-w-[1150px] overflow-hidden bg-white shadow-xl sm:min-h-[650px] sm:rounded-2xl lg:min-h-[700px]">

        {/* LEFT PANEL */}
        <div className="relative hidden w-[54%] flex-col justify-between overflow-hidden bg-[#762719] p-10 text-white lg:flex xl:p-12">

          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/image2.jpg')",
            }}
          />

          {/* Dark Red Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#672014]/95 via-[#8D2B19]/85 to-[#B64A20]/75" />

          {/* Branding */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 p-1.5 shadow-md">
              <img
                src="/CTU_new_logotransparent.svg"
                alt="Cebu Technological University Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                CTU Supply Office
              </h1>
              <p className="text-xs text-white/75">
                Cebu Technological University
              </p>
            </div>
          </div>

          {/* Main Introduction */}
          <div className="relative z-10 max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              SECURE INSTITUTIONAL ACCESS
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-[44px]">
                Your Account.
                <br />
                Your Access.
                <br />
                Always Secure.
              </h2>

              <p className="max-w-md text-sm leading-7 text-white/80 xl:text-base">
                We help keep your institutional account secure.
                Follow the verification process to safely restore
                access to your Supply Management System account.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-5">
            <div className="flex items-center gap-3">
              <img
                src="/CTU_new_logotransparent.svg"
                alt="CTU"
                className="h-8 w-8 rounded-full bg-white/90 p-1 object-contain"
              />

              <div>
                <p className="text-xs font-semibold">
                  Cebu Technological University
                </p>
                <p className="text-[10px] text-white/65">
                  Argao Campus
                </p>
              </div>
            </div>

            <p className="text-[10px] text-white/65">
              © {new Date().getFullYear()} CTU
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-12 lg:w-[46%] lg:px-12 xl:px-16">

          {/* Mobile Branding */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <img
              src="/CTU_new_logotransparent.svg"
              alt="CTU Logo"
              className="h-12 w-12 object-contain"
            />

            <div>
              <h1 className="text-lg font-bold text-slate-800">
                CTU Supply Office
              </h1>
              <p className="text-xs text-slate-500">
                Cebu Technological University
              </p>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[390px]">

            {/* Recovery Icon */}
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#922D1A]/10">
              <Mail className="h-7 w-7 text-[#922D1A]" />
            </div>

            {/* Heading */}
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-[34px]">
                Forgot Your Password?
              </h2>

              <p className="text-sm leading-6 text-slate-500">
                No worries. Enter your institutional email address
                below, and we'll send you a verification code to
                reset your password.
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

            {/* Recovery Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Institutional Email
                </Label>

                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-[17px] w-[17px]" />
                  </div>

                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your institutional email"
                    autoComplete="email"
                    {...register("email")}
                    className={`h-12 rounded-lg border-slate-200 bg-slate-50 pl-11 text-sm placeholder:text-slate-400 transition-all focus-visible:border-[#A52A16] focus-visible:ring-[#A52A16]/20 ${
                      errors.email ? "border-red-400" : ""
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-lg bg-[#922D1A] text-sm font-semibold text-white shadow-md shadow-[#922D1A]/20 transition-all hover:bg-[#752214] hover:shadow-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Verification Code...
                  </>
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#96321F] transition-colors hover:text-[#6F2115]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </button>
            </div>

            {/* Mobile Footer */}
            <p className="mt-10 text-center text-xs text-slate-400 lg:hidden">
              © {new Date().getFullYear()} Cebu Technological University
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
