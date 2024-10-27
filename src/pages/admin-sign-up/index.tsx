import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { AuthService } from "@/services";
import { ClipLoader } from "react-spinners";
// import { NOTIFY_TOKEN_SESSION_STORAGE_KEY } from "@/constants";
import { toast } from "react-toastify";
import { AuthService } from "@/services";
import { FaThumbsUp } from "react-icons/fa";

const schema = z
  .object({
    fullName: z
      .string({
        required_error: "Full name is required",
      })
      .min(2, "Full name is required"),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({ message: "Please provide a valid email" })
      .min(2, "Email is required"),
    accountOfficerCode: z
      .string()
      .min(4, "Account officer code must be at least 4 characters")
      .or(z.literal("")),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string({
        required_error: "Confirm Password is required",
      })
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormFields = z.infer<typeof schema>;

const AdminSignUp = () => {
  const authService = new AuthService();
  // const navigate = useNavigate();

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleToggleShowPassword = () => {
    setShowPassword((shown) => !shown);
  };

  const handleToggleShowConfirmPassword = () => {
    setShowConfirmPassword((shown) => !shown);
  };

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      const response = await authService.signup(values);
      if (response) {
        setIsSuccess(true);
      }
    } catch (error: any) {
      setError("root", {
        type: "deps",
        message:
          error?.response?.data?.message ??
          error?.message ??
          "An error occurred",
      });
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    }
  };

  return (
    <article>
      {isSuccess ? (
        <div>
          <h2 className="my-2 text-center text-lg font-bold uppercase text-green-700">
            Success
          </h2>
          <div className="mx-auto flex aspect-square h-16 items-center justify-center rounded-full bg-green-100">
            <FaThumbsUp className="text-2xl text-green-700" />
          </div>
          <p className="mt-2 text-center font-semibold">
            Your registeration request was successful, you will be able to login
            once the request is approved.
          </p>
        </div>
      ) : (
        <>
          <h3 className="scroll-m-20 text-center text-xl font-semibold tracking-tight">
            Signup
          </h3>
          <p className="mt-1 text-center text-sm leading-7">
            Please provide your credentials...
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-1 mt-7 flex flex-col gap-3">
              <Input
                placeholder="Enter your full name"
                label={
                  <>
                    Full Name <span className="text-xs text-red-500">*</span>
                  </>
                }
                id="fullname"
                {...register("fullName")}
                error={errors?.fullName?.message}
                disabled={isSubmitting}
                autoFocus
              />
              <Input
                placeholder="Email"
                label={
                  <>
                    Email <span className="text-xs text-red-500">*</span>
                  </>
                }
                id="email"
                {...register("email")}
                error={errors?.email?.message}
                disabled={isSubmitting}
              />
              <Input
                placeholder="Account officer code"
                label={<>Account Officer Code </>}
                id="accountOfficerCode"
                {...register("accountOfficerCode")}
                error={errors?.accountOfficerCode?.message}
                disabled={isSubmitting}
              />
              <Input
                placeholder="Password"
                label={
                  <>
                    Password <span className="text-xs text-red-500">*</span>
                  </>
                }
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                error={errors?.password?.message}
                disabled={isSubmitting}
                rightIcon={
                  <button onClick={handleToggleShowPassword} type="button">
                    {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
                  </button>
                }
              />
              <Input
                placeholder="Confirm Password"
                label={
                  <>
                    Confirm Password{" "}
                    <span className="text-xs text-red-500">*</span>
                  </>
                }
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                rightIcon={
                  <button
                    onClick={handleToggleShowConfirmPassword}
                    type="button"
                  >
                    {showConfirmPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
                  </button>
                }
                {...register("confirmPassword")}
                error={errors?.confirmPassword?.message}
                disabled={isSubmitting}
              />

              <div className="flex flex-col gap-0.5">
                {errors?.root?.message?.split(";").map((error) => (
                  <p key={error} className="text-sm text-red-500">
                    {error}
                  </p>
                ))}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <ClipLoader size={12} color="#fff" />{" "}
                    <span>Loading...</span>
                  </>
                ) : (
                  "Signup"
                )}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-xs lg:mt-10">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="group relative font-medium text-primary duration-200 hover:opacity-80"
            >
              Login
              <span className="absolute -bottom-0.5 left-0 h-[0.25px] w-0 bg-primary duration-200 group-hover:w-full"></span>
            </Link>
          </p>
        </>
      )}
    </article>
  );
};

export default AdminSignUp;
