import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import type { AuthResponse } from "../models/AuthResponse";
import { notify } from "../reusable/Notification";


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica inicial
    if (!email || !password) {
      notify("Todos los campos son obligatorios", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorData = (data as unknown) as { message: string };
        notify(errorData.message || "Credenciales incorrectas", "error");
        return;
      }

      // Si el login es exitoso
      login(data as AuthResponse);
      notify("¡Bienvenido de nuevo!", "success");
      navigate("/");

    } catch (err) {
      notify("No se pudo conectar con el servidor", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

   return (

<div className="bg-salviaGreen min-h-screen flex items-center justify-center p-4">

<form

onSubmit={handleSubmit}

className="backdrop-blur-lg bg-brokenWhite/70 p-6 rounded-xl shadow-lg w-full flex flex-col gap-4 max-h-md max-w-md mx-auto"

>

<h1 className="text-3xl font-bold">Login</h1>


<div className="mb-4">

<label className="block text-base/normal font-semibold text-gray-800 mb-2">Email address</label>

<input value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded placeholder-gray-400 py-1.5 px-3 bg-transparent border-white/10 text-grey-800 focus:border-white/25 focus:outline-0 focus:ring-0" type="text" id="emailaddress" placeholder="Enter your email" />

</div>

<div className="mb-4">

<label className="block text-base/normal font-semibold text-gray-800 mb-2">Password</label>

<input value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full placeholder-gray-400 rounded py-1.5 px-3 bg-transparent border-white/10 text-grey-800 focus:border-white/25 focus:outline-0 focus:ring-0" type="password" id="password" placeholder="Enter your password" />

</div>

<div className="flex justify-between items-center gap-1 mb-6">

<div className="inline-flex items-center">

<input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/20 text-blue-600 shadow-sm focus:border-blue-600 focus:ring focus:ring-blue-600/60 focus:ring-offset-0" id="checkbox-signin" />

<label className="text-base/none ms-2 text-gray-400 align-middle select-none">Remember me</label>

</div>

<Link to='/forgotPassword' className="text-gray-400 border-b border-dashed"><small>Forgot your password?</small></Link>

</div>

<div className="mb-6 text-center">

<button className="w-full inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/20 text-grey-800 rounded-lg transition-all duration-500 group hover:bg-blue-600/60 hover:text-white mt-5" type="submit">Log In </button>

</div>



</form>

</div>

); 
}