# Mentorly paso a paso

Recorrido guiado por la plataforma con cuentas de demostración ya
creadas, para verla funcionando sin registrarse.

**La app:** https://proyecto2526frontend-jose-manuelbg.vercel.app

> La API vive en el plan gratuito de Render y se duerme con la
> inactividad: la primera petición puede tardar uno o dos minutos en
> despertarla. Después va fluida.

## Cuentas de demostración

| Rol | Email | Contraseña |
|------------|----------------------------|------------|
| Estudiante | demo.student@mentorly.test | Demo1234!  |
| Mentor     | demo.mentor@mentorly.test  | Demo1234!  |

Hay una cuenta de administrador para ver el panel de validación y el
registro de auditoría; pídemela si te interesa esa parte.

## 1. Ver la plataforma como estudiante

1. Entra en `/login` con la cuenta de estudiante.
2. En **Buscar mentor** (`/findMentor`) están los mentores dados de
   alta con sus asignaturas. "Demo Mentor" da Matemáticas e Inglés de
   secundaria.
3. Abre su perfil: verás sus huecos de disponibilidad (lunes y
   miércoles de 17:00 a 19:00). Reserva uno.
4. En **Mis solicitudes** (`/seeRequests`) queda la reserva con su
   estado; ahí mismo se puede cancelar.

## 2. Verla como mentor

1. Sal y entra con la cuenta de mentor.
2. En **Disponibilidad** (`/availability`) está el calendario del
   mentor: los huecos se generan por tramos semanales (día de la
   semana + horas + número de semanas), no uno a uno.
3. En **Mis solicitudes** llegan las reservas de los estudiantes,
   para aceptarlas o rechazarlas.
4. Cuando una sesión está aceptada, el mentor puede subirle
   materiales (van a Cloudinary) y decidir si el estudiante los ve.

## 3. El circuito completo, si quieres verlo entero

Cualquier usuario nuevo se registra como estudiante en `/signup`
(formulario en tres pasos) y pide ser mentor en **Hazte mentor**
(`/become-mentor`), eligiendo asignaturas y contando su experiencia.
Esa solicitud le llega a un administrador, que la aprueba o rechaza
desde su panel; al aprobarla, la cuenta pasa a tener el rol de mentor
y desbloquea el calendario de disponibilidad. Todo queda anotado en
el registro de auditoría que ven los administradores.

## Qué hay debajo

[API en Spring Boot](https://github.com/JoseManuelbg/MentorlyBackend)
con JWT, MySQL (Aiven) y Cloudinary, desplegada en Render. Este front
es React + TypeScript + Vite, en Vercel.
