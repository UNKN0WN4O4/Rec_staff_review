import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                        <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Page Not Found
                </h1>

                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 gap-2"
                >
                    <Home className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
