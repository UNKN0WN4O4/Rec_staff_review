import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, doc, runTransaction } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { X, Star } from "lucide-react";

export default function RatingModal({ faculty, onClose }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { currentUser } = useAuth();
    const [hoverRating, setHoverRating] = useState(0);

    // Debugging logs
    useEffect(() => {
        console.log("RatingModal Mounted");
        console.log("Faculty Data:", faculty);
    }, [faculty]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0 || !faculty) return;
        setSubmitting(true);

        try {
            const facultyRef = doc(db, "faculty", faculty.id);
            await runTransaction(db, async (transaction) => {
                const facultyDoc = await transaction.get(facultyRef);
                if (!facultyDoc.exists()) throw "Document does not exist!";

                const currentData = facultyDoc.data();
                const newCount = (currentData.ratingCount || 0) + 1;
                const oldRating = currentData.rating || 0;
                const oldCount = currentData.ratingCount || 0;
                const newRating = ((oldRating * oldCount) + rating) / newCount;

                const reviewRef = doc(collection(facultyRef, "reviews"));
                transaction.set(reviewRef, {
                    userId: currentUser?.uid || 'anonymous',
                    userEmail: currentUser?.email || 'anonymous',
                    rating: rating,
                    comment: comment,
                    timestamp: new Date()
                });

                transaction.update(facultyRef, { rating: newRating, ratingCount: newCount });
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
                className="fixed inset-0 bg-black/50"
                onClick={onClose}
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} // Inline style fallback
            ></div>

            {/* Modal Content - Simplified CSS */}
            <div className="relative bg-white text-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 z-10" style={{ backgroundColor: 'white', color: 'black' }}>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Rate {faculty.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">{faculty.department}</p>
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                size={40}
                                className={
                                    (hoverRating || rating) >= star
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300"
                                }
                            />
                        </button>
                    ))}
                </div>

                {/* Comment */}
                <textarea
                    className="w-full border border-gray-300 rounded p-2 mb-4 text-black bg-white"
                    rows={3}
                    placeholder="Write a review..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ color: 'black', backgroundColor: 'white' }}
                />

                {/* Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 bg-white"
                        style={{ color: 'black', backgroundColor: 'white' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 ${(submitting || rating === 0) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        style={{ backgroundColor: '#4f46e5', color: 'white' }}
                    >
                        {submitting ? "Submitting..." : "Submit Rating"}
                    </button>
                </div>
            </div>
        </div>
    );
}
