import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import type { AuthResponse } from "../models/AuthResponse";
import { notify } from "../reusable/Notification";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica inicial
    if (!email || !password) {
      notify("Todos los campos son obligatorios", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/signin", {
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

<a href="#" className="text-gray-400 border-b border-dashed"><small>Forgot your password?</small></a>

</div>

<div className="mb-6 text-center">

<button className="w-full inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/20 text-grey-800 rounded-lg transition-all duration-500 group hover:bg-blue-600/60 hover:text-white mt-5" type="submit">Log In </button>

</div>

<div className="text-center mt-9">

<p className="text-grey-800 text-xl mb-6">Sign in with</p>

<div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2">

<a href="#" className="inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/20 text-grey-800 rounded-lg transition-all duration-500 group hover:bg-red-600/60 hover:text-white">

<svg className="me-3 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">

<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>

<path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>

<path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>

<path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>

</svg>

Login with Google

</a>

<a href="#" className="inline-flex items-center justify-center px-6 py-2 backdrop-blur-2xl bg-white/20 text-grey-800 rounded-lg transition-all duration-500 group hover:bg-gray-600/60 hover:text-white">

<svg className="me-3 w-6" viewBox="0 0 32 32">

<path fill-rule="evenodd" d="M16 4C9.371 4 4 9.371 4 16c0 5.3 3.438 9.8 8.207 11.387.602.11.82-.258.82-.578 0-.286-.011-1.04-.015-2.04-3.34.723-4.043-1.609-4.043-1.609-.547-1.387-1.332-1.758-1.332-1.758-1.09-.742.082-.726.082-.726 1.203.086 1.836 1.234 1.836 1.234 1.07 1.836 2.808 1.305 3.492 1 .11-.777.422-1.305.762-1.605-2.664-.301-5.465-1.332-5.465-5.93 0-1.313.469-2.383 1.234-3.223-.121-.3-.535-1.523.117-3.175 0 0 1.008-.32 3.301 1.23A11.487 11.487 0 0116 9.805c1.02.004 2.047.136 3.004.402 2.293-1.55 3.297-1.23 3.297-1.23.656 1.652.246 2.875.12 3.175.77.84 1.231 1.91 1.231 3.223 0 4.61-2.804 5.621-5.476 5.922.43.367.812 1.101.812 2.219 0 1.605-.011 2.898-.011 3.293 0 .32.214.695.824.578C24.566 25.797 28 21.3 28 16c0-6.629-5.371-12-12-12z"></path>

</svg>

Login with Github

</a>

</div>

</div>

</form>

</div>

); 
}