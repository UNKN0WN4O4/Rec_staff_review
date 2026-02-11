import { Star } from "lucide-react";

export default function FacultyCard({ faculty, onRate }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <img className="h-12 w-12 rounded-full" src={faculty.imageUrl || `https://ui-avatars.com/api/?name=${faculty.name}`} alt={faculty.name} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {faculty.department}
                            </dt>
                            <dd>
                                <div className="text-lg font-medium text-gray-900">{faculty.name}</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="ml-2 text-sm font-bold text-gray-900">
                            {faculty.rating ? faculty.rating.toFixed(1) : "N/A"}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                            ({faculty.ratingCount || 0})
                        </span>
                    </div>
                    <button
                        onClick={onRate}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        Rate Now
                    </button>
                </div>
            </div>
        </div>
    );
}
