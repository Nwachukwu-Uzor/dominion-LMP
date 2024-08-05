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
        error?.response?.data?.message ?? error?.message ?? "An error occurred"
      );
    }
  };

  return (
    <article>
      {isSuccess ? (
        <div>
          <h2 className="text-green-700 font-bold my-2 text-center text-lg uppercase">
            Success
          </h2>
          <div className="h-16 aspect-square mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <FaThumbsUp className="text-2xl text-green-700" />
          </div>
          <p className="mt-2 text-center font-semibold">
            Your registeration request was successful, you will be able to login
            once the request is approved.
          </p>
        </div>
      ) : (
        <>
          <h3 className="scroll-m-20 text-xl text-center font-semibold tracking-tight">
            Signup
          </h3>
          <p className="leading-7 mt-1 text-sm text-center">
            Please provide your credentials...
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-3 mt-7 mb-1">
              <Input
                placeholder="Enter your full name"
                label="Full Name"
                id="fullname"
                {...register("fullName")}
                error={errors?.fullName?.message}
                disabled={isSubmitting}
                autoFocus
              />
              <Input
                placeholder="Email"
                label="Email"
                id="email"
                {...register("email")}
                error={errors?.email?.message}
                disabled={isSubmitting}
              />
              <Input
                placeholder="Password"
                label="Password"
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
                label="Confirm Password"
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
          <p className="text-xs mt-6 lg:mt-16 text-center">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary font-medium hover:opacity-80 duration-200 relative group"
            >
              Login
              <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full duration-200 h-0.5 bg-primary"></span>
            </Link>
          </p>
        </>
      )}
    </article>
  );
};

export default AdminSignUp;
