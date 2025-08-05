import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/auth.store";
import { loginSchema, type LoginSchema } from "../lib/validations/auth";

type LoginFormInputs = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const { login, isLoading, error } = useAuthStore();

  const onSubmit = async (data: LoginFormInputs) => {
    console.log("login called");
    await login(data);
    // Clear the states
    reset();
  };

  return (
    <div className="my-background min-h-screen w-full flex justify-center items-center px-4">
      <div className="flex flex-col w-full max-w-md bg-white py-12 px-8 sm:px-12 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center">My Chat App</h1>
        <h2 className="text-xl font-medium text-center text-muted-foreground my-4">
          Log in to your account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Email Field */}
          <Controller
            name="email"
            control={control}
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                type="email"
                {...field}
              />
            )}
          />
          {errors.email && (
            <p className="text-red-500 text-sm -mt-2">{errors.email.message}</p>
          )}

          {/* Password Field */}
          <Controller
            name="password"
            control={control}
            rules={{ required: "Password is required" }}
            render={({ field }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                type="password"
                {...field}
              />
            )}
          />
          {errors.password && (
            <p className="text-red-500 text-sm -mt-2">
              {errors.password.message}
            </p>
          )}

          {/* Error from store */}
          {error && (
            <p className="text-red-500 text-sm -mt-2 text-center">{error}</p>
          )}

          <Button type="submit" className="mt-6" size="lg" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
