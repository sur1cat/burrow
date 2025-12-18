"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const setSession = useAuthStore((state) => state.setSession);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log({ email, password });
        setSession("dummy-token", { email });
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form
                onSubmit={handleSubmit}
                className="card card-padding max-w-md space-y-4"
            >
                <h2 className="text-2xl">Login</h2>

                <div>
                    <label className="block mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                    />
                </div>

                <div>
                    <label className="block mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-full"
                >
                    Login
                </button>
            </form>
        </div>
    );
}



//w/o styling
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
//         <div className="flex justify-center items-center min-h-screen">
//             <form
//                 onSubmit={handleSubmit}
//                 className="bg-white p-8 rounded shadow-md w-full max-w-md"
//             >
//                 <h2 className="text-2xl font-bold mb-6">Login</h2>
//                 <label className="block mb-2">Email</label>
//                 <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full p-2 border rounded mb-4"
//                 />
//                 <label className="block mb-2">Password</label>
//                 <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full p-2 border rounded mb-6"
//                 />
//                 <button
//                     type="submit"
//                     className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
//                 >
//                     Login
//                 </button>
//             </form>
//         </div>
//     );
// }
