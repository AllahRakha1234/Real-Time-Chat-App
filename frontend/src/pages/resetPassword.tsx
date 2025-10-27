import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ResetForm {
    newPassword: string;
    confirmPassword: string;
}

const ResetPasswordPage = () => {
    const { resetEmail, resetPassword, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetForm>({
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    useEffect(() => {
        if (!resetEmail) {
            navigate("/forgot-password"); // Prevent unauthorized access
        }
        document.title = "Reset Password - SmartTalk";
    }, [resetEmail, navigate]);

    const onSubmit = async (data: ResetForm) => {
        const result = await resetPassword(data.newPassword);
        if (result.success) {
            toast.success("Password reset successful! Please login.");
            navigate("/");
        } else if (result.error) {
            toast.error(result.error);
        }
    };

    return (
        <div className="my-background min-h-screen w-full flex justify-center items-center p-4">
            <div className="flex flex-col w-full max-w-md bg-white py-6 px-8 sm:px-12 rounded-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-center">SmartTalk</h1>
                <h2 className="text-xl font-medium text-center text-muted-foreground my-2">
                    Set a new password
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
                    {/* New Password */}
                    <Controller
                        name="newPassword"
                        control={control}
                        rules={{
                            required: "New password is required",
                            minLength: { value: 6, message: "Minimum 6 characters required" },
                        }}
                        render={({ field, fieldState }) => (
                            <>
                                <Input
                                    placeholder="New Password"
                                    type="password"
                                    {...field}
                                />
                                {fieldState.error && (
                                    <p className="text-red-500 text-sm ml-1">{fieldState.error.message}</p>
                                )}
                            </>
                        )}
                    />

                    {/* Confirm Password */}
                    <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{
                            validate: (value) =>
                                value === watch("newPassword") || "Passwords do not match",
                        }}
                        render={({ field, fieldState }) => (
                            <>
                                <Input
                                    placeholder="Confirm Password"
                                    type="password"
                                    {...field}
                                />
                                {fieldState.error && (
                                    <p className="text-red-500 text-sm ml-1">{fieldState.error.message}</p>
                                )}
                            </>
                        )}
                    />

                    <Button type="submit" className="mt-4" size="lg" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Reset Password"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
