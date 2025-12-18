"use client";

import { useForm } from "react-hook-form";
import { registerSchema, RegisterSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterForm() {
    const { register: registerFn, registerLoading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
    });

    async function onSubmit(values: RegisterSchema) {
        try {
            await registerFn(values);
        } catch (err: any) {
            alert(err.message);
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg space-y-4"
        >
            <h1 className="text-2xl font-bold">Register</h1>

            <div>
                <label className="block mb-1">Username</label>
                <input
                    {...register("username")}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Enter username"
                />
                {errors.username && (
                    <p className="text-red-500 text-sm">{errors.username.message}</p>
                )}
            </div>

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
                disabled={registerLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
                {registerLoading ? "Creating account..." : "Register"}
            </button>
        </form>
    );
}
