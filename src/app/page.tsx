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

type ColorMsp = "rojo" | "azul";
type EstadoColorDiente = "ninguno" | "realizado" | "por_realizar";
type CaraDiente = "O" | "V" | "L" | "M" | "D";

type TipoProcedimientoMsp =
  | "ninguno"
  | "caries"
  | "restauracion"
  | "sellante"
  | "extraccion_perdida_caries"
  | "perdida_otra_causa"
  | "endodoncia"
  | "protesis_fija"
  | "protesis_removible"
  | "protesis_total"
  | "corona";

interface SimboloAplicado {
  tipo: Exclude<TipoProcedimientoMsp, "ninguno">;
  color: ColorMsp;
}

interface EstadoPiezaMsp {
  O: EstadoColorDiente;
  V: EstadoColorDiente;
  L: EstadoColorDiente;
  M: EstadoColorDiente;
  D: EstadoColorDiente;
  simbolo: SimboloAplicado | null;
  movilidadRecesion: string;
  observacion: string;
}

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

  // 6. Exámenes complementarios, odontograma MSP y fotos
  examenesComplementarios: string;
  fotos: RegistroFoto[];
  piezaSeleccionada: string;
  procedimientoActivo: TipoProcedimientoMsp;
  colorMspActivo: ColorMsp;
  pincelEstado: EstadoColorDiente;
  odontogramaMsp: Record<string, EstadoPiezaMsp>;

  // 7. Diagnóstico CIE-10 y plan de tratamiento
  codigoCie10: string;
  diagnostico: string;
  planTratamiento: string;

  // 8. Odontograma y periodontograma
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

const PROCEDIMIENTOS_MSP: {
  id: Exclude<TipoProcedimientoMsp, "ninguno">;
  titulo: string;
  muestra: string;
  pintaCarasOclusal?: boolean;
}[] = [
  { id: "caries", titulo: "Caries", muestra: "●/○", pintaCarasOclusal: true },
  {
    id: "restauracion",
    titulo: "Restauración",
    muestra: "■/●",
    pintaCarasOclusal: true,
  },
  { id: "sellante", titulo: "Sellante", muestra: "*" },
  {
    id: "extraccion_perdida_caries",
    titulo: "Extracción / Pérdida por caries",
    muestra: "X",
  },
  {
    id: "perdida_otra_causa",
    titulo: "Pérdida (otra causa)",
    muestra: "⊗",
  },
  { id: "endodoncia", titulo: "Endodoncia", muestra: "△" },
  { id: "protesis_fija", titulo: "Prótesis fija", muestra: "o---o" },
  {
    id: "protesis_removible",
    titulo: "Prótesis removible",
    muestra: "(---)",
  },
  { id: "protesis_total", titulo: "Prótesis total", muestra: "=" },
  { id: "corona", titulo: "Corona", muestra: "▣" },
];

