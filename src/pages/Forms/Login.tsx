import { useState } from "react";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, Package } from "lucide-react";
import { InputOTPForm } from "@/pages/Forms/InputOTPForm";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema, userLoginType } from "@/types/request/user";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/components/Auth/AuthStore";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { checkUser, errorMessage, otpSent } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: userLoginType) => {
    setIsLoading(true);
    await checkUser(
      data.email,
      data.password,
      (successMessage) => {
        toast({
          title: "Success",
          description: successMessage,
        });
      },
      (errorMessage) => {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    );
    setIsLoading(false);
  };

  interface RenderFieldProps {
    label: string;
    field_name: "email" | "password";
    errors: FieldErrors<userLoginType>;
  }

  const renderField = ({ label, field_name, errors }: RenderFieldProps) => (
    <div className="w-full relative">
      <Label className="text-gray-700 text-sm font-medium">{label}</Label>
      <div className="relative mt-1">
        <Input
          type={
            field_name === "password" && !showPassword ? "password" : "text"
          }
          {...register(field_name)}
          className="w-full h-11 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400"
        />
        {field_name === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-500" />
            ) : (
              <Eye className="w-5 h-5 text-gray-500" />
            )}
          </button>
        )}
      </div>
      {errors && errors[field_name as keyof typeof errors] && (
        <span className="text-xs text-red-500 mt-1">
          {errors[field_name as keyof typeof errors]?.message}
        </span>
      )}
    </div>
  );

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-400 to-orange-600">
      {/* Background with blur - improved for mobile */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image2.jpg')",
          filter: "blur(8px)",
          transform: "scale(1.05)",
        }}
      ></div>

      {/* Login Card - Responsive */}
      <div className="relative w-full max-w-md md:max-w-lg lg:max-w-4xl bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Branding (hidden on mobile, visible on desktop) */}
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 p-8 flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Supply Management System
              </h2>
              <p className="text-orange-100 text-sm">
                Cebu Technological University - Argao Campus
              </p>
            </div>
            <p className="text-orange-100/60 text-xs mt-8">
              © 2024 Supply Management System
            </p>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full md:w-1/2 p-6 md:p-8">
            {/* Mobile Logo */}
            <div className="md:hidden flex justify-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Welcome Back
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Sign in to your account
              </p>
            </div>

            {!otpSent ? (
              <div className="space-y-5">
                {errorMessage && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertDescription>
                      <p className="text-red-500 text-sm">{errorMessage}</p>
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {renderField({ label: "Email", field_name: "email", errors })}
                  {renderField({
                    label: "Password",
                    field_name: "password",
                    errors,
                  })}
                  
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="text-center pt-4">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Register
                    </Link>
                  </p>
                </div>

                {/* Demo Credentials - Helpful for presentation */}
                <div className="mt-6 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 text-center mb-2">
                    Demo Credentials
                  </p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Supply Officer:</span>
                      <span className="font-mono">supply@ctu.edu.ph</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BAC Officer:</span>
                      <span className="font-mono">bac@ctu.edu.ph</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admin:</span>
                      <span className="font-mono">admin@ctu.edu.ph</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Password:</span>
                      <span className="font-mono">password123</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <InputOTPForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;