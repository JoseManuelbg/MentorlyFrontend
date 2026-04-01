import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { User } from "../models/User";
import { notify } from "../reusable/Notification";
import axios from "axios";
import type { ApiError } from '../models/ApiError';

export default function ListUsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData: ApiError = await res.json();
        throw new Error(errorData.message || "Error al cargar usuarios");
      }

      const data: User[] = await res.json();
      console.log("Usuarios cargados:", data); // Mira la consola para ver si es 'id' o 'id_user'
      setUsers(data);
    } catch (error: any) {
      notify(error.message || "Error cargando la lista de usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCancel = async (id: number) => {
    const url = `${BASE_URL}/admin/users/toggle-status?id=${id}`;
    try {
      const response = await axios.patch(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { newState, message } = response.data;

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          // IMPORTANTE: Si en tu modelo es id_user, cambia user.id por user.id_user
          (user.id === id || (user as any).id_user === id) 
            ? { ...user, active: newState } 
            : user
        )
      );
      notify(message, "success");
    } catch (error: any) {
      const apiError = error.response?.data as ApiError;
      notify(apiError?.message || "Error al actualizar", "error");
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
  const url = `${BASE_URL}/admin/users/update-role?id=${id}&newRole=${newRole}`;

  try {
    const response = await axios.patch(url, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Tu backend devuelve: { newRole: "admin", message: "..." }
    const { newRole: updatedRole, message } = response.data;

    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        // IMPORTANTE: Guardamos 'updatedRole' directamente en el campo 'role'
        u.id === id ? { ...u, role: updatedRole } : u
      )
    );

    notify(message || `Rol actualizado`, "success");
  } catch (error: any) {
    const apiError = error.response?.data as ApiError;
    notify(apiError?.message || "Error al cambiar el rol", "error");
  }
};

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ... Header igual ... */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Directorio de Usuarios</h2>
        </div>
        <input
          type="text"
          placeholder="Buscar..."
          className="pl-10 pr-4 py-2 border rounded-lg"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Roles</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => {
              // Sacamos el ID real (sea id o id_user)
              const userId = user.id || (user as any).id_user;
              
              return (
                <tr key={userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.active ? 'bg-green-100' : 'bg-red-100'}`}>
                      {user.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
  <select
    value={(() => {
      // 1. Leemos el campo 'role' (singular) que vimos en tu consola
      const r = user.role; 

      // 2. Si es un array, pillamos el primero. Si es string, lo usamos.
      const roleRaw = Array.isArray(r) ? r[0] : r;
      
      // 3. Si es un objeto {name: 'admin'}, extraemos name. Si no, string directo.
      const roleName = (roleRaw && typeof roleRaw === 'object') ? roleRaw.name : roleRaw;

      // 4. Limpiamos y convertimos a minúsculas para que coincida con <option value="admin">
      return String(roleName || "").toLowerCase().trim();
    })()}
    onChange={(e) => handleRoleChange(user.id, e.target.value)}
    className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg block w-full p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
  >
    <option value="student">Student</option>
    <option value="mentor">Mentor</option>
    <option value="admin">Admin</option>
  </select>
</td>

                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleCancel(userId)} className="text-gray-400 hover:text-red-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M18.364 5.636a9 9 0 11-12.728 0m12.728 0L12 12m0 0l4.243 4.243" strokeWidth="2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}