import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";

interface Subject {
  id: number;
  name: string;
  level: string;
}

export default function BecomeMentorForm() {
  const { token, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  // Cambiamos a un Array para soportar varias materias
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    level: "PRIMARY",
    motivation: ""
  });

  useEffect(() => {
    fetch(`${BASE_URL}/subjects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setAvailableSubjects(data))
    .catch(() => notify("Error al cargar materias", "error"));
  }, [token]);

  // Función para manejar la selección/deselección de materias
  const toggleSubject = (id: number) => {
    setSelectedSubjectIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectIds.length === 0) return notify("Selecciona al menos una materia", "error");
    
    setLoading(true);



    try {
      // Ajusta la URL a la que definiste en tu @RequestMapping
      const response = await fetch(`${BASE_URL}/api/requests/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userEmail: authUser?.sub, 
          subjectIds: selectedSubjectIds,
          academicLevel: formData.level,
          description: formData.motivation
        }),
      });

      if (response.ok) {
        notify("Solicitud enviada correctamente", "success");
        navigate("/home");
      } else {
        const errorData = await response.json();
        notify(errorData.error || "Error al enviar solicitud", "error");
      }
    } catch (error) {
      notify("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brokenWhite p-6 flex items-center justify-center font-sans">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-xl max-w-xl w-full border border-sageGrey/20">
        <h1 className="text-4xl font-black text-forestDark mb-6">Postúlate como <span className="text-salviaGreen">Mentor</span></h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* SELECCIÓN MÚLTIPLE DE MATERIAS */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Materias a impartir</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-brokenWhite rounded-2xl">
              {availableSubjects.map(sub => (
                <div 
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`cursor-pointer p-3 rounded-xl text-xs font-bold transition-all ${
                    selectedSubjectIds.includes(sub.id) 
                    ? "bg-salviaGreen text-white shadow-md" 
                    : "bg-white text-forestDark hover:bg-sageGrey/10"
                  }`}
                >
                  {sub.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Tu nivel académico actual</label>
            <select 
              className="w-full bg-brokenWhite border-none rounded-2xl p-4 text-forestDark focus:ring-2 focus:ring-salviaGreen outline-none font-semibold"
              onChange={(e) => setFormData({...formData, level: e.target.value})}
            >
              <option value="PRIMARY">Primaria</option>
              <option value="SECONDARY">Secundaria</option>
              <option value="BACHELOR">Bachillerato</option>
              <option value="UNIVERSITY">Universidad</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">¿Por qué quieres ser mentor?</label>
            <textarea 
              required
              className="w-full bg-brokenWhite border-none rounded-[2rem] p-5 text-forestDark focus:ring-2 focus:ring-salviaGreen outline-none resize-none h-32"
              onChange={(e) => setFormData({...formData, motivation: e.target.value})}
              placeholder="Cuéntanos tu experiencia..."
            ></textarea>
          </div>

          <button 
            disabled={loading}
            className="bg-forestDark text-white py-4 rounded-full font-black hover:bg-salviaGreen transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar Solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}