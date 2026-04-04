import React, { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

export interface FormData {
  name: string;
  surname: string;
  email: string;
  role: string;
  username: string;
  password: string;
  passwordRe: string;
  subjects: number[];
}

const MultiStepForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    surname: "",
    email: "",
    role: "STUDENT",
    username: "",
    password: "",
    passwordRe: "",
    subjects: [],
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  /**
   * Manejador genérico optimizado.
   * Maneja inputs de texto, selects y textareas.
   */
  const handleChange =
    (field: keyof FormData) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { value } = e.target;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  // Función para renderizar el paso actual con un contenedor común
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1 
            nextStep={nextStep} 
            handleChange={handleChange} 
            values={formData} 
          />
        );
      case 2:
        return (
          <Step2
            nextStep={nextStep}
            prevStep={prevStep}
            setFormData={setFormData}
            values={formData}
          />
        );
      case 3:
        return (
          <Step3
            prevStep={prevStep}
            handleChange={handleChange}
            values={formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-salviaGreen flex flex-col items-center justify-center p-6 font-sans text-forestDark">
      {/* Indicador de progreso visual */}
      <div className="w-full max-w-md mb-8 flex justify-between items-center px-4">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 shadow-lg ${
                step >= num 
                  ? "bg-forestDark text-white scale-110" 
                  : "bg-white/40 text-forestDark/40"
              }`}
            >
              {num}
            </div>
            {num < 3 && (
              <div className={`h-1 w-12 md:w-20 mx-2 rounded-full transition-all duration-500 ${
                step > num ? "bg-forestDark" : "bg-white/20"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Contenedor principal del formulario */}
      <div className="w-full max-w-2xl bg-brokenWhite/90 backdrop-blur-xl rounded-[3.5rem] shadow-2xl p-8 md:p-12 border border-white/40 transition-all duration-500">
        {renderStep()}
      </div>

      {/* Pie de página informativo */}
      <p className="mt-8 text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">
        Registro de Usuario — Paso {step} de 3
      </p>
    </div>
  );
};

export default MultiStepForm;