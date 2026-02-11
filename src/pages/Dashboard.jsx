import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import FacultyCard from "../components/FacultyCard";
import RatingModal from "../components/RatingModal"; // We'll create this next
import { LogOut } from "lucide-react";

export default function Dashboard() {
    const { logout, currentUser } = useAuth();
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaculty, setSelectedFaculty] = useState(null);

    useEffect(() => {
        fetchFaculty();
    }, []);

    const fetchFaculty = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "faculty"));
            const facultyList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // If empty, seed initial data (for demo purpose, logically this should be admin only/script)
            if (facultyList.length === 0) {
                await seedData();
                // re-fetch? or just set state
                fetchFaculty();
            } else {
                setFaculty(facultyList);
                setLoading(false);
            }
        } catch (err) {
            console.error("Error fetching faculty:", err);
            // Fallback for demo if DB fails/not config
            // setFaculty([{ id: '1', name: 'Harikumar', department: 'CSE' }]); 
            setLoading(false);
        }
    };

    const seedData = async () => {
        // Seed Harikumar
        try {
            await addDoc(collection(db, "faculty"), {
                name: "Harikumar",
                department: "CSE",
                imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Harikumar", // Placeholder
                rating: 0,
                ratingCount: 0
            });
        } catch (e) {
            console.error("Seeding failed", e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">Faculty Rating</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{currentUser?.email}</span>
                            <button
                                onClick={() => logout()}
                                className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {faculty.map((fac) => (
                            <FacultyCard
                                key={fac.id}
                                faculty={fac}
                                onRate={() => setSelectedFaculty(fac)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {selectedFaculty && (
                <RatingModal
                    faculty={selectedFaculty}
                    onClose={() => {
                        setSelectedFaculty(null);
                        fetchFaculty(); // Refresh after rating
                    }}
                />
            )}
        </div>
    );
}
