import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";
import { useNavigate } from "react-router-dom";
import type { ApiError } from '../models/ApiError'; // Importante para la consistencia

export default function EditUserForm() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    role: "",
  });

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const errorData: ApiError = await res.json();
        throw new Error(errorData.message || "Error al obtener perfil");
      }
      
      const data = await res.json();
      setFormData({
        name: data.name,
        username: data.username,
        email: data.email,
        password: "", 
        confirmPassword: "",
        role: data.role,
      });
    } catch (err: any) {
      notify(err.message || "Error al cargar datos", "error");
    } finally {
      setLoadingUser(false);
    }
  }, [token, logout, navigate, BASE_URL]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación local: Coincidencia de contraseñas
    if (formData.password && formData.password !== formData.confirmPassword) {
      return notify("Las contraseñas no coinciden", "error");
    }

    // Validación local: Longitud mínima si decide cambiarla
    if (formData.password && formData.password.length < 6) {
      return notify("La nueva contraseña debe tener al menos 6 caracteres", "error");
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/edit?email=${formData.email}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password || null 
        }),
      });

      if (!res.ok) {
        // Capturamos el error estructurado de tu Backend (BadRequestException, etc)
        const errorData: ApiError = await res.json();
        throw new Error(errorData.message || "Error al actualizar el perfil");
      }

      notify("Perfil actualizado correctamente", "success");
      navigate("/");
    } catch (err: any) {
      // Notificamos el mensaje exacto que viene del Service de Java
      notify(err.message || "Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) return (
    <div className="min-h-screen bg-salviaGreen flex items-center justify-center">
      <p className="text-forestDark font-black animate-pulse">Cargando perfil...</p>
    </div>
  );

  return (
    <div className="bg-salviaGreen min-h-screen flex items-center justify-center p-4 font-sans text-forestDark">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-md bg-brokenWhite/90 p-10 rounded-[3rem] shadow-2xl w-full max-w-md flex flex-col gap-6 border border-white/40"
      >
        <header className="text-center">
          <h1 className="text-3xl font-black">Mi Perfil</h1>
          <p className="text-xs font-bold text-forestDark/50 uppercase tracking-widest mt-1">Configuración de cuenta</p>
        </header>

        <div className="space-y-4">
          {[
            { label: "Nombre Completo", name: "name", type: "text", val: formData.name, placeholder: "" },
            { label: "Nombre de Usuario", name: "username", type: "text", val: formData.username, placeholder: "" },
            { label: "Nueva Contraseña", name: "password", type: "password", val: formData.password, placeholder: "Dejar en blanco para mantener" },
            { label: "Confirmar Contraseña", name: "confirmPassword", type: "password", val: formData.confirmPassword, placeholder: "Repite la contraseña" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-[10px] font-black text-forestDark/40 uppercase mb-1.5 ml-2">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={field.val}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="block w-full rounded-2xl py-3 px-5 bg-white border border-sageGrey/20 text-forestDark focus:ring-2 focus:ring-salviaGreen focus:outline-none transition-all placeholder:text-slate-300 placeholder:text-xs"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[10px] font-black text-forestDark/40 uppercase mb-1.5 ml-2">Email</label>
              <input
                disabled
                value={formData.email}
                className="block w-full rounded-2xl py-3 px-4 bg-sageGrey/10 border border-transparent text-forestDark/40 cursor-not-allowed text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-forestDark/40 uppercase mb-1.5 ml-2">Rol</label>
              <input
                disabled
                value={formData.role}
                className="block w-full rounded-2xl py-3 px-4 bg-sageGrey/10 border border-transparent text-forestDark/40 cursor-not-allowed text-xs font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 py-4 px-4 rounded-2xl font-black text-forestDark bg-white border border-sageGrey/20 hover:bg-sageGrey/10 transition-all active:scale-95"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-4 rounded-2xl font-black bg-forestDark text-white shadow-xl hover:bg-forestDark/90 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}