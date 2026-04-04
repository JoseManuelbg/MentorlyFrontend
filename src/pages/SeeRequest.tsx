import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import type RequestDTO from "../models/RequestDTO";
import { notify } from "../reusable/Notification";
import type { Status } from "../models/RequestDTO";

interface MaterialDTO {
    id: number;
    fileName: string;
    cloudinaryUrl: string;
    visible: boolean;
    uploadedAt: string;
    subjectName: string;
}

export default function SeeRequests() {
    const { token, user } = useAuth();
    const [requests, setRequests] = useState<RequestDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState<Record<number, MaterialDTO[]>>({});
    const [uploadingFor, setUploadingFor] = useState<number | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [visibleFor, setVisibleFor] = useState(true);
    const [expandedMaterials, setExpandedMaterials] = useState<Set<number>>(new Set());

    const BASE_URL = import.meta.env.VITE_API_URL;

const [mySubjects, setMySubjects] = useState<{id: number, name: string, subjectName: string}[]>([]);
   const isMentor = user?.roles?.some((r) =>
    typeof r === "string" ? r.toUpperCase() === "MENTOR" : (r as { name: string }).name?.toUpperCase() === "MENTOR"
) ?? false;

    const getHeaders = () => ({ "Authorization": `Bearer ${token}` });

    // --- REQUESTS ---
    const getRequests = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await fetch(`${BASE_URL}/requests/seeAll`, { headers: getHeaders() });
            const data = await res.json();
            if (!res.ok) { notify(data.message || "Error al obtener solicitudes", "error"); return; }
            const sorted = (data as RequestDTO[]).sort((a, b) =>
                new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()
            );
            setRequests(sorted);
        } catch { notify("Error de conexión con el servidor", "error"); }
        finally { setLoading(false); }
    }, [token, isMentor]);

    useEffect(() => { getRequests(); }, [getRequests, user?.sub]);

