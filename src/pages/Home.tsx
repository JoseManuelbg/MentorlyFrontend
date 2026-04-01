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

// ── Subcomponentes ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "green" | "orange" | "red";
}) {
  const colors = {
    green:  { label: "text-salviaGreen",  bar: "bg-salviaGreen" },
    orange: { label: "text-orange-400",   bar: "bg-orange-400"  },
    red:    { label: "text-red-400",       bar: "bg-red-400"     },
  };
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-4 px-3">
      <span className={`text-[10px] font-black uppercase tracking-widest ${colors[color].label}`}>
        {label}
      </span>
      <span className="text-5xl font-black text-white tabular-nums">{value}</span>
      <div className={`w-8 h-0.5 rounded-full mt-1 ${colors[color].bar} opacity-60`} />
    </div>
  );
}

function QuickLink({
  to,
  emoji,
  label,
  sublabel,
  accent = "hover:bg-forestDark",
}: {
  to: string;
  emoji: string;
  label: string;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <Link
      to={to}
      className={`group bg-white border border-sageGrey/25 p-6 rounded-2xl flex flex-col gap-3 ${accent} hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md no-underline`}
    >
      <span className="text-3xl group-hover:scale-110 transition-transform duration-200 inline-block w-fit">
        {emoji}
      </span>
      <div>
        <p className="font-black text-forestDark group-hover:text-white text-base m-0 leading-tight transition-colors duration-300">
          {label}
        </p>
        {sublabel && (
          <p className="text-slate-400 group-hover:text-white/60 text-xs m-0 mt-0.5 font-medium transition-colors duration-300">
            {sublabel}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────

export default function Home() {
  const { token, user: authUser } = useAuth();
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [stats, setStats] = useState<MentorshipStats>({ active: 0, pending: 0, rejected: 0 });
  const [quote, setQuote] = useState<Quote>();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const isAdmin = authUser?.roles.some((role) =>
    ["admin", "role_admin"].includes(role.toLowerCase())
  );
  const isMentor = authUser?.roles.some((role) =>
    ["mentor", "role_mentor"].includes(role.toLowerCase())
  );

  useEffect(() => {
    if (token && isAdmin) fetchAdminData(token);
  }, [token, isAdmin]);

  const fetchAdminData = async (t: string) => {
    try {
      const [resUsers, resStats] = await Promise.all([
        fetch(`${BASE_URL}/users/stats/getActive`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${BASE_URL}/requests/stats/all`,   { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (resUsers.ok) setActiveUsers((await resUsers.json()).count);
      if (resStats.ok) {
        const d = await resStats.json();
        setStats({ active: d.active || 0, pending: d.pending || 0, rejected: d.rejected || 0 });
      }
    } catch {
      notify("Error al actualizar estadísticas del panel", "error");
    }
  };

  useEffect(() => {
    fetch("https://api.quotable.io/random")
      .then((r) => r.json())
      .then(setQuote)
      .catch(() => {});
  }, []);

  if (!authUser)
    return (
      <div className="min-h-screen flex items-center justify-center bg-brokenWhite">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-salviaGreen border-t-transparent rounded-full animate-spin" />
          <p className="text-forestDark/50 text-sm font-bold tracking-wide">Cargando...</p>
        </div>
      </div>
    );

  const username = authUser.sub.split("@")[0];

  return (
    <div className="min-h-screen bg-brokenWhite">
      {/* ── Hero Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-sageGrey/15">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-salviaGreen mb-2">
              {isAdmin ? "Admin Dashboard" : isMentor ? "Panel Mentor" : "Mi Espacio"}
            </p>
            <h1 className="text-3xl lg:text-4xl font-black text-forestDark tracking-tight leading-tight">
              Hola, <span className="text-salviaGreen">{username}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 font-medium">
              {isAdmin
                ? "Vista general del sistema y estadísticas en tiempo real."
                : isMentor
                ? "Gestiona tus materias y disponibilidad."
                : "Explora mentores, consulta tus solicitudes y más."}
            </p>
          </div>

          {/* Badge rol */}
          <div className="flex items-center gap-2.5 bg-brokenWhite border border-sageGrey/20 rounded-2xl px-5 py-3 self-start sm:self-auto shrink-0">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-forestDark/40">Conectado como</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {authUser.roles.map((role) => (
                  <span
                    key={role}
                    className="bg-forestDark text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                  >
                    {role.replace("ROLE_", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Contenido ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8 space-y-8">

        {/* ── BLOQUE ADMIN ──────────────────────────────────────────── */}
        {isAdmin && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-widest text-forestDark/40 mb-4">
              Estadísticas de mentorías
            </h2>
            <div className="bg-forestDark rounded-3xl overflow-hidden shadow-xl">
              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-white/8">
                <StatCard label="Activas"    value={stats.active}   color="green"  />
                <StatCard label="Pendientes" value={stats.pending}  color="orange" />
                <StatCard label="Rechazadas" value={stats.rejected} color="red"    />
              </div>
              {/* Footer */}
              <div className="border-t border-white/5 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Usuarios activos</span>
                  <span className="text-white font-black text-sm">{activeUsers}</span>
                </div>
                <Link
                  to="/admin/requests"
                  className="bg-salviaGreen text-forestDark text-xs font-black px-5 py-2 rounded-full hover:bg-white transition-all no-underline"
                >
                  Validar solicitudes →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── BLOQUE NO-ADMIN ────────────────────────────────────────── */}
        {!isAdmin && (
          <section>
            {/* Cita inspiracional */}
            {quote && (
              <div className="bg-forestDark rounded-3xl px-8 py-7 mb-4 relative overflow-hidden">
                <span className="absolute -top-4 -left-2 text-8xl text-white/5 font-serif select-none">"</span>
                <p className="text-white font-serif italic text-lg leading-relaxed relative z-10">
                  {quote.content}
                </p>
                <p className="text-salviaGreen text-sm font-bold mt-4">— {quote.author}</p>
              </div>
            )}

            {/* CTA Convertirse en mentor */}
            {!isMentor && (
              <Link
                to="/become-mentor"
                className="flex items-center justify-between bg-white border-2 border-dashed border-salviaGreen/40 hover:border-salviaGreen p-6 rounded-2xl group hover:bg-salviaGreen/5 transition-all no-underline"
              >
                <div>
                  <p className="font-black text-forestDark text-base m-0">¿Quieres ser Mentor?</p>
                  <p className="text-slate-400 text-sm m-0 mt-0.5">Envía tu solicitud y empieza a enseñar.</p>
                </div>
                <span className="text-2xl group-hover:translate-x-1.5 transition-transform duration-200">🚀</span>
              </Link>
            )}
          </section>
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