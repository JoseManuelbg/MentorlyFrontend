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

const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects]             = useState<Subject[]>([]);
  const [loading, setLoading]               = useState(true);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [newSubject, setNewSubject]         = useState({ name: "", level: "PRIMARY" as Level });
  const [activeLevel, setActiveLevel]       = useState<Level | "ALL">("ALL");
  const [search, setSearch]                 = useState("");

  const { token } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL;

  // ── API ──────────────────────────────────────────────────────────────────

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${BASE_URL}/subjects`);
      if (!res.ok) throw new Error();
      setSubjects(await res.json());
    } catch {
      notify("Error cargando el catálogo de materias", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

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
        fetchSubjects();
      } else {
        notify(data.message || "No se pudo crear la materia", "error");
      }
    } catch {
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
        fetchSubjects();
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
        method: "DELETE", headers: getHeaders(),
      });
      if (res.ok) {
        notify("Materia eliminada del sistema", "success");
        fetchSubjects();
      } else {
        const data = await res.json();
        notify(data.message || "No se puede eliminar la materia", "error");
      }
    } catch {
      notify("Error de red al intentar eliminar", "error");
    } finally {
      setSubjectToDelete(null);
    }
  };

  // ── Filtrado ─────────────────────────────────────────────────────────────

  const subjectsByLevel = LEVELS.reduce((acc, l) => {
    acc[l] = subjects.filter(
      (s) =>
        s.level === l &&
        s.name.toLowerCase().includes(search.toLowerCase())
    );
    return acc;
  }, {} as Record<Level, Subject[]>);

  const visibleLevels =
    activeLevel === "ALL"
      ? LEVELS.filter((l) => subjectsByLevel[l].length > 0)
      : subjectsByLevel[activeLevel].length > 0
      ? [activeLevel]
      : [];

  const totalVisible = visibleLevels.reduce((n, l) => n + subjectsByLevel[l].length, 0);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-brokenWhite">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-sageGrey/15">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-8">
          <p className="text-xs font-black uppercase tracking-widest text-salviaGreen mb-1">Admin Panel</p>
          <h1 className="text-3xl font-black text-forestDark tracking-tight">Catálogo de Materias</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            {subjects.length} materias registradas en el sistema
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-8 space-y-8">

        {/* ── Formulario Nueva Materia ──────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest text-forestDark/40 mb-4">
            Nueva materia
          </h2>
          <div className="bg-white rounded-2xl border border-sageGrey/20 p-6 shadow-sm">
            <form onSubmit={handleCreate} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-black text-forestDark/50 uppercase tracking-widest mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 bg-brokenWhite border border-sageGrey/20 outline-none focus:ring-2 focus:ring-salviaGreen/40 focus:border-salviaGreen text-forestDark text-sm font-medium transition-all"
                  placeholder="Ej: Análisis Matemático II"
                  required
                />
              </div>
              <div className="w-44">
                <label className="block text-xs font-black text-forestDark/50 uppercase tracking-widest mb-1.5">
                  Nivel
                </label>
                <select
                  value={newSubject.level}
                  onChange={(e) => setNewSubject({ ...newSubject, level: e.target.value as Level })}
                  className="w-full rounded-xl px-4 py-2.5 bg-brokenWhite border border-sageGrey/20 outline-none focus:ring-2 focus:ring-salviaGreen/40 focus:border-salviaGreen text-forestDark text-sm font-medium cursor-pointer transition-all"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{LEVEL_META[l].label}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-forestDark text-white px-6 py-2.5 rounded-xl font-black text-sm hover:bg-forestDark/80 transition-all shadow-sm hover:shadow-md"
              >
                + Añadir
              </button>
            </form>
          </div>
        </section>

        {/* ── Filtros ───────────────────────────────────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-forestDark/40">
              Gestión del catálogo
              {search && (
                <span className="ml-2 text-salviaGreen normal-case tracking-normal">
                  — {totalVisible} resultado{totalVisible !== 1 ? "s" : ""}
                </span>
              )}
            </h2>
            {/* Buscador */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar materia..."
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-sageGrey/20 bg-white outline-none focus:ring-2 focus:ring-salviaGreen/40 focus:border-salviaGreen text-forestDark font-medium transition-all w-52"
              />
            </div>
          </div>

          {/* Tabs de nivel */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveLevel("ALL")}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                activeLevel === "ALL"
                  ? "bg-forestDark text-white shadow-sm"
                  : "bg-white border border-sageGrey/20 text-forestDark/60 hover:border-forestDark/30"
              }`}
            >
              Todos ({subjects.length})
            </button>
            {LEVELS.map((l) => {
              const meta = LEVEL_META[l];
              const count = subjectsByLevel[l].length;
              return (
                <button
                  key={l}
                  onClick={() => setActiveLevel(l)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeLevel === l
                      ? "bg-forestDark text-white shadow-sm"
                      : "bg-white border border-sageGrey/20 text-forestDark/60 hover:border-forestDark/30"
                  }`}
                >
                  {meta.label}
                  <span className={`${activeLevel === l ? "opacity-60" : "opacity-40"}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Catálogo */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-9 h-9 border-4 border-salviaGreen border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Sincronizando catálogo...</p>
            </div>
          ) : visibleLevels.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-forestDark/40 font-bold text-sm">
                {search ? `Sin resultados para "${search}"` : "No hay materias en este nivel"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleLevels.map((level) => {
                const meta = LEVEL_META[level];
                return (
                  <div key={level}>
                    {/* Cabecera nivel */}
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-forestDark/50">
                        {meta.label}
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-forestDark/8 text-forestDark/40 border border-forestDark/10">
                        {subjectsByLevel[level].length}
                      </span>
                    </div>

                    {/* Grid materias */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {subjectsByLevel[level].map((subject) => (
                        <div
                          key={subject.id}
                          className="group flex items-center justify-between bg-forestDark/5 border border-forestDark/10 px-4 py-3 rounded-xl hover:bg-forestDark/10 transition-all"
                        >
                          <span className="font-semibold text-forestDark text-sm truncate pr-2">
                            {subject.name}
                          </span>
                          <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingSubject(subject)}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                              title="Editar"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => setSubjectToDelete(subject)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Eliminar"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Modal Editar ─────────────────────────────────────────────────── */}
      {editingSubject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forestDark/50 backdrop-blur-sm p-4"
          onClick={() => setEditingSubject(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="bg-forestDark px-7 py-5">
              <p className="text-xs font-black uppercase tracking-widest text-salviaGreen mb-0.5">Editar</p>
              <h3 className="text-white font-black text-lg leading-tight truncate">{editingSubject.name}</h3>
            </div>
            <form onSubmit={handleUpdate} className="p-7 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-black text-forestDark/50 uppercase tracking-widest mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 border border-sageGrey/20 bg-brokenWhite outline-none focus:ring-2 focus:ring-salviaGreen/40 focus:border-salviaGreen text-forestDark text-sm font-medium transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-forestDark/50 uppercase tracking-widest mb-1.5">
                  Nivel
                </label>
                <select
                  value={editingSubject.level}
                  onChange={(e) => setEditingSubject({ ...editingSubject, level: e.target.value as Level })}
                  className="w-full rounded-xl px-4 py-2.5 border border-sageGrey/20 bg-brokenWhite outline-none focus:ring-2 focus:ring-salviaGreen/40 focus:border-salviaGreen text-forestDark text-sm font-medium cursor-pointer transition-all"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{LEVEL_META[l].label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="flex-1 py-2.5 rounded-xl bg-brokenWhite text-forestDark/60 font-bold text-sm hover:bg-sageGrey/20 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-salviaGreen text-white font-black text-sm hover:brightness-105 shadow-md shadow-salviaGreen/20 transition-all"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Eliminar ───────────────────────────────────────────────── */}
      {subjectToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forestDark/50 backdrop-blur-sm p-4"
          onClick={() => setSubjectToDelete(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-50 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <IconWarn />
            </div>
            <h3 className="text-xl font-black text-forestDark mb-2">¿Eliminar materia?</h3>
            <p className="text-slate-400 text-sm mb-7 leading-relaxed">
              Estás a punto de eliminar{" "}
              <span className="font-black text-forestDark">"{subjectToDelete.name}"</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSubjectToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-brokenWhite text-forestDark/60 font-bold text-sm hover:bg-sageGrey/20 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all shadow-md shadow-red-100"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;