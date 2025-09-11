import { z } from "zod";

export const groupCreationSchema = z.object({
    groupName: z
        .string()
        .min(1, { message: "Group name is required" })
        .min(3, { message: "Group name must be at least 3 characters long" }),
    users: z
        .array(z.string())
        .min(3, { message: "Select at least 3 users" }),
});

export type GroupCreationSchema = z.infer<typeof groupCreationSchema>;
