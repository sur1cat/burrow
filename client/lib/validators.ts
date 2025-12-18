import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(4, "Password must be at least 4 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    username: z.string().min(2, "Username too short"),
    email: z.string().email("Invalid email"),
    password: z.string().min(4, "Password must be at least 4 characters"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
