import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { notify } from "../reusable/Notification";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    
    // Extraemos el token de la URL (?token=...)
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            notify("Token no encontrado o inválido", "error");
            navigate("/login");
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return notify("Las contraseñas no coinciden", "error");
        }

        try {
            const res = await fetch("http://localhost:8080/reset-password/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: token,
                    newPassword: password
                }),
            });

            if (res.ok) {
                notify("¡Contraseña actualizada con éxito!", "success");
                navigate("/login");
            } else {
                const errorText = await res.text();
                notify(errorText || "Error al actualizar", "error");
            }
        } catch (error) {
            notify("Error de conexión", "error");
            console.error(error);
        }
    };

    return (
        <div className="bg-salviaGreen min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="flex bg-sageGrey backdrop-blur-2xl shadow-lg flex-col gap-4 rounded-md w-full max-w-md mx-auto p-6">
                <h2 className="text-center text-xl font-semibold mb-2">Create New Password</h2>
                
                <div className="flex flex-col gap-1">
                    <label className="text-sm ml-4">New Password</label>
                    <input 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="m-2 rounded-md py-2 px-2 text-black" 
                        type="password" 
                        placeholder="••••••••" 
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm ml-4">Confirm Password</label>
                    <input 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="m-2 rounded-md py-2 px-2 text-black" 
                        type="password" 
                        placeholder="••••••••" 
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="bg-brokenWhite transition-all duration-500 mt-4 py-2 rounded-md hover:bg-salviaGreen/70 font-medium"
                >
                    Reset Password
                </button>
            </form>
        </div>
    );
}