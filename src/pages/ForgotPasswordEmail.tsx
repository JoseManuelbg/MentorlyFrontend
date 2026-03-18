import { useState } from "react"
import { notify } from "../reusable/Notification";
import emailjs from '@emailjs/browser';

export default function ForgotPassword(){

    const [email, setEmail] = useState("");
  const BASE_URL = import.meta.env.VITE_API_URL;
  const APP_URL = import.meta.env.VITE_APP_URL;

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        return notify("Introduce un email", 'error');
    }

    try {
            const res = await fetch(`${BASE_URL}/forgot-password?email=${email}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });

        const token = await res.text(); 

        if (!res.ok) {
            notify("Usuario no encontrado", "error");
            return;
        }

        const resetUrl = `${APP_URL}/reset-password?token=${token}`;

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

    } catch (error) {
        notify("No se pudo conectar con el servidor", "error");
        console.error(error);
    }
};

    return (
        <div className="bg-salviaGreen min-h-screen flex  items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="flex bg-sageGrey backdrop-blur-2xl shadow-lg flex-col gap-4 rounded-md w-full max-h-md max-w-md mx-auto">
                
                    <h2 className="flex justify-center mt-2">Forgot your password?</h2>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="flex m-4 rounded-md py-2 px-2" type="email" placeholder="Enter your email..." />
                <button type="submit" className="bg-brokenWhite justify-center transition-all duration-500 m-4 py-2 rounded-md hover:bg-salviaGreen/70" >Send code</button>

                
</form>
        </div>
    )
}