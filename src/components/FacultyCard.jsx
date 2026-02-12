import { memo } from "react";
import { Star } from "lucide-react";

const FacultyCard = memo(({ faculty, onRate }) => {
    return (
        <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700 overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-50/50 dark:bg-indigo-900/20 blur-3xl group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-800/30 transition-colors duration-500"></div>

            <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <img
                                className="h-14 w-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm relative z-10"
                                src={faculty.imageUrl || `https://ui-avatars.com/api/?name=${faculty.name}&background=6366f1&color=fff`}
                                alt={`${faculty.name}`}
                            />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                                {faculty.name}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 mt-1">
                                {faculty.department}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {faculty.rating ? faculty.rating.toFixed(1) : "N/A"}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {faculty.ratingCount || 0} reviews
                        </span>
                    </div>
                </div>

                {/* Top Characteristics */}
                <div className="mt-4 min-h-[28px]">
                    {faculty.characteristics && Object.keys(faculty.characteristics).length > 0 ? (
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
                            {Object.entries(faculty.characteristics)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 3)
                                .map(([char]) => (
                                    <span key={char} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                        #{char}
                                    </span>
                                ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No tags yet</p>
                    )}
                </div>
            </div>

            <div className="bg-gray-50/50 dark:bg-gray-700/30 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/20 transition-colors duration-300">
                <button
                    onClick={onRate}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform active:scale-95"
                >
                    <Star className="w-4 h-4" />
                    <span>Rate Faculty</span>
                </button>
            </div>
        </div>
    );
});

export default FacultyCard;
