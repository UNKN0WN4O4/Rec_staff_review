import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, runTransaction, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { X, Star } from "lucide-react";

export default function RatingModal({ faculty, onClose }) {
    const [rating, setRating] = useState(0);
    const [selectedCharacteristics, setSelectedCharacteristics] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const { currentUser } = useAuth();
    const [hoverRating, setHoverRating] = useState(0);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [checkingReview, setCheckingReview] = useState(true);

    const CHARACTERISTICS = [
        "Chill", "Strict", "Friendly", "Rude",
        "Helpful", "Harsh", "Writing Heavy",
        "Knowledgeable", "Interactive", "Funny"
    ];

    const toggleCharacteristic = (char) => {
        if (selectedCharacteristics.includes(char)) {
            setSelectedCharacteristics(prev => prev.filter(c => c !== char));
        } else {
            // Optional: Limit selection to e.g., 3 tags? For now, unlimited as per prompt "student press it".
            setSelectedCharacteristics(prev => [...prev, char]);
        }
    };

    // Check if user has already reviewed
    useEffect(() => {
        if (!faculty || !currentUser) return;

        const checkExistingReview = async () => {
            setCheckingReview(true);
            try {
                // Check using the new specific ID format first (cheaper/faster)
                const specificReviewRef = doc(db, "faculty", faculty.id, "reviews", currentUser.uid);
                const specificSnap = await getDocs(query(collection(db, "faculty", faculty.id, "reviews"), where("userId", "==", currentUser.uid))); // Kept query for backward compatibility

                // We can just query essentially since we want to catch legacy auto-ids too
                // The transaction handles the strict enforcement for new ones
                const reviewsRef = collection(db, "faculty", faculty.id, "reviews");
                const q = query(reviewsRef, where("userId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    setHasReviewed(true);
                }
            } catch (error) {
                console.error("Error checking for existing review:", error);
            } finally {
                setCheckingReview(false);
            }
        };

        checkExistingReview();
    }, [faculty, currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0 || !faculty) return;
        if (hasReviewed) {
            alert("You have already reviewed this faculty member.");
            return;
        }
        setSubmitting(true);

        try {
            const facultyRef = doc(db, "faculty", faculty.id);
            await runTransaction(db, async (transaction) => {
                const facultyDoc = await transaction.get(facultyRef);
                if (!facultyDoc.exists()) throw "Document does not exist!";

                // Use the user's UID as the document ID for the review
                const reviewRef = doc(collection(facultyRef, "reviews"), currentUser.uid);
                const reviewDoc = await transaction.get(reviewRef);

                if (reviewDoc.exists()) {
                    throw new Error("You have already reviewed this faculty member.");
                }

                // Legacy check
                const reviewsRef = collection(facultyRef, "reviews");
                const q = query(reviewsRef, where("userId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    throw new Error("You have already reviewed this faculty member.");
                }

                const currentData = facultyDoc.data();
                const newCount = (currentData.ratingCount || 0) + 1;
                const oldRating = currentData.rating || 0;
                const oldCount = currentData.ratingCount || 0;
                const newRating = ((oldRating * oldCount) + rating) / newCount;

                // Update characteristics counts
                const charCounts = currentData.characteristics || {};
                selectedCharacteristics.forEach(char => {
                    charCounts[char] = (charCounts[char] || 0) + 1;
                });

                transaction.set(reviewRef, {
                    userId: currentUser?.uid || 'anonymous',
                    userEmail: currentUser?.email || 'anonymous',
                    rating: rating,
                    characteristics: selectedCharacteristics,
                    timestamp: new Date()
                });

                transaction.update(facultyRef, {
                    rating: newRating,
                    ratingCount: newCount,
                    characteristics: charCounts
                });
            });
            onClose();
        } catch (err) {
            console.error("Error submitting rating:", err);
            alert("Error: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!faculty) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white text-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Rate {faculty.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">{faculty.department}</p>
                </div>

                {checkingReview ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                        <p className="text-gray-500 text-sm">Checking eligibility...</p>
                    </div>
                ) : hasReviewed ? (
                    <div className="text-center py-6">
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md inline-block mb-4">
                            <p className="font-medium">Check complete</p>
                        </div>
                        <p className="text-red-500 font-medium mb-2">You have already reviewed this faculty member.</p>
                        <p className="text-gray-600 text-sm">Thank you for your feedback!</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors font-medium"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stars */}
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        size={40}
                                        className={
                                            (hoverRating || rating) >= star
                                                ? "text-yellow-400 fill-yellow-400 transition-colors"
                                                : "text-gray-300 transition-colors"
                                        }
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Characteristics Pills */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-3 block">Select Characteristics:</p>
                            <div className="flex flex-wrap gap-2">
                                {CHARACTERISTICS.map((char) => (
                                    <button
                                        key={char}
                                        onClick={() => toggleCharacteristic(char)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${selectedCharacteristics.includes(char)
                                                ? "bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm transform scale-105"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                            }`}
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || rating === 0}
                                className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg ${(submitting || rating === 0)
                                    ? 'opacity-50 cursor-not-allowed shadow-none'
                                    : ''
                                    }`}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Submitting...
                                    </span>
                                ) : "Submit Rating"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
