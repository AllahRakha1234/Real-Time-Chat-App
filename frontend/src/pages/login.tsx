import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/auth.store";
import { loginSchema, type LoginSchema } from "../lib/validations/auth";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const onSubmit = async (data: LoginSchema) => {
    // Clear any previous errors
    clearError();

    try {
      const result = await login(data);

      if (result?.success && result?.user) {
        navigate("/chat");
        toast.success(result?.message ?? "Welcome back!");
      } else {
        toast.error("Login failed");
      }
    } catch {
      toast.error("Something went wrong");
    }

  };

  useEffect(() => {
    document.title = "Login - My Chat App";
  }, []);

  return (
    <div className="my-background min-h-screen w-full flex justify-center items-center flex-col px-4">
      <div className="flex flex-col w-full max-w-md bg-white py-12 px-8 sm:px-12 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center font-heading">SmartTalk</h1>
        <h2 className="text-xl font-medium font-primary text-center text-muted-foreground my-4">
          Log in to your account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-sm ml-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Password Field */}
          <div className="relative space-y-2">
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  <Button variant="simple" onClick={() => setShowPassword(!showPassword)} className="absolute text-primary top-8 right-2 p-0" type="button">
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  {fieldState.error && (
                    <p className="text-red-500 text-sm ml-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Error from store */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Forgot Password */}
          <div className="flex justify-end -mt-5">
            <Link to="/forgot-password">
              <Button variant="link" type="button">Forgot Password?</Button>
            </Link>
          </div>

          <Button type="submit" className="mt-1" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <div className="flex justify-center mt-2">
          <Link to="/register">
            <Button variant="link" size={"sm"}>
              Signup
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
