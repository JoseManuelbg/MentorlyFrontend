import React, { useEffect, useState } from "react";
import type Subject from "../models/Subject";
import type { Level } from "../models/Subject";
import { notify } from "../reusable/Notification";
import { useAuth } from "../context/AuthContext";

const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  // Estados para modales y formularios
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState({ name: "", level: "PRIMARY" as Level });
  const BASE_URL = import.meta.env.VITE_API_URL;

  // --- PETICIONES API ---

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${BASE_URL}/subjects`);
      if (!res.ok) throw new Error();
      const data: Subject[] = await res.json();
      setSubjects(data);
    } catch (error) {
      notify("Error cargando el catálogo de materias", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/subjects/admin`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(newSubject),
      });

      const data = await res.json();

      if (res.ok) {
        notify("Materia creada con éxito", "success");
        setNewSubject({ name: "", level: "PRIMARY" });
        fetchSubjects();
      } else {
        // Aquí capturamos el mensaje de tu AlreadyExistsException o BadRequest
        notify(data.message || "No se pudo crear la materia", "error");
      }
    } catch (error) {
      notify("Error de conexión con el servidor", "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    try {
      const res = await fetch(`${BASE_URL}/subjects/admin/${editingSubject.id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(editingSubject),
      });

      const data = await res.json();

      if (res.ok) {
        notify("Materia actualizada correctamente", "success");
        setEditingSubject(null);
        fetchSubjects();
      } else {
        notify(data.message || "Error al actualizar", "error");
      }
    } catch (error) {
      notify("Error al procesar la actualización", "error");
    }
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;
    try {
      const res = await fetch(`${BASE_URL}/subjects/admin/${subjectToDelete.id}`, { 
        method: "DELETE",
        headers: getHeaders()
      });

      if (res.ok) {
        notify("Materia eliminada del sistema", "success");
        fetchSubjects();
      } else {
        // Captura el error de integridad referencial de tu GlobalControllerError
        const data = await res.json();
        notify(data.message || "No se puede eliminar la materia", "error");
      }
    } catch (error) {
      notify("Error de red al intentar eliminar", "error");
    } finally {
      setSubjectToDelete(null);
    }
  };

  // --- LÓGICA DE RENDERIZADO ---

  const levels: Level[] = ["PRIMARY", "SECONDARY", "HIGH_SCHOOL", "VOCATIONAL", "UNIVERSITY"];
  const subjectsByLevel: Record<Level, Subject[]> = {
    PRIMARY: [], SECONDARY: [], HIGH_SCHOOL: [], VOCATIONAL: [], UNIVERSITY: [],
  };
  
  subjects.forEach((s) => {
    if (subjectsByLevel[s.level]) subjectsByLevel[s.level].push(s);
  });

  return (
    <div className="bg-salviaGreen min-h-screen py-12 px-6 flex flex-col items-center relative">
      
      {/* FORMULARIO DE CREACIÓN */}
      <div className="w-full max-w-4xl backdrop-blur-lg bg-brokenWhite/70 rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Materia</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={newSubject.name}
              onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
              className="w-full rounded-xl px-4 py-2 bg-white/60 outline-none focus:ring-2 focus:ring-salviaGreen border border-transparent"
              placeholder="Ej: Análisis Matemático II"
              required
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nivel</label>
            <select 
              value={newSubject.level}
              onChange={(e) => setNewSubject({...newSubject, level: e.target.value as Level})}
              className="w-full rounded-xl px-4 py-2 bg-white/60 outline-none cursor-pointer focus:ring-2 focus:ring-salviaGreen"
            >
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button className="bg-slate-800 text-white px-8 py-2 rounded-xl hover:bg-slate-700 transition-all font-bold shadow-md">
            Añadir
          </button>
        </form>
      </div>

      {/* GESTIÓN DE CATÁLOGO */}
      <div className="w-full max-w-4xl backdrop-blur-lg bg-brokenWhite/70 rounded-2xl shadow-lg p-8 mb-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center uppercase tracking-widest">Catálogo de Materias</h2>
        
        {loading ? (
          <div className="flex flex-col items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-salviaGreen mb-4"></div>
            <p className="text-gray-600">Sincronizando con el servidor...</p>
          </div>
        ) : (
          (Object.keys(subjectsByLevel) as Level[]).map((level) => (
            subjectsByLevel[level].length > 0 && (
              <div key={level} className="mb-10">
                <h3 className="text-lg font-bold text-salviaGreen mb-4 border-b-2 border-salviaGreen/20 pb-1 uppercase tracking-wider">{level}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectsByLevel[level].map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between bg-white/60 p-4 rounded-xl border border-white/40 hover:bg-white/90 transition-all shadow-sm">
                      <span className="font-semibold text-gray-800">{subject.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingSubject(subject)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => setSubjectToDelete(subject)} className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))
        )}
      </div>

      {/* MODAL EDITAR */}
      {editingSubject && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-brokenWhite w-full max-w-md rounded-2xl shadow-2xl p-8 transform animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Editar Materia</h3>
            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre Actualizado</label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                  className="w-full rounded-xl px-4 py-3 border border-slate-200 outline-none focus:ring-2 focus:ring-salviaGreen bg-white shadow-inner"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nivel</label>
                <select 
                  value={editingSubject.level}
                  onChange={(e) => setEditingSubject({...editingSubject, level: e.target.value as Level})}
                  className="w-full rounded-xl px-4 py-3 border border-slate-200 outline-none focus:ring-2 focus:ring-salviaGreen bg-white cursor-pointer"
                >
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setEditingSubject(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-gray-600 font-bold hover:bg-slate-200">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-salviaGreen text-white font-bold hover:brightness-105 shadow-lg shadow-salviaGreen/20">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center transform animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">¿Confirmar borrado?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Estás a punto de eliminar <span className="font-bold text-gray-800">"{subjectToDelete.name}"</span>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSubjectToDelete(null)} className="flex-1 py-3 rounded-xl bg-slate-50 text-gray-500 font-bold hover:bg-slate-100">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;