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
  | "diagnostico"
  | "odontograma";

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
  genero: string;
  nacionalidad: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  correo: string;
  ocupacion: string;
  contactoAdicional: string;
  seguroConvenio: string;
  representanteLegal: string;

  // 2. Motivo de consulta y enfermedad actual
  motivoConsulta: string;
  enfermedadActual: string;
  noPresentaDolor: boolean;
  intensidadDolor: string;

  // 3. Antecedentes médicos generales
  enfermedadesSistemicas: string[];
  otrasEnfermedadesSistemicas: string;
  alergias: string;
  medicacionActual: string;
  cirugiasPrevias: string;
  antecedentesFamiliares: string;
  noRefiereHabitos: boolean;
  habitosGenerales: string;

  // 4. Antecedentes odontológicos
  tratamientosPrevios: string[];
  otrosTratamientosPrevios: string;
  frecuenciaVisitas: string;
  otraFrecuenciaVisitas: string;
  experienciasAnteriores: string;
  otraExperienciaAnterior: string;
  ansiedadDental: string;
  otraAnsiedadDental: string;
  higieneOral: string;
  otraHigieneOral: string;

  // 5. Signos vitales y examen clínico
  presionArterial: string;
  pulso: string;
  temperatura: string;
  frecuenciaRespiratoria: string;
  examenExtraoral: string[];
  detalleExamenExtraoral: string;
  examenIntraoral: string[];
  detalleExamenIntraoral: string;
  tejidosBlandos: string[];
  detalleTejidosBlandos: string;
  cpodCariados: string;
  cpodPerdidos: string;
  cpodObturados: string;
  oclusionLlaveAngle: string;
  detalleOclusionAngle: string;

  // 6. Exámenes complementarios y fotos
  examenesComplementarios: string;
  fotos: RegistroFoto[];

  // 7. Diagnóstico CIE-10 y plan de tratamiento
  codigoCie10: string;
  diagnostico: string;
  planTratamiento: string;

  // 8. Odontograma y periodontograma
  piezaSeleccionada: string;
  notasOdontograma: string;
  notasPeriodontograma: string;
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

const PAISES = [
  "Ecuador",
  "Colombia",
  "Perú",
  "Venezuela",
  "Argentina",
  "Bolivia",
  "Brasil",
  "Chile",
  "Costa Rica",
  "Cuba",
  "El Salvador",
  "España",
  "Estados Unidos",
  "Guatemala",
  "Honduras",
  "México",
  "Nicaragua",
  "Panamá",
  "Paraguay",
  "Puerto Rico",
  "República Dominicana",
  "Uruguay",
  "Alemania",
  "Canadá",
  "Francia",
  "Italia",
  "Reino Unido",
  "Otro país",
];

const OPCIONES_ENFERMEDADES = [
  "Diabetes",
  "Hipertensión arterial",
  "Asma",
  "Tuberculosis",
  "Cáncer",
  "VIH",
  "Otros",
];

const OPCIONES_TRATAMIENTOS_PREVIOS = [
  "Profilaxis / limpieza",
  "Resinas / obturaciones",
  "Endodoncia",
  "Exodoncia",
  "Prótesis / coronas",
  "Ortodoncia",
  "Blanqueamiento",
  "Ninguno",
  "Otros",
];

const OPCIONES_FRECUENCIA_VISITAS = [
  "Cada 6 meses",
  "Cada año",
  "Esporádica / irregular",
  "Solo cuando hay molestia o dolor",
  "Primera consulta",
  "Otros",
];

const OPCIONES_EXPERIENCIAS_ANTERIORES = [
  "Positivas / sin molestias",
  "Aceptables",
  "Negativas / dolorosas",
  "Primera experiencia",
  "Otros",
];

const OPCIONES_ANSIEDAD_DENTAL = [
  "Ninguna",
  "Baja",
  "Moderada",
  "Alta",
  "Otros",
];

const OPCIONES_HIGIENE_ORAL = [
  "Buena (cepillado e hilo dental)",
  "Regular (solo cepillado)",
  "Deficiente",
  "Otros",
];

const OPCIONES_EXAMEN_EXTRAORAL = [
  "Sin alteraciones aparentes",
  "Asimetría facial",
  "Alteración en ATM (ruidos, dolor o limitación)",
  "Adenopatías / ganglios palpables",
  "Lesión cutánea o en labios",
  "Otros",
];

