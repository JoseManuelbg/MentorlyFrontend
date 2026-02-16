import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import type RequestDTO from "../models/RequestDTO";
import { notify } from "../reusable/Notification";
import type { Status } from "../models/RequestDTO";

export default function SeeRequests() {
    const { token, user } = useAuth();
    const [requests, setRequests] = useState<RequestDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const getRequests = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8080/requests/seeAll", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) {
                notify(data.message || "Error al obtener solicitudes", "error");
                return;
            }
            const sortedData = (data as RequestDTO[]).sort((a, b) => 
                new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()
            );
            setRequests(sortedData);
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { getRequests(); }, [getRequests, user?.sub]);

    const handleCancel = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta mentoría?")) return;
        try {
            const res = await fetch(`http://localhost:8080/requests/cancel?requestId=${id}`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) {
                const errorData = await res.json();
                notify(errorData.message || "No se pudo cancelar", "error");
                return;
            }
            notify("Mentoría cancelada con éxito", "success");
            getRequests();
        } catch (error) {
            notify("Error al procesar la cancelación", "error");
        }
    };

    // --- LÓGICA DE TIEMPOS Y GRUPOS ---
    const now = new Date().getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    const activeRequests = requests.filter(req => {
        const appointmentDate = new Date(req.appointmentTime).getTime();
        return appointmentDate >= now && req.status.toUpperCase() !== 'REJECTED';
    });

    const historyRequests = requests.filter(req => !activeRequests.includes(req));

    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const getStatusStyles = (status: string) => {
        const normalized = status.toUpperCase() as Status;
        const styles: Record<Status, string> = {
            ACCEPTED: 'bg-statusAccepted text-forestDark border-forestDark/20',
            REJECTED: 'bg-statusRejected text-forestDark/70 border-forestDark/10',
            PENDING: 'bg-statusPending text-slate-600 border-slate-300'
        };
        return styles[normalized] || styles.PENDING;
    };

    const translateStatus = (status: string) => {
        const normalized = status.toUpperCase() as Status;
        const translations: Record<Status, string> = { PENDING: 'Pendiente', ACCEPTED: 'Aceptada', REJECTED: 'Rechazada' };
        return translations[normalized] || 'Desconocido';
    };

    return (
        <div className="min-h-screen bg-salviaGreen py-12 px-4 flex flex-col items-center">
            {loading ? (
                <div className="flex-1 flex items-center justify-center font-bold text-forestDark animate-pulse">
                    Cargando tus mentorías...
                </div>
            ) : (
                <>
                    <header className="mb-10 w-full max-w-2xl text-center">
                        <h1 className="text-3xl font-extrabold text-forestDark bg-brokenWhite py-3 px-8 rounded-2xl shadow-sm border-b-4 border-sageGrey">
                            Mis Mentorías
                        </h1>
                    </header>

                    <div className="w-full max-w-2xl flex flex-col gap-10">
                        {/* SECCIÓN ACTIVAS */}
                        <section>
                            <div className="flex items-center gap-2 mb-4 ml-4">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <h2 className="text-xs font-black text-forestDark/60 uppercase tracking-widest">Mentorías Activas</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                                {activeRequests.length > 0 ? activeRequests.map((req) => (
                                    <div key={req.id} className="bg-brokenWhite p-6 rounded-2xl shadow-sm border border-forestDark/10 flex flex-col gap-3 transition-all hover:shadow-md">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-forestDark/40">Fecha de sesión</span>
                                                <h3 className="text-xl font-bold text-forestDark">{formatDate(req.appointmentTime)}</h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyles(req.status)}`}>
                                                {translateStatus(req.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-forestDark/5">
                                            <p className="text-[10px] text-forestDark/40 font-mono italic uppercase tracking-widest">Ref: #{req.id}</p>
                                            {(new Date(req.appointmentTime).getTime() - now) >= twentyFourHoursInMs && (
                                                <button onClick={() => handleCancel(req.id)} className="text-[10px] font-black text-clayAccent hover:text-forestDark transition-all tracking-widest uppercase border-b border-clayAccent">
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-6 border-2 border-dashed border-forestDark/10 rounded-2xl text-center text-forestDark/40 text-sm bg-brokenWhite/30">
                                        No tienes mentorías pendientes
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* SECCIÓN HISTORIAL */}
                        <section>
                            <h2 className="text-xs font-black text-forestDark/40 uppercase tracking-widest mb-4 ml-4">Historial y Rechazadas</h2>
                            <div className="flex flex-col gap-4">
                                {historyRequests.length > 0 ? historyRequests.map((req) => (
                                    <div key={req.id} className="bg-brokenWhite p-6 rounded-2xl shadow-sm border border-transparent opacity-60 grayscale-[0.2] flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-forestDark/40">Fecha de sesión</span>
                                                <h3 className="text-xl font-bold text-forestDark">{formatDate(req.appointmentTime)}</h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyles(req.status)}`}>
                                                {translateStatus(req.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-forestDark/5">
                                            <p className="text-[10px] text-forestDark/40 font-mono italic uppercase tracking-widest">Ref: #{req.id}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm italic text-forestDark/30 ml-4">Historial vacío.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}