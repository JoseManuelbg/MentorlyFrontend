import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { notify } from "../reusable/Notification";
import { useNavigate } from "react-router-dom";

export default function EditUserForm() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true); // para esperar me()
  const { logout } = useAuth();
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8080/me", {
        headers: { Authorization: `Bearer ${token.startsWith("Bearer ") ? token.slice(7) : token}` }
        });

if (res.status === 401 || res.status === 403) {
  logout();
  navigate("/login");
  return;
}

if (!res.ok) {
  throw new Error("Failed to fetch user");
}
        const data = await res.json();
        setFormData({
          name: data.name,
          username: data.username,
          email: data.email,
          password: "",
          role: data.role,
        });

        setLoadingUser(false);
      } catch (err) {
        console.error(err);
        notify("Error fetching user data", "error");
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [token]);

  if (!user || loadingUser)
    return <p className="text-center mt-10">Cargando usuario...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email) {
      notify("Email not loaded yet", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/edit?email=${formData.email}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            username: formData.username,
            password: formData.password
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        notify(errData?.message || "Error updating user", "error");
        setLoading(false);
        return;
      }

      notify("User updated successfully", "success");
      setLoading(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      notify("Server error", "error");
      setLoading(false);
    }
  };


  return (
    <div className="bg-salviaGreen min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-lg bg-brokenWhite/70 p-6 rounded-xl shadow-lg w-full flex flex-col gap-4 max-w-md mx-auto"
      >
        <h1 className="text-3xl font-bold text-center mb-4">Editar Usuario</h1>

        {/* Name */}
        <div>
          <label className="block text-base/normal font-semibold text-gray-800 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full rounded placeholder-gray-400 py-1.5 px-3 bg-transparent border-white/10 text-grey-800 focus:border-white/25 focus:outline-0 focus:ring-0"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-base/normal font-semibold text-gray-800 mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="block w-full rounded placeholder-gray-400 py-1.5 px-3 bg-transparent border-white/10 text-grey-800 focus:border-white/25 focus:outline-0 focus:ring-0"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-base/normal font-semibold text-gray-800 mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New password..."
            className="block w-full rounded placeholder-gray-400 py-1.5 px-3 bg-transparent border-white/10 text-grey-800 focus:border-white/25 focus:outline-0 focus:ring-0"
          />
        </div>

        {/* Email (bloqueado) */}
        <div>
          <label className="block text-base/normal font-semibold text-gray-800 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="block w-full rounded placeholder-gray-400 py-1.5 px-3 bg-gray-700 border-white/20 text-grey-800 cursor-not-allowed"
          />
        </div>

        {/* Role (bloqueado) */}
        <div>
          <label className="block text-base/normal font-semibold text-gray-800 mb-2">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            disabled
            className="block w-full rounded placeholder-gray-400 py-1.5 px-3 bg-gray-700 border-white/20 text-grey-800 cursor-not-allowed"
          />
        </div>

        {/* Botón enviar */}
        <div className="w-full flex justify-between">
        <button type="button" onClick={() => navigate("/")} className="w-1/2 bg-red-500 inline-flex items-center justify-center px-6 py-2 backdrop-blur-2x1 rounded-lg text-grey-800 transition-all duration-500 group hover:bg-red-700 hover:text-white mt-5">Go back</button>
        <button
          type="submit"
          disabled={loading}
          className="w-1/2 inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-green-500 text-grey-800 rounded-lg transition-all duration-500 group hover:bg-green-700 hover:text-white mt-5"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
        
        </div>
      </form>
    </div>
  );
}