const OPCIONES_EXAMEN_INTRAORAL = [
  "Sin alteraciones aparentes",
  "Caries dental visible",
  "Restauraciones desadaptadas o filtradas",
  "Cálculo dental / placa abundante",
  "Desgaste dental / atrición / erosión",
  "Edentulismo parcial o total",
  "Otros",
];

const OPCIONES_TEJIDOS_BLANDOS = [
  "Normales / sin patología",
  "Gingivitis / inflamación gingival",
  "Úlcera / afta",
  "Lesión en lengua",
  "Lesión en mucosa yugal o paladar",
  "Alteración en piso de boca",
  "Otros",
];

const OPCIONES_OCLUSION_ANGLE = [
  "Clase I de Angle",
  "Clase II División 1",
  "Clase II División 2",
  "Clase III de Angle",
  "Borde a borde",
  "Mordida abierta",
  "Mordida cruzada",
  "No valorable / edéntulo",
  "Otros",
];

const PIEZAS_FDI_SUPERIOR = [
  "18",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
];

const PIEZAS_FDI_INFERIOR = [
  "48",
  "47",
  "46",
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
];

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
    genero: "",
    nacionalidad: "Ecuador",
    direccion: "",
    ciudad: "",
    telefono: telefonoInicial,
    correo: "",
    ocupacion: "",
    contactoAdicional: "",
    seguroConvenio: "",
    representanteLegal: "",
    motivoConsulta: "",
    enfermedadActual: "",
    noPresentaDolor: false,
    intensidadDolor: "",
    enfermedadesSistemicas: [],
    otrasEnfermedadesSistemicas: "",
    alergias: "",
    medicacionActual: "",
    cirugiasPrevias: "",
    antecedentesFamiliares: "",
    noRefiereHabitos: false,
    habitosGenerales: "",
    tratamientosPrevios: [],
    otrosTratamientosPrevios: "",
    frecuenciaVisitas: "",
    otraFrecuenciaVisitas: "",
    experienciasAnteriores: "",
    otraExperienciaAnterior: "",
    ansiedadDental: "",
    otraAnsiedadDental: "",
    higieneOral: "",
    otraHigieneOral: "",
    presionArterial: "",
    pulso: "",
    temperatura: "",
    frecuenciaRespiratoria: "",
    examenExtraoral: [],
    detalleExamenExtraoral: "",
    examenIntraoral: [],
    detalleExamenIntraoral: "",
    tejidosBlandos: [],
    detalleTejidosBlandos: "",
    cpodCariados: "",
    cpodPerdidos: "",
    cpodObturados: "",
    oclusionLlaveAngle: "",
    detalleOclusionAngle: "",
    examenesComplementarios: "",
    fotos: [],
    codigoCie10: "",
    diagnostico: "",
    planTratamiento: "",
    piezaSeleccionada: "11",
    notasOdontograma: "",
    notasPeriodontograma: "",
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

