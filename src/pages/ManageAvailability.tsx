import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Link } from "react-router-dom";

const DAYS = [
  { id: 1, label: "L", full: "Lunes" },
  { id: 2, label: "M", full: "Martes" },
  { id: 3, label: "X", full: "Miércoles" },
  { id: 4, label: "J", full: "Jueves" },
  { id: 5, label: "V", full: "Viernes" },
  { id: 6, label: "S", full: "Sábado" },
  { id: 7, label: "D", full: "Domingo" },
];

export default function ManageAvailability() {
  const { token } = useAuth();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [weeks, setWeeks] = useState(4);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;


  // Función para iluminar el calendario
  const isDateSelected = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fecha límite según semanas seleccionadas
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + (weeks * 7));

    // Ajuste de día de la semana (JS: 0=Dom, 1=Lun... -> Tu DAYS: 1=Lun, 7=Dom)
    let dayOfWeek = date.getDay(); 
    if (dayOfWeek === 0) dayOfWeek = 7; 

    return (
      date >= today && 
      date <= limitDate && 
      selectedDays.includes(dayOfWeek)
    );
  };

  const toggleDay = (id: number) => {
    setSelectedDays(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0) return notify("Selecciona al menos un día", "error");
    
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/availabilities/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          daysOfWeek: selectedDays,
          startTime,
          endTime,
          durationWeeks: weeks
        })
      });

      if (res.ok) {
        notify("Disponibilidad generada con éxito", "success");
      } else {
        notify("Error al procesar la solicitud", "error");
      }
    } catch (error) {
      notify("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brokenWhite p-6 lg:p-12 font-sans text-forestDark">
      <header className="max-w-6xl mx-auto mb-10">
        <Link to="/home" className="text-salviaGreen font-bold text-sm no-underline hover:underline">← Volver</Link>
        <h1 className="text-4xl font-black mt-2 tracking-tight text-forestDark">Gestionar <span className="text-salviaGreen">Horarios</span></h1>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* PANEL DE CONFIGURACIÓN */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-sageGrey/20">
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 ml-1">Días recurrentes</label>
              <div className="flex justify-between gap-2">
                {DAYS.map(day => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full font-bold transition-all text-sm border-2 ${
                      selectedDays.includes(day.id)
                        ? "bg-salviaGreen border-salviaGreen text-white shadow-lg scale-110"
                        : "border-sageGrey/10 text-slate-400 hover:border-salviaGreen/40"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Hora Inicio</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-brokenWhite border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-salviaGreen outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Hora Fin</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-brokenWhite border-none rounded-2xl p-4 font-bold focus:ring-2 focus:ring-salviaGreen outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Proyectar por (semanas)</label>
              <input 
                type="range" 
                min="1" max="12" 
                value={weeks}
                onChange={(e) => setWeeks(parseInt(e.target.value))}
                className="w-full h-2 bg-brokenWhite rounded-lg appearance-none cursor-pointer accent-salviaGreen"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
                <span>1 SEMANA</span>
                <span className="text-salviaGreen text-sm">{weeks} SEMANAS</span>
                <span>3 MESES</span>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-forestDark text-white py-5 rounded-[2rem] font-black hover:bg-salviaGreen transition-all shadow-xl disabled:opacity-50 active:scale-95"
            >
              {loading ? "Generando huecos..." : "Publicar Disponibilidad"}
            </button>
          </div>
        </div>

        {/* VISTA PREVIA CALENDARIO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-sageGrey/20">
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-6 ml-1">Vista previa en calendario</label>
          <div className="calendar-wrapper">
             <Calendar 
                className="main-calendar"
                tileClassName={({ date, view }) => {
                  if (view === 'month' && isDateSelected(date)) {
                    return 'highlighted-day';
                  }
                  return null;
                }}
             />
          </div>
          
          <div className="mt-8 p-6 bg-salviaGreen/5 rounded-[2.5rem] border border-salviaGreen/10">
            <h4 className="font-black text-xs text-salviaGreen uppercase tracking-widest">Resumen Automático</h4>
            <p className="text-sm font-semibold mt-3 leading-relaxed">
              Vas a generar sesiones los <span className="text-salviaGreen">
                {selectedDays.length > 0 
                  ? selectedDays.sort().map(d => DAYS.find(day => day.id === d)?.full).join(", ") 
                  : "..."}
              </span> de <span className="underline">{startTime}</span> a <span className="underline">{endTime}</span>.
              Esto creará aproximadamente <span className="font-black text-forestDark">{selectedDays.length * weeks}</span> espacios de clase.
            </p>
          </div>
        </div>

      </div>

      {/* Estilos in-line para el calendario */}
      <style>{`
        .main-calendar {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
        }
        .react-calendar__tile {
          padding: 1.2em 0.5em !important;
          font-weight: 700 !important;
          color: #2c362b;
        }
        .highlighted-day {
          background: #8da682 !important;
          color: white !important;
          border-radius: 12px !important;
          position: relative;
        }
        .react-calendar__navigation button {
          font-weight: 900 !important;
          text-transform: uppercase;
          color: #2c362b;
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none !important;
          font-weight: 800;
          color: #cbd5e1;
          font-size: 0.7rem;
        }
      `}</style>
    </div>
  );
}