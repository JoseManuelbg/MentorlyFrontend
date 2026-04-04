import React from "react";
import { useNavigate } from "react-router-dom";
import type { FormData } from "./MultiStepForm";
import { notify } from "../reusable/Notification";
import { validEmail, validPassword } from "../reusable/regex";
import emailjs from "@emailjs/browser";
import type { ApiError } from "../models/ApiError";

interface StepProps {
  prevStep: () => void;
  handleChange: (
    field: keyof FormData
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  values: FormData;
}

const Step3: React.FC<StepProps> = ({ prevStep, handleChange, values }) => {
  const navigate = useNavigate(); 
  const [loading, setLoading] = React.useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const submitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 1. Validaciones locales
    if (!values.email || !values.password || !values.passwordRe) {
      return notify("El email y la contraseña son obligatorios", "error");
    }
    if (!validEmail.test(values.email)) {
      return notify("El formato del email no es válido.", "error");
    }
    if (!validPassword.test(values.password)) {
      return notify("La contraseña debe tener al menos 6 caracteres, 1 letra, 1 número y 1 especial", "error");
    }
    if (values.password !== values.passwordRe) {
      return notify("Las contraseñas no coinciden", "error");
    }

    setLoading(true);

    const payload = {
      name: values.name + " " + values.surname, 
      email: values.email,                      
      role: values.role || "STUDENT",              
      username: values.username,               
      password: values.password,                
      subjects: values.subjects || []           
    };

    try {
      // 2. Guardar usuario en el backend
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // --- CAPTURA DE ERROR DEL BACKEND ---
      if (!res.ok) {
        const errorData = data as ApiError;
        notify(errorData.message || "Error al crear la cuenta", "error");
        setLoading(false);
        return; 
      }

      // 3. Si el registro fue bien, enviar email con EmailJS
      try {
        await emailjs.send(
          "service_c2b7b8y",       
          "template_reblczb",      
          {
            email: values.email,               
            name: values.name + " " + values.surname,
          },
          "fI1c9TlnKEMyykZn-"        
        );
      } catch (mailErr) {
        console.error("Error enviando email:", mailErr);
        // No bloqueamos el flujo si el mail falla pero el user ya se creó
      }

      notify("¡Cuenta creada con éxito! Revisa tu correo.", "success");
      navigate("/login");

    } catch (error) {
      console.error(error);
      notify("No se pudo conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-salviaGreen min-h-screen flex items-center justify-center overflow-hidden">

      <form className="backdrop-blur-lg bg-brokenWhite/70 p-8 rounded-2xl shadow-xl w-96 flex flex-col gap-5">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Cuenta</h2>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Correo</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={values.email}
            onChange={handleChange("email")}
            className="w-full rounded-lg py-2 px-4 bg-transparent border border-white/30 placeholder-gray-400 text-gray-800 focus:border-salviaGreen focus:ring-2 focus:ring-salviaGreen/40 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange("password")}
            className="w-full rounded-lg py-2 px-4 bg-transparent border border-white/30 placeholder-gray-400 text-gray-800 focus:border-salviaGreen focus:ring-2 focus:ring-salviaGreen/40 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Repite la contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={values.passwordRe}
            onChange={handleChange("passwordRe")}
            className="w-full rounded-lg py-2 px-4 bg-transparent border border-white/30 placeholder-gray-400 text-gray-800 focus:border-salviaGreen focus:ring-2 focus:ring-salviaGreen/40 focus:outline-none"
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-2 rounded-lg bg-white/40 text-gray-800 hover:bg-white/60 transition"
          >
            Atrás
          </button>

          <button
            type="button"
            onClick={submitForm}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-salviaGreen text-brokenWhite font-semibold hover:brightness-110 transition"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3;
