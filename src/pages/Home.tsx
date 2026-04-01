import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
import { Link } from "react-router-dom";
import { notify } from "../reusable/Notification";

interface Quote {
  _id: string;
  content: string;
  author: string;
}

interface MentorshipStats {
  active: number;
  pending: number;
  rejected: number;
}

export default function Home() {
  const { token, user: authUser } = useAuth();
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [stats, setStats] = useState<MentorshipStats>({ active: 0, pending: 0, rejected: 0 });
  const [quote, setQuote] = useState<Quote>();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const isAdmin = authUser?.roles.some(role => 
    ["admin", "role_admin"].includes(role.toLowerCase())
  );

  const isMentor = authUser?.roles.some(role => 
    ["mentor", "role_mentor"].includes(role.toLowerCase())
  );

  useEffect(() => {
    if (token && isAdmin) {
      fetchAdminData(token);
    }
  }, [token, isAdmin]);

  const fetchAdminData = async (t: string) => {
    try {
      // 1. Usuarios Activos
      const resUsers = await fetch(`${BASE_URL}/users/stats/getActive`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (resUsers.ok) {
        const data = await resUsers.json();
        setActiveUsers(data.count);
      }

      // 2. Estadísticas de Mentorías (Lo ideal es un endpoint que devuelva los 3 counts)
      // Si no tienes ese endpoint, puedes hacer 3 fetches aquí, pero uno unificado es mejor.
      const resStats = await fetch(`${BASE_URL}/requests/stats/all`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      
      if (resStats.ok) {
        const data = await resStats.json();
        setStats({
          active: data.active || 0,
          pending: data.pending || 0,
          rejected: data.rejected || 0
        });
      }
    } catch (error) {
      notify("Error al actualizar estadísticas del panel", "error");
    }
  };

  useEffect(() => {
    fetch('https://api.quotable.io/random')
      .then(res => res.json())
      .then(data => setQuote(data))
      .catch(() => {});
  }, []);

  if (!authUser) return <div className="p-10 text-center font-bold text-salviaGreen animate-pulse">Cargando...</div>;

  return (
    <div className="min-h-screen bg-brokenWhite p-6 lg:p-12 font-sans text-forestDark">
      {/* Header */}
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Bienvenido, <span className="text-salviaGreen">{authUser.sub.split('@')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 italic">
            {isAdmin ? "Admin Dashboard — Vista General" : "Explora tus cursos y mentorías."}
          </p>
        </div>
        <div className="hidden sm:block text-right">
            <span className="text-[10px] font-bold text-forestDark/40 uppercase tracking-widest">Estado</span>
            <div className="flex items-center gap-2 justify-end text-green-600 font-bold text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Sincronizado
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        
        {/* Perfil del Usuario */}
        <div className="md:col-span-2 md:row-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-sageGrey/30 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="px-4 py-1.5 bg-salviaGreen/10 text-salviaGreen text-[10px] font-bold rounded-full uppercase tracking-widest">Identidad</span>
            <h2 className="text-3xl font-black mt-6 break-words leading-tight text-forestDark">{authUser.sub}</h2>
          </div>
          <div className="mt-10 pt-6 border-t border-sageGrey/20">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Roles</p>
            <div className="flex flex-wrap gap-2">
              {authUser.roles.map(role => (
                <span key={role} className="bg-forestDark text-white px-4 py-1.5 rounded-2xl text-[10px] font-bold">
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* TARJETA DE MÉTRICAS ADMIN */}
        {isAdmin ? (
          <div className="md:col-span-2 bg-forestDark p-10 rounded-[3rem] text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-salviaGreen text-[10px] font-black uppercase mb-1">Activas</p>
                <h3 className="text-5xl font-black">{stats.active}</h3>
              </div>
              <div className="border-x border-white/10">
                <p className="text-orange-400 text-[10px] font-black uppercase mb-1">Pendientes</p>
                <h3 className="text-5xl font-black">{stats.pending}</h3>
              </div>
              <div>
                <p className="text-red-400 text-[10px] font-black uppercase mb-1">Rechazadas</p>
                <h3 className="text-5xl font-black">{stats.rejected}</h3>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Usuarios: {activeUsers}</span>
                {/* BOTÓN PARA EL ADMIN: Ir a validar */}
                <Link to="/admin/requests" className="bg-salviaGreen text-forestDark px-4 py-2 rounded-full text-[10px] font-black hover:bg-white transition-all no-underline">
                  VALIDAR SOLICITUDES →
                </Link>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Inspiración */}
            <div className="bg-salviaGreen p-10 rounded-[3rem] text-white shadow-xl">
              <h3 className="text-2xl font-serif italic italic leading-snug">"{quote?.content}"</h3>
              <p className="mt-4 font-bold text-sm">— {quote?.author}</p>
            </div>

            {/* BOTÓN PARA EL ALUMNO: Si no es mentor, mostramos la invitación */}
            {!isMentor && (
  <Link 
    to="/become-mentor" 
    className="bg-white border-2 border-dashed border-salviaGreen p-8 rounded-[3rem] flex items-center justify-between group hover:bg-salviaGreen/5 transition-all no-underline"
  >
    <div>
      <h4 className="font-black text-forestDark text-lg m-0">¿Quieres ser Mentor?</h4>
      <p className="text-slate-400 text-xs m-0">Haz clic aquí para enviar tu solicitud.</p>
    </div>
    <span className="text-2xl group-hover:translate-x-2 transition-transform">🚀</span>
  </Link>
)}
          </div>
        )}

        

        {/* Acciones Rápidas */}
        <Link to={isAdmin ? "/admin/subjects" : "/subjects"} className="bg-white p-8 rounded-[2.5rem] border border-sageGrey/30 flex flex-col items-center justify-center text-center group hover:bg-forestDark transition-all no-underline">
          <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📚</span>
          <p className="text-forestDark group-hover:text-white font-black text-lg m-0">Materias</p>
        </Link>

        <Link to="/edit" className="bg-white p-8 rounded-[2.5rem] border border-sageGrey/30 flex flex-col items-center justify-center text-center group hover:bg-salviaGreen transition-all no-underline">
          <span className="text-3xl mb-3 group-hover:rotate-45 transition-transform">⚙️</span>
          <p className="text-forestDark group-hover:text-white font-black text-lg m-0">Ajustes</p>
        </Link>

        {isAdmin && (
          <Link to="/admin/listUsers" className="bg-white p-8 rounded-[2.5rem] border border-sageGrey/30 flex flex-col items-center justify-center text-center group hover:bg-forestDark transition-all no-underline">
            <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">👥</span>
            <p className="text-forestDark group-hover:text-white font-black text-lg m-0">Usuarios</p>
          </Link>
        
        )}
        {isAdmin && (
          <Link 
  to="/admin/logs" 
  className="bg-white p-8 rounded-[2.5rem] border border-sageGrey/30 flex flex-col items-center justify-center text-center group hover:bg-orange-400 transition-all duration-500 shadow-sm no-underline"
>
  <div className="w-12 h-12 bg-brokenWhite rounded-2xl mb-4 flex items-center justify-center group-hover:bg-white/20 transition-colors">
    <span className="text-2xl group-hover:rotate-12 transition-transform">📜</span>
  </div>
  <p className="text-forestDark group-hover:text-white font-black text-xl m-0">Auditoría</p>
  <p className="text-slate-400 group-hover:text-white/80 text-xs m-0 mt-1 uppercase tracking-tighter font-bold">Historial de cambios</p>
</Link>
        )}
        

      </div>
    </div>
  );
}