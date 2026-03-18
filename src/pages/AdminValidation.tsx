import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";
import { Link } from "react-router-dom";

interface MentorRequest {
  id: number; // En Java usamos Integer, aquí number
  userEmail: string;
  subjectIds: string; // Importante: Viene como "1,2,5"
  academicLevel: string;
  description: string;
  status: string;
}

export default function AdminValidation() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/requests/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      notify("Error al cargar las solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: number, userEmail: string, action: 'APPROVE' | 'REJECT') => {
    try {
      // Ajustamos la URL al endpoint de tu controlador de validación
      const res = await fetch(`${BASE_URL}/api/requests/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ requestId, userEmail, action })
      });

      if (res.ok) {
        notify(`Usuario ${action === 'APPROVE' ? 'aprobado como mentor' : 'rechazado'}`, "success");
        setRequests(requests.filter(req => req.id !== requestId));
      }
    } catch (error) {
      notify("Error al procesar la solicitud", "error");
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
          <p className="text-center font-bold animate-pulse text-salviaGreen">Cargando solicitudes...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-sageGrey/30 text-center">
            <p className="text-slate-400 font-bold">No hay solicitudes pendientes por ahora. ✨</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-sageGrey/30 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex-1">
                <span className="px-3 py-1 bg-forestDark text-white text-[10px] font-bold rounded-full uppercase">
                  {req.academicLevel}
                </span>
                <h3 className="text-2xl font-black mt-3">{req.userEmail}</h3>
                
                {/* SOLUCIÓN AL ERROR .MAP: Convertimos el String en Array antes de mapear */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {req.subjectIds ? req.subjectIds.split(",").map((id, i) => (
                    <span key={i} className="text-salviaGreen font-bold text-xs bg-salviaGreen/10 px-2 py-0.5 rounded-lg">
                      #ID_{id.trim()}
                    </span>
                  )) : (
                    <span className="text-slate-400 text-xs">Sin materias</span>
                  )}
                </div>
                
                <p className="text-slate-500 text-sm mt-4 italic">"{req.description}"</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(req.id, req.userEmail, 'REJECT')}
                  className="px-6 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  Rechazar
                </button>
                <button 
                  onClick={() => handleAction(req.id, req.userEmail, 'APPROVE')}
                  className="px-8 py-3 bg-salviaGreen text-white rounded-2xl font-black hover:bg-forestDark transition-all shadow-lg"
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