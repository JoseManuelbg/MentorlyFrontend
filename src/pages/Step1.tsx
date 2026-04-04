import React, { useEffect, useState } from "react";
import { name } from "../reusable/regex";
import type { FormData } from "./MultiStepForm";
import { notify } from "../reusable/Notification";

interface Step1Props {
  nextStep: () => void;
  handleChange: (
    field: keyof FormData
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  values: FormData;
}

const Step1: React.FC<Step1Props> = ({ nextStep, handleChange, values }) => {
  const [isChecking, setIsChecking] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (values.role !== "STUDENT") {
      const fakeEvent = {
        target: { value: "STUDENT" }
      } as React.ChangeEvent<HTMLSelectElement>;
      handleChange("role")(fakeEvent);
    }
  }, []);

  const continueStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!values.name || !values.username) {
      notify("Nombre y Usuario son obligatorios", "error");
      return;
    }
    if (!name.test(values.name)) {
      notify("El nombre solo puede contener letras", "error");
      return;
    }

    setIsChecking(true);
    try {
      const res = await fetch(`${BASE_URL}/users/check-username?username=${encodeURIComponent(values.username)}`);
      const data = await res.json();
      if (data.exists) {
        notify("Ese nombre de usuario ya está en uso", "error");
        return;
      }
      nextStep();
    } catch {
      notify("Error de conexión", "error");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    /* ELIMINADO: bg-salviaGreen h-screen. 
       Ahora el componente se adapta al tamaño del padre (MultiStepForm) 
    */
    <div className="flex flex-col items-center justify-center w-full animate-fadeIn">
      
      {/* INDICADOR DE PASOS (Stepper) - Movido para que no use absolute fixed si no es necesario */}
      

      <form className="backdrop-blur-lg bg-brokenWhite/70 p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-5 border border-white/20">
        <div className="mb-2">
          <h2 className="text-3xl font-bold text-gray-800">Información Personal</h2>
          <p className="text-gray-500 text-sm">Paso 1 de 3</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            placeholder="Tu nombre"
            onChange={handleChange("name")}
            value={values.name}
            className="w-full rounded-xl py-2.5 px-4 bg-white/50 border border-gray-200 focus:ring-2 focus:ring-salviaGreen focus:outline-none transition-all"
          />
        </div>

        {/* Surname */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
          <input
            type="text"
            placeholder="Tu apellido"
            onChange={handleChange("surname")}
            value={values.surname}
            className="w-full rounded-xl py-2.5 px-4 bg-white/50 border border-gray-200 focus:ring-2 focus:ring-salviaGreen focus:outline-none transition-all"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de usuario *</label>
          <input
            type="text"
            placeholder="@usuario"
            onChange={handleChange("username")}
            value={values.username}
            className="w-full rounded-xl py-2.5 px-4 bg-white/50 border border-gray-200 focus:ring-2 focus:ring-salviaGreen focus:outline-none transition-all"
          />
        </div>

        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Nota:</strong> Te estás registrando como <strong>Estudiante</strong>. 
            Podrás cambiar a perfil de Profesor más adelante.
          </p>
        </div>

        <button
          onClick={continueStep}
          disabled={isChecking}
          className="w-full mt-2 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isChecking ? "Verificando..." : "Siguiente paso"}
        </button>
      </form>
    </div>
  );
};

export default Step1;