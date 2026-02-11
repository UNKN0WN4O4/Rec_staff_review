import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function login() {
        const provider = new GoogleAuthProvider();
        try {
            setError("");
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if email ends with @rajalakshmi.edu.in
            if (!user.email.endsWith("@rajalakshmi.edu.in")) {
                await logout();
                throw new Error("Only @rajalakshmi.edu.in emails are allowed.");
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!user.email.endsWith("@rajalakshmi.edu.in")) {
                    await logout();
                    setCurrentUser(null);
                } else {
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
