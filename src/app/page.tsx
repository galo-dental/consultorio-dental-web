"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RolUsuario = "odontologo" | "asistente" | "recepcionista" | string;
type ModuloActivo =
  | null
  | "historias"
  | "agenda"
  | "pagos"
  | "inventario";

interface Perfil {
  id: string;
  rol: RolUsuario;
  nombre_completo?: string | null;
}

interface Paciente {
  id: string;
  nombre: string;
  telefono: string;
  observacion: string;
}

interface Cita {
  id: string;
  paciente: string;
  motivo: string;
  hora: string;
  confirmada: boolean;
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
  const [moduloActivo, setModuloActivo] = useState<ModuloActivo>(null);

  // Pacientes e Historias Clínicas
  const [pacientes, setPacientes] = useState<Paciente[]>([
    {
      id: "pac-1",
      nombre: "Paciente Inicial",
      telefono: "0990000000",
      observacion: "Revisión general y profilaxis",
    },
  ]);
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [telefonoPaciente, setTelefonoPaciente] = useState("");
  const [observacionPaciente, setObservacionPaciente] = useState("");
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] =
    useState<string>("pac-1");

  // Agenda y Recordatorios
  const [pacienteCita, setPacienteCita] = useState("");
  const [motivoCita, setMotivoCita] = useState("");
  const [horaCita, setHoraCita] = useState("09:00");
  const [citas, setCitas] = useState<Cita[]>([
    {
      id: "1",
      paciente: "Paciente Inicial",
      motivo: "Valoración y limpieza",
      hora: "09:00",
      confirmada: false,
    },
  ]);

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
        nombre_completo:
          data.nombre_completo || user.email || "Panel del Consultorio",
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
    setModuloActivo(null);
    setPassword("");
  }

  function crearPaciente(e: React.FormEvent) {
    e.preventDefault();
    if (!nombrePaciente.trim()) return;
    const nuevo: Paciente = {
      id: `pac-${Date.now()}`,
      nombre: nombrePaciente.trim(),
      telefono: telefonoPaciente.trim() || "Sin teléfono",
      observacion: observacionPaciente.trim() || "Sin observaciones iniciales",
    };
    setPacientes((prev) => [nuevo, ...prev]);
    setPacienteSeleccionadoId(nuevo.id);
    setNombrePaciente("");
    setTelefonoPaciente("");
    setObservacionPaciente("");
  }

  function agregarCita(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteCita.trim() || !motivoCita.trim()) return;
    setCitas((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        paciente: pacienteCita.trim(),
        motivo: motivoCita.trim(),
        hora: horaCita,
        confirmada: false,
      },
    ]);
    setPacienteCita("");
    setMotivoCita("");
  }

  const pacienteActivo =
    pacientes.find((p) => p.id === pacienteSeleccionadoId) || null;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-slate-600">
          Cargando sistema del consultorio...
        </p>
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

      {!moduloActivo ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setModuloActivo("historias")}
            className="text-left bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 shadow-sm transition"
          >
            <h2 className="font-medium text-slate-900">
              Historias Clínicas y Odontograma
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Crear pacientes ({pacientes.length}), ver ficha y registro dental.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModuloActivo("agenda")}
            className="text-left bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 shadow-sm transition"
          >
            <h2 className="font-medium text-slate-900">Agenda y Recordatorios</h2>
            <p className="text-xs text-slate-500 mt-1">
              Citas programadas ({citas.length}) y confirmaciones.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModuloActivo("pagos")}
            className="text-left bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 shadow-sm transition"
          >
            <h2 className="font-medium text-slate-900">Presupuestos y Pagos</h2>
            <p className="text-xs text-slate-500 mt-1">
              Planes de tratamiento, abonos y saldos.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModuloActivo("inventario")}
            className="text-left bg-white border border-slate-200 hover:border-slate-400 rounded-xl p-4 shadow-sm transition"
          >
            <h2 className="font-medium text-slate-900">Inventario de Insumos</h2>
            <p className="text-xs text-slate-500 mt-1">
              Existencias y materiales del consultorio.
            </p>
          </button>
        </section>
      ) : (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">
              {moduloActivo === "historias" &&
                "Historias Clínicas y Odontograma"}
              {moduloActivo === "agenda" && "Agenda y Recordatorios"}
              {moduloActivo === "pagos" && "Presupuestos y Pagos"}
              {moduloActivo === "inventario" && "Inventario de Insumos"}
            </h2>
            <button
              type="button"
              onClick={() => setModuloActivo(null)}
              className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800"
            >
              Volver al menú
            </button>
          </div>

          {moduloActivo === "historias" && (
            <div className="space-y-5">
              <form
                onSubmit={crearPaciente}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200"
              >
                <input
                  type="text"
                  required
                  value={nombrePaciente}
                  onChange={(e) => setNombrePaciente(e.target.value)}
                  placeholder="Nombre completo del paciente"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={telefonoPaciente}
                  onChange={(e) => setTelefonoPaciente(e.target.value)}
                  placeholder="Teléfono / WhatsApp"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={observacionPaciente}
                  onChange={(e) => setObservacionPaciente(e.target.value)}
                  placeholder="Motivo o nota clínica"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="sm:col-span-3 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
                >
                  + Guardar nuevo paciente
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pacientes registrados ({pacientes.length})
                  </h3>
                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {pacientes.map((pac) => (
                      <li key={pac.id}>
                        <button
                          type="button"
                          onClick={() => setPacienteSeleccionadoId(pac.id)}
                          className={`w-full text-left px-3.5 py-2.5 text-sm transition ${
                            pac.id === pacienteActivo?.id
                              ? "bg-slate-900 text-white"
                              : "bg-white text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          <div className="font-medium">{pac.nombre}</div>
                          <div
                            className={`text-xs ${
                              pac.id === pacienteActivo?.id
                                ? "text-slate-300"
                                : "text-slate-500"
                            }`}
                          >
                            {pac.telefono}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ficha del paciente seleccionado
                  </h3>
                  {pacienteActivo ? (
                    <div className="space-y-1.5 text-sm text-slate-800">
                      <p>
                        <strong>Nombre:</strong> {pacienteActivo.nombre}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {pacienteActivo.telefono}
                      </p>
                      <p>
                        <strong>Nota clínica:</strong>{" "}
                        {pacienteActivo.observacion}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Selecciona un paciente de la lista.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {moduloActivo === "agenda" && (
            <div className="space-y-4">
              <form
                onSubmit={agregarCita}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2"
              >
                <input
                  type="text"
                  required
                  value={pacienteCita}
                  onChange={(e) => setPacienteCita(e.target.value)}
                  placeholder="Nombre del paciente"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  value={motivoCita}
                  onChange={(e) => setMotivoCita(e.target.value)}
                  placeholder="Motivo de cita"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={horaCita}
                  onChange={(e) => setHoraCita(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-medium"
                >
                  Agregar cita
                </button>
              </form>

              <ul className="divide-y divide-slate-100">
                {citas.map((cita) => (
                  <li
                    key={cita.id}
                    className="py-2.5 flex items-center justify-between gap-2 text-sm"
                  >
                    <div>
                      <strong className="text-slate-900">{cita.hora}</strong> —{" "}
                      {cita.paciente} ({cita.motivo})
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCitas((prev) =>
                          prev.map((item) =>
                            item.id === cita.id
                              ? { ...item, confirmada: !item.confirmada }
                              : item
                          )
                        )
                      }
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        cita.confirmada
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {cita.confirmada ? "Confirmada" : "Marcar recordatorio"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(moduloActivo === "pagos" || moduloActivo === "inventario") && (
            <p className="text-sm text-slate-600">
              Este módulo ya tiene su vista abierta y lista para añadirle
              campos. Dime si quieres que armemos primero{" "}
              {moduloActivo === "pagos"
                ? "el registro de presupuestos y abonos"
                : "el control de insumos y cantidades"}
              .
            </p>
          )}
        </section>
      )}
    </main>
  );
}
