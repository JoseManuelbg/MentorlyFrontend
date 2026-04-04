import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Link } from "react-router-dom";
import type { ApiError } from "../models/ApiError";

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

  const isDateSelected = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const limitDate = new Date();
    limitDate.setDate(today.getDate() + (weeks * 7));

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
    // Validaciones locales antes de pegarle a la API
    if (selectedDays.length === 0) return notify("Selecciona al menos un día de la semana", "error");
    if (startTime >= endTime) return notify("La hora de fin debe ser posterior a la de inicio", "error");
    
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

      if (!res.ok) {
        // Captura de AlreadyExistsException o BadRequestException de tu Java
        const errorData: ApiError = await res.json();
        throw new Error(errorData.message || "Error al procesar la disponibilidad");
      }

      notify("Disponibilidad generada y publicada con éxito", "success");
      // Limpiamos selección tras éxito
      setSelectedDays([]);
      
    } catch (error: any) {
      notify(error.message || "Error de conexión con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brokenWhite p-6 lg:p-12 font-sans text-forestDark">
      <header className="max-w-6xl mx-auto mb-10">
        <Link to="/home" className="text-salviaGreen font-bold text-sm no-underline hover:underline transition-all">← Volver al Dashboard</Link>
        <h1 className="text-4xl font-black mt-2 tracking-tight">Gestionar <span className="text-salviaGreen">Horarios</span></h1>
        <p className="text-slate-400 font-medium italic mt-1">Configura tus franjas de mentoría de forma masiva.</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* PANEL DE CONFIGURACIÓN */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-sageGrey/20 flex flex-col justify-between">
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 ml-1 tracking-widest">Días recurrentes</label>
              <div className="flex justify-between gap-2">
                {DAYS.map(day => (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full font-black transition-all text-sm border-2 ${
                      selectedDays.includes(day.id)
                        ? "bg-salviaGreen border-salviaGreen text-white shadow-lg scale-110"
                        : "border-sageGrey/10 text-slate-400 hover:border-salviaGreen/40 bg-brokenWhite/30"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Hora Inicio</label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-brokenWhite border-none rounded-2xl p-4 font-bold text-forestDark focus:ring-2 focus:ring-salviaGreen outline-none shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Hora Fin</label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-brokenWhite border-none rounded-2xl p-4 font-bold text-forestDark focus:ring-2 focus:ring-salviaGreen outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Proyectar disponibilidad</label>
              <input 
                type="range" 
                min="1" max="12" 
                value={weeks}
                onChange={(e) => setWeeks(parseInt(e.target.value))}
                className="w-full h-2 bg-brokenWhite rounded-lg appearance-none cursor-pointer accent-salviaGreen mt-4"
              />
              <div className="flex justify-between text-[10px] font-black text-slate-400 mt-3 px-1 uppercase">
                <span>1 Semana</span>
                <span className="text-salviaGreen text-sm">{weeks} SEMANAS</span>
                <span>3 Meses</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-forestDark text-white py-5 rounded-[2rem] font-black hover:bg-salviaGreen transition-all shadow-xl disabled:opacity-50 active:scale-95 mt-10"
          >
            {loading ? "Generando sesiones..." : "Publicar Disponibilidad"}
          </button>
        </div>

        {/* VISTA PREVIA CALENDARIO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-sageGrey/20">
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-6 ml-1 tracking-widest">Vista previa de franjas</label>
          <div className="calendar-wrapper bg-brokenWhite/50 p-4 rounded-[2rem]">
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
            <h4 className="font-black text-[10px] text-salviaGreen uppercase tracking-[0.2em]">Resumen de publicación</h4>
            <p className="text-sm font-bold mt-4 leading-relaxed text-forestDark/80">
              Vas a crear sesiones los <span className="text-salviaGreen">
                {selectedDays.length > 0 
                  ? selectedDays.sort((a,b) => a-b).map(d => DAYS.find(day => day.id === d)?.full).join(", ") 
                  : "..."}
              </span> de <span className="font-black underline">{startTime}</span> a <span className="font-black underline">{endTime}</span>.
              <br/>
              <span className="inline-block mt-2 px-3 py-1 bg-forestDark text-white text-[10px] rounded-full">
                Total estimado: {selectedDays.length * weeks} huecos
              </span>
            </p>
          </div>
        </div>

      </div>

      <style>{`
        .main-calendar {
          width: 100% !important;
          border: none !important;
          background: transparent !important;
          font-family: inherit !important;
        }
        .react-calendar__tile {
          padding: 1.2em 0.5em !important;
          font-weight: 800 !important;
          color: #2c362b;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        .highlighted-day {
          background: #8da682 !important;
          color: white !important;
          border-radius: 14px !important;
          transform: scale(0.9);
          box-shadow: 0 4px 10px rgba(141, 166, 130, 0.3);
        }
        .react-calendar__navigation button {
          font-weight: 900 !important;
          text-transform: uppercase;
          color: #2c362b;
          font-size: 0.9rem;
        }
        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none !important;
          font-weight: 900;
          color: #cbd5e1;
          font-size: 0.65rem;
          text-transform: uppercase;
        }
        .react-calendar__tile--now {
          background: #f1f5f9 !important;
          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}