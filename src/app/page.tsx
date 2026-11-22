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

type SeccionHC =
  | "identificacion"
  | "motivo"
  | "medicos"
  | "odontologicos"
  | "clinico"
  | "examenes"
  | "diagnostico";

interface Perfil {
  id: string;
  rol: RolUsuario;
  nombre_completo?: string | null;
}

interface RegistroFoto {
  id: string;
  nombreArchivo: string;
  dataUrl: string;
  fecha: string;
}

interface HistoriaClinicaCompleta {
  // 1. Identificación y contacto
  nombres: string;
  apellidos: string;
  documento: string;
  fechaNacimiento: string;
  sexo: string;
  direccion: string;
  telefono: string;
  correo: string;
  ocupacion: string;
  contactoEmergencia: string;
  seguroConvenio: string;
  representanteLegal: string;

  // 2. Motivo de consulta y enfermedad actual
  motivoConsulta: string;
  enfermedadActual: string;
  intensidadDolor: string;

  // 3. Antecedentes médicos generales
  enfermedadesSistemicas: string;
  alergias: string;
  medicacionActual: string;
  cirugiasPrevias: string;
  antecedentesFamiliares: string;
  habitosGenerales: string;

  // 4. Antecedentes odontológicos
  tratamientosPrevios: string;
  frecuenciaVisitas: string;
  experienciasAnteriores: string;
  ansiedadDental: string;
  higieneOral: string;

  // 5. Signos vitales y examen clínico
  presionArterial: string;
  pulso: string;
  otrosSignosVitales: string;
  examenExtraoral: string;
  examenIntraoral: string;
  tejidosBlandos: string;
  notasPeriodontograma: string;
  notasOdontograma: string;

  // 6. Exámenes complementarios y fotos
  examenesComplementarios: string;
  fotos: RegistroFoto[];

  // 7. Diagnóstico CIE-10 y plan de tratamiento
  codigoCie10: string;
  diagnostico: string;
  planTratamiento: string;
}

interface Paciente {
  id: string;
  hc: HistoriaClinicaCompleta;
}

interface Cita {
  id: string;
  paciente: string;
  motivo: string;
  hora: string;
  confirmada: boolean;
}

function nombreCompletoPaciente(hc: HistoriaClinicaCompleta): string {
  const full = `${hc.nombres || ""} ${hc.apellidos || ""}`.trim();
  return full || "Paciente sin nombre";
}

function crearHcVacia(
  nombres = "",
  apellidos = "",
  telefonoInicial = ""
): HistoriaClinicaCompleta {
  return {
    nombres,
    apellidos,
    documento: "",
    fechaNacimiento: "",
    sexo: "",
    direccion: "",
    telefono: telefonoInicial,
    correo: "",
    ocupacion: "",
    contactoEmergencia: "",
    seguroConvenio: "",
    representanteLegal: "",
    motivoConsulta: "",
    enfermedadActual: "",
    intensidadDolor: "",
    enfermedadesSistemicas: "",
    alergias: "",
    medicacionActual: "",
    cirugiasPrevias: "",
    antecedentesFamiliares: "",
    habitosGenerales: "",
    tratamientosPrevios: "",
    frecuenciaVisitas: "",
    experienciasAnteriores: "",
    ansiedadDental: "",
    higieneOral: "",
    presionArterial: "",
    pulso: "",
    otrosSignosVitales: "",
    examenExtraoral: "",
    examenIntraoral: "",
    tejidosBlandos: "",
    notasPeriodontograma: "",
    notasOdontograma: "",
    examenesComplementarios: "",
    fotos: [],
    codigoCie10: "",
    diagnostico: "",
    planTratamiento: "",
  };
}

