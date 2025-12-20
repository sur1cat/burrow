"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { LOGIN_MUTATION } from "@/graphql/mutations/auth";
import { useAuthStore } from "@/store/auth.store";

//m
interface LoginResponse {
    login: {
        token: string;
        user: {
            id: string;
            email: string;
            username: string;
        };
    };
}

interface LoginVariables {
    email: string;
    password: string;
}




export default function LoginPage() {
    const router = useRouter();
    const setSession = useAuthStore((state) => state.setSession);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //m    const [login, { loading, error }] = useMutation(LOGIN_MUTATION);
    const [login, { loading, error }] = useMutation<
        LoginResponse,
        LoginVariables
    >(LOGIN_MUTATION);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await login({
                variables: { email, password },
            });

            const token = data?.login?.token;
            const user = data?.login?.user;

            if (!token || !user) {
                throw new Error("Invalid login response");
            }

            // Store token for Apollo auth header
            localStorage.setItem("token", token);

            // Store in Zustand
            setSession(token, user);

            // Redirect to feed
            router.push("/feed");
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error(err);
            }
        }

    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form
                onSubmit={handleSubmit}
                className="card card-padding max-w-md space-y-4 w-full"
            >
                <h2 className="text-2xl">Login</h2>

                <div>
                    <label className="block mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        required
                    />
                </div>

                <div>
                    <label className="block mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                        required
                    />
                </div>

                {error && (
                    <p className="text-red-600 text-sm">
                        {error.message}
                    </p>
                )}

                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}





// "use client";
//
// import { useState } from "react";
// import { useAuthStore } from "@/store/auth.store";
//
// export default function LoginPage() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const setSession = useAuthStore((state) => state.setSession);
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//
//         console.log({ email, password });
//         setSession("dummy-token", { email });
//     };
//
//     return (
//         <div className="flex items-center justify-center min-h-screen">
//             <form
//                 onSubmit={handleSubmit}
//                 className="card card-padding max-w-md space-y-4"
//             >
//                 <h2 className="text-2xl">Login</h2>
//
//                 <div>
//                     <label className="block mb-1">Email</label>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="input"
//                     />
//                 </div>
//
//                 <div>
//                     <label className="block mb-1">Password</label>
//                     <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="input"
//                     />
//                 </div>
//
//                 <button
//                     type="submit"
//                     className="btn btn-primary w-full"
//                 >
//                     Login
//                 </button>
//             </form>
//         </div>
//     );
// }
//
