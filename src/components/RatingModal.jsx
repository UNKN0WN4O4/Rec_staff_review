import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, increment, getDoc, runTransaction } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { X, Star } from "lucide-react";

export default function RatingModal({ faculty, onClose }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { currentUser } = useAuth();
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;
        setSubmitting(true);

        try {
            // Create a reference to the faculty document
            const facultyRef = doc(db, "faculty", faculty.id);

            // Run as transaction to ensure atomic update of average
            await runTransaction(db, async (transaction) => {
                const facultyDoc = await transaction.get(facultyRef);
                if (!facultyDoc.exists()) {
                    throw "Document does not exist!";
                }

                const currentData = facultyDoc.data();
                const newCount = (currentData.ratingCount || 0) + 1;
                // Total score = (old_avg * old_count) + new_rating
                // But better is to just store current total? Not storing total, storing avg directly
                // New Avg = ((old_avg * old_count) + new_rating) / new_count

                const oldRating = currentData.rating || 0;
                const oldCount = currentData.ratingCount || 0;
                const newRating = ((oldRating * oldCount) + rating) / newCount;

                // Add review to subcollection
                const reviewRef = doc(collection(facultyRef, "reviews"));
                transaction.set(reviewRef, {
                    userId: currentUser.uid,
                    userEmail: currentUser.email,
                    rating: rating,
                    comment: comment,
                    timestamp: new Date()
                });

                // Update faculty stats
                transaction.update(facultyRef, {
                    rating: newRating,
                    ratingCount: newCount
                });
            });

            onClose();
        } catch (err) {
            console.error("Error submitting rating:", err);
            // Handle error (maybe show toast)
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Rate {faculty.name}
                                    </h3>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-center space-x-2 py-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`h-8 w-8 ${(hoverRating || rating) >= star
                                                            ? "text-yellow-400 fill-current"
                                                            : "text-gray-300"
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <textarea
                                        rows={3}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                                        placeholder="Share your experience (optional)"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting || rating === 0}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${(submitting || rating === 0) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {submitting ? "Submitting..." : "Submit Rating"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