function calcularEdad(fechaNacimiento: string): string {
  if (!fechaNacimiento) return "—";
  const nac = new Date(fechaNacimiento);
  if (Number.isNaN(nac.getTime())) return "—";
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const mesDif = hoy.getMonth() - nac.getMonth();
  if (mesDif < 0 || (mesDif === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return edad >= 0 ? `${edad} años` : "—";
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

  // Pacientes e Historia Clínica
  const [pacientes, setPacientes] = useState<Paciente[]>([
    {
      id: "pac-1",
      hc: {
        ...crearHcVacia("Paciente", "Inicial", "0990000000"),
        sexo: "No especificado",
        motivoConsulta: "Revisión odontológica general",
      },
    },
  ]);
  const [nombresNuevo, setNombresNuevo] = useState("");
  const [apellidosNuevo, setApellidosNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] =
    useState<string>("pac-1");
  const [seccionHc, setSeccionHc] = useState<SeccionHC>("identificacion");
  const [mensajeGuardado, setMensajeGuardado] = useState<string | null>(null);

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
    if (!nombresNuevo.trim() && !apellidosNuevo.trim()) return;
    const nuevo: Paciente = {
      id: `pac-${Date.now()}`,
      hc: crearHcVacia(
        nombresNuevo.trim(),
        apellidosNuevo.trim(),
        telefonoNuevo.trim()
      ),
    };
    setPacientes((prev) => [nuevo, ...prev]);
    setPacienteSeleccionadoId(nuevo.id);
    setSeccionHc("identificacion");
    setNombresNuevo("");
    setApellidosNuevo("");
    setTelefonoNuevo("");
    setMensajeGuardado(
      "Paciente creado. Ya puede completar su historia clínica."
    );
  }

  function actualizarCampoHc<K extends keyof HistoriaClinicaCompleta>(
    campo: K,
    valor: HistoriaClinicaCompleta[K]
  ) {
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) =>
        pac.id === pacienteSeleccionadoId
          ? { ...pac, hc: { ...pac.hc, [campo]: valor } }
          : pac
      )
    );
  }

  function handleSubirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo || !pacienteSeleccionadoId) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const nuevaFoto: RegistroFoto = {
        id: `foto-${Date.now()}`,
        nombreArchivo: archivo.name || "foto_clinica.jpg",
        dataUrl: reader.result,
        fecha: new Date().toLocaleDateString("es-EC"),
      };

      setMensajeGuardado(null);
      setPacientes((prev) =>
        prev.map((pac) =>
          pac.id === pacienteSeleccionadoId
            ? { ...pac, hc: { ...pac.hc, fotos: [nuevaFoto, ...pac.hc.fotos] } }
            : pac
        )
      );
    };
    reader.readAsDataURL(archivo);
    e.target.value = "";
  }

  function eliminarFoto(fotoId: string) {
    setPacientes((prev) =>
      prev.map((pac) =>
        pac.id === pacienteSeleccionadoId
          ? {
              ...pac,
              hc: {
                ...pac.hc,
                fotos: pac.hc.fotos.filter((f) => f.id !== fotoId),
              },
            }
          : pac
      )
    );
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

  const pestanasHc: { id: SeccionHC; titulo: string }[] = [
    { id: "identificacion", titulo: "1. Identificación" },
    { id: "motivo", titulo: "2. Motivo y enfermedad" },
    { id: "medicos", titulo: "3. Ant. médicos" },
    { id: "odontologicos", titulo: "4. Ant. odontológicos" },
    { id: "clinico", titulo: "5. Signos y examen" },
    { id: "examenes", titulo: "6. Exámenes y fotos" },
    { id: "diagnostico", titulo: "7. Diagnóstico CIE-10 y plan" },
  ];

  return (
    <main className="min-h-screen p-4 max-w-5xl mx-auto space-y-6">
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
              Pacientes ({pacientes.length}), historia clínica completa, fotos
              y CIE-10.
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
        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
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
              {/* Alta rápida de paciente con Nombres y Apellidos */}
              <form
                onSubmit={crearPaciente}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200"
              >
                <input
                  type="text"
                  required
                  value={nombresNuevo}
                  onChange={(e) => setNombresNuevo(e.target.value)}
                  placeholder="Nombres"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  value={apellidosNuevo}
                  onChange={(e) => setApellidosNuevo(e.target.value)}
                  placeholder="Apellidos"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={telefonoNuevo}
                  onChange={(e) => setTelefonoNuevo(e.target.value)}
                  placeholder="Teléfono / WhatsApp"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
                >
                  + Crear paciente
                </button>
              </form>

              {/* Selector de paciente */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Paciente activo:
                </span>
                {pacientes.map((pac) => (
                  <button
                    key={pac.id}
                    type="button"
                    onClick={() => {
                      setPacienteSeleccionadoId(pac.id);
                      setMensajeGuardado(null);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                      pac.id === pacienteActivo?.id
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {nombreCompletoPaciente(pac.hc)}
                  </button>
                ))}
              </div>

              {pacienteActivo && (
                <div className="space-y-4 border border-slate-200 rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {nombreCompletoPaciente(pacienteActivo.hc)}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Edad calculada:{" "}
                        <strong>
                          {calcularEdad(pacienteActivo.hc.fechaNacimiento)}
                        </strong>{" "}
                        · Doc: {pacienteActivo.hc.documento || "Sin registro"} ·
                        Fotos: {pacienteActivo.hc.fotos.length}
                      </p>
                    </div>
                    {mensajeGuardado && (
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                        {mensajeGuardado}
                      </span>
                    )}
                  </div>

                  {/* Pestañas de Historia Clínica */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {pestanasHc.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSeccionHc(tab.id)}
                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium ${
                          seccionHc === tab.id
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {tab.titulo}
                      </button>
                    ))}
                  </div>

                  {seccionHc === "identificacion" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Nombres
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.nombres}
                          onChange={(e) =>
                            actualizarCampoHc("nombres", e.target.value)
                          }
                          placeholder="Nombres del paciente"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Apellidos
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.apellidos}
                          onChange={(e) =>
                            actualizarCampoHc("apellidos", e.target.value)
                          }
                          placeholder="Apellidos del paciente"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Documento de identidad
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.documento}
                          onChange={(e) =>
                            actualizarCampoHc("documento", e.target.value)
                          }
                          placeholder="Cédula / DNI / Pasaporte"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Fecha de nacimiento (Edad:{" "}
                          {calcularEdad(pacienteActivo.hc.fechaNacimiento)})
                        </label>
                        <input
                          type="date"
                          value={pacienteActivo.hc.fechaNacimiento}
                          onChange={(e) =>
                            actualizarCampoHc("fechaNacimiento", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Sexo
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.sexo}
                          onChange={(e) =>
                            actualizarCampoHc("sexo", e.target.value)
                          }
                          placeholder="Femenino / Masculino / Otro"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.telefono}
                          onChange={(e) =>
                            actualizarCampoHc("telefono", e.target.value)
                          }
                          placeholder="Teléfono / WhatsApp"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          value={pacienteActivo.hc.correo}
                          onChange={(e) =>
                            actualizarCampoHc("correo", e.target.value)
                          }
                          placeholder="correo@ejemplo.com"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Ocupación
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.ocupacion}
                          onChange={(e) =>
                            actualizarCampoHc("ocupacion", e.target.value)
                          }
                          placeholder="Ocupación actual"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.direccion}
                          onChange={(e) =>
                            actualizarCampoHc("direccion", e.target.value)
                          }
                          placeholder="Dirección domiciliaria"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Contacto de emergencia
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.contactoEmergencia}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "contactoEmergencia",
                              e.target.value
                            )
                          }
                          placeholder="Nombre y teléfono de emergencia"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Seguro o convenio médico
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.seguroConvenio}
                          onChange={(e) =>
                            actualizarCampoHc("seguroConvenio", e.target.value)
                          }
                          placeholder="Particular / Seguro / Convenio"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Representante legal (si es menor de edad)
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.representanteLegal}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "representanteLegal",
                              e.target.value
                            )
                          }
                          placeholder="Nombre, documento y parentesco del representante"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {seccionHc === "motivo" && (
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Motivo de consulta (en palabras del paciente)
                        </label>
                        <textarea
                          rows={2}
                          value={pacienteActivo.hc.motivoConsulta}
                          onChange={(e) =>
                            actualizarCampoHc("motivoConsulta", e.target.value)
                          }
                          placeholder="Ej. 'Me duele una muela al tomar algo frío'"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Enfermedad actual (síntomas, inicio y evolución)
                        </label>
                        <textarea
                          rows={3}
                          value={pacienteActivo.hc.enfermedadActual}
                          onChange={(e) =>
                            actualizarCampoHc("enfermedadActual", e.target.value)
                          }
                          placeholder="Cuándo inició, cómo ha evolucionado y qué lo agrava o alivia"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Intensidad del dolor / molestia
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.intensidadDolor}
                          onChange={(e) =>
                            actualizarCampoHc("intensidadDolor", e.target.value)
                          }
                          placeholder="Ej. 6/10, leve/moderada/severa"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {seccionHc === "medicos" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Enfermedades sistémicas
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.enfermedadesSistemicas}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "enfermedadesSistemicas",
                              e.target.value
                            )
                          }
                          placeholder="Diabetes, hipertensión, cardiopatías, etc."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Alergias (medicamentos o materiales)
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.alergias}
                          onChange={(e) =>
                            actualizarCampoHc("alergias", e.target.value)
                          }
                          placeholder="Penicilina, anestésicos, látex, acrílicos..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Medicación actual
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.medicacionActual}
                          onChange={(e) =>
                            actualizarCampoHc("medicacionActual", e.target.value)
                          }
                          placeholder="Fármacos y dosis actuales"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Cirugías previas
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.cirugiasPrevias}
                          onChange={(e) =>
                            actualizarCampoHc("cirugiasPrevias", e.target.value)
                          }
                          placeholder="Intervenciones quirúrgicas anteriores"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Antecedentes familiares
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.antecedentesFamiliares}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "antecedentesFamiliares",
                              e.target.value
                            )
                          }
                          placeholder="Patologías relevantes en familiares"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Hábitos (tabaquismo, alcoholismo, etc.)
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.habitosGenerales}
                          onChange={(e) =>
                            actualizarCampoHc("habitosGenerales", e.target.value)
                          }
                          placeholder="Tabaquismo, alcohol, otros hábitos"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {seccionHc === "odontologicos" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Tratamientos odontológicos previos
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.tratamientosPrevios}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "tratamientosPrevios",
                              e.target.value
                            )
                          }
                          placeholder="Profilaxis, resinas, endodoncias, ortodoncia..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Frecuencia de visitas al odontólogo
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.frecuenciaVisitas}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "frecuenciaVisitas",
                              e.target.value
                            )
                          }
                          placeholder="Cada 6 meses, anual, solo por molestia..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Experiencias anteriores
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.experienciasAnteriores}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "experienciasAnteriores",
                              e.target.value
                            )
                          }
                          placeholder="Cómo vivió consultas o procedimientos previos"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Nivel de ansiedad dental
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.ansiedadDental}
                          onChange={(e) =>
                            actualizarCampoHc("ansiedadDental", e.target.value)
                          }
                          placeholder="Bajo, moderado, alto"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Higiene oral habitual
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.higieneOral}
                          onChange={(e) =>
                            actualizarCampoHc("higieneOral", e.target.value)
                          }
                          placeholder="Cepillado diario, uso de hilo dental, enjuague..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {seccionHc === "clinico" && (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Presión arterial
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.presionArterial}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "presionArterial",
                                e.target.value
                              )
                            }
                            placeholder="Ej. 120/80 mmHg"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Pulso
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.pulso}
                            onChange={(e) =>
                              actualizarCampoHc("pulso", e.target.value)
                            }
                            placeholder="Ej. 72 lpm"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Otros signos vitales
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.otrosSignosVitales}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "otrosSignosVitales",
                                e.target.value
                              )
                            }
                            placeholder="Temperatura, saturación, etc."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Examen extraoral
                          </label>
                          <textarea
                            rows={2}
                            value={pacienteActivo.hc.examenExtraoral}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "examenExtraoral",
                                e.target.value
                              )
                            }
                            placeholder="ATM, ganglios, asimetría facial..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Examen intraoral y tejidos blandos
                          </label>
                          <textarea
                            rows={2}
                            value={pacienteActivo.hc.examenIntraoral}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "examenIntraoral",
                                e.target.value
                              )
                            }
                            placeholder="Mucosas, encía, lengua, paladar, piso de boca..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Periodontograma (si aplica)
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.notasPeriodontograma}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "notasPeriodontograma",
                              e.target.value
                            )
                          }
                          placeholder="Profundidad de sondaje, sangrado, movilidad..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Registro del odontograma (estado actual, patologías y
                          tratamientos previos)
                        </label>
                        <textarea
                          rows={3}
                          value={pacienteActivo.hc.notasOdontograma}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "notasOdontograma",
                              e.target.value
                            )
                          }
                          placeholder="Piezas dentales, caries, restauraciones, ausencias..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {seccionHc === "examenes" && (
                    <div className="space-y-4 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Exámenes complementarios (radiografías, fotografías
                          clínicas, tomografías, laboratorio)
                        </label>
                        <textarea
                          rows={3}
                          value={pacienteActivo.hc.examenesComplementarios}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "examenesComplementarios",
                              e.target.value
                            )
                          }
                          placeholder="Detalle o hallazgos de Rx periapical/panorámica, fotos clínicas, CBCT o análisis de laboratorio"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      {/* Tomar foto desde cámara o adjuntar desde archivo/galería */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <label className="cursor-pointer rounded-lg bg-slate-900 text-white px-3 py-2.5 text-center text-xs font-medium hover:bg-slate-800">
                          Tomar foto con cámara
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleSubirFoto}
                            className="hidden"
                          />
                        </label>

                        <label className="cursor-pointer rounded-lg border border-slate-300 bg-white text-slate-800 px-3 py-2.5 text-center text-xs font-medium hover:bg-slate-100">
                          Adjuntar foto o imagen
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSubirFoto}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {pacienteActivo.hc.fotos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {pacienteActivo.hc.fotos.map((foto) => (
                            <div
                              key={foto.id}
                              className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                            >
                              <img
                                src={foto.dataUrl}
                                alt={foto.nombreArchivo}
                                className="w-full h-36 object-cover bg-slate-100"
                              />
                              <div className="p-2.5 flex items-center justify-between gap-2 text-xs">
                                <div className="truncate">
                                  <p className="font-medium text-slate-800 truncate">
                                    {foto.nombreArchivo}
                                  </p>
                                  <p className="text-slate-500">{foto.fecha}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => eliminarFoto(foto.id)}
                                  className="text-red-600 hover:underline shrink-0"
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {seccionHc === "diagnostico" && (
                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Código CIE-10
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.codigoCie10}
                            onChange={(e) =>
                              actualizarCampoHc("codigoCie10", e.target.value)
                            }
                            placeholder="Ej. K02.1 (Caries de la dentina)"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Diagnóstico presuntivo o definitivo (CIE-10)
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.diagnostico}
                            onChange={(e) =>
                              actualizarCampoHc("diagnostico", e.target.value)
                            }
                            placeholder="Diagnóstico clínico según CIE-10"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Plan de tratamiento
                        </label>
                        <textarea
                          rows={3}
                          value={pacienteActivo.hc.planTratamiento}
                          onChange={(e) =>
                            actualizarCampoHc("planTratamiento", e.target.value)
                          }
                          placeholder="Secuencia de tratamientos y citas propuestas"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setMensajeGuardado(
                          "Cambios aplicados en la ficha clínica activa."
                        )
                      }
                      className="rounded-lg bg-slate-900 text-white px-4 py-2 text-xs font-medium hover:bg-slate-800"
                    >
                      Confirmar registro de esta sección
                    </button>
                  </div>
                </div>
              )}
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
