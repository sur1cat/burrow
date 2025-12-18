"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/auth.store";

export default function ProfilePage() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <ProtectedRoute>
            <div className="page-container space-y-4">
                <h1 className="text-3xl">Your Profile</h1>

                <div className="card card-padding space-y-2">
                    {user ? (
                        <>
                            <p>
                                <span className="font-medium">Email:</span>{" "}
                                {user.email ?? "Unknown"}
                            </p>
                            <p>
                                <span className="font-medium">Username:</span>{" "}
                                {user.username ?? "Unknown"}
                            </p>
                        </>
                    ) : (
                        <p className="text-slate-500">
                            No user data available.
                        </p>
                    )}
                </div>

                <button
                    onClick={logout}
                    className="btn btn-danger"
                >
                    Logout
                </button>
            </div>
        </ProtectedRoute>
    );
}




// "use client";
//
// import ProtectedRoute from "@/components/ProtectedRoute";
// import { useAuthStore } from "@/store/auth.store";
//
// export default function ProfilePage() {
//     const user = useAuthStore((s) => s.user);
//     const logout = useAuthStore((s) => s.logout);
//
//     return (
//         <ProtectedRoute>
//             <div className="max-w-xl mx-auto p-6 space-y-4">
//                 <h1 className="text-3xl font-bold">Your Profile</h1>
//
//                 {user ? (
//                     <div className="space-y-2">
//                         <p>
//                             <span className="font-medium">Email:</span>{" "}
//                             {user.email ?? "Unknown"}
//                         </p>
//                         <p>
//                             <span className="font-medium">Username:</span>{" "}
//                             {user.username ?? "Unknown"}
//                         </p>
//                     </div>
//                 ) : (
//                     <p className="text-gray-600">No user data available.</p>
//                 )}
//
//                 <button
//                     onClick={logout}
//                     className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
//                 >
//                     Logout
//                 </button>
//             </div>
//         </ProtectedRoute>
//     );
// }
