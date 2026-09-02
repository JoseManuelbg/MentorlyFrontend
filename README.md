# Mentorly — front

Interfaz web de Mentorly, una plataforma de mentorías entre
estudiantes. Contra la [API en Spring Boot](https://github.com/JoseManuelbg/MentorlyBackend).

**En producción:** https://proyecto2526frontend-jose-manuelbg.vercel.app

## Qué se puede hacer

- Registrarse, iniciar sesión (también con Google) y recuperar la
  contraseña por correo.
- Hacerse mentor con un formulario en tres pasos; un administrador
  revisa y valida las solicitudes desde su propio panel.
- Gestionar disponibilidad sobre un calendario y atender las
  peticiones de mentoría que llegan.
- Buscar usuarios y asignaturas; los admins además gestionan usuarios
  y consultan el registro de actividad.

## Stack

React 18 + TypeScript + Vite, Tailwind (Material Tailwind),
React Router, react-hook-form, axios con el JWT en un contexto de
autenticación propio. Desplegado en Vercel.

## Arrancar en local

```
npm install
npm run dev
```

Apunta a `http://localhost:8080` (la API en local) vía
`.env.development`. Para apuntar a otra API, cambia `VITE_API_URL`.
