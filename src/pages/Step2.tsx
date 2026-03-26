import React, { useEffect, useState } from "react";
import type { FormData } from "./MultiStepForm";
import type Subject from "../models/Subject";
import type { Level } from "../models/Subject";
import { notify } from "../reusable/Notification";

interface StepProps {
  nextStep: () => void;
  prevStep: () => void;
  values: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const Step2: React.FC<StepProps> = ({
  nextStep,
  prevStep,
  setFormData,
  values,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const BASE_URL = import.meta.env.VITE_API_URL;


  console.log(values)
  // Traer materias desde la API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${BASE_URL}:8080/subjects`);
        if (!res.ok) throw new Error("Error fetching subjects");

        const data: Subject[] = await res.json();
        setSubjects(data);
      } catch (error) {
        notify("Error cargando materias", "error");
        setSubjects([]);
      }
    };

    fetchSubjects();
  }, []);

 
   const continueStep = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (values.subjects.length > 0) {
        nextStep();
      } else {
        notify("Choose at least 1 subject", "error");
      }
    };
  //Funcion para separar por nivel academico

  const subjectsByLevel: Record<Level, Subject[]> = {
PRIMARY: [],
  SECONDARY: [],
  HIGH_SCHOOL: [],
  VOCATIONAL: [],
  UNIVERSITY: [],
  
  
  };

  subjects.forEach((subject) => {
  subjectsByLevel[subject.level].push(subject);
});


  return (
  <div className="bg-salviaGreen min-h-screen overflow-y-auto py-16 flex flex-col items-center">

    {/* Step indicator */}
    <div className="flex items-center gap-4 mb-12">
      <div className="w-10 h-10 rounded-full bg-brokenWhite/40 flex items-center justify-center font-semibold">
        1
      </div>

      <div className="w-10 h-[2px] bg-brokenWhite/50"></div>

      <div className="
        w-12 h-12 rounded-full
        bg-salviaGreen
        text-brokenWhite
        flex items-center justify-center
        font-bold
        ring-4 ring-brokenWhite/50
        shadow-[0_0_20px_rgba(126,144,118,0.8)]
      ">
        2
      </div>

      <div className="w-10 h-[2px] bg-brokenWhite/30"></div>

      <div className="w-10 h-10 rounded-full bg-brokenWhite/30 flex items-center justify-center font-semibold">
        3
      </div>
    </div>

    {/* Card principal */}
    <div className="
      w-full max-w-4xl
      backdrop-blur-lg bg-brokenWhite/70
      rounded-2xl shadow-lg
      p-8
    ">

      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Elige tus materias
      </h2>

      {/* Fake search */}
      <div className="mb-8 flex justify-center">
        <input
          type="text"
          placeholder="Buscar materia..."
          className="
            w-full max-w-md
            rounded-full
            px-5 py-2
            bg-white/60
            text-gray-800
            placeholder-gray-500
            focus:outline-none
            focus:ring-2 focus:ring-salviaGreen
          "
        />
      </div>

      {/* Subjects */}
      {(Object.keys(subjectsByLevel) as Level[]).map((level) => (
        <div key={level} className="mb-8">

          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            {level}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjectsByLevel[level].map((subject) => {
              const selected = values.subjects.includes(subject.id);

              return (
                <label
                  key={subject.id}
                  className={`
                    cursor-pointer
                    rounded-xl p-4
                    transition-all duration-300
                    border
                    ${selected
                      ? "bg-salviaGreen text-brokenWhite border-salviaGreen shadow-md scale-[1.02]"
                      : "bg-white/60 text-gray-800 border-white/40 hover:bg-white/80"}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {subject.name}
                    </span>

                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        if (selected) {
                          setFormData({
                            ...values,
                            subjects: values.subjects.filter(
                              (id) => id !== subject.id
                            ),
                          });
                        } else {
                          setFormData({
                            ...values,
                            subjects: [...values.subjects, subject.id],
                          });
                        }
                      }}
                      className="accent-salviaGreen"
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Buttons */}
      <div className="flex justify-between mt-10">
        <button
          onClick={prevStep}
          className="
            px-6 py-2
            rounded-lg
            bg-white/40
            text-gray-800
            hover:bg-white/60
            transition
          "
        >
          Atrás
        </button>

        <button
          onClick={continueStep}
          className="
            px-6 py-2
            rounded-lg
            bg-salviaGreen
            text-brokenWhite
            hover:brightness-110
            transition
          "
        >
          Siguiente
        </button>
      </div>

    </div>
  </div>
);

};

export default Step2;