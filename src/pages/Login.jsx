import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
    const { login, currentUser, error } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    const handleLogin = async () => {
        try {
            await login();
            navigate("/");
        } catch (err) {
            console.error("Failed to login", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Faculty Rating Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in with your institutional email
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="mt-8 space-y-6">
                    <button
                        onClick={handleLogin}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <FcGoogle className="h-5 w-5 bg-white rounded-full" />
                        </span>
                        Sign in with Google
                    </button>
                    <div className="text-center text-xs text-gray-500">
                        Restricted to @rajalakshmi.edu.in
                    </div>
                </div>
            </div>
        </div>
    );
}
