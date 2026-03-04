import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { User } from "../models/User";
import { notify } from "../reusable/Notification";
import axios from "axios";

export default function ListUsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/admin/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data: User[] = await res.json();
      setUsers(data);
    } catch (error) {
      notify("Error cargando la lista de usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

 const handleCancel = async (id: number) => {
  const url = `http://localhost:8080/admin/users/toggle-status?id=${id}`;

  try {
    const response = await axios.patch(url, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200 || response.status === 204) {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === id) {

            const nuevoEstado = user.active === 1 ? 0 : 1;
            
            return { 
              ...user, 
              active: nuevoEstado 
            } as User; 
          }
          return user;
        })
      );
      notify("Estado actualizado", "success");
    }
  } catch (error) {
    console.error(error);
    notify("Error al actualizar", "error");
  }
};

const handleRoleChange = async (id: number, newRole: string) => {
  const url = `http://localhost:8080/admin/users/update-role?id=${id}&newRole=${newRole}`;

  try {
    const response = await axios.patch(url, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 200) {
      setUsers((prevUsers) =>
        prevUsers.map((user) => 
          user.id === id ? { ...user, roles: [newRole] } : user
        )
      );
      notify(`Rol actualizado a ${newRole}`, "success");
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || "Error al cambiar el rol";
    notify(errorMsg, "error");
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Directorio de Usuarios</h2>
          <p className="text-sm text-gray-500">Gestiona accesos y estados de cuenta</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar usuario..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Usuario</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase">Roles</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.active ? "bg-green-500" : "bg-red-500"}`}></span>
                    {user.active ? "Activo" : "Inactivo"}
                  </span>
                </td>

                
                <td className="px-6 py-4">
  <select
  value={(() => {
    const roleRaw = user.roles?.[0] || "";
    return (typeof roleRaw === 'string' ? roleRaw : roleRaw.name)
      .replace("ROLE_", "")
      .toLowerCase();
  })()}
  onChange={(e) => handleRoleChange(user.id, e.target.value)}
  className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg block w-full p-1"
>
  <option>Select Role</option>
  <option value="student">Student</option>
  <option value="mentor">Mentor</option>
  <option value="admin">Admin</option>
</select>
</td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleCancel(user.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.active ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                      }`}
                      title={user.active ? "Desactivar" : "Activar"}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 11-12.728 0m12.728 0L12 12m0 0l4.243 4.243" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}