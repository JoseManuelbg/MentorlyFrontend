import React, { useEffect } from "react";
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
  
  // Forzamos que el rol sea STUDENT al cargar el componente
  useEffect(() => {
    if (values.role !== "STUDENT") {
      // Simulamos un evento para actualizar el estado global a STUDENT
      const fakeEvent = {
        target: { value: "STUDENT" }
      } as React.ChangeEvent<HTMLSelectElement>;
      handleChange("role")(fakeEvent);
    }
  }, []);

  const continueStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 1. Validar campos obligatorios
    if (!values.name || !values.username) {
      notify("Name and Username are required", "error");
      return;
    }

    // 2. Validar formato del nombre
    if (!name.test(values.name)) {
      notify("The name can only contain letters and spaces", "error");
      return;
    }

    // 3. Validar apellido (si existe, debe ser válido)
    if (values.surname && !name.test(values.surname)) {
      notify("The surname format is invalid", "error");
      return;
    }

    // Si todo está ok, avanzamos
    nextStep();
  };

  return (
    <div className="bg-salviaGreen h-screen overflow-hidden flex items-center justify-center">
      {/* Step indicator (Simplificado para brevedad) */}
      <div className="absolute top-1/2 -translate-y-72 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-salviaGreen text-brokenWhite flex items-center justify-center font-bold shadow-[0_0_20px_rgba(126,144,118,0.8)] ring-4 ring-brokenWhite/50">1</div>
        <div className="w-10 h-[2px] bg-brokenWhite/50"></div>
        <div className="w-10 h-10 rounded-full bg-brokenWhite/40 text-gray-700 flex items-center justify-center font-semibold backdrop-blur-lg">2</div>
        <div className="w-10 h-[2px] bg-brokenWhite/30"></div>
        <div className="w-10 h-10 rounded-full bg-brokenWhite/30 text-gray-700 flex items-center justify-center font-semibold backdrop-blur-lg">3</div>
      </div>

      <form className="backdrop-blur-lg bg-brokenWhite/70 p-6 rounded-xl shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">User Info</h2>

        {/* Name */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-1">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            onChange={handleChange("name")}
            value={values.name}
            className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/20 text-gray-800 focus:outline-none focus:border-salviaGreen"
          />
        </div>

        {/* Surname */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-1">Surname</label>
          <input
            type="text"
            placeholder="Enter your surname"
            onChange={handleChange("surname")}
            value={values.surname}
            className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/20 text-gray-800 focus:outline-none focus:border-salviaGreen"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-1">
            Username <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            onChange={handleChange("username")}
            value={values.username}
            className="block w-full rounded py-1.5 px-3 bg-transparent border border-white/20 text-gray-800 focus:outline-none focus:border-salviaGreen"
          />
        </div>

        {/* INFO ROLE: Informamos al usuario de su rol por defecto */}
        <div className="mt-2 p-3 bg-salviaGreen/10 rounded-lg border border-salviaGreen/20">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> You are registering as a <strong>Student</strong>. 
            You can request to become a Teacher later from your profile.
          </p>
        </div>

        <button
          onClick={continueStep}
          className="w-full mt-4 inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/20 text-gray-800 rounded-lg transition-all duration-300 hover:bg-salviaGreen hover:text-white"
        >
          Next
        </button>
      </form>
    </div>
  );
};

export default Step1;