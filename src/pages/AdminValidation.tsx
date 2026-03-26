import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";
import { Link } from "react-router-dom";
import type { ApiError } from '../models/ApiError';

interface Subject {
  id: number;
  name: string;
  level: string;
}

interface MentorRequest {
  id: number;
  userEmail: string;
  subjectIds: any; 
  academicLevel: string;
  description: string;
  status: string;
}

export default function AdminValidation() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]); // Guardamos el catálogo de materias
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchData = async () => {
    try {
      // Cargamos solicitudes y materias en paralelo para ganar velocidad
      const [resReq, resSub] = await Promise.all([
        fetch(`${BASE_URL}/api/requests/pending`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/subjects`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!resReq.ok || !resSub.ok) {
        throw new Error("Error al obtener datos del servidor");
      }

      const dataRequests = await resReq.json();
      const dataSubjects = await resSub.json();

      setRequests(dataRequests);
      setSubjects(dataSubjects);
    } catch (error: any) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Función mágica para convertir ID -> "Nombre - Nivel"
  const getSubjectInfo = (id: string | number) => {
    const subject = subjects.find(s => s.id === Number(id));
    return subject ? `${subject.name} (${subject.level})` : `ID: ${id}`;
  };

  const handleAction = async (requestId: number, userEmail: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`${BASE_URL}/api/requests/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ requestId, userEmail, action })
      });

      if (!res.ok) {
        const errorData: ApiError = await res.json();
        throw new Error(errorData.message || "No se pudo procesar la acción");
      }

      notify(`Usuario ${action === 'APPROVE' ? 'aprobado' : 'rechazado'} correctamente`, "success");
      setRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error: any) {
      notify(error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-brokenWhite p-6 lg:p-12 font-sans text-forestDark">
      <header className="max-w-6xl mx-auto mb-10">
        <Link to="/home" className="text-salviaGreen font-bold text-sm no-underline hover:underline">← Volver al Dashboard</Link>
        <h1 className="text-4xl font-black mt-2 tracking-tight">Validación de Mentores</h1>
        <p className="text-slate-500 font-medium italic">Revisa y aprueba las nuevas solicitudes de profesores.</p>
      </header>

      <div className="max-w-6xl mx-auto grid gap-6">
        {loading ? (
          <p className="text-center font-bold animate-pulse text-salviaGreen">Cargando datos...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-sageGrey/30 text-center">
            <p className="text-slate-400 font-bold">No hay solicitudes pendientes por ahora. ✨</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-sageGrey/20 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex-1">
                <span className="px-3 py-1 bg-forestDark text-white text-[10px] font-bold rounded-full uppercase">
                  Nivel Solicitado: {req.academicLevel}
                </span>
                <h3 className="text-2xl font-black mt-3 text-forestDark">{req.userEmail}</h3>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {/* Manejamos tanto si viene String "1,2" como si viene Array [1,2] */}
                  {(Array.isArray(req.subjectIds) ? req.subjectIds : req.subjectIds?.split(",") || []).map((id: any, i: number) => (
                    <span key={i} className="text-salviaGreen font-bold text-[11px] bg-salviaGreen/10 px-3 py-1 rounded-full border border-salviaGreen/20">
                      {getSubjectInfo(id)}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-brokenWhite rounded-2xl border border-sageGrey/10">
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{req.description}"</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(req.id, req.userEmail, 'REJECT')}
                  className="px-6 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all active:scale-95"
                >
                  Rechazar
                </button>
                <button 
                  onClick={() => handleAction(req.id,  req.userEmail, 'APPROVE')}
                  className="px-8 py-3 bg-salviaGreen text-white rounded-2xl font-black hover:bg-forestDark transition-all shadow-lg active:scale-95"
                >
                  Aprobar Mentor
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}