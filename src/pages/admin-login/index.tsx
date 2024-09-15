import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { EyeNoneIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { AuthService } from "@/services";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { AuthService } from "@/services";
import { SESSION_STORAGE_KEY } from "@/constants";

const schema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .min(2, "Email is required")
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters"),
});

type FormFields = z.infer<typeof schema>;

const AdminLogin = () => {
  const authService = new AuthService();
  const navigate = useNavigate();

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleToggleShowPassword = () => {
    setShowPassword((shown) => !shown);
  };
  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      // console.log("Here");
      const response = await authService.login(values);
      if (response.payload) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, response.payload);
        navigate("/");
      }

      // sessionStorage.setItem(NOTIFY_TOKEN_SESSION_STORAGE_KEY, response);
      // toast.success("Login successful");
      // navigate("/dashboard");
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
      <h3 className="scroll-m-20 text-xl text-center font-semibold tracking-tight">
        Login
      </h3>
      <p className="leading-7 mt-1 text-sm text-center">
        Enter your valid credentials
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 mt-7 mb-1">
          <Input
            placeholder="Email"
            label="Email"
            id="email"
            {...register("email")}
            error={errors?.email?.message}
            disabled={isSubmitting}
            autoFocus
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
              <button onClick={handleToggleShowPassword} type="button" disabled={isSubmitting}>
                {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
              </button>
            }
          />
          {/* <Link
            to="/auth/forgot-password/account-number"
            className="mt-0.5 text-primary text-xs group font-medium duration-200 relative w-fit text-center"
          >
            Forgot Password?{" "}
            <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full duration-200 h-0.5 bg-primary"></span>
          </Link> */}
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
                <ClipLoader size={12} color="#fff" /> <span>Loading...</span>
              </>
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </form>
      <p className="mt-8 lg:mt-16 text-xs text-center">
        Yet to create an account?{" "}
        <Link
          to="/auth/signup"
          className="text-primary font-medium hover:opacity-80 duration-200 relative group"
        >
          Sign up
          <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full duration-200 h-0.5 bg-primary"></span>
        </Link>
      </p>
    </article>
  );
};

export default AdminLogin;
