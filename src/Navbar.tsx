import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setAvatarOpen(false);
    setMobileOpen(false);
    logout();
    navigate("/login");
  };

  const isAdmin = user?.roles?.some(
    (r) => r.toLowerCase() === "admin" || r.toLowerCase() === "role_admin"
  );
  const isMentor = user?.roles?.some(
    (r) => r.toLowerCase() === "mentor" || r.toLowerCase() === "role_mentor"
  );

  const isActive = (path: string) => location.pathname === path;

  const linkBase =
    "relative py-2 px-3 text-sm font-semibold transition-colors duration-200 rounded-lg";
  const activeLink =
    "text-salviaGreen bg-salviaGreen/10";
  const inactiveLink =
    "text-forestDark/70 hover:text-forestDark hover:bg-forestDark/5";

  // Links según rol
  const navLinks = () => {
    if (!user) return null;

    return (
      <>
        <Link
          to="/"
          className={`${linkBase} ${isActive("/") ? activeLink : inactiveLink}`}
        >
          Inicio
        </Link>

        {/* Alumno */}
        {!isMentor && !isAdmin && (
          <Link
            to="/findMentor"
            className={`${linkBase} ${isActive("/findMentor") ? activeLink : inactiveLink}`}
          >
            Buscar Mentor
          </Link>
        )}

        {/* Mentor */}
        {isMentor && (
          <>
            <Link
              to="/my-subjects"
              className={`${linkBase} ${isActive("/my-subjects") ? activeLink : inactiveLink}`}
            >
              Mis Materias
            </Link>
            <Link
              to="/availability"
              className={`${linkBase} ${isActive("/availability") ? activeLink : inactiveLink}`}
            >
              Disponibilidad
            </Link>
          </>
        )}

        {/* Común autenticado — no admin */}
        {!isAdmin && (
          <Link
            to="/seeRequests"
            className={`${linkBase} ${isActive("/seeRequests") ? activeLink : inactiveLink}`}
          >
            {isMentor ? "Solicitudes" : "Mis Solicitudes"}
          </Link>
        )}

        {/* Admin */}
        {isAdmin && (
          <>
            <Link
              to="/admin/subjects"
              className={`${linkBase} ${isActive("/admin/subjects") ? activeLink : inactiveLink}`}
            >
              Materias
            </Link>
            <Link
              to="/admin/listUsers"
              className={`${linkBase} ${isActive("/admin/listUsers") ? activeLink : inactiveLink}`}
            >
              Usuarios
            </Link>
            <Link
              to="/admin/requests"
              className={`${linkBase} ${isActive("/admin/requests") ? activeLink : inactiveLink}`}
            >
              Validaciones
            </Link>
            <Link
              to="/admin/logs"
              className={`${linkBase} ${isActive("/admin/logs") ? activeLink : inactiveLink}`}
            >
              Auditoría
            </Link>
          </>
        )}
      </>
    );
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-sageGrey/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">

        {/* Logo */}
        <Link
          to="/"
          className="font-black text-xl tracking-tight text-forestDark flex items-center gap-2 shrink-0"
        >
          <span className="w-7 h-7 rounded-lg bg-salviaGreen flex items-center justify-center text-white text-xs font-black">M</span>
          Mentorly
        </Link>

        {/* Links Desktop */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {navLinks()}
        </div>

        {/* Derecha: Sin sesión o Avatar */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {!user ? (
            <>
              <Link
                to="/login"
                className="py-2 px-4 text-sm font-semibold text-forestDark/70 hover:text-forestDark rounded-lg hover:bg-forestDark/5 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/signup"
                className="py-2 px-5 text-sm font-bold bg-salviaGreen text-white rounded-full hover:bg-salviaGreen/90 transition-colors shadow-sm"
              >
                Registrarse
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="w-10 h-10 rounded-full bg-forestDark text-white flex items-center justify-center font-black text-sm hover:bg-forestDark/80 transition-all shadow-md ring-2 ring-white ring-offset-1 ring-offset-salviaGreen/20"
                title={user.email}
              >
                {user.sub?.charAt(0).toUpperCase() ?? "U"}
              </button>

              {/* Dropdown Avatar */}
              {avatarOpen && (
                <>
                  {/* Overlay para cerrar */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAvatarOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-sageGrey/20 shadow-xl z-20 overflow-hidden">
                    {/* Header usuario */}
                    <div className="px-4 py-3 bg-forestDark/3 border-b border-sageGrey/10">
                      <p className="text-xs font-black text-forestDark truncate">{user.sub}</p>
                      <p className="text-[10px] text-salviaGreen font-bold uppercase tracking-widest mt-0.5">
                        {user.roles?.map((r) => r.replace("ROLE_", "")).join(" · ")}
                      </p>
                    </div>

                    <div className="p-1.5 flex flex-col gap-0.5">
                      <Link
                        to="/edit"
                        onClick={() => setAvatarOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-forestDark rounded-xl hover:bg-slate-50 transition-colors font-medium"
                      >
                        <span className="text-base">⚙️</span> Editar perfil
                      </Link>

                      <div className="h-px bg-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium w-full text-left"
                      >
                        <span className="text-base">🚪</span> Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Hamburguesa móvil */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-sageGrey/30 hover:bg-salviaGreen/10 transition-colors"
          aria-label="Menú"
        >
          <span className={`block w-5 h-0.5 bg-forestDark transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-forestDark transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-forestDark transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-2 bg-white border-t border-slate-100 flex flex-col gap-1">
          {!user ? (
            <>
              <Link to="/" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl hover:bg-salviaGreen/10 font-semibold text-forestDark">Inicio</Link>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl hover:bg-salviaGreen/10 font-semibold text-forestDark">Iniciar sesión</Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl bg-salviaGreen text-white font-bold text-center mt-2">Registrarse</Link>
            </>
          ) : (
            <>
              {/* Info usuario móvil */}
              <div className="flex items-center gap-3 py-3 px-4 mb-1 bg-forestDark/3 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-forestDark text-white flex items-center justify-center font-black text-sm shrink-0">
                  {user.sub?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-forestDark truncate">{user.sub}</p>
                  <p className="text-[10px] text-salviaGreen font-bold uppercase">{user.roles?.map((r) => r.replace("ROLE_", "")).join(" · ")}</p>
                </div>
              </div>

              <Link to="/" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl hover:bg-slate-50 font-semibold text-forestDark">🏠 Inicio</Link>

              {!isMentor && !isAdmin && (
                <Link to="/findMentor" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl hover:bg-slate-50 font-semibold text-forestDark">🔍 Buscar Mentor</Link>
              )}
              {isMentor && (
                <>
                  <Link to="/my-subjects" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl hover:bg-slate-50 font-semibold text-forestDark">📚 Mis Materias</Link>
                  <Link to="/availability" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl hover:bg-slate-50 font-semibold text-forestDark">📅 Disponibilidad</Link>
                </>
              )}
              {!isAdmin && (
                <Link to="/seeRequests" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl hover:bg-slate-50 font-semibold text-forestDark">✉️ {isMentor ? "Solicitudes" : "Mis Solicitudes"}</Link>
              )}
              <Link to="/edit" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl hover:bg-slate-50 font-semibold text-forestDark">⚙️ Editar Perfil</Link>

              {isAdmin && (
                <>
                  <div className="h-px bg-slate-100 my-2" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-1">Admin</p>
                  <Link to="/admin/subjects" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl bg-salviaGreen/8 hover:bg-salviaGreen/15 font-semibold text-forestDark ml-2">📋 Materias</Link>
                  <Link to="/admin/listUsers" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl bg-salviaGreen/8 hover:bg-salviaGreen/15 font-semibold text-forestDark ml-2">👥 Usuarios</Link>
                  <Link to="/admin/requests" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl bg-salviaGreen/8 hover:bg-salviaGreen/15 font-semibold text-forestDark ml-2">✅ Validaciones</Link>
                  <Link to="/admin/logs" onClick={() => setMobileOpen(false)} className="py-2.5 px-4 rounded-xl bg-salviaGreen/8 hover:bg-salviaGreen/15 font-semibold text-forestDark ml-2">📜 Auditoría</Link>
                </>
              )}

              <div className="h-px bg-slate-100 my-2" />
              <button onClick={handleLogout} className="py-3 px-4 rounded-xl bg-red-50 text-red-600 font-bold text-left hover:bg-red-100 transition-colors">
                🚪 Cerrar sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}