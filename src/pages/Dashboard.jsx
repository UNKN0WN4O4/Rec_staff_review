import { useState, useEffect } from "react";
// Deployment verification timestamp: {new Date().toISOString()}
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import FacultyCard from "../components/FacultyCard";
import RatingModal from "../components/RatingModal";

import { eeeFaculty } from "../data/eeeFaculty";
import { mechFaculty } from "../data/mechFaculty";
import { civilFaculty } from "../data/civilFaculty";
import { cseFaculty } from "../data/cseFaculty";
import { itFaculty } from "../data/itFaculty";

import { LogOut, Database, Server, Zap, Wrench, Hammer } from "lucide-react";

export default function Dashboard() {
    const { logout, currentUser } = useAuth();
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [selectedDept, setSelectedDept] = useState("All Departments");

    const DEPARTMENTS = [
        "All Departments",
        "CSE", "IT", "ECE", "EEE", "MECH",
        "CIVIL", "AERO", "AUTO", "BME", "BT",
        "AI&DS", "CSBS", "Food Tech", "Chemical", "H&S"
    ];

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

    const seedCSEFaculty = async () => {
        if (!window.confirm(`Are you sure you want to add ${cseFaculty.length} faculty members?`)) return;
        setLoading(true);
        let addedCount = 0;
        let skippedCount = 0;
        try {
            for (const fac of cseFaculty) {
                const q = query(collection(db, "faculty"), where("name", "==", fac.name), where("department", "==", fac.department));
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    await addDoc(collection(db, "faculty"), { ...fac, imageUrl: "", rating: 0, ratingCount: 0, characteristics: {} });
                    addedCount++;
                } else { skippedCount++; }
            }
            alert(`Seeding complete!\nAdded: ${addedCount}\nSkipped: ${skippedCount}`);
            fetchFaculty();
        } catch (e) { alert("Error: " + e.message); } finally { setLoading(false); }
    };

    const seedITFaculty = async () => {
        if (!window.confirm(`Are you sure you want to add ${itFaculty.length} IT faculty members?`)) return;
        setLoading(true);
        let addedCount = 0;
        let skippedCount = 0;
        try {
            for (const fac of itFaculty) {
                const q = query(collection(db, "faculty"), where("name", "==", fac.name), where("department", "==", fac.department));
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    await addDoc(collection(db, "faculty"), { ...fac, imageUrl: "", rating: 0, ratingCount: 0, characteristics: {} });
                    addedCount++;
                } else { skippedCount++; }
            }
            alert(`Seeding complete!\nAdded: ${addedCount}\nSkipped: ${skippedCount}`);
            fetchFaculty();
        } catch (e) { alert("Error: " + e.message); } finally { setLoading(false); }
    };

    const seedEEEFaculty = async () => {
        if (!window.confirm(`Are you sure you want to add ${eeeFaculty.length} EEE faculty members?`)) return;
        setLoading(true);
        let addedCount = 0;
        let skippedCount = 0;
        try {
            for (const fac of eeeFaculty) {
                const q = query(collection(db, "faculty"), where("name", "==", fac.name), where("department", "==", fac.department));
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    await addDoc(collection(db, "faculty"), { ...fac, imageUrl: "", rating: 0, ratingCount: 0, characteristics: {} });
                    addedCount++;
                } else { skippedCount++; }
            }
            alert(`Seeding complete!\nAdded: ${addedCount}\nSkipped: ${skippedCount}`);
            fetchFaculty();
        } catch (e) { alert("Error: " + e.message); } finally { setLoading(false); }
    };

    const seedMECHFaculty = async () => {
        if (!window.confirm(`Are you sure you want to add ${mechFaculty.length} MECH faculty members?`)) return;
        setLoading(true);
        let addedCount = 0;
        let skippedCount = 0;
        try {
            for (const fac of mechFaculty) {
                const q = query(collection(db, "faculty"), where("name", "==", fac.name), where("department", "==", fac.department));
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    await addDoc(collection(db, "faculty"), { ...fac, imageUrl: "", rating: 0, ratingCount: 0, characteristics: {} });
                    addedCount++;
                } else { skippedCount++; }
            }
            alert(`Seeding complete!\nAdded: ${addedCount}\nSkipped: ${skippedCount}`);
            fetchFaculty();
        } catch (e) { alert("Error: " + e.message); } finally { setLoading(false); }
    };

    const seedCIVILFaculty = async () => {
        if (!window.confirm(`Are you sure you want to add ${civilFaculty.length} CIVIL faculty members?`)) return;
        setLoading(true);
        let addedCount = 0;
        let skippedCount = 0;
        try {
            for (const fac of civilFaculty) {
                const q = query(collection(db, "faculty"), where("name", "==", fac.name), where("department", "==", fac.department));
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    await addDoc(collection(db, "faculty"), { ...fac, imageUrl: "", rating: 0, ratingCount: 0, characteristics: {} });
                    addedCount++;
                } else { skippedCount++; }
            }
            alert(`Seeding complete!\nAdded: ${addedCount}\nSkipped: ${skippedCount}`);
            fetchFaculty();
        } catch (e) { alert("Error: " + e.message); } finally { setLoading(false); }
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
                                className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>

                            {/* Temporary Seed Buttons */}
                            <button onClick={seedCSEFaculty} className="p-2 rounded-full text-indigo-600" title="Seed CSE"><Database className="h-5 w-5" /></button>
                            <button onClick={seedITFaculty} className="p-2 rounded-full text-blue-600" title="Seed IT"><Server className="h-5 w-5" /></button>
                            <button onClick={seedEEEFaculty} className="p-2 rounded-full text-yellow-600" title="Seed EEE"><Zap className="h-5 w-5" /></button>
                            <button onClick={seedMECHFaculty} className="p-2 rounded-full text-gray-600" title="Seed MECH"><Wrench className="h-5 w-5" /></button>
                            <button onClick={seedCIVILFaculty} className="p-2 rounded-full text-orange-600" title="Seed CIVIL"><Hammer className="h-5 w-5" /></button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-end">
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm text-gray-900 bg-white"
                    >
                        {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {faculty
                            .filter(fac => selectedDept === "All Departments" || fac.department === selectedDept)
                            .map((fac) => (
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
