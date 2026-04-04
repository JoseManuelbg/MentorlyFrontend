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
    name: "", surname: "", email: "", role: "STUDENT",
    username: "", password: "", passwordRe: "", subjects: [],
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (field: keyof FormData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="min-h-screen bg-salviaGreen flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
      {/* Indicador de progreso (Stepper) */}
      <div className="w-full max-w-md mb-8 flex justify-between items-center px-4">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 shadow-lg ${
                step >= num ? "bg-slate-800 text-white scale-110" : "bg-white/40 text-slate-800/40"
            }`}>
              {num}
            </div>
            {num < 3 && (
              <div className={`h-1 w-12 md:w-20 mx-2 rounded-full transition-all duration-500 ${
                step > num ? "bg-slate-800" : "bg-white/20"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* TARJETA ÚNICA (Sin bordes duplicados) */}
      <div className="w-full max-w-2xl bg-brokenWhite/90 backdrop rounded-[2.5rem]   transition-all duration-500">
        {step === 1 && <Step1 nextStep={nextStep} handleChange={handleChange} values={formData} />}
        {step === 2 && <Step2 nextStep={nextStep} prevStep={prevStep} setFormData={setFormData} values={formData} />}
        {step === 3 && <Step3 prevStep={prevStep} handleChange={handleChange} values={formData} />}
      </div>

      <p className="mt-8 text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">
        Paso {step} de 3
      </p>
    </div>
  );
};

export default MultiStepForm;