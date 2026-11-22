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
  | "corona"
  | "implante"
  | "ortodoncia";

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
  simbolos: SimboloAplicado[];
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
  piezasSeleccionadas: string[];
  carasSeleccionadas: CaraDiente[];
  procedimientoActivo: TipoProcedimientoMsp;
  colorCaries: ColorMsp;
  colorRestauracion: ColorMsp;
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
}[] = [
  { id: "caries", titulo: "Caries", muestra: "●" },
  { id: "restauracion", titulo: "Restauración", muestra: "■" },
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
  { id: "implante", titulo: "Implante", muestra: "⊥" },
  { id: "ortodoncia", titulo: "Ortodoncia", muestra: "⊞" },
];

const SIMBOLOS_SECUNDARIOS_MSP = PROCEDIMIENTOS_MSP.filter(
  (p) => p.id !== "caries" && p.id !== "restauracion"
);

const SUP_DER_PERM = ["18", "17", "16", "15", "14", "13", "12", "11"];
const SUP_IZQ_PERM = ["21", "22", "23", "24", "25", "26", "27", "28"];

const SUP_DER_TEMP = ["55", "54", "53", "52", "51"];
const SUP_IZQ_TEMP = ["61", "62", "63", "64", "65"];

const INF_DER_TEMP = ["85", "84", "83", "82", "81"];
const INF_IZQ_TEMP = ["71", "72", "73", "74", "75"];

const INF_DER_PERM = ["48", "47", "46", "45", "44", "43", "42", "41"];
const INF_IZQ_PERM = ["31", "32", "33", "34", "35", "36", "37", "38"];

const LINEA_DIAGRAMA_TENUE = "#94a3b8";

function esPiezaTemporal(codigoPieza: string): boolean {
  return (
    codigoPieza.startsWith("5") ||
    codigoPieza.startsWith("6") ||
    codigoPieza.startsWith("7") ||
    codigoPieza.startsWith("8")
  );
}

function esCuadranteDerecho(codigoPieza: string): boolean {
  return (
    codigoPieza.startsWith("1") ||
    codigoPieza.startsWith("4") ||
    codigoPieza.startsWith("5") ||
    codigoPieza.startsWith("8")
  );
}

function esArcadaSuperior(codigoPieza: string): boolean {
  return (
    codigoPieza.startsWith("1") ||
    codigoPieza.startsWith("2") ||
    codigoPieza.startsWith("5") ||
    codigoPieza.startsWith("6")
  );
}

function esSimboloExterno(
  tipo: Exclude<TipoProcedimientoMsp, "ninguno">
): boolean {
  return tipo === "endodoncia" || tipo === "implante" || tipo === "ortodoncia";
}

function esProcedimientoConCaras(
  tipo: TipoProcedimientoMsp
): tipo is "caries" | "restauracion" {
  return tipo === "caries" || tipo === "restauracion";
}

function esPiezaPerdidaRealizada(simbolos: SimboloAplicado[]): boolean {
  return (simbolos || []).some(
    (s) =>
      s.color === "azul" &&
      (s.tipo === "extraccion_perdida_caries" ||
        s.tipo === "perdida_otra_causa")
  );
}

function carasPorPieza(codigoPieza: string): {
  arriba: CaraDiente;
  abajo: CaraDiente;
  izq: CaraDiente;
  der: CaraDiente;
} {
  const superior = esArcadaSuperior(codigoPieza);
  const derecho = esCuadranteDerecho(codigoPieza);

  return {
    arriba: superior ? "V" : "L",
    abajo: superior ? "L" : "V",
    izq: derecho ? "M" : "D",
    der: derecho ? "D" : "M",
  };
}

function piezaVacia(): EstadoPiezaMsp {
  return {
    O: "ninguno",
    V: "ninguno",
    L: "ninguno",
    M: "ninguno",
    D: "ninguno",
    simbolos: [],
    movilidadRecesion: "",
    observacion: "",
  };
}

function hexPorColorMsp(color: ColorMsp): string {
  return color === "azul" ? "#3b82f6" : "#ef4444";
}

function estadoCaraPorColor(color: ColorMsp): EstadoColorDiente {
  return color === "azul" ? "realizado" : "por_realizar";
}

