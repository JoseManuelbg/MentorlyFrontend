import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { notify } from "../reusable/Notification";
import { useAuth } from "../context/AuthContext"; 
import type { User } from "../models/User";

interface Profile {
    username: string;
    name: string;
    email: string;
    subjects: any[];
    availabilities: any[];
    bookedAppointments?: string[]; 
}

export default function SeeProfile() {
    const { id } = useParams();
    const { token, user: rawUser } = useAuth();
    const user = rawUser as User | null;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const BASE_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (id) {
            setLoading(true);
            fetch(`${BASE_URL}/users/seeProfile?id=${id}`)
                .then(response => response.json())
                .then(data => {
                    setProfile(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error al cargar perfil:", error);
                    setLoading(false);
                });
        }
    }, [id]);

    const generateHourSlots = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const slots = [];
        
        let current = new Date(start);
        current.setMinutes(0, 0, 0);

        const limit = new Date(end);

        while (current <= limit) {
            if (current.getDate() === start.getDate()) {
                slots.push(new Date(current));
            }
            current.setHours(current.getHours() + 1);
        }
        return slots;
    };
    
    const handleBooking = async () => {
       if (!selectedSlot || !profile || !token) return;

    const dateObj = new Date(selectedSlot);
    

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    const appointmentTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;

    const bookingData = {
        id_availability: profile.availabilities.find(a => 
            new Date(a.start_datetime).toDateString() === dateObj.toDateString()
        )?.id_availability,
        status: "PENDING",
        appointmentTime: appointmentTime 
    };

        try {
            const response = await fetch(`${BASE_URL}/requests/book`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                notify("¡Reserva solicitada con éxito!", "success");
                setSelectedSlot(null);
                window.location.reload();
            } else {
                const errorData = await response.json();
                notify(errorData.message || "Error al procesar la reserva", "error");
            }
        } catch (error) {
            notify("Error de conexión con el servidor", "error");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-salviaGreen animate-pulse">Loading mentor profile...</div>;
    if (!profile) return <div className="p-10 text-center font-bold text-red-400">Mentor not found.</div>;

    const now = new Date();

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-6 lg:p-12 font-sans">
            <header className="mb-10 max-w-6xl mx-auto">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                    Mentor <span className="text-salviaGreen">Profile</span>
                </h1>
                <p className="text-slate-500 font-medium mt-2">Book a session and start learning.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 max-w-6xl mx-auto">
                
                <div className="md:col-span-2 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="w-20 h-20 bg-salviaGreen/10 rounded-3xl flex items-center justify-center mb-6">
                            <i className="fa fa-user text-3xl text-salviaGreen"></i>
                        </div>
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-widest">Mentor Details</span>
                        <h2 className="text-3xl font-black text-slate-800 mt-4 leading-tight">{profile.name}</h2>
                        <p className="text-salviaGreen font-bold mt-1">@{profile.username}</p>
                        <p className="text-slate-400 mt-4 text-sm font-medium">{profile.email}</p>
                    </div>

                    <div className="mt-10">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Expertise</p>
                        <div className="flex flex-wrap gap-2">
                            {profile.subjects?.map((subject, index) => (
                                <span key={index} className="bg-slate-800 text-white px-4 py-2 rounded-2xl text-xs font-bold shadow-sm">
                                    {subject.name.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-4 bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-500 text-[10px] font-bold rounded-full uppercase tracking-widest">Availability</span>
                        <h3 className="text-2xl font-black text-slate-800 mt-4 mb-8">Select a time slot</h3>
                        
                        <div className="space-y-8 h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                            {profile.availabilities?.filter(ava => new Date(ava.start_datetime) >= new Date(now.setHours(0,0,0,0))).map((ava, index) => (
                                <div key={index} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                    <h4 className="text-slate-700 font-bold mb-4 flex items-center gap-2">
                                        <i className="fa fa-calendar-alt text-salviaGreen"></i>
                                        {new Date(ava.start_datetime).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                        {generateHourSlots(ava.start_datetime, ava.end_datetime).map((slotDate) => {
                                            const isoString = slotDate.toISOString();
                                            const displayHour = slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                            const isSelected = selectedSlot === isoString;
                                            
                                            const isPast = slotDate < new Date();
                                            const isAlreadyBooked = profile.bookedAppointments?.some(b => new Date(b).getTime() === slotDate.getTime());
                                            const isDisabled = isPast || isAlreadyBooked;

                                            return (
                                                <button
                                                    key={isoString}
                                                    disabled={isDisabled}
                                                    onClick={() => setSelectedSlot(isoString)}
                                                    className={`py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
                                                        isDisabled
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                                        : isSelected 
                                                        ? 'bg-salviaGreen text-white shadow-lg shadow-salviaGreen/30 transform scale-105' 
                                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-salviaGreen hover:text-salviaGreen'
                                                    }`}
                                                >
                                                    {displayHour}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 flex items-center justify-between bg-slate-900 p-6 rounded-[2.5rem]">
                        <div className="text-white px-4">
                            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Selection</p>
                            <p className="font-bold">
                                {selectedSlot 
                                    ? `Class at ${new Date(selectedSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                                    : 'No slot selected'}
                            </p>
                        </div>
                        <button 
                            disabled={!selectedSlot}
                            onClick={handleBooking}
                            className={`px-8 py-4 rounded-2xl font-black text-sm transition-all ${
                                selectedSlot 
                                ? 'bg-salviaGreen text-white hover:brightness-110 shadow-lg shadow-salviaGreen/20 active:scale-95' 
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                        >
                            CONFIRM BOOKING
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}