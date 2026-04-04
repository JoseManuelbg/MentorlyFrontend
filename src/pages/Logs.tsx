import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";

interface AuditLog {
  idLog: number;
  adminEmail: string;
  actionType: string;
  targetInfo: string;
  description: string;
  createdAt: string;
}

export default function AuditTable() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (token) fetchLogs();
  }, [token]);

 const fetchLogs = async () => {
  try {
    const res = await fetch(`${BASE_URL}/admin/audit/all`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!res.ok) {
      throw new Error(`Error en servidor: ${res.status}`);
    }

    const data = await res.json();
    console.log("Logs recibidos:", data); // Mira si esto imprime [] o datos
    setLogs(data);
  } catch (error) {
    console.error("Error detallado:", error);
    notify("Error al conectar con el servidor", "error");
  } finally {
    setLoading(false);
  }
};

  const getActionStyle = (action: string) => {
    if (action.includes("ROL")) return "bg-blue-100 text-blue-700";
    if (action.includes("ESTADO")) return "bg-purple-100 text-purple-700";
    if (action.includes("BORRADO")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-salviaGreen font-bold">Cargando historial...</div>;

  return (
    <div className="min-h-screen bg-brokenWhite p-6 lg:p-12 font-sans text-forestDark">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Historial de <span className="text-salviaGreen">Auditoría</span></h1>
          <p className="text-slate-500 text-sm mt-1 italic font-medium">Registro inmutable de acciones administrativas (H18)</p>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-sageGrey/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-forestDark text-white">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Fecha y Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Administrador</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Acción</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Afectado</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Detalle del Cambio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sageGrey/20">
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-slate-400 italic">No hay registros de actividad aún.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.idLog} className="hover:bg-brokenWhite/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-forestDark">
                        {log.adminEmail}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-tighter uppercase ${getActionStyle(log.actionType)}`}>
                          {log.actionType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {log.targetInfo}
                      </td>
                      <td className="px-6 py-4 text-xs italic text-slate-500">
                        {log.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}