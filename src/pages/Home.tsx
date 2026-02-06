import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext"; 
import { Link } from "react-router-dom";

interface UserPayload {
  sub: string;
  email: string;
  roles: string[];
}

export default function Home() {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const { token } = useAuth();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const pureToken = storedToken.startsWith("Bearer ") ? storedToken.slice(7) : storedToken;
      const decoded: UserPayload = jwtDecode(pureToken);
      setUser(decoded);

      // Check if roles array includes "admin"
      if (decoded.roles.some(role => role.toLowerCase() === "admin")) {
        fetchStats(pureToken);
      }
    }
  }, []);

  const fetchStats = async (t: string) => {
    try {
      const res = await fetch("http://localhost:8080/users/stats/getActive", {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveUsers(data.count);
      }
    } catch (error) {
      console.error("Error loading stats");
    }
  };

  if (!user) return <div className="p-10 text-center font-bold text-salviaGreen">Loading session...</div>;

  const isAdmin = user.roles.some(role => role.toLowerCase() === "admin");

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-6 lg:p-12 font-sans">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
          Welcome back, <span className="text-salviaGreen">{user.email.split('@')[0]}</span> 👋
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          {isAdmin ? "Administration Control Center" : "Explore your learning journey today."}
        </p>
      </header>

      {/* --- BENTO STYLE GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        
        {/* Profile Card (Large) */}
        <div className="md:col-span-2 md:row-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span className="px-4 py-1.5 bg-salviaGreen/10 text-salviaGreen text-[10px] font-bold rounded-full uppercase tracking-widest">Account Details</span>
            <h2 className="text-3xl font-black text-slate-800 mt-6 break-words leading-tight">{user.email}</h2>
            <p className="text-slate-400 mt-2 font-medium">Unique ID: {user.sub}</p>
          </div>
          <div className="mt-10">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-3">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {user.roles.map(role => (
                <span key={role} className="bg-slate-800 text-white px-4 py-1.5 rounded-2xl text-xs font-bold shadow-sm">
                  {role.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Card: Admin Stats OR User Inspiration */}
        {isAdmin ? (
          <div className="md:col-span-2 bg-blue-600 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-100 flex flex-col justify-center relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Live Metrics</p>
              <h3 className="text-7xl font-black tracking-tighter">{activeUsers}</h3>
              <p className="text-blue-100 mt-2 font-bold text-lg">Active Users</p>
            </div>
            {/* Animated background shape */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
          </div>
        ) : (
          <div className="md:col-span-2 bg-salviaGreen p-10 rounded-[3rem] text-white shadow-xl shadow-salviaGreen/20 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-2">Daily Quote</p>
              <h3 className="text-2xl font-bold leading-snug italic">"The beautiful thing about learning is that nobody can take it away from you."</h3>
              <p className="mt-4 text-white/90 font-medium">— B.B. King</p>
            </div>
            <div className="mt-8 relative z-10">
               <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full text-sm font-bold backdrop-blur-md transition-all">
                 View Courses
               </button>
            </div>
          </div>
        )}

        {/* Subjects Card */}
        <Link 
          to={isAdmin ? "/admin/subjects" : "/subjects"} 
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-slate-800 transition-all duration-500 shadow-sm no-underline"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-4 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <i className={`fa ${isAdmin ? 'fa-plus' : 'fa-book'} text-slate-600 group-hover:text-white`}></i>
          </div>
          <p className="text-slate-800 group-hover:text-white font-black text-xl m-0">Subjects</p>
          <p className="text-slate-400 group-hover:text-white/60 text-xs m-0 mt-1">
            {isAdmin ? "Manage catalog" : "Browse materials"}
          </p>
        </Link>

        {/* Settings/Profile Card */}
        <Link 
          to="/edit" 
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-salviaGreen transition-all duration-500 shadow-sm no-underline"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-4 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <i className="fa fa-user-circle text-slate-600 group-hover:text-white"></i>
          </div>
          <p className="text-slate-800 group-hover:text-white font-black text-xl m-0">Settings</p>
          <p className="text-slate-400 group-hover:text-white/60 text-xs m-0 mt-1">Account preferences</p>
        </Link>

      </div>
    </div>
  );
}