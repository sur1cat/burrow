"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function Navbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <nav className="navbar">
            <div className="flex gap-4">
                <Link href="/feed" className="navbar-link">
                    Feed
                </Link>

                {user && (
                    <Link href="/profile" className="navbar-link">
                        Profile
                    </Link>
                )}
            </div>

            <div>
                {user ? (
                    <button onClick={logout} className="navbar-link">
                        Logout
                    </button>
                ) : (
                    <Link href="/login" className="navbar-link">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}



// "use client";
//
// import Link from "next/link";
// import { useAuthStore } from "@/store/auth.store";
//
// export default function Navbar() {
//     const user = useAuthStore((s) => s.user);
//     const logout = useAuthStore((s) => s.logout);
//
//     return (
//         <nav className="w-full bg-gray-900 text-white px-6 py-3 flex justify-between">
//             <div className="flex gap-4">
//                 <Link href="/feed" className="hover:underline">
//                     Feed
//                 </Link>
//
//                 {user && (
//                     <Link href="/profile" className="hover:underline">
//                         Profile
//                     </Link>
//                 )}
//             </div>
//
//             <div>
//                 {user ? (
//                     <button onClick={logout} className="hover:underline">
//                         Logout
//                     </button>
//                 ) : (
//                     <Link href="/login" className="hover:underline">
//                         Login
//                     </Link>
//                 )}
//             </div>
//         </nav>
//     );
// }







//without mock data
// "use client";
//
// import Link from "next/link";
// import { useAuthStore } from "@/store/auth.store";
//
// export default function Navbar() {
//     const { user, logout } = useAuthStore();
//
//     return (
//         <nav className="bg-gray-800 text-white p-4 flex justify-between">
//             <div>
//                 <Link href="/feed" className="font-bold text-lg">
//                     MERN Social
//                 </Link>
//             </div>
//             <div className="space-x-4">
//                 {user ? (
//                     <>
//                         <span>{user.username || user.email}</span>
//                         <button onClick={logout} className="bg-red-500 px-2 py-1 rounded">
//                             Logout
//                         </button>
//                     </>
//                 ) : (
//                     <>
//                         <Link href="/login" className="hover:underline">
//                             Login
//                         </Link>
//                         <Link href="/register" className="hover:underline">
//                             Register
//                         </Link>
//                     </>
//                 )}
//             </div>
//         </nav>
//     );
// }
