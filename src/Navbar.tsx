import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import "font-awesome/css/font-awesome.min.css";

export default function Navbar() {
  const [open, setOpen] = useState(false); // Menú móvil
  const { user, logout } = useAuth();
  const [openU, setOpenU] = useState(false); // Menú usuario (desktop)
  const navigate = useNavigate();

  const handleLogout = () => {
    setOpenU(false);
    setOpen(false);
    logout();
    navigate("/login");
  };

  // Lógica de Roles
  const isAdmin = user?.roles?.some(role => 
    role.toLowerCase() === "admin" || role.toLowerCase() === "role_admin"
  );
  
  const isMentor = user?.roles?.some(role => 
    role.toLowerCase() === "mentor" || role.toLowerCase() === "role_mentor"
  );

  return (
    <nav className="bg-brokenWhite shadow-md border-b border-salviaGreen/30 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 lg:px-12">
        {/* Logo */}
        <Link to="/" className="font-extrabold text-2xl text-slate-700 tracking-wide">
          Mentorly
        </Link>

        {/* --- LINKS DESKTOP --- */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          <Link to="/" className="py-2 px-4 rounded-lg hover:bg-salviaGreen/20 transition-colors duration-300">
            Home
          </Link>

          {!user ? (
            <>
              <Link to="/login" className="py-2 px-4 rounded-lg hover:bg-salviaGreen/20 transition-colors duration-300">
                Login
              </Link>
              <Link to="/signup" className="py-2 px-4 rounded-lg hover:bg-salviaGreen/20 transition-colors duration-300">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative inline-block">
              <button
                onClick={() => setOpenU(!openU)}
                className="rounded-full size-11 bg-slate-800 flex items-center justify-center text-white transition-all shadow-md hover:bg-slate-700 ml-2"
                type="button"
              >
                <i className="fa fa-user" aria-hidden="true"></i>
              </button>
              
              <ul className={`absolute right-0 mt-2 z-10 min-w-[220px] overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl focus:outline-none ${openU ? "block" : "hidden"}`}>
                
                {/* Info Usuario */}
                <li className="px-4 py-2 text-xs text-slate-500 border-b border-slate-100 mb-1">
                  <span className="block truncate">{user.email}</span>
                  <span className="font-bold text-salviaGreen uppercase text-[9px]">{user.roles?.join(', ')}</span>
                </li>

                {/* 1. Solo para Alumnos (No mentores ni admins) */}
                {!isMentor && !isAdmin && (
                  <li>
                    <Link to="/findMentor" onClick={() => setOpenU(false)} className="flex w-full text-sm items-center rounded-md p-3 hover:bg-slate-100 transition-all text-slate-800">
                      <i className="fa fa-search mr-2"></i> Find mentors
                    </Link>
                  </li>
                )}

                {/* 2. Solo para Mentores */}
                {isMentor && (
                  <>
                    <li>
                      <Link to="/my-subjects" onClick={() => setOpenU(false)} className="flex w-full text-sm items-center rounded-md p-3 hover:bg-slate-100 transition-all text-slate-800">
                        <i className="fa fa-book mr-2"></i> My Subjects
                      </Link>
                    </li>
                    {/* NUEVO LINK: DISPONIBILIDAD */}
                    <li>
                      <Link to="/availability" onClick={() => setOpenU(false)} className="flex w-full text-sm items-center rounded-md p-3 hover:bg-slate-100 transition-all text-slate-800">
                        <i className="fa fa-calendar mr-2"></i> Manage Availability
                      </Link>
                    </li>
                  </>
                )}

                {/* 3. Opciones Comunes */}
                <li>
                  <Link to="/edit" onClick={() => setOpenU(false)} className="flex w-full text-sm items-center rounded-md p-3 hover:bg-slate-100 transition-all text-slate-800">
                    <i className="fa fa-cog mr-2"></i> Edit Profile
                  </Link>
                </li>

                <li>
                  <Link to="/seeRequests" onClick={() => setOpenU(false)} className="flex w-full text-sm items-center rounded-md p-3 hover:bg-slate-100 transition-all text-slate-800">
                    <i className="fa fa-envelope mr-2"></i> 
                    {isMentor ? "Manage Requests" : "My Requests"}
                  </Link>
                </li>
      
                {/* --- SECCIÓN ADMIN --- */}
                {isAdmin && (
                  <>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <li className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Panel</li>
                    <li>
                      <Link to="/admin/subjects" onClick={() => setOpenU(false)} className="flex w-full text-sm items-center rounded-md p-3 hover:bg-salviaGreen/10 transition-all text-slate-800">
                        <i className="fa fa-list mr-2 text-salviaGreen"></i> All Subjects
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/listUsers" onClick={() => setOpenU(false)} className="flex w-full text-sm items-center rounded-md p-3 hover:bg-salviaGreen/10 transition-all text-slate-800">
                        <i className="fa fa-users mr-2 text-salviaGreen"></i> Manage Users
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/logs" onClick={() => setOpenU(false)} className="flex w-full text-sm items-center rounded-md p-3 hover:bg-salviaGreen/10 transition-all text-slate-800">
                        <i className="fa fa-history mr-2 text-salviaGreen"></i> Audit Logs
                      </Link>
                    </li>
                  </>
                )}

                <div className="h-px bg-slate-100 my-1"></div>
                
                {/* Logout */}
                <li>
                  <button onClick={handleLogout} className="flex w-full text-sm items-center rounded-md p-3 bg-red-50 hover:bg-red-100 text-red-600 transition-all">
                    <i className="fa fa-sign-out mr-2"></i> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Botón menú móvil */}
        <button onClick={() => setOpen(!open)} className="lg:hidden px-3 py-2 rounded-md border border-salviaGreen text-salviaGreen hover:bg-salviaGreen hover:text-brokenWhite transition-all">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>

      {/* --- MENÚ MÓVIL --- */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col gap-2 px-6 pb-6 bg-white border-t border-slate-100">
          <Link to="/" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg hover:bg-salviaGreen/20">Home</Link>

          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg hover:bg-salviaGreen/20">Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg hover:bg-salviaGreen/20">Sign Up</Link>
            </>
          ) : (
            <>
              <div className="h-px bg-slate-200 my-2"></div>
              
              {/* Opciones Admin Móvil */}
              {isAdmin && (
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-4">Admin Panel</span>
                  <Link to="/admin/subjects" onClick={() => setOpen(false)} className="py-2 px-4 rounded-lg bg-salviaGreen/10 text-slate-700 ml-2">Subjects</Link>
                  <Link to="/admin/listUsers" onClick={() => setOpen(false)} className="py-2 px-4 rounded-lg bg-salviaGreen/10 text-slate-700 ml-2">Users</Link>
                  <Link to="/admin/logs" onClick={() => setOpen(false)} className="py-2 px-4 rounded-lg bg-salviaGreen/10 text-slate-700 ml-2">Audit Logs</Link>
                </div>
              )}

              {/* Opciones Usuario Móvil */}
              <Link to="/edit" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg hover:bg-slate-100">
                <i className="fa fa-cog mr-2"></i> Edit Profile
              </Link>
              
              {isMentor ? (
                <>
                  <Link to="/my-subjects" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg hover:bg-slate-100">
                    <i className="fa fa-book mr-2"></i> My Subjects
                  </Link>
                  {/* NUEVO LINK MÓVIL */}
                  <Link to="/availability" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg hover:bg-slate-100">
                    <i className="fa fa-calendar mr-2"></i> Manage Availability
                  </Link>
                </>
              ) : !isAdmin && (
                <Link to="/findMentor" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg hover:bg-slate-100">
                  <i className="fa fa-search mr-2"></i> Find mentor
                </Link>
              )}

              <Link to="/seeRequests" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg hover:bg-slate-100">
                <i className="fa fa-envelope mr-2"></i>
                {isMentor ? "Manage Requests" : "My Requests"}
              </Link>
              
              <button onClick={handleLogout} className="mt-4 py-3 px-4 rounded-lg bg-red-100 text-red-600 text-left font-bold">
                <i className="fa fa-sign-out mr-2"></i> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}