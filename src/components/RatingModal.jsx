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
        if (rating === 0 || !faculty) return;
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

                const oldRating = currentData.rating || 0;
                const oldCount = currentData.ratingCount || 0;

                // Calculate new weighted average
                // (Old Total + New Rating) / New Count
                const newRating = ((oldRating * oldCount) + rating) / newCount;

                // Add review to subcollection
                const reviewRef = doc(collection(facultyRef, "reviews"));
                transaction.set(reviewRef, {
                    userId: currentUser?.uid || 'anonymous',
                    userEmail: currentUser?.email || 'anonymous',
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
            // Handle error
        } finally {
            setSubmitting(false);
        }
    };

    if (!faculty) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            {/* Flex container for centering */}
            <div className="flex items-center justify-center min-h-screen px-4 text-center">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-500/75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal Panel */}
                <div className="relative inline-block w-full max-w-lg p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="sm:flex sm:items-start">
                        <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                            <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                                Rate {faculty.name}
                            </h3>
                            <div className="mt-2 text-sm text-gray-500">
                                {faculty.department}
                            </div>

                            {/* Star Rating Section */}
                            <div className="mt-6">
                                <p className="mb-2 text-sm font-medium text-gray-700">Select Rating:</p>
                                <div className="flex items-center justify-center space-x-2 sm:justify-start">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110 p-1"
                                        >
                                            <Star
                                                className={`h-10 w-10 transition-colors duration-200 ${(hoverRating || rating) >= star
                                                        ? "text-yellow-400 fill-current"
                                                        : "text-gray-300"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment Section */}
                            <div className="mt-6">
                                <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-700">
                                    Review (Optional)
                                </label>
                                <textarea
                                    id="comment"
                                    rows={3}
                                    className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Share your experience with this faculty member..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting || rating === 0}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-opacity duration-200 ${(submitting || rating === 0) ? 'opacity-50 cursor-not-allowed' : ''
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
