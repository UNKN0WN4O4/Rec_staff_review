import { useState, useEffect } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { db } from "../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import FacultyCard from "../components/FacultyCard";
import RatingModal from "../components/RatingModal";



import { LogOut, Search, Star, Moon, Sun, Database } from "lucide-react";
import facultyData from "../data/facultyData.json";

export default function Dashboard() {
    const { logout, currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [selectedDept, setSelectedDept] = useState("All Departments");
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);

    const DEPARTMENTS = [
        "All Departments",
        "CSE", "IT", "ECE", "EEE", "MECH",
        "CIVIL", "AERO", "AUTOMOBILE", "BME", "BIOTECH",
        "AIDS", "AIML", "CSBS", "CSD", "FOOD TECH", "CHEMICAL", "HUMANITIES",
        "MEGATRONICS", "R&A", "MBA"
    ];

    useEffect(() => {
        fetchFaculty();
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fetchFaculty = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "faculty"));
            const facultyList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (facultyList.length === 0) {
                // Empty logic
            } else {
                setFaculty(facultyList);
                setLoading(false);
            }
        } catch (err) {
            console.error("Error fetching faculty:", err);
            setLoading(false);
        }
    };

    const handleSeedData = async () => {
        if (!confirm("Are you sure you want to seed the database? This might create duplicates if run multiple times.")) return;

        setLoading(true);
        try {
            let count = 0;
            for (const facultyMember of facultyData) {
                // Check for duplicates based on name and department
                const q = query(
                    collection(db, "faculty"),
                    where("name", "==", facultyMember.name),
                    where("department", "==", facultyMember.department)
                );
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    await addDoc(collection(db, "faculty"), facultyMember);
                    count++;
                }
            }
            alert(`Successfully seeded ${count} new faculty members!`);
            fetchFaculty();
        } catch (err) {
            console.error("Error seeding data:", err);
            alert("Error seeding data. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const filteredFaculty = faculty.filter(fac => {
        const matchesDept = selectedDept === "All Departments" || fac.department === selectedDept;
        const matchesSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fac.department.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesDept && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors duration-300">
            {/* Navbar */}
            <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800" : "bg-transparent"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1">
                                <img src="/REC.png" alt="REC Logo" className="h-full w-full object-contain" />
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                                Staff Rating
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                                title="Toggle Theme"
                            >
                                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            </button>
                            <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 font-medium">{currentUser?.email}</span>
                            <button
                                onClick={() => logout()}
                                className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 focus:outline-none transition-all duration-200"
                                title="Sign Out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12 animate-fade-in">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                        Rate Your Professors
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Share your honest feedback anonymously and help others choose the right courses.
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sticky top-20 z-30 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/50 dark:border-gray-700 shadow-sm animate-slide-up transition-colors duration-300">
                    <div className="relative flex-1 max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 shadow-sm"
                            placeholder="Search faculty by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Horizontal Scrollable Pills for Departments */}
                    <div className="flex-1 w-full overflow-x-auto pb-2 sm:pb-0 sm:ml-4 hide-scrollbar">
                        <div className="flex space-x-2">
                            {/* Seed Button (Temporary) */}
                            <button
                                onClick={handleSeedData}
                                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 transition-colors"
                                title="Seed Database"
                            >
                                <Database className="h-4 w-4 inline mr-1" />
                                Seed Data
                            </button>
                            {DEPARTMENTS.map((dept) => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedDept === dept
                                        ? "bg-indigo-600 text-white shadow-md transform scale-105"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600"
                                        }`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {filteredFaculty.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600 mb-4">
                                    <Search className="h-full w-full opacity-20" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No faculty found</h3>
                                <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your search or filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                {filteredFaculty.map((fac) => (
                                    <FacultyCard
                                        key={fac.id}
                                        faculty={fac}
                                        onRate={() => setSelectedFaculty(fac)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
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
