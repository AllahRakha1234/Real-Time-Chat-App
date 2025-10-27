import { createBrowserRouter } from "react-router-dom";
import RegisterPage from "@/pages/register";
import LoginPage from "@/pages/login";
import ChatPage from "@/pages/chat";
import ForgotPasswordPage from "@/pages/forgotPassword";
import NotFoundPage from "@/pages/notFound";
import RootLayout from "@/layouts/RootLayout";
import ErrorElement from "@/pages/errorElement";
import OtpPage from "@/pages/otp";
import ResetPasswordPage from "@/pages/resetPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/chat",
    element: <RootLayout />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
    ],
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/otp",
    element: <OtpPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
