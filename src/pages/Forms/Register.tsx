
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ShieldCheck,
  ArrowRight,
  User,
  Hash,
  BriefcaseBusiness,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  registerFormSchema,
  type RegisterInputData,
} from "@/types/request/input";
import { useRegisterUser } from "@/services/registerUserServices";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/response/api-response";
import { UserResponse } from "@/types/request/user";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Register = () => {
  const [isloading, setIsloading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate } = useRegisterUser();

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<RegisterInputData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      employee_id: "",
      first_name: "",
      last_name: "",
      email: "",
      role: "",
      password: "",
      password2: "",
    },
  });

  const onSubmit = async (data: RegisterInputData) => {
    setIsloading(true);
    setErrorMessage(null);

    const result = registerFormSchema.safeParse(data);

    if (result.success) {
      mutate(data, {
        onSuccess: (response: ApiResponse<UserResponse>) => {
          setIsloading(false);

          if (response.status === "success") {
            navigate("/");

            toast({
              title: "Success",
              description:
                "Your account is pending activation by an administrator. You'll be notified once it's activated.",
            });
          } else {
            const responseError = response.error?.response?.data as {
              email?: string;
              employee_id?: string;
            };

            setErrorMessage(
              responseError?.email ??
                responseError?.employee_id ??
                "Registration failed. Please check your information."
            );
          }
        },

        onError: (error) => {
          setIsloading(false);

          if (error instanceof AxiosError) {
            const responseData = error.response?.data;

            setErrorMessage(
              responseData?.email ??
                responseData?.employee_id ??
                responseData?.detail ??
                "Registration failed. Please check your information."
            );
          } else {
            setErrorMessage("An unexpected error occurred.");
          }
        },
      });
    } else {
      setIsloading(false);
    }
  };

  const handleRoleChange = (roleValue: string) => {
    setValue("role", roleValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const renderInput = ({
    label,
    fieldName,
    placeholder,
    icon,
    type = "text",
    passwordVisible,
    togglePassword,
  }: {
    label: string;
    fieldName: keyof RegisterInputData;
    placeholder: string;
    icon: React.ReactNode;
    type?: string;
    passwordVisible?: boolean;
    togglePassword?: () => void;
  }) => {
    const isPassword = type === "password";

    return (
      <div className="min-w-0 space-y-1.5">
        <Label
          htmlFor={fieldName}
          className="text-xs font-semibold text-gray-800 sm:text-sm"
        >
          {label}
        </Label>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </div>

          <Input
            id={fieldName}
            type={
              isPassword
                ? passwordVisible
                  ? "text"
                  : "password"
                : type
            }
            placeholder={placeholder}
            autoComplete={
              fieldName === "password"
                ? "new-password"
                : fieldName === "password2"
                  ? "new-password"
                  : fieldName === "email"
                    ? "email"
                    : "off"
            }
            {...register(fieldName)}
            className={`h-11 rounded-lg border-slate-200 bg-slate-100 pl-10 ${
              isPassword ? "pr-10" : "pr-3"
            } text-sm placeholder:text-slate-500 transition-all focus-visible:border-orange-300 focus-visible:ring-orange-300/20 ${
              errors[fieldName] ? "border-red-400" : ""
            }`}
          />

          {isPassword && togglePassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-gray-800"
              onClick={togglePassword}
              aria-label={
                passwordVisible ? "Hide password" : "Show password"
              }
            >
              {passwordVisible ? (
                <EyeOff className="h-[17px] w-[17px]" />
              ) : (
                <Eye className="h-[17px] w-[17px]" />
              )}
            </button>
          )}
        </div>

        {errors[fieldName] && (
          <p className="text-xs font-medium text-red-500">
            {errors[fieldName]?.message as string}
          </p>
        )}
      </div>
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
                Join the
                <br />
                Supply Management
                <br />
                System.
              </h2>

              <p className="max-w-md text-sm leading-7 text-gray-800 xl:text-base">
                Create your institutional account to access procurement
                workflows, inventory monitoring, purchase requests, and
                supply distribution services.
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
          <div className="mb-7 flex items-center justify-center gap-3 lg:hidden">
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

          <div className="mx-auto w-full max-w-[520px]">

            {/* Heading */}
            <div className="mb-6 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-[34px]">
                Create Your Account
              </h2>

              <p className="text-sm leading-6 text-slate-500">
                Fill in your information to register for the CTU Supply
                Management System.
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

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Employee Number */}
              {renderInput({
                label: "Employee Number",
                fieldName: "employee_id",
                placeholder: "Enter your employee number",
                icon: <Hash className="h-[17px] w-[17px]" />,
              })}

              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {renderInput({
                  label: "First Name",
                  fieldName: "first_name",
                  placeholder: "First name",
                  icon: <User className="h-[17px] w-[17px]" />,
                })}

                {renderInput({
                  label: "Last Name",
                  fieldName: "last_name",
                  placeholder: "Last name",
                  icon: <User className="h-[17px] w-[17px]" />,
                })}
              </div>

              {/* Email and Role */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {renderInput({
                  label: "Institutional Email",
                  fieldName: "email",
                  placeholder: "Enter your email",
                  icon: <Mail className="h-[17px] w-[17px]" />,
                  type: "email",
                })}

                <div className="min-w-0 space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-800 sm:text-sm">
                    Account Role
                  </Label>

                  <Select onValueChange={handleRoleChange}>
                    <SelectTrigger
                      className={`h-11 rounded-lg border-slate-200 bg-slate-100 text-sm focus:ring-orange-300/20 ${
                        errors.role ? "border-red-400" : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <BriefcaseBusiness className="h-[17px] w-[17px] shrink-0 text-slate-500" />
                        <SelectValue placeholder="Select role" />
                      </div>
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Supply Officer">
                        Supply Officer
                      </SelectItem>

                      <SelectItem value="BAC Officer">
                        BAC Officer
                      </SelectItem>

                      <SelectItem value="Requisitioner">
                        Requisitioner
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {errors.role && (
                    <p className="text-xs font-medium text-red-500">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {renderInput({
                  label: "Password",
                  fieldName: "password",
                  placeholder: "Enter password",
                  icon: <LockKeyhole className="h-[17px] w-[17px]" />,
                  type: "password",
                  passwordVisible: showPassword,
                  togglePassword: () =>
                    setShowPassword((prev) => !prev),
                })}

                {renderInput({
                  label: "Confirm Password",
                  fieldName: "password2",
                  placeholder: "Confirm password",
                  icon: <LockKeyhole className="h-[17px] w-[17px]" />,
                  type: "password",
                  passwordVisible: showConfirmPassword,
                  togglePassword: () =>
                    setShowConfirmPassword((prev) => !prev),
                })}
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                disabled={isloading}
                className="mt-3 h-12 w-full rounded-lg bg-orange-300 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-200 disabled:opacity-70"
              >
                {isloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/"
                  className="font-semibold text-gray-800 hover:text-gray-800 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Mobile Footer */}
            <p className="mt-7 text-center text-xs text-slate-500 lg:hidden">
              © {new Date().getFullYear()} Cebu Technological University
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
