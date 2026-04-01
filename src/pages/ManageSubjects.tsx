import React, { useEffect, useState } from "react";
import type Subject from "../models/Subject";
import type { Level } from "../models/Subject";
import { notify } from "../reusable/Notification";
import { useAuth } from "../context/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVELS: Level[] = ["PRIMARY", "SECONDARY", "HIGH_SCHOOL", "VOCATIONAL", "UNIVERSITY"];

const LEVEL_META: Record<Level, { label: string }> = {
  PRIMARY:     { label: "Primaria"     },
  SECONDARY:   { label: "Secundaria"   },
  HIGH_SCHOOL: { label: "Bachillerato" },
  VOCATIONAL:  { label: "FP / Ciclos"  },
  UNIVERSITY:  { label: "Universidad"  },
};

// ── Iconos inline ─────────────────────────────────────────────────────────────

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const IconWarn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

// ── Componente Principal ──────────────────────────────────────────────────────

const SubjectsPanel: React.FC = () => {
  const { token, user } = useAuth(); // asume que useAuth expone el rol del usuario
const isAdmin = user?.roles?.some((r) =>
  typeof r === "string" ? r === "ADMIN" : (r as { name: string }).name === "ADMIN"
); const BASE_URL = import.meta.env.VITE_API_URL;

  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [mySubjectIds, setMySubjectIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState({ name: "", level: "PRIMARY" as Level });

  const levels: Level[] = ["PRIMARY", "SECONDARY", "HIGH_SCHOOL", "VOCATIONAL", "UNIVERSITY"];

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  });

  // --- FETCH ---

  const fetchAllSubjects = async () => {
    try {
      const res = await fetch(`${BASE_URL}/subjects`);
      if (!res.ok) throw new Error();
      setAllSubjects(await res.json());
    } catch {
      notify("Error cargando el catálogo de materias", "error");
    }
  };

  const fetchMySubjects = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/subjects/me`, { headers: getHeaders() });
      if (!res.ok) throw new Error();
      const data: Subject[] = await res.json();
      setMySubjectIds(new Set(data.map((s) => s.id)));
    } catch {
      notify("Error cargando tus materias", "error");
    }
  };

  useEffect(() => {
    Promise.all([fetchAllSubjects(), fetchMySubjects()]).finally(() => setLoading(false));
  }, []);

  // --- ADMIN: CRUD ---

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/subjects/admin`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify(newSubject),
      });
      const data = await res.json();
      if (res.ok) {
        notify("Materia creada con éxito", "success");
        setNewSubject({ name: "", level: "PRIMARY" });
        fetchAllSubjects();
      } else {
        notify(data.message || "No se pudo crear la materia", "error");
      }
    }  catch {
      notify("Error de conexión con el servidor", "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    try {
      const res = await fetch(`${BASE_URL}/subjects/admin/${editingSubject.id}`, {
        method: "PUT", headers: getHeaders(), body: JSON.stringify(editingSubject),
      });
      const data = await res.json();
      if (res.ok) {
        notify("Materia actualizada correctamente", "success");
        setEditingSubject(null);
        fetchAllSubjects();
      } else {
        notify(data.message || "Error al actualizar", "error");
      }
    } catch {
      notify("Error al procesar la actualización", "error");
    }
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      const res = await fetch(`${BASE_URL}/subjects/admin/${subjectToDelete.id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) {
        notify("Materia eliminada del sistema", "success");
        fetchAllSubjects();
      } else {
        const data = await res.json();
        notify(data.message || "No se puede eliminar la materia", "error");
      }
    }  catch {
      notify("Error de red al intentar eliminar", "error");
    } finally {
      setSubjectToDelete(null);
    }
  };

  // --- USUARIO: TOGGLE ---

  const toggleSubject = async (subject: Subject) => {
    const has = mySubjectIds.has(subject.id);
    const url = `${BASE_URL}/users/subjects/${has ? "remove" : "add"}/${subject.id}`;
    const method = has ? "DELETE" : "POST";

    try {
      const res = await fetch(url, { method, headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setMySubjectIds((prev) => {
          const next = new Set(prev);
          has ? next.delete(subject.id) : next.add(subject.id);
          return next;
        });
        notify(has ? "Materia eliminada de tu perfil" : "Materia añadida a tu perfil", "success");
      } else {
        notify(data.message || "Error al actualizar tus materias", "error");
      }
    } catch {
      notify("Error de conexión", "error");
    }
  };

  // --- RENDER ---

  const subjectsByLevel: Record<Level, Subject[]> = {
    PRIMARY: [], SECONDARY: [], HIGH_SCHOOL: [], VOCATIONAL: [], UNIVERSITY: [],
  };
  allSubjects.forEach((s) => {
    if (subjectsByLevel[s.level]) subjectsByLevel[s.level].push(s);
  });

  return (
    <div className="bg-salviaGreen min-h-screen py-12 px-6 flex flex-col items-center relative">

      {/* ADMIN: formulario de creación */}
      {isAdmin && (
        <div className="w-full max-w-4xl backdrop-blur-lg bg-brokenWhite/70 rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Materia</h2>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="w-full rounded-xl px-4 py-2 bg-white/60 outline-none focus:ring-2 focus:ring-salviaGreen border border-transparent"
                placeholder="Ej: Análisis Matemático II"
                required
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nivel</label>
              <select
                value={newSubject.level}
                onChange={(e) => setNewSubject({ ...newSubject, level: e.target.value as Level })}
                className="w-full rounded-xl px-4 py-2 bg-white/60 outline-none cursor-pointer focus:ring-2 focus:ring-salviaGreen"
              >
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button className="bg-slate-800 text-white px-8 py-2 rounded-xl hover:bg-slate-700 transition-all font-bold shadow-md">
              Añadir
            </button>
          </form>
        </div>
      )}

      {/* CATÁLOGO */}
      <div className="w-full max-w-4xl backdrop-blur-lg bg-brokenWhite/70 rounded-2xl shadow-lg p-8 mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center uppercase tracking-widest">
          {isAdmin ? "Catálogo de Materias" : "Mis Materias"}
        </h2>
        {!isAdmin && (
          <p className="text-center text-sm text-gray-500 mb-8">
            Activa o desactiva las materias que impartes o quieres aprender.
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-salviaGreen mb-4"></div>
            <p className="text-gray-600">Sincronizando con el servidor...</p>
          </div>
        ) : (
          (Object.keys(subjectsByLevel) as Level[]).map((level) =>
            subjectsByLevel[level].length > 0 && (
              <div key={level} className="mb-10">
                <h3 className="text-lg font-bold text-salviaGreen mb-4 border-b-2 border-salviaGreen/20 pb-1 uppercase tracking-wider">
                  {level}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectsByLevel[level].map((subject) => {
                    const isMine = mySubjectIds.has(subject.id);
                    return (
                      <div
                        key={subject.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all shadow-sm
                          ${isMine && !isAdmin
                            ? "bg-salviaGreen/20 border-salviaGreen/40"
                            : "bg-white/60 border-white/40 hover:bg-white/90"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Badge "tuya" para usuario normal */}
                          {!isAdmin && isMine && (
                            <span className="w-2 h-2 rounded-full bg-salviaGreen inline-block shrink-0" />
                          )}
                          <span className="font-semibold text-gray-800">{subject.name}</span>
                        </div>

                        <div className="flex gap-2">
                          {isAdmin ? (
                            // Botones admin: editar + eliminar
                            <>
                              <button
                                onClick={() => setEditingSubject(subject)}
                                className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setSubjectToDelete(subject)}
                                className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            // Toggle para usuario normal
                            <button
                              onClick={() => toggleSubject(subject)}
                              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                                ${isMine
                                  ? "bg-red-100 text-red-500 hover:bg-red-200"
                                  : "bg-salviaGreen/20 text-salviaGreen hover:bg-salviaGreen/30"
                                }`}
                            >
                              {isMine ? "Quitar" : "Añadir"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* MODAL EDITAR — solo admin */}
      {editingSubject && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-brokenWhite w-full max-w-md rounded-2xl shadow-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Editar Materia</h3>
            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 border border-slate-200 outline-none focus:ring-2 focus:ring-salviaGreen bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nivel</label>
                <select
                  value={editingSubject.level}
                  onChange={(e) => setEditingSubject({ ...editingSubject, level: e.target.value as Level })}
                  className="w-full rounded-xl px-4 py-3 border border-slate-200 outline-none focus:ring-2 focus:ring-salviaGreen bg-white cursor-pointer"
                >
                  {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditingSubject(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-gray-600 font-bold hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-salviaGreen text-white font-bold hover:brightness-105">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR — solo admin */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Confirmar borrado?</h3>
            <p className="text-gray-500 mb-8">
              Estás a punto de eliminar <span className="font-bold text-gray-800">"{subjectToDelete.name}"</span>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSubjectToDelete(null)} className="flex-1 py-3 rounded-xl bg-slate-50 text-gray-500 font-bold hover:bg-slate-100">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPanel;