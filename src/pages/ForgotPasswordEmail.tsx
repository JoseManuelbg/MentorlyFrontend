import { useState } from "react";
import { notify } from "../reusable/Notification";
import emailjs from '@emailjs/browser';
import type { ApiError } from '../models/ApiError';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const APP_URL = import.meta.env.VITE_APP_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return notify("Introduce un email", 'error');

        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/forgot-password?email=${email}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            // Si la respuesta no es OK, el backend envió un JSON (ApiError)
            if (!res.ok) {
                const errorData: ApiError = await res.json();
                throw new Error(errorData.message || "Usuario no encontrado");
            }

            // Si es OK, extraemos el token (asumiendo que tu backend lo envía como texto plano)
            const token = await res.text();
            const resetUrl = `${APP_URL}/reset-password?token=${token}`;

            // Envío a través de EmailJS
            await emailjs.send(
                "service_c2b7b8y",
                "template_53futik",
                {
                    email: email,
                    link: resetUrl,
                },
                "fI1c9TlnKEMyykZn-"
            );

            notify("Email de recuperación enviado con éxito", "success");
            setEmail(""); // Limpiamos el input

        } catch (error: any) {
            // Aquí capturamos tanto el error del backend como si falla EmailJS o la red
            notify(error.message || "Error al procesar la solicitud", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-salviaGreen min-h-screen flex items-center justify-center p-4 font-sans text-forestDark">
            <form 
                onSubmit={handleSubmit} 
                className="bg-white/90 backdrop-blur-xl p-10 shadow-2xl flex flex-col gap-6 rounded-[3rem] w-full max-w-md border border-white/40"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-black mb-2">¿Olvidaste tu contraseña?</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        Introduce tu email para recibir un enlace de recuperación
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-forestDark/40 ml-4">Email de registro</label>
                    <input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full rounded-2xl py-4 px-6 bg-brokenWhite border border-sageGrey/20 focus:ring-2 focus:ring-salviaGreen outline-none transition-all font-medium" 
                        type="email" 
                        placeholder="ejemplo@correo.com" 
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-forestDark text-white py-4 rounded-full font-black hover:bg-salviaGreen transition-all shadow-lg active:scale-95 disabled:opacity-50" 
                >
                    {loading ? "Procesando..." : "Enviar enlace"}
                </button>
                
                <button 
                    type="button" 
                    onClick={() => window.history.back()}
                    className="text-xs font-bold text-slate-400 hover:text-forestDark transition-colors"
                >
                    Volver al inicio de sesión
                </button>
            </form>
        </div>
    );
}