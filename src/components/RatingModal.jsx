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

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (faculty) {
            setIsVisible(true);
        }
    }, [faculty]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200); // Wait for animation
    };

    if (!faculty) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>

                {/* Header with decorative background */}
                <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center">
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="mt-2 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-white p-1 shadow-lg mb-3">
                            <img
                                className="w-full h-full rounded-full object-cover"
                                src={faculty.imageUrl || `https://ui-avatars.com/api/?name=${faculty.name}&background=6366f1&color=fff`}
                                alt={faculty.name}
                            />
                        </div>
                        <h3 className="text-2xl font-bold">{faculty.name}</h3>
                        <p className="text-indigo-100 text-sm font-medium opacity-90">{faculty.department}</p>
                    </div>
                </div>

                <div className="p-6">
                    {checkingReview ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Checking eligibility...</p>
                        </div>
                    ) : hasReviewed ? (
                        <div className="text-center py-6 animate-fade-in">
                            <div className="bg-red-50 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">Already Reviewed</h4>
                            <p className="text-gray-600 mb-6">You have already submitted feedback for this faculty member.</p>
                            <button
                                onClick={handleClose}
                                className="w-full py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {/* Stars */}
                            <div className="flex flex-col items-center mb-8">
                                <span className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Tap to Rate</span>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            className="focus:outline-none transition-all duration-200 hover:scale-110 active:scale-95 p-1"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                        >
                                            <Star
                                                size={36}
                                                className={
                                                    (hoverRating || rating) >= star
                                                        ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                                                        : "text-gray-200 fill-gray-50"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="h-6 mt-1">
                                    {rating > 0 && (
                                        <span className="text-sm font-bold text-indigo-600 animate-slide-up">
                                            {rating === 1 && "Poor"}
                                            {rating === 2 && "Fair"}
                                            {rating === 3 && "Good"}
                                            {rating === 4 && "Very Good"}
                                            {rating === 5 && "Excellent"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Characteristics Pills */}
                            <div className="mb-8">
                                <p className="text-sm font-bold text-gray-900 mb-3">What are they like?</p>
                                <div className="flex flex-wrap gap-2">
                                    {CHARACTERISTICS.map((char) => (
                                        <button
                                            key={char}
                                            onClick={() => toggleCharacteristic(char)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${selectedCharacteristics.includes(char)
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || rating === 0}
                                    className={`flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2`}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : "Submit"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
