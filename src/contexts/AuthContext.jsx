import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
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

    const login = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        try {
            setError("");
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if email ends with @rajalakshmi.edu.in
            if (!user.email.endsWith("@rajalakshmi.edu.in")) {
                await signOut(auth);
                throw new Error("Only @rajalakshmi.edu.in emails are allowed.");
            }
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const logout = useCallback(() => {
        return signOut(auth);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (!user.email.endsWith("@rajalakshmi.edu.in")) {
                    await signOut(auth);
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

    const value = useMemo(() => ({
        currentUser,
        login,
        logout,
        error
    }), [currentUser, login, logout, error]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