const PIEZAS_PERMANENTES_SUP = [
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

const PIEZAS_TEMPORALES_SUP = [
  "55",
  "54",
  "53",
  "52",
  "51",
  "61",
  "62",
  "63",
  "64",
  "65",
];

const PIEZAS_TEMPORALES_INF = [
  "85",
  "84",
  "83",
  "82",
  "81",
  "71",
  "72",
  "73",
  "74",
  "75",
];

const PIEZAS_PERMANENTES_INF = [
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

function piezaVacia(): EstadoPiezaMsp {
  return {
    O: "ninguno",
    V: "ninguno",
    L: "ninguno",
    M: "ninguno",
    D: "ninguno",
    simbolo: null,
    movilidadRecesion: "",
    observacion: "",
  };
}

function hexPorColorMsp(color: ColorMsp): string {
  return color === "azul" ? "#2563eb" : "#dc2626";
}

function estadoCaraPorColor(color: ColorMsp): EstadoColorDiente {
  return color === "azul" ? "realizado" : "por_realizar";
}

function fillPorEstado(estado: EstadoColorDiente): string {
  if (estado === "realizado") return "#2563eb";
  if (estado === "por_realizar") return "#dc2626";
  return "#ffffff";
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
    piezaSeleccionada: "16",
    procedimientoActivo: "ninguno",
    colorMspActivo: "rojo",
    pincelEstado: "por_realizar",
    odontogramaMsp: {},
    codigoCie10: "",
    diagnostico: "",
    planTratamiento: "",
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

function describirProcedimientoEnPieza(simbolo: SimboloAplicado | null): string {
  if (!simbolo) return "";
  const info = PROCEDIMIENTOS_MSP.find((p) => p.id === simbolo.tipo);
  if (!info) return "";
  const estadoTexto =
    simbolo.color === "azul" ? "Realizado (Azul)" : "Por realizar (Rojo)";
  return `${info.titulo} — ${estadoTexto}`;
}

function renderSimboloOverlay(simbolo: SimboloAplicado | null) {
  if (!simbolo) return null;
  const stroke = hexPorColorMsp(simbolo.color);

  switch (simbolo.tipo) {
    case "caries":
      return (
        <circle
          cx="22"
          cy="22"
          r="6"
          fill={stroke}
          stroke="#ffffff"
          strokeWidth="1.5"
          pointerEvents="none"
        />
      );
    case "restauracion":
      return (
        <rect
          x="16"
          y="16"
          width="12"
          height="12"
          rx="2"
          fill={stroke}
          stroke="#ffffff"
          strokeWidth="1.5"
          pointerEvents="none"
        />
      );
    case "sellante":
      return (
        <text
          x="22"
          y="28"
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill={stroke}
          pointerEvents="none"
        >
          *
        </text>
      );
    case "extraccion_perdida_caries":
      return (
        <g stroke={stroke} strokeWidth="3.2" pointerEvents="none">
          <line x1="8" y1="8" x2="36" y2="36" />
          <line x1="36" y1="8" x2="8" y2="36" />
        </g>
      );
    case "perdida_otra_causa":
      return (
        <g stroke={stroke} strokeWidth="2.5" fill="none" pointerEvents="none">
          <circle cx="22" cy="22" r="13" />
          <line x1="12" y1="12" x2="32" y2="32" />
          <line x1="32" y1="12" x2="12" y2="32" />
        </g>
      );
    case "endodoncia":
      return (
        <polygon
          points="22,8 36,34 8,34"
          fill="none"
          stroke={stroke}
          strokeWidth="2.8"
          pointerEvents="none"
        />
      );
    case "protesis_fija":
      return (
        <g stroke={stroke} strokeWidth="2.4" fill="none" pointerEvents="none">
          <circle cx="7" cy="22" r="3" />
          <line x1="11" y1="22" x2="33" y2="22" strokeDasharray="3 2" />
          <circle cx="37" cy="22" r="3" />
        </g>
      );
    case "protesis_removible":
      return (
        <g stroke={stroke} strokeWidth="2.4" fill="none" pointerEvents="none">
          <path d="M 10 10 Q 4 22 10 34" />
          <line x1="13" y1="22" x2="31" y2="22" strokeDasharray="3 2" />
          <path d="M 34 10 Q 40 22 34 34" />
        </g>
      );
    case "protesis_total":
      return (
        <g stroke={stroke} strokeWidth="3" pointerEvents="none">
          <line x1="8" y1="17" x2="36" y2="17" />
          <line x1="8" y1="27" x2="36" y2="27" />
        </g>
      );
    case "corona":
      return (
        <g stroke={stroke} strokeWidth="2.4" fill="none" pointerEvents="none">
          <rect x="8" y="8" width="28" height="28" />
          <rect x="14" y="14" width="16" height="16" />
        </g>
      );
    default:
      return null;
  }
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

  function seleccionarPiezaOdontograma(codigoPieza: string) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const piezaData = pac.hc.odontogramaMsp[codigoPieza];
        return {
          ...pac,
          hc: {
            ...pac.hc,
            piezaSeleccionada: codigoPieza,
            procedimientoActivo: piezaData?.simbolo?.tipo || "ninguno",
            colorMspActivo: piezaData?.simbolo?.color || pac.hc.colorMspActivo,
          },
        };
      })
    );
  }

  function seleccionarProcedimiento(
    procedimiento: Exclude<TipoProcedimientoMsp, "ninguno">
  ) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const pieza = pac.hc.piezaSeleccionada;
        const color = pac.hc.colorMspActivo;
        const actualPieza = pac.hc.odontogramaMsp[pieza] || piezaVacia();
        const estadoCara = estadoCaraPorColor(color);
        const esMismoProc = actualPieza.simbolo?.tipo === procedimiento;

        const siguienteSimbolo: SimboloAplicado | null = esMismoProc
          ? null
          : { tipo: procedimiento, color };

        const siguienteOclusal =
          procedimiento === "caries" || procedimiento === "restauracion"
            ? esMismoProc
              ? "ninguno"
              : estadoCara
            : actualPieza.O;

        return {
          ...pac,
          hc: {
            ...pac.hc,
            procedimientoActivo: esMismoProc ? "ninguno" : procedimiento,
            odontogramaMsp: {
              ...pac.hc.odontogramaMsp,
              [pieza]: {
                ...actualPieza,
                O: siguienteOclusal,
                simbolo: siguienteSimbolo,
              },
            },
          },
        };
      })
    );
  }

  function seleccionarColorYaplicarAutomaticamente(color: ColorMsp) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    const estadoPincel = estadoCaraPorColor(color);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const pieza = pac.hc.piezaSeleccionada;
        const proc = pac.hc.procedimientoActivo;
        const actualPieza = pac.hc.odontogramaMsp[pieza] || piezaVacia();

        const tipoFinal: Exclude<TipoProcedimientoMsp, "ninguno"> | null =
          proc !== "ninguno" ? proc : actualPieza.simbolo?.tipo || null;

        const simboloActualizado: SimboloAplicado | null = tipoFinal
          ? { tipo: tipoFinal, color }
          : null;

        const pintaOclusal =
          tipoFinal === "caries" || tipoFinal === "restauracion";

        const tieneAlgunaCaraMarcada =
          actualPieza.O !== "ninguno" ||
          actualPieza.V !== "ninguno" ||
          actualPieza.L !== "ninguno" ||
          actualPieza.M !== "ninguno" ||
          actualPieza.D !== "ninguno";

        const siguienteO =
          pintaOclusal || actualPieza.O !== "ninguno"
            ? estadoPincel
            : actualPieza.O;
        const siguienteV =
          actualPieza.V !== "ninguno" ? estadoPincel : actualPieza.V;
        const siguienteL =
          actualPieza.L !== "ninguno" ? estadoPincel : actualPieza.L;
        const siguienteM =
          actualPieza.M !== "ninguno" ? estadoPincel : actualPieza.M;
        const siguienteD =
          actualPieza.D !== "ninguno" ? estadoPincel : actualPieza.D;

        const actualizarCaras =
          pintaOclusal || tieneAlgunaCaraMarcada
            ? {
                O: siguienteO,
                V: siguienteV,
                L: siguienteL,
                M: siguienteM,
                D: siguienteD,
              }
            : {};

        return {
          ...pac,
          hc: {
            ...pac.hc,
            colorMspActivo: color,
            pincelEstado: estadoPincel,
            odontogramaMsp: {
              ...pac.hc.odontogramaMsp,
              [pieza]: {
                ...actualPieza,
                ...actualizarCaras,
                simbolo: simboloActualizado,
              },
            },
          },
        };
      })
    );
  }

  function limpiarRegistroPieza(pieza: string) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actualPieza = pac.hc.odontogramaMsp[pieza] || piezaVacia();
        return {
          ...pac,
          hc: {
            ...pac.hc,
            procedimientoActivo: "ninguno",
            odontogramaMsp: {
              ...pac.hc.odontogramaMsp,
              [pieza]: {
                ...actualPieza,
                O: "ninguno",
                V: "ninguno",
                L: "ninguno",
                M: "ninguno",
                D: "ninguno",
                simbolo: null,
              },
            },
          },
        };
      })
    );
  }

  function marcarCaraPieza(pieza: string, cara: CaraDiente) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actualPieza = pac.hc.odontogramaMsp[pieza] || piezaVacia();
        const estadoActual = actualPieza[cara];
        const siguienteEstado: EstadoColorDiente =
          estadoActual === pac.hc.pincelEstado ? "ninguno" : pac.hc.pincelEstado;

        const simboloAuto: SimboloAplicado | null =
          pac.hc.procedimientoActivo !== "ninguno"
            ? {
                tipo: pac.hc.procedimientoActivo,
                color: pac.hc.colorMspActivo,
              }
            : actualPieza.simbolo;

        return {
          ...pac,
          hc: {
            ...pac.hc,
            piezaSeleccionada: pieza,
            odontogramaMsp: {
              ...pac.hc.odontogramaMsp,
              [pieza]: {
                ...actualPieza,
                [cara]: siguienteEstado,
                simbolo: simboloAuto,
              },
            },
          },
        };
      })
    );
  }

  function marcarPiezaCompleta(pieza: string) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actualPieza = pac.hc.odontogramaMsp[pieza] || piezaVacia();
        const color = pac.hc.pincelEstado;
        return {
          ...pac,
          hc: {
            ...pac.hc,
            piezaSeleccionada: pieza,
            odontogramaMsp: {
              ...pac.hc.odontogramaMsp,
              [pieza]: {
                ...actualPieza,
                O: color,
                V: color,
                L: color,
                M: color,
                D: color,
              },
            },
          },
        };
      })
    );
  }

  function actualizarDatoPieza(
    pieza: string,
    campo: "movilidadRecesion" | "observacion",
    valor: string
  ) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actualPieza = pac.hc.odontogramaMsp[pieza] || piezaVacia();
        return {
          ...pac,
          hc: {
            ...pac.hc,
            odontogramaMsp: {
              ...pac.hc.odontogramaMsp,
              [pieza]: {
                ...actualPieza,
                [campo]: valor,
              },
            },
          },
        };
      })
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
          ? actuales.filter((item) => item