function fillPorEstado(estado: EstadoColorDiente): string {
  if (estado === "realizado") return "#93c5fd";
  if (estado === "por_realizar") return "#fca5a5";
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
    piezaSeleccionada: "",
    piezasSeleccionadas: [],
    carasSeleccionadas: [],
    procedimientoActivo: "ninguno",
    colorCaries: "rojo",
    colorRestauracion: "azul",
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

function describirProcedimientosEnPieza(simbolos: SimboloAplicado[]): string {
  if (!simbolos || simbolos.length === 0) return "";
  return simbolos
    .map((sim) => {
      const info = PROCEDIMIENTOS_MSP.find((p) => p.id === sim.tipo);
      if (!info) return "";
      const estadoTexto = sim.color === "azul" ? "Realizado" : "Por realizar";
      return `${info.titulo} (${estadoTexto})`;
    })
    .filter(Boolean)
    .join(" + ");
}

function renderFiguraSimbolo(
  tipo: Exclude<TipoProcedimientoMsp, "ninguno">,
  color: ColorMsp
) {
  const stroke = hexPorColorMsp(color);

  switch (tipo) {
    case "caries":
    case "restauracion":
      return null;
    case "sellante":
      return (
        <g pointerEvents="none">
          <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round">
            <line x1="22" y1="6" x2="22" y2="38" />
            <line x1="8.1" y1="14" x2="35.9" y2="30" />
            <line x1="35.9" y1="14" x2="8.1" y2="30" />
          </g>
          <g stroke={stroke} strokeWidth="3.5" strokeLinecap="round">
            <line x1="22" y1="6" x2="22" y2="38" />
            <line x1="8.1" y1="14" x2="35.9" y2="30" />
            <line x1="35.9" y1="14" x2="8.1" y2="30" />
          </g>
        </g>
      );
    case "extraccion_perdida_caries":
      return (
        <g pointerEvents="none">
          <g stroke="#ffffff" strokeWidth="6.2" strokeLinecap="round">
            <line x1="6" y1="6" x2="38" y2="38" />
            <line x1="38" y1="6" x2="6" y2="38" />
          </g>
          <g stroke={stroke} strokeWidth="3.6" strokeLinecap="round">
            <line x1="6" y1="6" x2="38" y2="38" />
            <line x1="38" y1="6" x2="6" y2="38" />
          </g>
        </g>
      );
    case "perdida_otra_causa":
      return (
        <g fill="none" pointerEvents="none">
          <g stroke="#ffffff" strokeWidth="5.8" strokeLinecap="round">
            <circle cx="22" cy="22" r="15.5" />
            <line x1="11" y1="11" x2="33" y2="33" />
            <line x1="33" y1="11" x2="11" y2="33" />
          </g>
          <g stroke={stroke} strokeWidth="3.2" strokeLinecap="round">
            <circle cx="22" cy="22" r="15.5" />
            <line x1="11" y1="11" x2="33" y2="33" />
            <line x1="33" y1="11" x2="11" y2="33" />
          </g>
        </g>
      );
    case "endodoncia":
      return (
        <polygon
          points="22,4 40,39 4,39"
          fill="#ffffff"
          fillOpacity="0.85"
          stroke={stroke}
          strokeWidth="4"
          strokeLinejoin="round"
          pointerEvents="none"
        />
      );
    case "protesis_fija":
      return (
        <g fill="none" pointerEvents="none">
          <g stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round">
            <circle cx="6" cy="22" r="3.6" />
            <line x1="10" y1="22" x2="34" y2="22" />
            <circle cx="38" cy="22" r="3.6" />
          </g>
          <g stroke={stroke} strokeWidth="3" strokeLinecap="round">
            <circle cx="6" cy="22" r="3.6" />
            <line x1="10" y1="22" x2="34" y2="22" strokeDasharray="3 2" />
            <circle cx="38" cy="22" r="3.6" />
          </g>
        </g>
      );
    case "protesis_removible":
      return (
        <g fill="none" pointerEvents="none">
          <g stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round">
            <path d="M 9 8 Q 3 22 9 36" />
            <line x1="12" y1="22" x2="32" y2="22" />
            <path d="M 35 8 Q 41 22 35 36" />
          </g>
          <g stroke={stroke} strokeWidth="3" strokeLinecap="round">
            <path d="M 9 8 Q 3 22 9 36" />
            <line x1="12" y1="22" x2="32" y2="22" strokeDasharray="3 2" />
            <path d="M 35 8 Q 41 22 35 36" />
          </g>
        </g>
      );
    case "protesis_total":
      return (
        <g pointerEvents="none">
          <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round">
            <line x1="5" y1="16" x2="39" y2="16" />
            <line x1="5" y1="28" x2="39" y2="28" />
          </g>
          <g stroke={stroke} strokeWidth="3.5" strokeLinecap="round">
            <line x1="5" y1="16" x2="39" y2="16" />
            <line x1="5" y1="28" x2="39" y2="28" />
          </g>
        </g>
      );
    case "corona":
      return (
        <g fill="none" pointerEvents="none">
          <g stroke="#ffffff" strokeWidth="5.5">
            <rect x="5" y="5" width="34" height="34" />
            <rect x="12" y="12" width="20" height="20" />
          </g>
          <g stroke={stroke} strokeWidth="3">
            <rect x="5" y="5" width="34" height="34" />
            <rect x="12" y="12" width="20" height="20" />
          </g>
        </g>
      );
    case "implante":
      return (
        <g fill="none" pointerEvents="none">
          <line
            x1="22"
            y1="6"
            x2="22"
            y2="38"
            stroke="#ffffff"
            strokeWidth="6"
          />
          <line
            x1="22"
            y1="6"
            x2="22"
            y2="38"
            stroke={stroke}
            strokeWidth="3.3"
          />
          <line
            x1="10"
            y1="38"
            x2="34"
            y2="38"
            stroke={stroke}
            strokeWidth="3.3"
          />
          <line
            x1="15"
            y1="15"
            x2="29"
            y2="15"
            stroke={stroke}
            strokeWidth="3.3"
          />
          <line
            x1="15"
            y1="23"
            x2="29"
            y2="23"
            stroke={stroke}
            strokeWidth="3.3"
          />
        </g>
      );
    case "ortodoncia":
      return (
        <g fill="none" pointerEvents="none">
          <rect
            x="10"
            y="10"
            width="24"
            height="24"
            rx="2"
            fill="#ffffff"
            fillOpacity="0.85"
            stroke={stroke}
            strokeWidth="3"
          />
          <line x1="2" y1="22" x2="10" y2="22" stroke={stroke} strokeWidth="3" />
          <line
            x1="34"
            y1="22"
            x2="42"
            y2="22"
            stroke={stroke}
            strokeWidth="3"
          />
          <line
            x1="22"
            y1="10"
            x2="22"
            y2="34"
            stroke={stroke}
            strokeWidth="3"
          />
          <line
            x1="10"
            y1="22"
            x2="34"
            y2="22"
            stroke={stroke}
            strokeWidth="3"
          />
        </g>
      );
    default:
      return null;
  }
}

function renderSimbolosInternos(simbolos: SimboloAplicado[]) {
  const internos = (simbolos || []).filter(
    (s) => !esSimboloExterno(s.tipo) && !esProcedimientoConCaras(s.tipo)
  );
  if (internos.length === 0) return null;

  return (
    <g pointerEvents="none">
      {internos.map((sim, idx) => (
        <g
          key={`${sim.tipo}-${sim.color}-${idx}`}
          transform={
            internos.length > 1
              ? `translate(${(idx - (internos.length - 1) / 2) * 3}, ${
                  (idx - (internos.length - 1) / 2) * 2
                }) scale(0.85) translate(3, 3)`
              : undefined
          }
        >
          {renderFiguraSimbolo(sim.tipo, sim.color)}
        </g>
      ))}
    </g>
  );
}

function renderMarcadoresExternosPieza(
  simbolos: SimboloAplicado[],
  superior: boolean
) {
  const externos = (simbolos || []).filter((s) => esSimboloExterno(s.tipo));
  if (externos.length === 0) {
    return <div className="h-5" aria-hidden="true" />;
  }

  return (
    <div
      className={`min-h-5 flex items-center justify-center gap-0.5 ${
        superior ? "mb-0.5" : "mt-0.5"
      }`}
      title={describirProcedimientosEnPieza(externos)}
    >
      {externos.map((sim, idx) => (
        <svg
          key={`${sim.tipo}-${sim.color}-${idx}`}
          viewBox="0 0 44 44"
          className="w-3.5 h-3.5 pointer-events-none shrink-0"
        >
          {renderFiguraSimbolo(sim.tipo, sim.color)}
        </svg>
      ))}
    </div>
  );
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

  function seleccionarColorMsp(color: ColorMsp) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        return {
          ...pac,
          hc: {
            ...pac.hc,
            colorMspActivo: color,
            pincelEstado: estadoCaraPorColor(color),
            colorCaries:
              pac.hc.procedimientoActivo === "caries"
                ? color
                : pac.hc.colorCaries,
            colorRestauracion:
              pac.hc.procedimientoActivo === "restauracion"
                ? color
                : pac.hc.colorRestauracion,
          },
        };
      })
    );
  }

  function cambiarColorCarieORestauracion(
    tipo: "caries" | "restauracion",
    color: ColorMsp
  ) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        return {
          ...pac,
          hc: {
            ...pac.hc,
            colorCaries: tipo === "caries" ? color : pac.hc.colorCaries,
            colorRestauracion:
              tipo === "restauracion" ? color : pac.hc.colorRestauracion,
            procedimientoActivo: tipo,
            colorMspActivo: color,
            pincelEstado: estadoCaraPorColor(color),
          },
        };
      })
    );
  }

  function alternarSeleccionPieza(codigoPieza: string) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actuales = pac.hc.piezasSeleccionadas || [];
        const existe = actuales.includes(codigoPieza);
        const siguientes = existe
          ? actuales.filter((p) => p !== codigoPieza)
          : [...actuales, codigoPieza];

        const piezaFoco = siguientes[siguientes.length - 1] || "";

        return {
          ...pac,
          hc: {
            ...pac.hc,
            piezaSeleccionada: piezaFoco,
            piezasSeleccionadas: siguientes,
          },
        };
      })
    );
  }

  function alternarSeleccionCara(pieza: string, cara: CaraDiente) {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;

        const piezasActuales = pac.hc.piezasSeleccionadas || [];
        const siguientesPiezas = piezasActuales.includes(pieza)
          ? piezasActuales
          : [...piezasActuales, pieza];

        const procActivo = pac.hc.procedimientoActivo;
        if (!esProcedimientoConCaras(procActivo)) {
          return {
            ...pac,
            hc: {
              ...pac.hc,
              piezaSeleccionada: pieza,
              piezasSeleccionadas: siguientesPiezas,
            },
          };
        }

        const colorAplicar: ColorMsp =
          procActivo === "caries"
            ? pac.hc.colorCaries
            : pac.hc.colorRestauracion;
        const estadoObjetivo = estadoCaraPorColor(colorAplicar);

        const actualPieza = pac.hc.odontogramaMsp[pieza] || piezaVacia();
        const estadoActualCara = actualPieza[cara];
        const siguienteEstadoCara: EstadoColorDiente =
          estadoActualCara === estadoObjetivo ? "ninguno" : estadoObjetivo;

        const nuevoOdontograma = {
          ...pac.hc.odontogramaMsp,
          [pieza]: {
            ...actualPieza,
            [cara]: siguienteEstadoCara,
          },
        };

        const carasActuales = pac.hc.carasSeleccionadas || [];
        const existeCara = carasActuales.includes(cara);
        const siguientesCaras = existeCara
          ? carasActuales.filter((c) => c !== cara)
          : [...carasActuales, cara];

        return {
          ...pac,
          hc: {
            ...pac.hc,
            piezaSeleccionada: pieza,
            piezasSeleccionadas: siguientesPiezas,
            carasSeleccionadas: siguientesCaras,
            colorMspActivo: colorAplicar,
            pincelEstado: estadoObjetivo,
            odontogramaMsp: nuevoOdontograma,
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
        const esMismo = pac.hc.procedimientoActivo === procedimiento;
        const siguienteProc: TipoProcedimientoMsp = esMismo
          ? "ninguno"
          : procedimiento;

        const colorAsociado =
          siguienteProc ===
