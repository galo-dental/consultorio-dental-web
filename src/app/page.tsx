"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RolUsuario = "odontologo" | "asistente" | "recepcionista" | string;

interface Perfil {
  id: string;
  rol: RolUsuario;
  nombre_completo?: string | null;
}

function inferirRolRespaldo(email?: string | null): RolUsuario {
  const limpio = (email || "").toLowerCase();
  if (limpio.includes("asistente")) return "asistente";
  if (limpio.includes("recep")) return "recepcionista";
  return "odontologo";
}

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [avisoPerfil, setAvisoPerfil] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  async function cargarSesion() {
    setLoading(true);
    setErrorMsg(null);
    setAvisoPerfil(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setPerfil(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("perfiles")
      .select("id, rol, nombre_completo")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      setPerfil({
        id: user.id,
        rol: inferirRolRespaldo(user.email),
        nombre_completo: user.email || "Usuario del Consultorio",
      });
      setAvisoPerfil(
        "Acceso concedido con rol temporal (no se pudo leer la fila en perfiles)."
      );
    } else {
      setPerfil({
        id: data.id,
        rol: data.rol || inferirRolRespaldo(user.email),
        nombre_completo: data.nombre_completo || user.email || "Panel del Consultorio",
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    cargarSesion();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg("Correo o contraseña incorrectos.");
      setSubmitting(false);
      return;
    }

    await cargarSesion();
    setSubmitting(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setPerfil(null);
    setAvisoPerfil(null);
    setPassword("");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-slate-600">Cargando sistema del consultorio...</p>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Consultorio Dental
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingresa con tu cuenta asignada para abrir tu panel.
          </p>

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@consultorio.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Rol activo: <strong className="text-slate-900">{perfil.rol}</strong>
          </p>
          <h1 className="text-lg font-semibold text-slate-900">
            {perfil.nombre_completo || "Panel del Consultorio"}
          </h1>
          {avisoPerfil && (
            <p className="text-xs text-amber-700 mt-1">{avisoPerfil}</p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          Cerrar sesión
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-medium text-slate-900">Historias Clínicas y Odontograma</h2>
          <p className="text-xs text-slate-500 mt-1">
            Listo para conectar tus tablas clínicas en Supabase.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-medium text-slate-900">Agenda y Recordatorios</h2>
          <p className="text-xs text-slate-500 mt-1">
            Control de citas y flujo de confirmación por WhatsApp.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-medium text-slate-900">Presupuestos y Pagos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Seguimiento de planes de tratamiento, abonos y saldos.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-medium text-slate-900">Inventario de Insumos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Control de existencias y materiales del consultorio.
          </p>
        </div>
      </section>
    </main>
  );
}
