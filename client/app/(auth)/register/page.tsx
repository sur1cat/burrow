"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const setSession = useAuthStore((state) => state.setSession);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ email, username, password });
        setSession("dummy-token", { email, username });
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <form
                onSubmit={handleSubmit}
                className="card card-padding max-w-md space-y-4"
            >
                <h2 className="text-2xl">Register</h2>

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
                    <label className="block mb-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                    Register
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
// export default function RegisterPage() {
//     const [email, setEmail] = useState("");
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const setSession = useAuthStore((state) => state.setSession);
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         // TODO: call GraphQL mutation to create user
//         console.log({ email, username, password });
//         setSession("dummy-token", { email, username });
//     };
//
//     return (
//         <div className="flex justify-center items-center min-h-screen">
//             <form
//                 onSubmit={handleSubmit}
//                 className="bg-white p-8 rounded shadow-md w-full max-w-md"
//             >
//                 <h2 className="text-2xl font-bold mb-6">Register</h2>
//                 <label className="block mb-2">Email</label>
//                 <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full p-2 border rounded mb-4"
//                 />
//                 <label className="block mb-2">Username</label>
//                 <input
//                     type="text"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
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
//                     className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
//                 >
//                     Register
//                 </button>
//             </form>
//         </div>
//     );
// }
