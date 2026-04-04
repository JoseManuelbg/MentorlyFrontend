import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { notify } from "../reusable/Notification";
import type { ApiError } from "../models/ApiError";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_URL;

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            notify("El enlace de recuperación no es válido o ha expirado", "error");
            navigate("/login");
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación local básica
        if (password !== confirmPassword) {
            return notify("Las contraseñas no coinciden", "error");
        }
        if (password.length < 6) {
            return notify("La contraseña debe tener al menos 6 caracteres", "error");
        }

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/reset-password/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token,
                    newPassword: password
                }),
            });

            if (!res.ok) {
                // Capturamos el error estructurado de tu backend (ej. Token expired)
                const errorData: ApiError = await res.json();
                throw new Error(errorData.message || "No se pudo actualizar la contraseña");
            }

            notify("¡Contraseña actualizada con éxito!", "success");
            navigate("/login");
        } catch (error: any) {
            notify(error.message || "Error de conexión con el servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-salviaGreen min-h-screen flex items-center justify-center p-6 font-sans text-forestDark">
            <form 
                onSubmit={handleSubmit} 
                className="backdrop-blur-xl bg-brokenWhite/90 p-10 rounded-[3.5rem] shadow-2xl w-full max-w-md flex flex-col gap-6 border border-white/40"
            >
                <header className="text-center">
                    <h2 className="text-3xl font-black tracking-tight mb-2">Nueva Contraseña</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Establece tus nuevas credenciales de acceso
                    </p>
                </header>
                
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-forestDark/40 ml-4">Contraseña</label>
                        <input 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full rounded-2xl py-4 px-6 bg-white border border-sageGrey/20 focus:ring-2 focus:ring-salviaGreen outline-none transition-all font-bold placeholder:text-slate-200" 
                            type="password" 
                            placeholder="••••••••" 
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-forestDark/40 ml-4">Confirmar Contraseña</label>
                        <input 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            className="w-full rounded-2xl py-4 px-6 bg-white border border-sageGrey/20 focus:ring-2 focus:ring-salviaGreen outline-none transition-all font-bold placeholder:text-slate-200" 
                            type="password" 
                            placeholder="••••••••" 
                            required
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-forestDark text-white py-4 rounded-full font-black hover:bg-salviaGreen transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-2 uppercase text-xs tracking-widest"
                >
                    {loading ? "Guardando..." : "Actualizar Contraseña"}
                </button>

                <button 
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-[10px] font-black text-slate-400 hover:text-forestDark transition-colors uppercase tracking-tighter"
                >
                    Cancelar y volver al login
                </button>
            </form>
        </div>
    );
}