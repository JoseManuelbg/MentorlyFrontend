import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; 
import { Link, useNavigate } from "react-router-dom";
import { notify } from "../reusable/Notification";

interface UserPayload {
  sub: string;
  email: string;
  roles: string[];
}

interface Quote {
  _id: string;
  content: string;
  author: string;
  authorSlug: string;
  length: number;
  tags: string[];
}

export default function Home() {
  const { token, user: authUser } = useAuth();
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [quote, setQuote] = useState<Quote>();

  // 1. Cargar estadísticas si es Admin
  useEffect(() => {
    if (token && authUser?.roles.some(r => r.toLowerCase() === "admin")) {
      fetchStats(token);
    }
  }, [token, authUser]);

  const fetchStats = async (t: string) => {
    try {
      const res = await fetch("http://localhost:8080/users/stats/getActive", {
        headers: { Authorization: `Bearer ${t}` }
      });
      
      if (!res.ok) {
        // Aquí usamos el notify si el backend responde con error (ej: 403 Forbidden)
        const errData = await res.json().catch(() => ({}));
        notify(errData.message || "No tienes permisos para ver las estadísticas", "error");
        return;
      }

      const data = await res.json();
      setActiveUsers(data.count);
    } catch (error) {
      // Error de red o servidor caído
      notify("Error al conectar con el servicio de estadísticas", "error");
    }
  };

  // 2. Frase del día
  useEffect(() => {
    fetch('https://api.quotable.io/random')
      .then(res => {
        if(!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setQuote(data))
      .catch(() => {
        // Notificamos que la frase no cargó, pero de forma más suave o silenciosa
        console.log("Quotable API offline");
      });
  }, []);

 

  if (!authUser) return <div className="p-10 text-center font-bold text-salviaGreen animate-pulse">Cargando sesión...</div>;

  const isAdmin = authUser.roles.some(role => role.toLowerCase() === "admin");

  return (
    <div className="min-h-screen bg-brokenWhite p-6 lg:p-12 font-sans text-forestDark">
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Hola, <span className="text-salviaGreen">{authUser.sub.split('@')[0]}</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 italic">
            {isAdmin ? "Panel de Control de Administración" : "Tu camino de aprendizaje empieza aquí."}
          </p>
        </div>
        <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-forestDark/40 uppercase tracking-widest">Estado del Sistema</span>
            <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-xs font-bold text-forestDark/70">Online</span>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        
        {/* Profile Card - Bento Large */}
        <div className="md:col-span-2 md:row-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-sageGrey/30 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <span className="px-4 py-1.5 bg-salviaGreen/10 text-salviaGreen text-[10px] font-bold rounded-full uppercase tracking-widest">Mi Perfil</span>
            <h2 className="text-3xl font-black mt-6 break-words leading-tight">{authUser.sub}</h2>
            <p className="text-slate-400 mt-2 font-mono text-xs">Token verificado ✓</p>
          </div>
          
          <div className="mt-10 pt-6 border-t border-sageGrey/20">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Roles Asignados</p>
            <div className="flex flex-wrap gap-2">
              {authUser.roles.map(role => (
                <span key={role} className="bg-forestDark text-white px-4 py-1.5 rounded-2xl text-[10px] font-bold tracking-wider shadow-sm">
                  {role.replace('ROLE_', '').toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Card (Admin o Usuario) */}
        {isAdmin ? (
          <div className="md:col-span-2 bg-forestDark p-10 rounded-[3rem] text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-salviaGreen text-[10px] font-black uppercase tracking-widest mb-1">Métricas en Vivo</p>
              <h3 className="text-7xl font-black tracking-tighter">{activeUsers}</h3>
              <p className="text-salviaGreen/80 mt-2 font-bold text-lg text-pretty">Usuarios activos en la plataforma</p>
            </div>
            {/* Círculo decorativo sutil */}
            <div className="absolute -right-5 -top-5 w-32 h-32 bg-salviaGreen/10 rounded-full blur-2xl"></div>
          </div>
        ) : (
          <div className="md:col-span-2 bg-salviaGreen p-10 rounded-[3rem] text-white shadow-xl shadow-salviaGreen/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-4">Inspiración Diaria</p>
              <h3 className="text-2xl font-medium leading-snug italic serif font-serif">
                "{quote?.content || "Cree que puedes y casi lo habrás logrado."}"
              </h3>
              <p className="mt-4 text-white/80 font-bold text-sm">
                — {quote?.author || "Theodore Roosevelt"}
              </p>
            </div>
            <button className="mt-6 w-fit bg-white/20 hover:bg-white text-white hover:text-salviaGreen px-6 py-2 rounded-full text-xs font-bold backdrop-blur-md transition-all relative z-10">
                 Ver mis cursos
            </button>
          </div>
        )}

        {/* Action Card: Subjects */}
        <Link 
          to={isAdmin ? "/admin/subjects" : "/subjects"} 
          className="bg-white p-8 rounded-[2.5rem] border border-sageGrey/30 flex flex-col items-center justify-center text-center group hover:bg-forestDark transition-all duration-500 shadow-sm no-underline"
        >
          <div className="w-12 h-12 bg-brokenWhite rounded-2xl mb-4 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
          </div>
          <p className="text-forestDark group-hover:text-white font-black text-xl m-0">Materias</p>
          <p className="text-slate-400 group-hover:text-salviaGreen text-xs m-0 mt-1 uppercase tracking-tighter font-bold">
            {isAdmin ? "Gestionar catálogo" : "Explorar recursos"}
          </p>
        </Link>

        {/* Action Card: Settings */}
        <Link 
          to="/edit" 
          className="bg-white p-8 rounded-[2.5rem] border border-sageGrey/30 flex flex-col items-center justify-center text-center group hover:bg-salviaGreen transition-all duration-500 shadow-sm no-underline"
        >
          <div className="w-12 h-12 bg-brokenWhite rounded-2xl mb-4 flex items-center justify-center group-hover:bg-white/20 transition-colors text-2xl">
            ⚙️
          </div>
          <p className="text-forestDark group-hover:text-white font-black text-xl m-0">Ajustes</p>
          <p className="text-slate-400 group-hover:text-white/60 text-xs m-0 mt-1 uppercase tracking-tighter font-bold">Cuenta y Perfil</p>
        </Link>

      </div>
    </div>
  );
}