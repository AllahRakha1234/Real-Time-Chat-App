import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../store/auth.store";
import { signupSchema, type SignupSchema } from "../lib/validations/auth";
import { toast } from "sonner";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      image: undefined,
    },
  });

  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const watchedImage = watch("image");

  const onSubmit = async (data: SignupSchema) => {
    // Clear any previous errors
    clearError();

    console.log("Form data:", data);
    console.log("Image data:", data.image);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);

      // Only append image if it exists
      if (data.image && data.image instanceof File) {
        formData.append("pic", data.image);
      }

      const result = await register(formData);

      if (result.success && result.user) {
        toast.success("Signup successful!");
        reset();
        setTimeout(() => navigate("/"), 1000);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Signup error in component:", error);
      toast.error("Signup failed. Please try again.");
    }
  };

  useEffect(() => {
    document.title = "Register - My Chat App";
  }, []);

  return (
    <div className="my-background min-h-screen w-full flex justify-center items-center p-4">
      <div className="flex flex-col w-full max-w-md bg-white py-6 px-8 sm:px-12 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center">SmartTalk</h1>
        <h2 className="text-xl font-medium text-center text-muted-foreground my-2">
          Register your account
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-3"
        >
          {/* Name Field */}
          <div className="space-y-1">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    label="Name"
                    placeholder="Enter your name"
                    type="text"
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

          {/* Email Field */}
          <div className="space-y-1">
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
          <div className="space-y-1">
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    label="Password"
                    placeholder="Enter password"
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

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <>
                  <Input
                    label="Confirm Password"
                    placeholder="Enter confirm password"
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

          {/* Image Field */}
          <div className="space-y-1">
            <Controller
              name="image"
              control={control}
              render={({ field, fieldState }) => {
                const handleFileChange = (
                  event: React.ChangeEvent<HTMLInputElement>
                ) => {
                  const file = event.target.files?.[0];
                  field.onChange(file || null);
                };
                return (
                  <>
                    <Input
                      label="Image"
                      placeholder="Select your image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                    {watchedImage && (
                      <p className="text-sm text-green-600 ml-1">
                        Selected: {watchedImage.name}
                      </p>
                    )}
                    {fieldState.error && (
                      <p className="text-red-500 text-sm ml-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                );
              }}
            />
          </div>

          {/* Error from store */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          <Button type="submit" className="mt-4" size="lg" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Signup"}
          </Button>
        </form>
        <div className="flex justify-center mt-2">
          <Link to="/">
            <Button variant="link" size={"sm"}>
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
