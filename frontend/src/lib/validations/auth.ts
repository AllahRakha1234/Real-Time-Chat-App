import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const signupSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters long" }),
    image: z
      .any()
      .refine(
        (file) => {
          return file && file instanceof File;
        },
        { message: "Image is required." }
      )
      .refine(
        (file) => {
          if (!file || !(file instanceof File)) return false;
          return file.size > 0;
        },
        { message: "Please select a valid image file." }
      )
      .refine(
        (file) => {
          if (!file || !(file instanceof File)) return false;
          return file.type.startsWith("image/");
        },
        { message: "Please select an image file." }
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginSchema = z.infer<typeof loginSchema>;

export type SignupSchema = z.infer<typeof signupSchema>;
