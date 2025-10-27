import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../store/auth.store";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface OtpForm {
    otp: string;
}

const OtpPage = () => {
    const { control, handleSubmit } = useForm<OtpForm>({
        defaultValues: { otp: "" },
    });

    const { verifyOtp, resetEmail, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Verify OTP - SmartTalk";
        if (!resetEmail) {
            navigate("/forgot-password"); // 🚫 No direct visiting allowed
        }
    }, [resetEmail, navigate]);

    const onSubmit = async (data: OtpForm) => {
        const result = await verifyOtp(data.otp);

        if (result.success) {
            toast.success("OTP Verified!");
            navigate("/reset-password");
        } else if (result.error) {
            toast.error(result.error);
        }
    };

    return (
        <div className="my-background min-h-screen w-full flex justify-center items-center p-4">
            <div className="flex flex-col w-full max-w-md bg-white py-6 px-8 sm:px-12 rounded-3xl shadow-lg">
                <h1 className="text-3xl font-bold text-center">SmartTalk</h1>
                <h2 className="text-xl font-medium text-center text-muted-foreground my-2">
                    Enter the OTP sent to your email
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
                    <div className="space-y-1">
                        <Controller
                            name="otp"
                            control={control}
                            rules={{
                                required: "OTP is required",
                                minLength: { value: 4, message: "OTP must be at least 4 digits" },
                                maxLength: { value: 6, message: "OTP must be max 6 digits" },
                            }}
                            render={({ field, fieldState }) => (
                                <>
                                    <Input placeholder="Enter OTP" type="text" {...field} />
                                    {fieldState.error && (
                                        <p className="text-red-500 text-sm ml-1">{fieldState.error.message}</p>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    <Button type="submit" className="mt-4" size="lg" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default OtpPage;
