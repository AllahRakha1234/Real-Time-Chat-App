import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    defaultValues: { email: "" },
  });

  const navigate = useNavigate();
  const { forgotPassword, isLoading } = useAuthStore(); // global isLoading state

  const onSubmit = async (data: ForgotPasswordForm) => {
    const result = await forgotPassword(data.email);

    if (result?.success) {
      toast.success("OTP sent to your email!");
      navigate("/otp", { state: { email: data.email } });
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    document.title = "Forgot Password - SmartTalk";
  }, []);

  return (
    <div className="my-background min-h-screen w-full flex justify-center items-center p-4">
      <div className="flex flex-col w-full max-w-md bg-white py-6 px-8 sm:px-12 rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center">SmartTalk</h1>
        <h2 className="text-xl font-medium text-center text-muted-foreground my-2">
          Enter your email to receive an OTP
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <>
                <Input {...field} placeholder="Enter your email" type="email" />
                {errors.email && (
                  <p className="text-red-500 text-sm ml-1">
                    {errors.email.message}
                  </p>
                )}
              </>
            )}
          />

          <Button
            type="submit"
            className="mt-4"
            size="lg"
            disabled={isLoading || isSubmitting} // ✅ Button lock during request
          >
            {isLoading || isSubmitting ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
