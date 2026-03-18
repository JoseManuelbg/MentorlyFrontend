import React from "react";
import { useNavigate } from "react-router-dom";
import type { FormData } from "./MultiStepForm";
import { notify } from "../reusable/Notification";
import { validEmail, validPassword } from "../reusable/regex";
import emailjs from "@emailjs/browser";

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
    setLoading(true);

    // Validaciones
    if (!values.email || !values.password || !values.passwordRe) {
      notify("Email and password are required", "error");
      setLoading(false);
      return;
    }
    if (!validEmail.test(values.email)) {
      notify("The provided email is not valid.", "error");
      setLoading(false);
      return;
    }
    if (!validPassword.test(values.password) || !validPassword.test(values.passwordRe)) {
      notify(
        "Password must have at least 6 chars, 1 letter, 1 number, 1 special char",
        "error"
      );
      setLoading(false);
      return;
    }
    if (values.password !== values.passwordRe) {
      notify("Passwords don't match", "error");
      setLoading(false);
      return;
    }

    const payload = {
  name: values.name + " " + values.surname, 
  email: values.email,                      
  role: values.role || "user",              
  username: values.username,               
  password: values.password,                
  subjects: values.subjects || []           
};

    try {
  // Guardar usuario en tu backend
  const res = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save user");

  // Enviar email de confirmación con EmailJS
  await emailjs.send(
    "service_c2b7b8y",       
    "template_reblczb",      
    {
      email: values.email,               
      name: values.name + " " + values.surname,
    },
    "fI1c9TlnKEMyykZn-"        
  );

  notify("User created successfully and confirmation email sent", "success");
  navigate("/login"); // solo si todo sale bien
} catch (error) {
  console.error(error);
  notify("Failed to create user or send email", "error");
} finally {
  setLoading(false);
}

  };

  return (
    <div className="bg-salviaGreen min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute top-64 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brokenWhite/40 flex items-center justify-center font-semibold">1</div>
        <div className="w-10 h-[2px] bg-brokenWhite/40"></div>
        <div className="w-10 h-10 rounded-full bg-brokenWhite/40 flex items-center justify-center font-semibold">2</div>
        <div className="w-10 h-[2px] bg-brokenWhite/40"></div>
        <div className="w-12 h-12 rounded-full bg-salviaGreen text-brokenWhite flex items-center justify-center font-bold ring-4 ring-brokenWhite/60 shadow-[0_0_20px_rgba(126,144,118,0.9)]">3</div>
      </div>

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