function calcularTotalCpod(hc: HistoriaClinicaCompleta): number {
  const c = parseInt(hc.cpodCariados || "0", 10) || 0;
  const p = parseInt(hc.cpodPerdidos || "0", 10) || 0;
  const o = parseInt(hc.cpodObturados || "0", 10) || 0;
  return Math.max(0, c) + Math.max(0, p) + Math.max(0, o);
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
        genero: "Otro",
        nacionalidad: "Ecuador",
        ciudad: "Quito",
        seguroConvenio: "Particular",
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

  function toggleNoPresentaDolor() {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const nuevoEstado = !pac.hc.noPresentaDolor;
        return {
          ...pac,
          hc: {
            ...pac.hc,
            noPresentaDolor: nuevoEstado,
            intensidadDolor: nuevoEstado ? "0" : "",
          },
        };
      })
    );
  }

  function toggleNoRefiereHabitos() {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const nuevoEstado = !pac.hc.noRefiereHabitos;
        return {
          ...pac,
          hc: {
            ...pac.hc,
            noRefiereHabitos: nuevoEstado,
            habitosGenerales: nuevoEstado
              ? "Refiere no tener hábitos"
              : pac.hc.habitosGenerales === "Refiere no tener hábitos"
              ? ""
              : pac.hc.habitosGenerales,
          },
        };
      })
    );
  }

  function toggleEnfermedadSistemica(enfermedad: string) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actuales = pac.hc.enfermedadesSistemicas || [];
        const existe = actuales.includes(enfermedad);
        const siguientes = existe
          ? actuales.filter((item) => item !== enfermedad)
          : [...actuales, enfermedad];

        return {
          ...pac,
          hc: {
            ...pac.hc,
            enfermedadesSistemicas: siguientes,
            otrasEnfermedadesSistemicas:
              enfermedad === "Otros" && existe
                ? ""
                : pac.hc.otrasEnfermedadesSistemicas,
          },
        };
      })
    );
  }

  function toggleTratamientoPrevio(tratamiento: string) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actuales = pac.hc.tratamientosPrevios || [];
        const existe = actuales.includes(tratamiento);
        const siguientes = existe
          ? actuales.filter((item) => item !== tratamiento)
          : [...actuales, tratamiento];

        return {
          ...pac,
          hc: {
            ...pac.hc,
            tratamientosPrevios: siguientes,
            otrosTratamientosPrevios:
              tratamiento === "Otros" && existe
                ? ""
                : pac.hc.otrosTratamientosPrevios,
          },
        };
      })
    );
  }

  function toggleChecklistClinico(
    campoLista: "examenExtraoral" | "examenIntraoral" | "tejidosBlandos",
    campoDetalle:
      | "detalleExamenExtraoral"
      | "detalleExamenIntraoral"
      | "detalleTejidosBlandos",
    opcion: string
  ) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actuales = pac.hc[campoLista] || [];
        const existe = actuales.includes(opcion);
        const siguientes = existe
          ? actuales.filter((item) => item !== opcion)
          : [...actuales, opcion];

        return {
          ...pac,
          hc: {
            ...pac.hc,
            [campoLista]: siguientes,
            [campoDetalle]:
              opcion === "Otros" && existe ? "" : pac.hc[campoDetalle],
          },
        };
      })
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
    { id: "odontograma", titulo: "8. Odontograma y periodontograma" },
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
                          Género
                        </label>
                        <select
                          value={pacienteActivo.hc.genero}
                          onChange={(e) =>
                            actualizarCampoHc("genero", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar género</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Nacionalidad
                        </label>
                        <select
                          value={pacienteActivo.hc.nacionalidad}
                          onChange={(e) =>
                            actualizarCampoHc("nacionalidad", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar país</option>
                          {PAISES.map((pais) => (
                            <option key={pais} value={pais}>
                              {pais}
                            </option>
                          ))}
                        </select>
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

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.ciudad}
                          onChange={(e) =>
                            actualizarCampoHc("ciudad", e.target.value)
                          }
                          placeholder="Ciudad de residencia"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Dirección o sector
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.direccion}
                          onChange={(e) =>
                            actualizarCampoHc("direccion", e.target.value)
                          }
                          placeholder="Calle, sector, referencia"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Contacto adicional
                        </label>
                        <input
                          type="text"
                          value={pacienteActivo.hc.contactoAdicional}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "contactoAdicional",
                              e.target.value
                            )
                          }
                          placeholder="Nombre y teléfono de contacto adicional"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Seguro o convenio médico
                        </label>
                        <select
                          value={pacienteActivo.hc.seguroConvenio}
                          onChange={(e) =>
                            actualizarCampoHc("seguroConvenio", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar opción</option>
                          <option value="Particular">Particular</option>
                          <option value="Seguro">Seguro</option>
                          <option value="Convenio">Convenio</option>
                        </select>
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

                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="block text-xs font-medium text-slate-600">
                            Intensidad del dolor / molestia (1 al 10)
                          </label>
                          <label className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pacienteActivo.hc.noPresentaDolor}
                              onChange={toggleNoPresentaDolor}
                              className="rounded border-slate-300"
                            />
                            <span>No presenta dolor</span>
                          </label>
                        </div>

                        <select
                          disabled={pacienteActivo.hc.noPresentaDolor}
                          value={
                            pacienteActivo.hc.noPresentaDolor
                              ? ""
                              : pacienteActivo.hc.intensidadDolor
                          }
                          onChange={(e) =>
                            actualizarCampoHc("intensidadDolor", e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                        >
                          <option value="">
                            {pacienteActivo.hc.noPresentaDolor
                              ? "No presenta dolor"
                              : "Seleccionar nivel (1 a 10)"}
                          </option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((nivel) => (
                            <option key={nivel} value={String(nivel)}>
                              {nivel}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {seccionHc === "medicos" && (
                    <div className="space-y-4 text-sm">
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Enfermedades sistémicas (seleccione una o varias)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {OPCIONES_ENFERMEDADES.map((enf) => {
                            const marcada =
                              pacienteActivo.hc.enfermedadesSistemicas.includes(
                                enf
                              );
                            return (
                              <label
                                key={enf}
                                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={marcada}
                                  onChange={() =>
                                    toggleEnfermedadSistemica(enf)
                                  }
                                  className="rounded border-slate-300"
                                />
                                <span>{enf}</span>
                              </label>
                            );
                          })}
                        </div>

                        {pacienteActivo.hc.enfermedadesSistemicas.includes(
                          "Otros"
                        ) && (
                          <div className="pt-1">
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Especificar otras enfermedades sistémicas
                            </label>
                            <input
                              type="text"
                              value={
                                pacienteActivo.hc.otrasEnfermedadesSistemicas
                              }
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "otrasEnfermedadesSistemicas",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba cuál es la enfermedad..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
                              actualizarCampoHc(
                                "medicacionActual",
                                e.target.value
                              )
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
                              actualizarCampoHc(
                                "cirugiasPrevias",
                                e.target.value
                              )
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

                        <div className="sm:col-span-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-xs font-medium text-slate-600">
                              Hábitos (tabaquismo, alcoholismo, etc.)
                            </label>
                            <label className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pacienteActivo.hc.noRefiereHabitos}
                                onChange={toggleNoRefiereHabitos}
                                className="rounded border-slate-300"
                              />
                              <span>Refiere no tener hábitos</span>
                            </label>
                          </div>

                          <input
                            type="text"
                            disabled={pacienteActivo.hc.noRefiereHabitos}
                            value={pacienteActivo.hc.habitosGenerales}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "habitosGenerales",
                                e.target.value
                              )
                            }
                            placeholder="Tabaquismo, alcohol, otros hábitos"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {seccionHc === "odontologicos" && (
                    <div className="space-y-4 text-sm">
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Tratamientos odontológicos previos
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {OPCIONES_TRATAMIENTOS_PREVIOS.map((trat) => {
                            const marcado =
                              pacienteActivo.hc.tratamientosPrevios.includes(
                                trat
                              );
                            return (
                              <label
                                key={trat}
                                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={marcado}
                                  onChange={() =>
                                    toggleTratamientoPrevio(trat)
                                  }
                                  className="rounded border-slate-300"
                                />
                                <span>{trat}</span>
                              </label>
                            );
                          })}
                        </div>

                        {pacienteActivo.hc.tratamientosPrevios.includes(
                          "Otros"
                        ) && (
                          <div className="pt-1">
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Especificar otros tratamientos previos
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.otrosTratamientosPrevios}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "otrosTratamientosPrevios",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba a qué tratamientos se refiere..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                          <label className="block text-xs font-medium text-slate-600">
                            Frecuencia de visitas al odontólogo
                          </label>
                          <select
                            value={pacienteActivo.hc.frecuenciaVisitas}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "frecuenciaVisitas",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Seleccionar opción</option>
                            {OPCIONES_FRECUENCIA_VISITAS.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                          {pacienteActivo.hc.frecuenciaVisitas === "Otros" && (
                            <input
                              type="text"
                              value={pacienteActivo.hc.otraFrecuenciaVisitas}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "otraFrecuenciaVisitas",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba a qué se refiere..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          )}
                        </div>

                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                          <label className="block text-xs font-medium text-slate-600">
                            Experiencias anteriores
                          </label>
                          <select
                            value={pacienteActivo.hc.experienciasAnteriores}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "experienciasAnteriores",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Seleccionar opción</option>
                            {OPCIONES_EXPERIENCIAS_ANTERIORES.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                          {pacienteActivo.hc.experienciasAnteriores ===
                            "Otros" && (
                            <input
                              type="text"
                              value={pacienteActivo.hc.otraExperienciaAnterior}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "otraExperienciaAnterior",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba a qué se refiere..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          )}
                        </div>

                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                          <label className="block text-xs font-medium text-slate-600">
                            Nivel de ansiedad dental
                          </label>
                          <select
                            value={pacienteActivo.hc.ansiedadDental}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "ansiedadDental",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Seleccionar opción</option>
                            {OPCIONES_ANSIEDAD_DENTAL.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                          {pacienteActivo.hc.ansiedadDental === "Otros" && (
                            <input
                              type="text"
                              value={pacienteActivo.hc.otraAnsiedadDental}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "otraAnsiedadDental",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba a qué se refiere..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          )}
                        </div>

                        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                          <label className="block text-xs font-medium text-slate-600">
                            Higiene oral habitual
                          </label>
                          <select
                            value={pacienteActivo.hc.higieneOral}
                            onChange={(e) =>
                              actualizarCampoHc("higieneOral", e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Seleccionar opción</option>
                            {OPCIONES_HIGIENE_ORAL.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                          {pacienteActivo.hc.higieneOral === "Otros" && (
                            <input
                              type="text"
                              value={pacienteActivo.hc.otraHigieneOral}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "otraHigieneOral",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba a qué se refiere..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {seccionHc === "clinico" && (
                    <div className="space-y-4 text-sm">
                      {/* Signos vitales (solo PA, Pulso, Temperatura, FR) */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                            Temperatura
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.temperatura}
                            onChange={(e) =>
                              actualizarCampoHc("temperatura", e.target.value)
                            }
                            placeholder="Ej. 36.6 °C"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Frecuencia respiratoria
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.frecuenciaRespiratoria}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "frecuenciaRespiratoria",
                                e.target.value
                              )
                            }
                            placeholder="Ej. 16 rpm"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      {/* Examen extraoral (checks + detalle en Otros) */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Examen extraoral
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {OPCIONES_EXAMEN_EXTRAORAL.map((op) => {
                            const marcada =
                              pacienteActivo.hc.examenExtraoral.includes(op);
                            return (
                              <label
                                key={op}
                                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={marcada}
                                  onChange={() =>
                                    toggleChecklistClinico(
                                      "examenExtraoral",
                                      "detalleExamenExtraoral",
                                      op
                                    )
                                  }
                                  className="rounded border-slate-300"
                                />
                                <span>{op}</span>
                              </label>
                            );
                          })}
                        </div>
                        {pacienteActivo.hc.examenExtraoral.includes(
                          "Otros"
                        ) && (
                          <div className="pt-1">
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Detallar examen extraoral (Otros)
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.detalleExamenExtraoral}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "detalleExamenExtraoral",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba los hallazgos extraorales..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* Examen intraoral (checks + detalle en Otros) */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Examen intraoral
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {OPCIONES_EXAMEN_INTRAORAL.map((op) => {
                            const marcada =
                              pacienteActivo.hc.examenIntraoral.includes(op);
                            return (
                              <label
                                key={op}
                                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={marcada}
                                  onChange={() =>
                                    toggleChecklistClinico(
                                      "examenIntraoral",
                                      "detalleExamenIntraoral",
                                      op
                                    )
                                  }
                                  className="rounded border-slate-300"
                                />
                                <span>{op}</span>
                              </label>
                            );
                          })}
                        </div>
                        {pacienteActivo.hc.examenIntraoral.includes(
                          "Otros"
                        ) && (
                          <div className="pt-1">
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Detallar examen intraoral (Otros)
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.detalleExamenIntraoral}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "detalleExamenIntraoral",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba los hallazgos intraorales..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* Tejidos blandos (checks + detalle en Otros) */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Tejidos blandos
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {OPCIONES_TEJIDOS_BLANDOS.map((op) => {
                            const marcada =
                              pacienteActivo.hc.tejidosBlandos.includes(op);
                            return (
                              <label
                                key={op}
                                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={marcada}
                                  onChange={() =>
                                    toggleChecklistClinico(
                                      "tejidosBlandos",
                                      "detalleTejidosBlandos",
                                      op
                                    )
                                  }
                                  className="rounded border-slate-300"
                                />
                                <span>{op}</span>
                              </label>
                            );
                          })}
                        </div>
                        {pacienteActivo.hc.tejidosBlandos.includes("Otros") && (
                          <div className="pt-1">
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Detallar tejidos blandos (Otros)
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.detalleTejidosBlandos}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "detalleTejidosBlandos",
                                  e.target.value
                                )
                              }
                              placeholder="Escriba los hallazgos en tejidos blandos..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* Cuadro para Índice CPOD */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Índice CPOD
                          </label>
                          <span className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                            Total CPOD: {calcularTotalCpod(pacienteActivo.hc)}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse bg-white rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700">
                                <th className="border border-slate-200 px-3 py-2 text-center">
                                  C (Cariados)
                                </th>
                                <th className="border border-slate-200 px-3 py-2 text-center">
                                  P (Perdidos)
                                </th>
                                <th className="border border-slate-200 px-3 py-2 text-center">
                                  O (Obturados)
                                </th>
                                <th className="border border-slate-200 px-3 py-2 text-center">
                                  Total CPOD
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-slate-200 p-2 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    value={pacienteActivo.hc.cpodCariados}
                                    onChange={(e) =>
                                      actualizarCampoHc(
                                        "cpodCariados",
                                        e.target.value
                                      )
                                    }
                                    placeholder="0"
                                    className="w-20 text-center rounded border border-slate-300 px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="border border-slate-200 p-2 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    value={pacienteActivo.hc.cpodPerdidos}
                                    onChange={(e) =>
                                      actualizarCampoHc(
                                        "cpodPerdidos",
                                        e.target.value
                                      )
                                    }
                                    placeholder="0"
                                    className="w-20 text-center rounded border border-slate-300 px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="border border-slate-200 p-2 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    value={pacienteActivo.hc.cpodObturados}
                                    onChange={(e) =>
                                      actualizarCampoHc(
                                        "cpodObturados",
                                        e.target.value
                                      )
                                    }
                                    placeholder="0"
                                    className="w-20 text-center rounded border border-slate-300 px-2 py-1 text-sm"
                                  />
                                </td>
                                <td className="border border-slate-200 p-2 text-center font-semibold text-slate-900">
                                  {calcularTotalCpod(pacienteActivo.hc)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Oclusión / Llave de Angle (lista desplegable + detalle en Otros) */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
                        <label className="block text-xs font-medium text-slate-600">
                          Oclusión / Llave de Angle
                        </label>
                        <select
                          value={pacienteActivo.hc.oclusionLlaveAngle}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "oclusionLlaveAngle",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar clasificación</option>
                          {OPCIONES_OCLUSION_ANGLE.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                        {pacienteActivo.hc.oclusionLlaveAngle === "Otros" && (
                          <input
                            type="text"
                            value={pacienteActivo.hc.detalleOclusionAngle}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "detalleOclusionAngle",
                                e.target.value
                              )
                            }
                            placeholder="Detallar clasificación o relación oclusal..."
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        )}
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

                  {seccionHc === "odontograma" && (
                    <div className="space-y-4 text-sm">
                      {/* Selector rápido de pieza FDI */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Odontograma — Pieza seleccionada: #
                            {pacienteActivo.hc.piezaSeleccionada}
                          </label>
                          <span className="text-xs text-slate-500">
                            Toque una pieza para enfocar el registro
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[11px] font-medium text-slate-500">
                            Arcada superior (18–28)
                          </p>
                          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                            {PIEZAS_FDI_SUPERIOR.map((pieza) => (
                              <button
                                key={pieza}
                                type="button"
                                onClick={() =>
                                  actualizarCampoHc("piezaSeleccionada", pieza)
                                }
                                className={`rounded border py-1.5 text-xs font-medium ${
                                  pacienteActivo.hc.piezaSeleccionada === pieza
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                                }`}
                              >
                                {pieza}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <p className="text-[11px] font-medium text-slate-500">
                            Arcada inferior (48–38)
                          </p>
                          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1">
                            {PIEZAS_FDI_INFERIOR.map((pieza) => (
                              <button
                                key={pieza}
                                type="button"
                                onClick={() =>
                                  actualizarCampoHc("piezaSeleccionada", pieza)
                                }
                                className={`rounded border py-1.5 text-xs font-medium ${
                                  pacienteActivo.hc.piezaSeleccionada === pieza
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                                }`}
                              >
                                {pieza}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Registro del odontograma (estado actual, patologías y
                            tratamientos)
                          </label>
                          <textarea
                            rows={4}
                            value={pacienteActivo.hc.notasOdontograma}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "notasOdontograma",
                                e.target.value
                              )
                            }
                            placeholder={`Ej. Pieza #${pacienteActivo.hc.piezaSeleccionada}: caries oclusal / restauración / ausencia...`}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      {/* Periodontograma */}
                      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Periodontograma
                        </label>
                        <textarea
                          rows={4}
                          value={pacienteActivo.hc.notasPeriodontograma}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "notasPeriodontograma",
                              e.target.value
                            )
                          }
                          placeholder="Profundidad de sondaje, sangrado al sondaje, movilidad dental, margen gingival..."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
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
