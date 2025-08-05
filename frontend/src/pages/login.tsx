import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/auth.store";
import { loginSchema, type LoginSchema } from "../lib/validations/auth";
import { toast } from "sonner";

const LoginPage = () => {
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

  const { login, isLoading, error, user, clearError } = useAuthStore();

  const onSubmit = async (data: LoginSchema) => {
    // Clear any previous errors
    clearError();

    try {
      const result = await login(data);

      if (result.success && result.user) {
        toast.success("Login successful!");
        reset();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Login error in component:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="my-background min-h-screen w-full flex justify-center items-center px-4">
      <div className="flex flex-col w-full max-w-md bg-white py-12 px-8 sm:px-12 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center">My Chat App</h1>
        <h2 className="text-xl font-medium text-center text-muted-foreground my-4">
          Log in to your account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
          <div className="space-y-2">
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
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

          {/* Error from store */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
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