useEffect(() => {
    if (!isMentor) return;
    fetch(`${BASE_URL}/users/subjects/me`, { headers: getHeaders() })
        .then(res => res.json())
        .then(data => setMySubjects(data))
        .catch(() => notify("Error cargando tus materias", "error"));
}, [isMentor]);

    // --- MATERIALES ---
    const fetchMaterials = async (requestId: number) => {
        try {
const endpoint = isMentor
    ? `/materials/request/${requestId}`
    : `/materials/request/${requestId}/visible`;
                const res = await fetch(`${BASE_URL}${endpoint}`, { headers: getHeaders() });
            if (!res.ok) return;
            const data: MaterialDTO[] = await res.json();
            setMaterials(prev => ({ ...prev, [requestId]: data }));
        } catch { notify("Error cargando materiales", "error"); }
    };

    const toggleExpand = (requestId: number) => {
        setExpandedMaterials(prev => {
            const next = new Set(prev);
            if (next.has(requestId)) {
                next.delete(requestId);
            } else {
                next.add(requestId);
                fetchMaterials(requestId);
            }
            return next;
        });
    };

    const handleUpload = async (requestId: number) => {
    if (!selectedFile) {
        notify("Selecciona un archivo", "error");
        return;
    }
        const formData = new FormData();
        formData.append("file", selectedFile);
    formData.append("requestId", String(requestId)); 
            formData.append("visible", String(visibleFor));

 console.log(">>> requestId enviado:", requestId);

        try {
            const res = await fetch(`${BASE_URL}/materials/upload`, {
                method: "POST",
                headers: getHeaders(),
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                notify("Material subido con éxito", "success");
                setUploadingFor(null);
                setSelectedFile(null);
                fetchMaterials(requestId);
            } else {
                notify(data.message || "Error al subir el archivo", "error");
            }
        } catch { notify("Error de conexión", "error"); }
    };

    const handleDelete = async (materialId: number, requestId: number) => {
        if (!window.confirm("¿Eliminar este material?")) return;
        try {
            const res = await fetch(`${BASE_URL}/materials/${materialId}`, {
                method: "DELETE",
                headers: getHeaders(),
            });
            if (res.ok) {
                notify("Material eliminado", "success");
                fetchMaterials(requestId);
            }
        } catch { notify("Error al eliminar", "error"); }
    };

    const handleToggleVisibility = async (materialId: number, requestId: number) => {
        try {
            const res = await fetch(`${BASE_URL}/materials/${materialId}/visibility`, {
                method: "PATCH",
                headers: getHeaders(),
            });
            if (res.ok) fetchMaterials(requestId);
        } catch { notify("Error al cambiar visibilidad", "error"); }
    };

    // --- ACCIONES MENTOR/ALUMNO ---
    const handleStatusUpdate = async (id: number, action: 'book' | 'cancel') => {
        try {
            const endpoint = action === 'book' ? "accept" : "cancel";
            const method = action === 'book' ? "POST" : "PATCH";
            const res = await fetch(`${BASE_URL}/requests/${endpoint}?requestId=${id}`, {
                method,
                headers: getHeaders(),
            });
            if (res.ok) {
                notify(`Solicitud ${action === 'book' ? 'aceptada' : 'rechazada'}`, "success");
                getRequests();
            } else {
                const err = await res.json();
                notify(err.message || "Error al actualizar", "error");
            }
        } catch { notify("Error de conexión", "error"); }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta mentoría?")) return;
        try {
            const res = await fetch(`${BASE_URL}/requests/cancel?requestId=${id}`, {
                method: "PATCH",
                headers: getHeaders(),
            });
            if (res.ok) { notify("Mentoría cancelada con éxito", "success"); getRequests(); }
        } catch { notify("Error al procesar la cancelación", "error"); }
    };

    // --- HELPERS ---
    const now = new Date().getTime();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    const activeRequests = requests.filter(req =>
        new Date(req.appointmentTime).getTime() >= now && req.status.toUpperCase() !== 'REJECTED'
    );
    const historyRequests = requests.filter(req => !activeRequests.includes(req));

    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

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
        const translations: Record<Status, string> = {
            PENDING: 'Pendiente', ACCEPTED: 'Aceptada', REJECTED: 'Rechazada'
        };
        return translations[normalized] || 'Desconocido';
    };

    // --- SUBCOMPONENTE: SECCIÓN DE MATERIALES ---
    const MaterialsSection = ({ req }: { req: RequestDTO }) => {
        const isExpanded = expandedMaterials.has(req.id);
        const reqMaterials = materials[req.id] ?? [];
        const isUploading = uploadingFor === req.id;

        return (
            <div className="mt-3 pt-3 border-t border-forestDark/5">
                <button
                    onClick={() => toggleExpand(req.id)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-forestDark/40 hover:text-forestDark/70 transition-all"
                >
                    <span className={`transition-transform duration-200 inline-block ${isExpanded ? 'rotate-45' : ''}`}>+</span>
                    Materiales {reqMaterials.length > 0 && `(${reqMaterials.length})`}
                </button>

                {isExpanded && (
                    <div className="mt-3 flex flex-col gap-2">

                        {/* Lista de materiales */}
                        {reqMaterials.length > 0 ? (
                            reqMaterials.map(mat => (
                                <div key={mat.id} className="flex items-center justify-between bg-forestDark/5 rounded-xl px-4 py-2">
                                    <a
                                        href={mat.cloudinaryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-semibold text-forestDark hover:underline truncate max-w-[200px]"
                                        title={mat.fileName}
                                    >
                                        📄 {mat.fileName}
                                    </a>
                                    {isMentor && (
                                        <div className="flex items-center gap-3 shrink-0 ml-2">
                                            <button
                                                onClick={() => handleToggleVisibility(mat.id, req.id)}
                                                title={mat.visible ? "Visible para alumnos" : "Oculto"}
                                                className={`text-[10px] font-bold uppercase tracking-wider transition-all ${mat.visible ? 'text-green-600' : 'text-forestDark/30'}`}
                                            >
                                                {mat.visible ? "Visible" : "Oculto"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(mat.id, req.id)}
                                                className="text-clayAccent hover:text-red-700 text-[10px] font-black uppercase tracking-wider border-b border-clayAccent transition-all"
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-[11px] italic text-forestDark/30 ml-1">
                                {isMentor ? "Aún no has subido materiales para esta sesión." : "No hay materiales disponibles."}
                            </p>
                        )}

                        {/* Formulario de subida — solo mentor */}
                        {isMentor && (
                            <div className="mt-2">
                                {!isUploading ? (
                                    <button
                                        onClick={() => setUploadingFor(req.id)}
                                        className="text-[10px] font-black uppercase tracking-widest text-salviaGreen hover:text-forestDark transition-all border-b border-salviaGreen"
                                    >
                                        + Subir material
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2 mt-2 p-3 bg-brokenWhite rounded-xl border border-forestDark/10">
                                        <label className="flex items-center gap-2 cursor-pointer">
    <span className="px-3 py-1.5 rounded-lg bg-salviaGreen/20 text-forestDark text-xs font-bold hover:bg-salviaGreen/30 transition-all">
        Elegir archivo
    </span>
    <span className="text-xs text-forestDark/50 truncate max-w-[150px]">
        {selectedFile ? selectedFile.name : "Ningún archivo seleccionado"}
    </span>
    <input
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
    />
</label>
                                       
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`visible-${req.id}`}
                                                checked={visibleFor}
                                                onChange={e => setVisibleFor(e.target.checked)}
                                                className="accent-salviaGreen"
                                            />
                                            <label htmlFor={`visible-${req.id}`} className="text-xs text-forestDark/60">
                                                Visible para el alumno
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpload(req.id)}
                                                className="flex-1 py-1.5 rounded-lg bg-salviaGreen text-white text-xs font-bold hover:brightness-105 transition-all"
                                            >
                                                Subir
                                            </button>
                                            <button
                                                onClick={() => { setUploadingFor(null); setSelectedFile(null); }}
                                                className="flex-1 py-1.5 rounded-lg bg-forestDark/10 text-forestDark text-xs font-bold hover:bg-forestDark/20 transition-all"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-salviaGreen py-12 px-4 flex flex-col items-center">
            {loading ? (
                <div className="flex-1 flex items-center justify-center font-bold text-forestDark animate-pulse">
                    Cargando {isMentor ? "solicitudes de alumnos..." : "tus mentorías..."}
                </div>
            ) : (
                <>
                    <header className="mb-10 w-full max-w-2xl text-center">
                        <h1 className="text-3xl font-extrabold text-forestDark bg-brokenWhite py-3 px-8 rounded-2xl shadow-sm border-b-4 border-sageGrey">
                            {isMentor ? "Gestión de Mentorías" : "Mis Mentorías"}
                        </h1>
                    </header>

                    <div className="w-full max-w-2xl flex flex-col gap-10">
                        {/* ACTIVAS */}
                        <section>
                            <div className="flex items-center gap-2 mb-4 ml-4">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <h2 className="text-xs font-black text-forestDark/60 uppercase tracking-widest">
                                    {isMentor ? "Solicitudes por atender" : "Mentorías Activas"}
                                </h2>
                            </div>

                            <div className="flex flex-col gap-4">
                                {activeRequests.length > 0 ? activeRequests.map((req) => (
                                    <div key={req.id} className="bg-brokenWhite p-6 rounded-2xl shadow-sm border border-forestDark/10 flex flex-col gap-3 transition-all hover:shadow-md">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-forestDark/40">
                                                    {isMentor ? `Alumno: ${req.idStudent || 'Sin nombre'}` : "Fecha de sesión"}
                                                </span>
                                                <h3 className="text-xl font-bold text-forestDark">{formatDate(req.appointmentTime)}</h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyles(req.status)}`}>
                                                {translateStatus(req.status)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-forestDark/5">
                                            <p className="text-[10px] text-forestDark/40 font-mono italic uppercase tracking-widest">Ref: #{req.id}</p>
                                            <div className="flex gap-4">
                                                {isMentor && req.status.toUpperCase() === 'PENDING' ? (
                                                    <>
                                                        <button onClick={() => handleStatusUpdate(req.id, 'book')} className="text-[10px] font-black text-green-600 hover:text-green-800 transition-all tracking-widest uppercase border-b border-green-600">Aceptar</button>
                                                        <button onClick={() => handleStatusUpdate(req.id, 'cancel')} className="text-[10px] font-black text-clayAccent hover:text-red-700 transition-all tracking-widest uppercase border-b border-clayAccent">Rechazar</button>
                                                    </>
                                                ) : !isMentor && (new Date(req.appointmentTime).getTime() - now) >= twentyFourHoursInMs && (
                                                    <button onClick={() => handleCancel(req.id)} className="text-[10px] font-black text-clayAccent hover:text-forestDark transition-all tracking-widest uppercase border-b border-clayAccent">Cancelar</button>
                                                )}
                                            </div>
                                        </div>

                                        <MaterialsSection req={req} />
                                    </div>
                                )) : (
                                    <div className="p-6 border-2 border-dashed border-forestDark/10 rounded-2xl text-center text-forestDark/40 text-sm bg-brokenWhite/30">
                                        No hay mentorías {isMentor ? "pendientes de aprobación" : "pendientes"}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* HISTORIAL */}
                        <section>
                            <h2 className="text-xs font-black text-forestDark/40 uppercase tracking-widest mb-4 ml-4">Historial y Rechazadas</h2>
                            <div className="flex flex-col gap-4">
                                {historyRequests.length > 0 ? historyRequests.map((req) => (
                                    <div key={req.id} className="bg-brokenWhite p-6 rounded-2xl shadow-sm border border-transparent opacity-60 grayscale-[0.2] flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-forestDark/40">
                                                    {isMentor ? `Alumno: ${req.idStudent || 'Sin nombre'}` : "Fecha de sesión"}
                                                </span>
                                                <h3 className="text-xl font-bold text-forestDark">{formatDate(req.appointmentTime)}</h3>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyles(req.status)}`}>
                                                {translateStatus(req.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-forestDark/5">
                                            <p className="text-[10px] text-forestDark/40 font-mono italic uppercase tracking-widest">Ref: #{req.id}</p>
                                        </div>

                                        <MaterialsSection req={req} />
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