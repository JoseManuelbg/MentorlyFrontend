import React, { useEffect, useState } from "react";
import { notify } from "../reusable/Notification";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

interface UserMatchDTO {
  id: string,
  name: string;
  score: number;
  commonSubjects: string[]; 
}

const UserFinder: React.FC = () => {
  const [matches, setMatches] = useState<UserMatchDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const { token, user } = useAuth();

  const fetchMatches = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/users/find`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (!res.ok) throw new Error();
      const data: UserMatchDTO[] = await res.json();
      setMatches(data);
    } catch (error) {
      notify("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [token, user?.sub]);

  

  return (
    <div className="bg-salviaGreen min-h-screen py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-4xl backdrop-blur-lg bg-brokenWhite/70 rounded-2xl shadow-lg p-8">
        
        {/* CABECERA */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Maestros Ideales</h2>
            <p className="text-gray-600">Usuarios con intereses similares a los tuyos</p>
          </div>
          <button 
            onClick={fetchMatches}
            className="p-3 hover:bg-white/50 rounded-full transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* LISTADO O CARGA */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-40 bg-white/30 animate-pulse rounded-2xl border border-white/20"></div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match, index) => (
              <div key={index} className="bg-white/60 p-6 rounded-2xl border border-white/40 hover:bg-white/80 transition-all group shadow-sm hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 text-brokenWhite rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
                      {match.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg leading-none">{match.name}</h3>
                      <span className="text-[10px] font-bold text-salviaGreen uppercase tracking-widest bg-salviaGreen/10 px-2 py-0.5 rounded-md mt-2 inline-block">Sugerido</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-800">{Math.round(match.score)}%</span>
                  </div>
                </div>
                

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-5">
                  <div 
                    className="h-full bg-salviaGreen transition-all duration-700"
                    style={{ width: `${match.score}%` }}
                  ></div>
                </div>

              {/* Sección de Materias en Común */}
<div className="mb-5">
  <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">
    Coincidencias:
  </p>
  <div className="flex flex-wrap gap-1.5">
    {match.commonSubjects && match.commonSubjects.length > 0 ? (
      match.commonSubjects.map((sub, i) => (
        <span 
          key={i} 
          className="px-2 py-0.5 bg-salviaGreen/10 border border-salviaGreen/20 text-salviaGreen text-[11px] font-medium rounded-md"
        >
          {sub}
        </span>
      ))
    ) : (
      <span className="text-[11px] text-gray-400 italic">Sin materias específicas</span>
    )}
  </div>
</div>
            {/*{match?.id}*/}
                <Link to={`/seeProfile/${match.id}`}  className="w-full py-2.5 p-2 bg-slate-800  text-white rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200">
                  Ver perfil completo 
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="bg-white/40 p-6 rounded-full mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <p className="text-xl text-gray-600 font-medium">No hay coincidencias todavía</p>
            <p className="text-gray-500 max-w-xs mt-2">Asegúrate de haber añadido materias y niveles en tu panel de control.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFinder;