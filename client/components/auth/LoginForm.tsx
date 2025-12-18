"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema, LoginSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";

export default function LoginForm() {
    const { login, loginLoading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(values: LoginSchema) {
        try {
            await login(values);
        } catch (err: any) {
            alert(err.message);
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg space-y-4"
        >
            <h1 className="text-2xl font-bold">Login</h1>

            <div>
                <label className="block mb-1">Email</label>
                <input
                    {...register("email")}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Enter email"
                />
                {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label className="block mb-1">Password</label>
                <input
                    type="password"
                    {...register("password")}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Enter password"
                />
                {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
            </div>

            <button
                disabled={loginLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
                {loginLoading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}
