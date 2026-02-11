import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from "react";
import { jwtDecode } from 'jwt-decode';

interface User {
    sub: string;
    email: string;
    roles: string[]; // Changed from roles: string[] to a single string
}

interface AuthResponse {
    token: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = localStorage.getItem("token");
        if (t) {
            try {
                const pureToken = t.startsWith("Bearer ") ? t.slice(7) : t;
                const decoded: User = jwtDecode(pureToken);
                console.log("Contenido del token:", decoded); // <--- MIRA ESTO EN LA CONSOLA
                // Expiration check
                const currentTime = Date.now() / 1000;
                if ((decoded as any).exp < currentTime) {
                    throw new Error("Token expired");
                }

                setToken(pureToken);
                setUser(decoded);
            } catch (err) {
                console.error("Session invalid or expired:", err);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (data: AuthResponse) => {
        const pureToken = data.token.startsWith("Bearer ") ? data.token.slice(7) : data.token;
        const decoded: User = jwtDecode(pureToken);
        
        setToken(pureToken);
        setUser(decoded);
        localStorage.setItem("token", pureToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};