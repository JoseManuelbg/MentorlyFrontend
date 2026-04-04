import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";
import type { ApiError } from '../models/ApiError';

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
      .catch(() => notify("Error al cargar el catálogo de materias", "error"));
  }, [token, BASE_URL]);

  const filteredSubjects = availableSubjects.filter(sub => sub.level === formData.level);

  const toggleSubject = (id: number) => {
    setSelectedSubjectIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectIds.length === 0) return notify("Selecciona al menos una materia", "error");
    if (formData.motivation.length < 20) return notify("La motivación es demasiado corta", "error");

    setLoading(true);
    try {
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
        const errorData: ApiError = await response.json();
        notify(errorData.message || "Error al enviar solicitud", "error");
      }
    } catch {
      notify("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brokenWhite p-6 flex items-center justify-center font-sans">
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl max-w-xl w-full border border-sageGrey/20">
        <h1 className="text-3xl md:text-4xl font-black text-forestDark mb-6 text-center">
          Postúlate como <span className="text-salviaGreen">Mentor</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* NIVEL ACADÉMICO — primero para que el filtro de materias tenga contexto */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Tu nivel académico</label>
            <select
              value={formData.level}
              className="w-full bg-brokenWhite border-none rounded-2xl p-4 text-forestDark focus:ring-2 focus:ring-salviaGreen outline-none font-semibold cursor-pointer"
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            >
              <option value="PRIMARY">Primaria</option>
              <option value="SECONDARY">Secundaria (ESO)</option>
              <option value="HIGH_SCHOOL">Bachillerato</option>
              <option value="VOCATIONAL">Formación Profesional</option>
              <option value="UNIVERSITY">Universidad</option>
            </select>
          </div>

          {/* MATERIAS — filtradas por nivel */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">
              Materias de {formData.level} ({selectedSubjectIds.length} seleccionadas en total)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-brokenWhite rounded-2xl border border-sageGrey/10 shadow-inner">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map(sub => (
                  <button
                    type="button"
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`p-3 rounded-xl text-[11px] font-bold transition-all text-left ${
                      selectedSubjectIds.includes(sub.id)
                        ? "bg-salviaGreen text-white shadow-md scale-[1.02]"
                        : "bg-white text-forestDark hover:bg-sageGrey/10 border border-sageGrey/10"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))
              ) : (
                <p className="col-span-2 text-center py-6 text-[10px] text-slate-400 italic">
                  No hay materias configuradas para {formData.level}
                </p>
              )}
            </div>
          </div>

          {/* MOTIVACIÓN */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Motivación</label>
            <textarea
              required
              value={formData.motivation}
              className="w-full bg-brokenWhite border-none rounded-[2rem] p-5 text-forestDark focus:ring-2 focus:ring-salviaGreen outline-none resize-none h-32 text-sm"
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              placeholder="Cuéntanos por qué quieres ser mentor..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-forestDark text-white py-4 rounded-full font-black hover:bg-salviaGreen transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? "Enviando solicitud..." : "Enviar Solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}