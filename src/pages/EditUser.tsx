import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";
import { useNavigate } from "react-router-dom";

export default function EditUserForm() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

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
      const res = await fetch("http://localhost:8080/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        navigate("/login");
        return;
      }

      if (!res.ok) throw new Error();
      
      const data = await res.json();
      setFormData({
        name: data.name,
        username: data.username,
        email: data.email,
        password: "", 
        confirmPassword: "", // <-- Inicializamos vacío
        role: data.role,
      });
    } catch (err) {
      notify("Error al cargar datos de usuario", "error");
    } finally {
      setLoadingUser(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDACIÓN DE CONTRASEÑAS ---
    if (formData.password !== formData.confirmPassword) {
      notify("Las contraseñas no coinciden", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8080/edit?email=${formData.email}`, {
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
        const data = await res.json();
        const errorData = (data as unknown) as { message: string };
        notify(errorData.message || "Error al actualizar", "error");
        return;
      }

      notify("Perfil actualizado correctamente", "success");
      navigate("/");
    } catch (err) {
      notify("Error de servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) return (
    <div className="min-h-screen bg-salviaGreen flex items-center justify-center">
      <p className="text-forestDark font-bold animate-pulse">Cargando perfil...</p>
    </div>
  );

  return (
    <div className="bg-salviaGreen min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-lg bg-brokenWhite/80 p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-5 border border-white/20"
      >
        <h1 className="text-2xl font-bold text-forestDark text-center">Mi Perfil</h1>

        <div className="space-y-4">
          {/* Campos Dinámicos */}
          {[
            { label: "Nombre Completo", name: "name", type: "text", val: formData.name, placeholder: "" },
            { label: "Nombre de Usuario", name: "username", type: "text", val: formData.username, placeholder: "" },
            { label: "Nueva Contraseña", name: "password", type: "password", val: formData.password, placeholder: "Dejar en blanco para no cambiar" },
            { label: "Confirmar Contraseña", name: "confirmPassword", type: "password", val: formData.confirmPassword, placeholder: "Repite la contraseña" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-bold text-forestDark/60 uppercase mb-1 ml-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={field.val}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="block w-full rounded-xl py-2.5 px-4 bg-white/50 border border-sageGrey text-forestDark focus:ring-2 focus:ring-salviaGreen focus:outline-none transition-all"
              />
            </div>
          ))}

          {/* Campos Bloqueados */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-forestDark/40 uppercase mb-1 ml-1">Email</label>
              <input
                disabled
                value={formData.email}
                className="block w-full rounded-xl py-2 px-3 bg-sageGrey/30 border border-transparent text-forestDark/50 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-forestDark/40 uppercase mb-1 ml-1">Rol</label>
              <input
                disabled
                value={formData.role}
                className="block w-full rounded-xl py-2 px-3 bg-sageGrey/30 border border-transparent text-forestDark/50 cursor-not-allowed text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-forestDark border-2 border-sageGrey hover:bg-sageGrey/20 transition-all"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-forestDark text-white shadow-lg hover:bg-forestDark/90 disabled:opacity-50 transition-all"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}