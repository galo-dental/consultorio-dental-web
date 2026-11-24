"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const Odontograma3D = dynamic(() => import("./Odontograma3D"), {
  ssr: false,
});

type RolUsuario = "odontologo" | "asistente" | "recepcionista" | string;
type ModuloActivo =
  | null
  | "historias"
  | "agenda"
  | "pagos"
  | "inventario";

type SeccionHC =
  | "identificacion"
  | "motivo_antecedentes"
  | "clinico"
  | "odontograma"
  | "diagnostico"
  | "examenes"
  | "prescripciones";

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
  movilidad: string;
  recesion: string;
  movilidadRecesion: string;
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

interface DiagnosticoRegistrado {
  id: string;
  codigoCie10: string;
  descripcion: string;
  pieza: string;
}

interface ItemPlanTratamiento {
  id: string;
  pieza: string;
  procedimiento: string;
}

interface MedicamentoCatalogo {
  id: string;
  nombre: string;
  presentacion: string;
}

interface PrescripcionItem {
  id: string;
  medicamentoId: string;
  medicamentoTexto: string;
  indicaciones: string;
}

interface HistoriaClinicaCompleta {
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
  fotoCarne: string;
  motivoConsulta: string;
  enfermedadActual: string;
  noPresentaDolor: boolean;
  intensidadDolor: string;
  enfermedadesSistemicas: string[];
  otrasEnfermedadesSistemicas: string;
  alergicoMedicamentos: boolean;
  medicamentoAlergia: string;
  alergias: string;
  problemasHemorragias: string;
  detalleHemorragias: string;
  problemasAnestesiaDental: string;
  detalleAnestesiaDental: string;
  medicacionActual: string;
  cirugiasPrevias: string;
  antecedentesFamiliares: string;
  tieneHabitos: boolean;
  habitosGenerales: string;
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
  cpodAjusteManualCariados: number;
  cpodAjusteManualPerdidos: number;
  cpodAjusteManualObturados: number;
  oclusionLlaveAngle: string;
  detalleOclusionAngle: string;
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
  codigoCie10: string;
  diagnostico: string;
  diagnosticosRegistrados: DiagnosticoRegistrado[];
  piezaPlanSeleccionada: string;
  procedimientoPlanSeleccionado: string;
  itemsPlanTratamiento: ItemPlanTratamiento[];
  planTratamiento: string;
  notasOdontograma: string;
  medicamentoPrescribirId: string;
  indicacionesPrescripcion: string;
  prescripciones: PrescripcionItem[];
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
  "Ecuador", "Colombia", "Perú", "Venezuela", "Argentina", "Bolivia",
  "Brasil", "Chile", "Costa Rica", "Cuba", "El Salvador", "España",
  "Estados Unidos", "Guatemala", "Honduras", "México", "Nicaragua",
  "Panamá", "Paraguay", "Puerto Rico", "República Dominicana", "Uruguay",
  "Alemania", "Canadá", "Francia", "Italia", "Reino Unido", "Otro país",
];

const OPCIONES_ENFERMEDADES = [
  "Diabetes", "Hipertensión arterial", "Asma", "Tuberculosis",
  "Cáncer", "VIH", "Otros",
];

const OPCIONES_TRATAMIENTOS_PREVIOS = [
  "Profilaxis / limpieza", "Resinas / obturaciones", "Endodoncia",
  "Exodoncia", "Prótesis / coronas", "Ortodoncia", "Blanqueamiento",
  "Ninguno", "Otros",
];

const OPCIONES_FRECUENCIA_VISITAS = [
  "Cada 6 meses", "Cada año", "Esporádica / irregular",
  "Solo cuando hay molestia o dolor", "Primera consulta", "Otros",
];

const OPCIONES_EXPERIENCIAS_ANTERIORES = [
  "Positivas / sin molestias", "Aceptables", "Negativas / dolorosas",
  "Primera experiencia", "Otros",
];

const OPCIONES_ANSIEDAD_DENTAL = [
  "Ninguna", "Baja", "Moderada", "Alta", "Otros",
];

const OPCIONES_HIGIENE_ORAL = [
  "Buena (cepillado e hilo dental)", "Regular (solo cepillado)",
  "Deficiente", "Otros",
];

const OPCIONES_EXAMEN_EXTRAORAL = [
  "Sin alteraciones aparentes", "Asimetría facial",
  "Alteración en ATM (ruidos, dolor o limitación)",
  "Adenopatías / ganglios palpables", "Lesión cutánea o en labios", "Otros",
];

const OPCIONES_EXAMEN_INTRAORAL = [
  "Sin alteraciones aparentes", "Caries dental visible",
  "Restauraciones desadaptadas o filtradas",
  "Cálculo dental / placa abundante", "Desgaste dental / atrición / erosión",
  "Edentulismo parcial o total", "Otros",
];

const OPCIONES_TEJIDOS_BLANDOS = [
  "Normales / sin patología", "Gingivitis / inflamación gingival",
  "Úlcera / afta", "Lesión en lengua",
  "Lesión en mucosa yugal o paladar", "Alteración en piso de boca", "Otros",
];

const OPCIONES_OCLUSION_ANGLE = [
  "Clase I",
  "Clase II",
  "Clase III",
];

const CODIGOS_CIE10_ODONTO: { codigo: string; descripcion: string }[] = [
  { codigo: "K00.0", descripcion: "Anodoncia" },
  { codigo: "K00.1", descripcion: "Dientes supernumerarios" },
  { codigo: "K00.2", descripcion: "Anomalías del tamaño y de la forma del diente" },
  { codigo: "K00.6", descripcion: "Alteraciones en la erupción dentaria" },
  { codigo: "K00.7", descripcion: "Síndrome de la erupción dentaria" },
  { codigo: "K01.0", descripcion: "Dientes incluidos" },
  { codigo: "K01.1", descripcion: "Dientes impactados" },
  { codigo: "K02.0", descripcion: "Caries limitada al esmalte" },
  { codigo: "K02.1", descripcion: "Caries de la dentina" },
  { codigo: "K02.2", descripcion: "Caries del cemento" },
  { codigo: "K02.3", descripcion: "Caries dentaria detenida" },
  { codigo: "K02.8", descripcion: "Otras caries dentales" },
  { codigo: "K02.9", descripcion: "Caries dental, no especificada" },
  { codigo: "K03.0", descripcion: "Atrición excesiva de los dientes" },
  { codigo: "K03.1", descripcion: "Abrasión de los dientes" },
  { codigo: "K03.2", descripcion: "Erosión de los dientes" },
  { codigo: "K03.6", descripcion: "Depósitos [acreciones] en los dientes" },
  { codigo: "K03.7", descripcion: "Cambios posteriores a la erupción en el color de los tejidos duros de los dientes" },
  { codigo: "K04.0", descripcion: "Pulpitis" },
  { codigo: "K04.1", descripcion: "Necrosis de la pulpa" },
  { codigo: "K04.4", descripcion: "Periodontitis apical aguda originada en la pulpa" },
  { codigo: "K04.5", descripcion: "Periodontitis apical crónica" },
  { codigo: "K04.6", descripcion: "Absceso periapical con fístula" },
  { codigo: "K04.7", descripcion: "Absceso periapical sin fístula" },
  { codigo: "K05.0", descripcion: "Gingivitis aguda" },
  { codigo: "K05.1", descripcion: "Gingivitis crónica" },
  { codigo: "K05.2", descripcion: "Periodontitis aguda" },
  { codigo: "K05.3", descripcion: "Periodontitis crónica" },
  { codigo: "K06.0", descripcion: "Retracción gingival" },
  { codigo: "K06.1", descripcion: "Hiperplasia gingival" },
  { codigo: "K07.0", descripcion: "Anomalías evidentes del tamaño de los maxilares" },
  { codigo: "K07.2", descripcion: "Anomalías de la relación entre los arcos dentarios" },
  { codigo: "K07.3", descripcion: "Anomalías de la posición del diente" },
  { codigo: "K07.4", descripcion: "Maloclusión de tipo no especificado" },
  { codigo: "K07.6", descripcion: "Trastornos de la articulación temporomandibular" },
  { codigo: "K08.1", descripcion: "Pérdida de dientes debida a accidente, extracción o enfermedad periodontal local" },
  { codigo: "K08.2", descripcion: "Atrofia de reborde edéntulo" },
  { codigo: "K08.3", descripcion: "Raíz dental retenida" },
  { codigo: "K12.0", descripcion: "Aftas bucales recurrentes" },
  { codigo: "K12.1", descripcion: "Otras formas de estomatitis" },
  { codigo: "K13.2", descripcion: "Leucoplasia y otras alteraciones del epitelio bucal, incluyendo la lengua" },
  { codigo: "K14.0", descripcion: "Glositis" },
  { codigo: "Z02.1", descripcion: "Examen odontológico" },
];

const MOVILIDAD_MILLER = [
  { codigo: "M0", etiqueta: "Grado 0: fisiológica (≤0,2 mm)" },
  { codigo: "M1", etiqueta: "Grado 1: horizontal (<1 mm)" },
  { codigo: "M2", etiqueta: "Grado 2: horizontal (≥1 mm)" },
  { codigo: "M3", etiqueta: "Grado 3: horizontal y vertical" },
];

const RETRACCION_MILLER = [
  { codigo: "R-I", etiqueta: "Clase I: no alcanza LMG; sin pérdida ósea/interdental" },
  { codigo: "R-II", etiqueta: "Clase II: hasta/más allá LMG; sin pérdida ósea/interdental" },
  { codigo: "R-III", etiqueta: "Clase III: hasta/más allá LMG; pérdida ósea/interdental o malposición" },
  { codigo: "R-IV", etiqueta: "Clase IV: supera LMG; pérdida ósea/interdental severa" },
];

const PROCEDIMIENTOS_MSP: {
  id: Exclude<TipoProcedimientoMsp, "ninguno">;
  titulo: string;
  muestra: string;
}[] = [
  { id: "caries", titulo: "Caries", muestra: "●" },
  { id: "restauracion", titulo: "Restauración", muestra: "■" },
  { id: "sellante", titulo: "Sellante", muestra: "*" },
  { id: "extraccion_perdida_caries", titulo: "Extracción / Pérdida por caries", muestra: "X" },
  { id: "perdida_otra_causa", titulo: "Pérdida (otra causa)", muestra: "⊗" },
  { id: "endodoncia", titulo: "Endodoncia", muestra: "△" },
  { id: "protesis_fija", titulo: "Prótesis fija", muestra: "o---o" },
  { id: "protesis_removible", titulo: "Prótesis removible", muestra: "(---)" },
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
const ARCADA_SUPERIOR_COMPLETA = [...SUP_DER_PERM, ...SUP_IZQ_PERM];

const SUP_DER_TEMP = ["55", "54", "53", "52", "51"];
const SUP_IZQ_TEMP = ["61", "62", "63", "64", "65"];

const INF_DER_TEMP = ["85", "84", "83", "82", "81"];
const INF_IZQ_TEMP = ["71", "72", "73", "74", "75"];

const INF_DER_PERM = ["48", "47", "46", "45", "44", "43", "42", "41"];
const INF_IZQ_PERM = ["31", "32", "33", "34", "35", "36", "37", "38"];
const ARCADA_INFERIOR_COMPLETA = [...INF_DER_PERM, ...INF_IZQ_PERM];

const TODAS_LAS_PIEZAS = [
  ...ARCADA_SUPERIOR_COMPLETA,
  ...SUP_DER_TEMP,
  ...SUP_IZQ_TEMP,
  ...INF_DER_TEMP,
  ...INF_IZQ_TEMP,
  ...ARCADA_INFERIOR_COMPLETA,
];

const CATALOGO_MEDICAMENTOS_INICIAL: MedicamentoCatalogo[] = [
  { id: "med-1", nombre: "Amoxicilina", presentacion: "500 mg cápsulas" },
  { id: "med-2", nombre: "Ibuprofeno", presentacion: "400 mg tabletas" },
  { id: "med-3", nombre: "Paracetamol", presentacion: "500 mg tabletas" },
  { id: "med-4", nombre: "Clorhexidina", presentacion: "0.12% enjuague bucal" },
];

const LINEA_DIAGRAMA_TENUE = "#94a3b8";

function colorFijoPorTipo(tipo: "caries" | "restauracion"): ColorMsp {
  return tipo === "caries" ? "rojo" : "azul";
}

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
    movilidad: "",
    recesion: "",
    movilidadRecesion: "",
  };
}

function obtenerMovilidadPieza(d: EstadoPiezaMsp): string {
  if (d.movilidad) return d.movilidad;
  if (d.movilidadRecesion?.startsWith("M")) return d.movilidadRecesion;
  return "";
}

function obtenerRecesionPieza(d: EstadoPiezaMsp): string {
  if (d.recesion) return d.recesion;
  if (d.movilidadRecesion?.startsWith("R-")) return d.movilidadRecesion;
  return "";
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

function pacienteTieneAlergias(hc: HistoriaClinicaCompleta): boolean {
  return (
    hc.alergicoMedicamentos ||
    Boolean(hc.medicamentoAlergia?.trim()) ||
    Boolean(hc.alergias?.trim())
  );
}

function obtenerLeyendaAlergia(hc: HistoriaClinicaCompleta): string {
  const partes: string[] = [];
  if (hc.alergicoMedicamentos || hc.medicamentoAlergia?.trim()) {
    const med = hc.medicamentoAlergia?.trim();
    partes.push(
      med
        ? `Alérgico a medicamentos: ${med}`
        : "Alérgico a medicamentos"
    );
  }
  if (hc.alergias?.trim()) {
    partes.push(`Otras alergias: ${hc.alergias.trim()}`);
  }
  return partes.join(" · ");
}

function pacienteTieneEnfermedadSistemica(
  hc: HistoriaClinicaCompleta
): boolean {
  const lista = hc.enfermedadesSistemicas || [];
  return lista.length > 0 || Boolean(hc.otrasEnfermedadesSistemicas?.trim());
}

function obtenerDetalleEnfermedadesSistemicas(
  hc: HistoriaClinicaCompleta
): string {
  const lista = (hc.enfermedadesSistemicas || []).filter(
    (item) => item !== "Otros"
  );
  if (
    (hc.enfermedadesSistemicas || []).includes("Otros") ||
    hc.otrasEnfermedadesSistemicas?.trim()
  ) {
    lista.push(
      hc.otrasEnfermedadesSistemicas?.trim()
        ? `Otros (${hc.otrasEnfermedadesSistemicas.trim()})`
        : "Otros"
    );
  }
  return lista.join(", ");
}

function calcularCpodAutomaticoDesdeOdontograma(
  odontograma: Record<string, EstadoPiezaMsp>
): { cariados: number; perdidos: number; obturados: number } {
  let cariados = 0;
  let perdidos = 0;
  let obturados = 0;

  const piezas = Object.values(odontograma || {});
  for (const d of piezas) {
    if (!d) continue;
    const simbolos = d.simbolos || [];
    const tieneCaraRoja = (["O", "V", "L", "M", "D"] as CaraDiente[]).some(
      (c) => d[c] === "por_realizar"
    );
    const tieneCaraAzul = (["O", "V", "L", "M", "D"] as CaraDiente[]).some(
      (c) => d[c] === "realizado"
    );

    const esCariada =
      simbolos.some((s) => s.tipo === "caries") || tieneCaraRoja;
    const esPerdida = simbolos.some(
      (s) =>
        s.tipo === "extraccion_perdida_caries" ||
        s.tipo === "perdida_otra_causa"
    );
    const esObturada =
      simbolos.some(
        (s) => s.tipo === "restauracion" || s.tipo === "corona"
      ) || tieneCaraAzul;

    if (esCariada) cariados += 1;
    if (esPerdida) perdidos += 1;
    if (esObturada) obturados += 1;
  }

  return { cariados, perdidos, obturados };
}

function obtenerValoresCpod(hc: HistoriaClinicaCompleta): {
  cariados: number;
  perdidos: number;
  obturados: number;
  total: number;
} {
  const auto = calcularCpodAutomaticoDesdeOdontograma(hc.odontogramaMsp);
  const cariados = Math.max(
    0,
    auto.cariados + (hc.cpodAjusteManualCariados || 0)
  );
  const perdidos = Math.max(
    0,
    auto.perdidos + (hc.cpodAjusteManualPerdidos || 0)
  );
  const obturados = Math.max(
    0,
    auto.obturados + (hc.cpodAjusteManualObturados || 0)
  );
  return {
    cariados,
    perdidos,
    obturados,
    total: cariados + perdidos + obturados,
  };
}

function crearHcVacia(
  nombres = "",
  apellidos = "",
  telefonoInicial = ""
): HistoriaClinicaCompleta {
  return {
    nombres, apellidos, documento: "", fechaNacimiento: "", genero: "",
    nacionalidad: "Ecuador", direccion: "", ciudad: "", telefono: telefonoInicial,
    correo: "", ocupacion: "", contactoAdicional: "", seguroConvenio: "",
    representanteLegal: "", fotoCarne: "", motivoConsulta: "",
    enfermedadActual: "", noPresentaDolor: false, intensidadDolor: "",
    enfermedadesSistemicas: [], otrasEnfermedadesSistemicas: "",
    alergicoMedicamentos: false, medicamentoAlergia: "", alergias: "",
    problemasHemorragias: "", detalleHemorragias: "",
    problemasAnestesiaDental: "", detalleAnestesiaDental: "",
    medicacionActual: "", cirugiasPrevias: "", antecedentesFamiliares: "",
    tieneHabitos: false, habitosGenerales: "", tratamientosPrevios: [],
    otrosTratamientosPrevios: "", frecuenciaVisitas: "",
    otraFrecuenciaVisitas: "", experienciasAnteriores: "",
    otraExperienciaAnterior: "", ansiedadDental: "", otraAnsiedadDental: "",
    higieneOral: "", otraHigieneOral: "", presionArterial: "", pulso: "",
    temperatura: "", frecuenciaRespiratoria: "", examenExtraoral: [],
    detalleExamenExtraoral: "", examenIntraoral: [], detalleExamenIntraoral: "",
    tejidosBlandos: [], detalleTejidosBlandos: "", cpodCariados: "0",
    cpodPerdidos: "0", cpodObturados: "0", cpodAjusteManualCariados: 0,
    cpodAjusteManualPerdidos: 0, cpodAjusteManualObturados: 0,
    oclusionLlaveAngle: "", detalleOclusionAngle: "",
    examenesComplementarios: "", fotos: [], piezaSeleccionada: "",
    piezasSeleccionadas: [], carasSeleccionadas: [],
    procedimientoActivo: "ninguno", colorCaries: "rojo", colorRestauracion: "azul",
    colorMspActivo: "rojo", pincelEstado: "por_realizar", odontogramaMsp: {},
    codigoCie10: "", diagnostico: "", diagnosticosRegistrados: [],
    piezaPlanSeleccionada: "", procedimientoPlanSeleccionado: "",
    itemsPlanTratamiento: [], planTratamiento: "", notasOdontograma: "",
    medicamentoPrescribirId: "", indicacionesPrescripcion: "",
    prescripciones: [],
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
          <line x1="22" y1="6" x2="22" y2="38" stroke="#ffffff" strokeWidth="6" />
          <line x1="22" y1="6" x2="22" y2="38" stroke={stroke} strokeWidth="3.3" />
          <line x1="10" y1="38" x2="34" y2="38" stroke={stroke} strokeWidth="3.3" />
          <line x1="15" y1="15" x2="29" y2="15" stroke={stroke} strokeWidth="3.3" />
          <line x1="15" y1="23" x2="29" y2="23" stroke={stroke} strokeWidth="3.3" />
        </g>
      );
    case "ortodoncia":
      return (
        <g fill="none" pointerEvents="none">
          <rect
            x="10" y="10" width="24" height="24" rx="2"
            fill="#ffffff" fillOpacity="0.85" stroke={stroke} strokeWidth="3"
          />
          <line x1="2" y1="22" x2="10" y2="22" stroke={stroke} strokeWidth="3" />
          <line x1="34" y1="22" x2="42" y2="22" stroke={stroke} strokeWidth="3" />
          <line x1="22" y1="10" x2="22" y2="34" stroke={stroke} strokeWidth="3" />
          <line x1="10" y1="22" x2="34" y2="22" stroke={stroke} strokeWidth="3" />
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

function SiluetaPersonaNeutral() {
  return (
    <svg
      viewBox="0 0 120 140"
      className="w-24 h-28 text-sky-400"
      role="img"
      aria-label="Silueta general sin género"
    >
      <circle cx="60" cy="44" r="22" fill="currentColor" opacity="0.35" />
      <path
        d="M 24 126 C 24 94 38 78 60 78 C 82 78 96 94 96 126 Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [moduloActivo, setModuloActivo] = useState<ModuloActivo>(null);
  const [mostrarVista3D, setMostrarVista3D] = useState(false);

  const [catalogoMedicamentos, setCatalogoMedicamentos] = useState<
    MedicamentoCatalogo[]
  >(CATALOGO_MEDICAMENTOS_INICIAL);
  const [nuevoMedNombre, setNuevoMedNombre] = useState("");
  const [nuevoMedPresentacion, setNuevoMedPresentacion] = useState("");

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

  function seleccionarCie10DesdeLista(codigoSeleccionado: string) {
    if (!pacienteSeleccionadoId) return;
    const item = CODIGOS_CIE10_ODONTO.find(
      (c) => c.codigo === codigoSeleccionado
    );
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        if (!item) {
          return {
            ...pac,
            hc: {
              ...pac.hc,
              codigoCie10: "",
            },
          };
        }
        return {
          ...pac,
          hc: {
            ...pac.hc,
            codigoCie10: item.codigo,
            diagnostico: item.descripcion,
          },
        };
      })
    );
  }

  function registrarDiagnosticoSeleccionado() {
    if (!pacienteSeleccionadoId) return;
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const cod = pac.hc.codigoCie10.trim();
        const desc =
          pac.hc.diagnostico.trim() ||
          CODIGOS_CIE10_ODONTO.find((c) => c.codigo === cod)?.descripcion ||
          "";

        if (!cod && !desc) {
          setMensajeGuardado(
            "Seleccione o escriba un diagnóstico CIE-10 antes de registrar."
          );
          return pac;
        }

        const piezaRef =
          pac.hc.piezaPlanSeleccionada ||
          pac.hc.piezasSeleccionadas[0] ||
          pac.hc.piezaSeleccionada ||
          "General";

        const nuevoDiag: DiagnosticoRegistrado = {
          id: `diag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          codigoCie10: cod || "Sin código",
          descripcion: desc || "Diagnóstico odontológico",
          pieza: piezaRef,
        };

        const procRef =
          pac.hc.procedimientoPlanSeleccionado ||
          PROCEDIMIENTOS_MSP.find((p) => p.id === pac.hc.procedimientoActivo)
            ?.titulo ||
          "";

        let siguientesItemsPlan = pac.hc.itemsPlanTratamiento || [];
        if (procRef) {
          siguientesItemsPlan = [
            ...siguientesItemsPlan,
            {
              id: `plan-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 6)}`,
              pieza: piezaRef,
              procedimiento: procRef,
            },
          ];
        }

        setMensajeGuardado(
          `Diagnóstico ${nuevoDiag.codigoCie10} registrado (${piezaRef}).`
        );

        return {
          ...pac,
          hc: {
            ...pac.hc,
            diagnosticosRegistrados: [
              ...(pac.hc.diagnosticosRegistrados || []),
              nuevoDiag,
            ],
            itemsPlanTratamiento: siguientesItemsPlan,
            codigoCie10: "",
            diagnostico: "",
          },
        };
      })
    );
  }

  function eliminarDiagnosticoRegistrado(diagId: string) {
    setPacientes((prev) =>
      prev.map((pac) =>
        pac.id === pacienteSeleccionadoId
          ? {
              ...pac,
              hc: {
                ...pac.hc,
                diagnosticosRegistrados: (
                  pac.hc.diagnosticosRegistrados || []
                ).filter((d) => d.id !== diagId),
              },
            }
          : pac
      )
    );
  }

  function agregarItemPlanTratamiento() {
    if (!pacienteSeleccionadoId) return;
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const pieza =
          pac.hc.piezaPlanSeleccionada ||
          pac.hc.piezasSeleccionadas[0] ||
          "General";
        const proc = pac.hc.procedimientoPlanSeleccionado.trim();
        if (!proc) {
          setMensajeGuardado(
            "Seleccione o escriba el procedimiento a realizar para el plan de tratamiento."
          );
          return pac;
        }
        const nuevoItem: ItemPlanTratamiento = {
          id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          pieza,
          procedimiento: proc,
        };
        setMensajeGuardado(
          `Procedimiento '${proc}' añadido en pieza ${pieza}.`
        );
        return {
          ...pac,
          hc: {
            ...pac.hc,
            itemsPlanTratamiento: [
              ...(pac.hc.itemsPlanTratamiento || []),
              nuevoItem,
            ],
            procedimientoPlanSeleccionado: "",
          },
        };
      })
    );
  }

  function eliminarItemPlanTratamiento(itemId: string) {
    setPacientes((prev) =>
      prev.map((pac) =>
        pac.id === pacienteSeleccionadoId
          ? {
              ...pac,
              hc: {
                ...pac.hc,
                itemsPlanTratamiento: (
                  pac.hc.itemsPlanTratamiento || []
                ).filter((i) => i.id !== itemId),
              },
            }
          : pac
      )
    );
  }

  function agregarMedicamentoCatalogo(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoMedNombre.trim()) return;
    const creado: MedicamentoCatalogo = {
      id: `med-${Date.now()}`,
      nombre: nuevoMedNombre.trim(),
      presentacion: nuevoMedPresentacion.trim() || "Presentación general",
    };
    setCatalogoMedicamentos((prev) => [creado, ...prev]);
    setNuevoMedNombre("");
    setNuevoMedPresentacion("");
    if (pacienteSeleccionadoId) {
      actualizarCampoHc("medicamentoPrescribirId", creado.id);
    }
  }

  function agregarPrescripcionPaciente() {
    if (!pacienteSeleccionadoId) return;
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const medObj = catalogoMedicamentos.find(
          (m) => m.id === pac.hc.medicamentoPrescribirId
        );
        if (!medObj) {
          setMensajeGuardado(
            "Seleccione un medicamento de la lista general antes de prescribir."
          );
          return pac;
        }
        const textoMed = `${medObj.nombre} (${medObj.presentacion})`;
        const indTexto =
          pac.hc.indicacionesPrescripcion.trim() ||
          "Según indicación clínica";

        const nuevaPresc: PrescripcionItem = {
          id: `presc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          medicamentoId: medObj.id,
          medicamentoTexto: textoMed,
          indicaciones: indTexto,
        };

        setMensajeGuardado(`Prescripción añadida: ${textoMed}.`);

        return {
          ...pac,
          hc: {
            ...pac.hc,
            prescripciones: [...(pac.hc.prescripciones || []), nuevaPresc],
            indicacionesPrescripcion: "",
          },
        };
      })
    );
  }

  function eliminarPrescripcionPaciente(prescId: string) {
    setPacientes((prev) =>
      prev.map((pac) =>
        pac.id === pacienteSeleccionadoId
          ? {
              ...pac,
              hc: {
                ...pac.hc,
                prescripciones: (pac.hc.prescripciones || []).filter(
                  (p) => p.id !== prescId
                ),
              },
            }
          : pac
      )
    );
  }
  function handleSubirFotoCarne(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo || !pacienteSeleccionadoId) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      actualizarCampoHc("fotoCarne", reader.result);
    };
    reader.readAsDataURL(archivo);
    e.target.value = "";
  }

  function quitarFotoCarne() {
    actualizarCampoHc("fotoCarne", "");
  }

  function actualizarCpodManual(
    campo: "cariados" | "perdidos" | "obturados",
    valorTexto: string
  ) {
    if (!pacienteSeleccionadoId) return;
    const numeroIngresado = Math.max(0, parseInt(valorTexto || "0", 10) || 0);
    setMensajeGuardado(null);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const auto = calcularCpodAutomaticoDesdeOdontograma(
          pac.hc.odontogramaMsp
        );
        const delta =
          campo === "cariados"
            ? numeroIngresado - auto.cariados
            : campo === "perdidos"
            ? numeroIngresado - auto.perdidos
            : numeroIngresado - auto.obturados;

        return {
          ...pac,
          hc: {
            ...pac.hc,
            cpodAjusteManualCariados:
              campo === "cariados"
                ? delta
                : pac.hc.cpodAjusteManualCariados || 0,
            cpodAjusteManualPerdidos:
              campo === "perdidos"
                ? delta
                : pac.hc.cpodAjusteManualPerdidos || 0,
            cpodAjusteManualObturados:
              campo === "obturados"
                ? delta
                : pac.hc.cpodAjusteManualObturados || 0,
          },
        };
      })
    );
  }

  function toggleAlergicoMedicamentos() {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const siguiente = !pac.hc.alergicoMedicamentos;
        return {
          ...pac,
          hc: {
            ...pac.hc,
            alergicoMedicamentos: siguiente,
            medicamentoAlergia: siguiente ? pac.hc.medicamentoAlergia : "",
          },
        };
      })
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
          },
        };
      })
    );
  }

  function activarModoCarieORestauracion(tipo: "caries" | "restauracion") {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);

    const colorFijo = colorFijoPorTipo(tipo);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        return {
          ...pac,
          hc: {
            ...pac.hc,
            colorCaries: "rojo",
            colorRestauracion: "azul",
            procedimientoActivo: tipo,
            colorMspActivo: colorFijo,
            pincelEstado: estadoCaraPorColor(colorFijo),
          },
        };
      })
    );
  }

  function borrarCariesYRestauraciones() {
    if (!pacienteSeleccionadoId) return;

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const piezasSel = pac.hc.piezasSeleccionadas || [];
        const codigosObjetivo =
          piezasSel.length > 0
            ? piezasSel
            : Object.keys(pac.hc.odontogramaMsp || {});

        if (codigosObjetivo.length === 0) {
          setMensajeGuardado(
            "No hay caries ni restauraciones registradas para borrar."
          );
          return pac;
        }

        const nuevoOdontograma = { ...pac.hc.odontogramaMsp };

        for (const cod of codigosObjetivo) {
          const actualPieza = nuevoOdontograma[cod] || piezaVacia();
          const simbolosRestantes = (actualPieza.simbolos || []).filter(
            (s) => s.tipo !== "caries" && s.tipo !== "restauracion"
          );

          nuevoOdontograma[cod] = {
            ...actualPieza,
            O: "ninguno",
            V: "ninguno",
            L: "ninguno",
            M: "ninguno",
            D: "ninguno",
            simbolos: simbolosRestantes,
          };
        }

        setMensajeGuardado(
          piezasSel.length > 0
            ? `Se borraron caries y restauraciones en pieza(s) #${piezasSel.join(
                ", #"
              )}.`
            : "Se borraron todas las caries y restauraciones del odontograma."
        );

        return {
          ...pac,
          hc: {
            ...pac.hc,
            odontogramaMsp: nuevoOdontograma,
            piezaSeleccionada: "",
            piezasSeleccionadas: [],
            carasSeleccionadas: [],
          },
        };
      })
    );
  }

  function alternarArcadaCompleta(arcada: "superior" | "inferior") {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);

    const piezasArcada =
      arcada === "superior"
        ? ARCADA_SUPERIOR_COMPLETA
        : ARCADA_INFERIOR_COMPLETA;

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actuales = pac.hc.piezasSeleccionadas || [];
        const yaTodaSeleccionada = piezasArcada.every((cod) =>
          actuales.includes(cod)
        );

        const siguientes = yaTodaSeleccionada
          ? actuales.filter((cod) => !piezasArcada.includes(cod))
          : Array.from(new Set([...actuales, ...piezasArcada]));

        const piezaFoco = siguientes[siguientes.length - 1] || "";

        setMensajeGuardado(
          yaTodaSeleccionada
            ? `Se deseleccionó la arcada ${arcada} completa.`
            : `Arcada ${arcada} completa seleccionada (${piezasArcada.length} piezas). Ideal para prótesis total.`
        );

        return {
          ...pac,
          hc: {
            ...pac.hc,
            piezaSeleccionada: piezaFoco,
            piezasSeleccionadas: siguientes,
            piezaPlanSeleccionada: piezaFoco || pac.hc.piezaPlanSeleccionada,
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
            piezaPlanSeleccionada: !existe
              ? codigoPieza
              : piezaFoco || pac.hc.piezaPlanSeleccionada,
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
              piezaPlanSeleccionada: pieza,
            },
          };
        }

        const colorAplicar: ColorMsp = colorFijoPorTipo(procActivo);
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
            piezaPlanSeleccionada: pieza,
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

    const procObj = PROCEDIMIENTOS_MSP.find((p) => p.id === procedimiento);

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const esMismo = pac.hc.procedimientoActivo === procedimiento;
        const siguienteProc: TipoProcedimientoMsp = esMismo
          ? "ninguno"
          : procedimiento;

        const colorAsociado = esProcedimientoConCaras(siguienteProc)
          ? colorFijoPorTipo(siguienteProc)
          : pac.hc.colorMspActivo;

        return {
          ...pac,
          hc: {
            ...pac.hc,
            procedimientoActivo: siguienteProc,
            procedimientoPlanSeleccionado: !esMismo && procObj
              ? procObj.titulo
              : pac.hc.procedimientoPlanSeleccionado,
            colorMspActivo: colorAsociado,
            pincelEstado: estadoCaraPorColor(colorAsociado),
            carasSeleccionadas: esProcedimientoConCaras(siguienteProc)
              ? pac.hc.carasSeleccionadas
              : [],
          },
        };
      })
    );
  }
  function cargarInformacionSeleccionada(
    procedimientoForzado?: "caries" | "restauracion"
  ) {
    if (!pacienteSeleccionadoId) return;

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const procActivo: TipoProcedimientoMsp =
          procedimientoForzado || pac.hc.procedimientoActivo;
        const piezasTarget = pac.hc.piezasSeleccionadas || [];

        const tieneCarasMarcadasEnAlgunaPieza = piezasTarget.some((cod) => {
          const estadoP = pac.hc.odontogramaMsp[cod];
          if (!estadoP) return false;
          return (["O", "V", "L", "M", "D"] as CaraDiente[]).some(
            (c) => estadoP[c] !== "ninguno"
          );
        });

        if (piezasTarget.length === 0) {
          setMensajeGuardado("Selecciona al menos una pieza antes de cargar.");
          return pac;
        }

        if (procActivo === "ninguno") {
          setMensajeGuardado(
            "Selecciona un procedimiento o simbología antes de pulsar Cargar."
          );
          return pac;
        }

        const colorAplicar: ColorMsp = esProcedimientoConCaras(procActivo)
          ? colorFijoPorTipo(procActivo)
          : pac.hc.colorMspActivo;

        const esCaras = esProcedimientoConCaras(procActivo);
        const estadoCara = estadoCaraPorColor(colorAplicar);
        const nuevoOdontograma = { ...pac.hc.odontogramaMsp };

        for (const cod of piezasTarget) {
          const actualPieza = nuevoOdontograma[cod] || piezaVacia();
          const listaActual = actualPieza.simbolos || [];

          const simbolosSinDuplicado = listaActual.filter(
            (s) => s.tipo !== procActivo
          );
          const siguientesSimbolos: SimboloAplicado[] = [
            ...simbolosSinDuplicado,
            { tipo: procActivo, color: colorAplicar },
          ];

          const actualizada: EstadoPiezaMsp = {
            ...actualPieza,
            simbolos: siguientesSimbolos,
          };

          if (esCaras) {
            const tieneCaraPintada = (
              ["O", "V", "L", "M", "D"] as CaraDiente[]
            ).some((c) => actualizada[c] !== "ninguno");
            if (!tieneCaraPintada && !tieneCarasMarcadasEnAlgunaPieza) {
              const carasTarget =
                pac.hc.carasSeleccionadas.length > 0
                  ? pac.hc.carasSeleccionadas
                  : (["O", "V", "L", "M", "D"] as CaraDiente[]);
              for (const c of carasTarget) {
                actualizada[c] = estadoCara;
              }
            }
          }

          nuevoOdontograma[cod] = actualizada;
        }

        const nombreProc =
          PROCEDIMIENTOS_MSP.find((p) => p.id === procActivo)?.titulo ||
          procActivo;
        setMensajeGuardado(
          `Cargado: ${nombreProc} (${
            colorAplicar === "azul" ? "Azul - Realizado" : "Rojo - Por realizar"
          }) en pieza(s) #${piezasTarget.join(
            ", #"
          )}. Selección limpia para registrar más novedades.`
        );

        return {
          ...pac,
          hc: {
            ...pac.hc,
            odontogramaMsp: nuevoOdontograma,
            piezaSeleccionada: "",
            piezasSeleccionadas: [],
            carasSeleccionadas: [],
            procedimientoActivo: "ninguno",
          },
        };
      })
    );
  }

  function borrarInformacionSeleccionada() {
    if (!pacienteSeleccionadoId) return;

    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const procActivo = pac.hc.procedimientoActivo;
        const piezasTarget = pac.hc.piezasSeleccionadas || [];

        if (piezasTarget.length === 0) {
          setMensajeGuardado("Selecciona al menos una pieza para borrar.");
          return pac;
        }

        const nuevoOdontograma = { ...pac.hc.odontogramaMsp };

        for (const cod of piezasTarget) {
          const actualPieza = nuevoOdontograma[cod] || piezaVacia();

          if (procActivo !== "ninguno") {
            const filtrados = (actualPieza.simbolos || []).filter(
              (s) => s.tipo !== procActivo
            );
            const limpiaCaras =
              esProcedimientoConCaras(procActivo) &&
              !filtrados.some((s) => esProcedimientoConCaras(s.tipo));

            nuevoOdontograma[cod] = {
              ...actualPieza,
              simbolos: filtrados,
              O: limpiaCaras ? "ninguno" : actualPieza.O,
              V: limpiaCaras ? "ninguno" : actualPieza.V,
              L: limpiaCaras ? "ninguno" : actualPieza.L,
              M: limpiaCaras ? "ninguno" : actualPieza.M,
              D: limpiaCaras ? "ninguno" : actualPieza.D,
            };
          } else {
            nuevoOdontograma[cod] = {
              ...actualPieza,
              O: "ninguno",
              V: "ninguno",
              L: "ninguno",
              M: "ninguno",
              D: "ninguno",
              simbolos: [],
            };
          }
        }

        const detalleBorrado =
          procActivo !== "ninguno"
            ? `Se quitó ${
                PROCEDIMIENTOS_MSP.find((p) => p.id === procActivo)?.titulo
              } de pieza(s) #${piezasTarget.join(", #")}.`
            : `Se limpiaron los registros de pieza(s) #${piezasTarget.join(
                ", #"
              )}.`;
        setMensajeGuardado(detalleBorrado);

        return {
          ...pac,
          hc: {
            ...pac.hc,
            odontogramaMsp: nuevoOdontograma,
            piezaSeleccionada: "",
            piezasSeleccionadas: [],
            carasSeleccionadas: [],
            procedimientoActivo: "ninguno",
          },
        };
      })
    );
  }

  function actualizarDatoPieza(
    pieza: string,
    campo: "movilidad" | "recesion" | "movilidadRecesion",
    valor: string
  ) {
    if (!pieza || !pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const actualPieza = pac.hc.odontogramaMsp[pieza] || piezaVacia();
        const siguienteMov =
          campo === "movilidad" ? valor : obtenerMovilidadPieza(actualPieza);
        const siguienteRec =
          campo === "recesion" ? valor : obtenerRecesionPieza(actualPieza);
        const combinado = [siguienteMov, siguienteRec].filter(Boolean).join("/");

        return {
          ...pac,
          hc: {
            ...pac.hc,
            odontogramaMsp: {
              ...pac.hc.odontogramaMsp,
              [pieza]: {
                ...actualPieza,
                movilidad: siguienteMov,
                recesion: siguienteRec,
                movilidadRecesion:
                  campo === "movilidadRecesion" ? valor : combinado,
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

  function toggleTieneHabitos() {
    if (!pacienteSeleccionadoId) return;
    setMensajeGuardado(null);
    setPacientes((prev) =>
      prev.map((pac) => {
        if (pac.id !== pacienteSeleccionadoId) return pac;
        const siguiente = !pac.hc.tieneHabitos;
        return {
          ...pac,
          hc: {
            ...pac.hc,
            tieneHabitos: siguiente,
            habitosGenerales: siguiente ? pac.hc.habitosGenerales : "",
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

  function renderDienteMsp(codigoPieza: string, hc: HistoriaClinicaCompleta) {
    const d = hc.odontogramaMsp[codigoPieza] || piezaVacia();
    const simbolos = d.simbolos || [];
    const perdidaRealizada = esPiezaPerdidaRealizada(simbolos);
    const seleccionada = (hc.piezasSeleccionadas || []).includes(codigoPieza);
    const temporal = esPiezaTemporal(codigoPieza);
    const superior = esArcadaSuperior(codigoPieza);
    const caras = carasPorPieza(codigoPieza);
    const valorMov = obtenerMovilidadPieza(d);
    const valorRec = obtenerRecesionPieza(d);

    return (
      <div
        key={codigoPieza}
        onClick={() => alternarSeleccionPieza(codigoPieza)}
        className={`flex flex-col items-center p-1 border cursor-pointer transition ${
          temporal ? "rounded-2xl" : "rounded-lg"
        } ${
          perdidaRealizada
            ? "opacity-40 border-sky-100 bg-sky-50/40"
            : seleccionada
            ? "border-sky-500 bg-sky-100/80 ring-1 ring-sky-400"
            : "border-transparent hover:border-sky-200"
        }`}
      >
        {superior ? (
          <>
            <span className="text-[11px] font-semibold text-sky-900 leading-tight mb-0.5">
              {codigoPieza}
            </span>
            {renderMarcadoresExternosPieza(simbolos, true)}
          </>
        ) : (
          <div className="h-5 mb-0.5" aria-hidden="true" />
        )}

        <svg
          viewBox="0 0 44 44"
          className="w-8 h-8 sm:w-9 sm:h-9 touch-manipulation select-none"
          aria-label={`Pieza ${codigoPieza}`}
        >
          {temporal ? (
            <>
              <path
                d="M 2 22 C 2 8 12 2 22 2 C 32 2 42 8 42 22 L 31 22 C 31 15 27 12 22 12 C 17 12 13 15 13 22 Z"
                fill={fillPorEstado(d[caras.arriba])}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.2"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, caras.arriba);
                }}
              />
              <path
                d="M 2 22 L 13 22 C 13 29 17 32 22 32 C 27 32 31 29 31 22 L 42 22 C 42 36 32 42 22 42 C 12 42 2 36 2 22 Z"
                fill={fillPorEstado(d[caras.abajo])}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.2"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, caras.abajo);
                }}
              />
              <path
                d="M 2 22 C 2 14 6 8 13 6 L 16 15 C 14 17 13 19 13 22 C 13 25 14 27 16 29 L 13 38 C 6 36 2 30 2 22 Z"
                fill={fillPorEstado(d[caras.izq])}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.2"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, caras.izq);
                }}
              />
              <path
                d="M 42 22 C 42 30 38 36 31 38 L 28 29 C 30 27 31 25 31 22 C 31 19 30 17 28 15 L 31 6 C 38 8 42 14 42 22 Z"
                fill={fillPorEstado(d[caras.der])}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.2"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, caras.der);
                }}
              />
              <circle
                cx="22"
                cy="22"
                r="9"
                fill={fillPorEstado(d.O)}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.2"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, "O");
                }}
              />
            </>
          ) : (
            <>
              <polygon
                points="2,2 42,2 32,12 12,12"
                fill={fillPorEstado(d[caras.arriba])}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.3"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, caras.arriba);
                }}
              />
              <polygon
                points="12,32 32,32 42,42 2,42"
                fill={fillPorEstado(d[caras.abajo])}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.3"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, caras.abajo);
                }}
              />
              <polygon
                points="2,2 12,12 12,32 2,42"
                fill={fillPorEstado(d[caras.izq])}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.3"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, caras.izq);
                }}
              />
              <polygon
                points="32,12 42,2 42,42 32,32"
                fill={fillPorEstado(d[caras.der])}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.3"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, caras.der);
                }}
              />
              <rect
                x="12"
                y="12"
                width="20"
                height="20"
                fill={fillPorEstado(d.O)}
                stroke={LINEA_DIAGRAMA_TENUE}
                strokeWidth="1.3"
                onClick={(e) => {
                  e.stopPropagation();
                  alternarSeleccionCara(codigoPieza, "O");
                }}
              />
            </>
          )}
          {renderSimbolosInternos(simbolos)}
        </svg>

        {!superior ? (
          <>
            {renderMarcadoresExternosPieza(simbolos, false)}
            <span className="text-[11px] font-semibold text-sky-900 leading-tight mt-0.5">
              {codigoPieza}
            </span>
          </>
        ) : (
          <div className="h-5 mt-0.5" aria-hidden="true" />
        )}

        <div className="flex flex-col gap-0.5 mt-0.5">
          <select
            value={valorMov}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              actualizarDatoPieza(codigoPieza, "movilidad", e.target.value)
            }
            title={`Movilidad (Miller) pieza ${codigoPieza}`}
            className="w-12 text-center text-[10px] border border-sky-200 rounded bg-white text-sky-900 px-0.5 py-0.5"
          >
            <option value="">M</option>
            {MOVILIDAD_MILLER.map((m) => (
              <option key={m.codigo} value={m.codigo}>
                {m.codigo}
              </option>
            ))}
          </select>

          <select
            value={valorRec}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              actualizarDatoPieza(codigoPieza, "recesion", e.target.value)
            }
            title={`Retracción / Recesión (Miller) pieza ${codigoPieza}`}
            className="w-12 text-center text-[10px] border border-sky-200 rounded bg-white text-sky-900 px-0.5 py-0.5"
          >
            <option value="">R</option>
            {RETRACCION_MILLER.map((r) => (
              <option key={r.codigo} value={r.codigo}>
                {r.codigo}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
  function renderOdontogramaMsp(hc: HistoriaClinicaCompleta) {
    const piezasSel = hc.piezasSeleccionadas || [];
    const procActualObj = PROCEDIMIENTOS_MSP.find(
      (p) => p.id === hc.procedimientoActivo
    );
    const modoCarasActivo = esProcedimientoConCaras(hc.procedimientoActivo);

    const superiorCompleta = ARCADA_SUPERIOR_COMPLETA.every((cod) =>
      piezasSel.includes(cod)
    );
    const inferiorCompleta = ARCADA_INFERIOR_COMPLETA.every((cod) =>
      piezasSel.includes(cod)
    );

    const procParaCargarCaras: "caries" | "restauracion" | undefined =
      hc.procedimientoActivo === "caries" ||
      hc.procedimientoActivo === "restauracion"
        ? hc.procedimientoActivo
        : undefined;

    return (
      <div className="border border-sky-200 rounded-2xl p-3.5 bg-sky-50/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setMostrarVista3D((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700"
          >
            {mostrarVista3D ? "Ocultar vista 3D" : "Ver en 3D para el paciente"}
          </button>
        </div>

        {mostrarVista3D && (
          <div className="mb-2">
            <Odontograma3D
              odontogramaMsp={hc.odontogramaMsp || {}}
              piezaSeleccionada={hc.piezaSeleccionada || piezasSel[0] || ""}
              onSeleccionarPieza={(codigo) => alternarSeleccionPieza(codigo)}
            />
          </div>
        )}

        <div className="bg-white border border-sky-200 rounded-xl p-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-sky-950">
              Caries / por realizar (Rojo) y Restauración (Azul) — se marcan al
              tocar las caras
            </span>
            {modoCarasActivo && (
              <span className="text-[11px] font-medium text-sky-800">
                Modo caras activo:{" "}
                <strong>
                  {hc.procedimientoActivo === "caries"
                    ? "Caries / por realizar (Rojo)"
                    : "Restauración (Azul)"}
                </strong>
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
              <button
                type="button"
                onClick={() => activarModoCarieORestauracion("caries")}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-left transition ${
                  hc.procedimientoActivo === "caries"
                    ? "bg-sky-200 text-sky-950 border-sky-400"
                    : "bg-sky-50/60 text-sky-900 border-sky-200 hover:bg-sky-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-red-500 inline-block border border-red-600" />
                  <span>Caries / por realizar</span>
                </span>
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold border bg-red-50 text-red-700 border-red-200">
                  Rojo
                </span>
              </button>

              <button
                type="button"
                onClick={() => activarModoCarieORestauracion("restauracion")}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-left transition ${
                  hc.procedimientoActivo === "restauracion"
                    ? "bg-sky-200 text-sky-950 border-sky-400"
                    : "bg-sky-50/60 text-sky-900 border-sky-200 hover:bg-sky-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block border border-blue-600" />
                  <span>Restauración</span>
                </span>
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                  Azul
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={borrarCariesYRestauraciones}
                className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 text-xs font-semibold"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={() =>
                  cargarInformacionSeleccionada(procParaCargarCaras)
                }
                className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold"
              >
                Cargar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/95 border border-sky-200 rounded-xl p-2.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-sky-950">
              Odontograma — Piezas (
              {piezasSel.length > 0 ? `#${piezasSel.join(", #")}` : "ninguna"})
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => alternarArcadaCompleta("superior")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                  superiorCompleta
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100"
                }`}
              >
                {superiorCompleta
                  ? "✓ Arcada superior completa"
                  : "Seleccionar arcada superior"}
              </button>

              <button
                type="button"
                onClick={() => alternarArcadaCompleta("inferior")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                  inferiorCompleta
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100"
                }`}
              >
                {inferiorCompleta
                  ? "✓ Arcada inferior completa"
                  : "Seleccionar arcada inferior"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-sky-800 bg-sky-50/80 border border-sky-200/80 rounded-lg px-2.5 py-1.5">
            <span><strong>V</strong> = Vestibular</span>
            <span><strong>P</strong> = Palatino / <strong>L</strong> = Lingual</span>
            <span><strong>M</strong> = Mesial</span>
            <span><strong>D</strong> = Distal</span>
            <span><strong>O</strong> = Oclusal</span>
            <span>
              <strong>M</strong> = Movilidad (M0–M3) · <strong>R</strong> = Retracción/Recesión (R-I..R-IV)
            </span>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="relative min-w-[780px] py-1">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-sky-200 z-0"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-sky-200 z-0"
              />

              <div className="relative z-10 space-y-2">
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center justify-end gap-0.5 pr-2">
                    <span className="text-[10px] font-medium text-sky-500 mr-1">V</span>
                    {SUP_DER_PERM.map((p) => renderDienteMsp(p, hc))}
                  </div>
                  <div className="flex items-center justify-start gap-0.5 pl-2">
                    {SUP_IZQ_PERM.map((p) => renderDienteMsp(p, hc))}
                    <span className="text-[10px] font-medium text-sky-500 ml-1">V</span>
                  </div>
                </div>

                <div className="space-y-1 py-0.5">
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      {SUP_DER_TEMP.map((p) => renderDienteMsp(p, hc))}
                    </div>
                    <div className="flex items-center justify-start gap-1 pl-2">
                      {SUP_IZQ_TEMP.map((p) => renderDienteMsp(p, hc))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center justify-end gap-1 pr-2">
                      {INF_DER_TEMP.map((p) => renderDienteMsp(p, hc))}
                    </div>
                    <div className="flex items-center justify-start gap-1 pl-2">
                      {INF_IZQ_TEMP.map((p) => renderDienteMsp(p, hc))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center justify-end gap-0.5 pr-2">
                    <span className="text-[10px] font-medium text-sky-500 mr-1">V</span>
                    {INF_DER_PERM.map((p) => renderDienteMsp(p, hc))}
                  </div>
                  <div className="flex items-center justify-start gap-0.5 pl-2">
                    {INF_IZQ_PERM.map((p) => renderDienteMsp(p, hc))}
                    <span className="text-[10px] font-medium text-sky-500 ml-1">V</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-sky-50/80 border border-sky-200/80 rounded-lg p-2.5 text-[11px] text-sky-900">
            <div className="space-y-0.5">
              <p className="font-semibold text-sky-950">
                Leyenda Movilidad (Miller)
              </p>
              {MOVILIDAD_MILLER.map((m) => (
                <p key={m.codigo}>
                  <strong>{m.codigo}:</strong>{" "}
                  {m.etiqueta.replace(/^Grado \d:\s*/, "")}
                </p>
              ))}
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-sky-950">
                Leyenda Retracción / Recesión (Miller)
              </p>
              {RETRACCION_MILLER.map((r) => (
                <p key={r.codigo}>
                  <strong>{r.codigo}:</strong>{" "}
                  {r.etiqueta.replace(/^Clase [I]+V?:\s*/, "")}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-sky-200 rounded-xl p-2.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-sky-950">
              Simbología
              {procActualObj
                ? ` · Activo: ${procActualObj.titulo} (${
                    hc.colorMspActivo === "rojo" ? "Rojo" : "Azul"
                  })`
                : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
            {SIMBOLOS_SECUNDARIOS_MSP.map((proc) => {
              const seleccionado = hc.procedimientoActivo === proc.id;

              return (
                <button
                  key={proc.id}
                  type="button"
                  onClick={() => seleccionarProcedimiento(proc.id)}
                  className={`flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-[11px] transition ${
                    seleccionado
                      ? "bg-sky-200 text-sky-950 border-sky-400 font-semibold"
                      : "bg-sky-50/60 text-sky-900 border-sky-200 hover:bg-sky-100"
                  }`}
                >
                  <span className="truncate">{proc.titulo}</span>
                  <span
                    className={`font-bold shrink-0 ${
                      seleccionado ? "text-sky-950" : "text-sky-600"
                    }`}
                  >
                    {proc.muestra}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-sky-200 rounded-xl p-2.5 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-sky-950 mr-1">
              Color:
            </span>

            <button
              type="button"
              onClick={() => seleccionarColorMsp("rojo")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold border ${
                hc.colorMspActivo === "rojo"
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-red-50/70 text-red-700 border-red-200"
              }`}
            >
              <span className="w-3 h-3 rounded-sm bg-red-500 border border-white inline-block" />
              Rojo (Por realizar)
            </button>

            <button
              type="button"
              onClick={() => seleccionarColorMsp("azul")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold border ${
                hc.colorMspActivo === "azul"
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-sky-50 text-sky-800 border-sky-200"
              }`}
            >
              <span className="w-3 h-3 rounded-sm bg-sky-500 border border-white inline-block" />
              Azul (Realizado)
            </button>

            <div
              className={`ml-auto flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                hc.colorMspActivo === "rojo"
                  ? "bg-red-50/80 border-red-300 text-red-800"
                  : "bg-sky-100/80 border-sky-300 text-sky-900"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  hc.colorMspActivo === "rojo" ? "bg-red-500" : "bg-sky-600"
                }`}
              />
              <span>
                Activo:{" "}
                {hc.colorMspActivo === "rojo"
                  ? "Rojo (Por realizar)"
                  : "Azul (Realizado)"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-sky-100">
            <button
              type="button"
              onClick={borrarInformacionSeleccionada}
              className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3.5 py-2 text-xs font-semibold"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => cargarInformacionSeleccionada()}
              className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold"
            >
              Cargar
            </button>
          </div>
        </div>
      </div>
    );
  }
  const pacienteActivo =
    pacientes.find((p) => p.id === pacienteSeleccionadoId) || null;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-sky-50/40">
        <p className="text-sm text-sky-800">
          Cargando sistema del consultorio...
        </p>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-sky-50/40">
        <div className="w-full max-w-sm bg-white border border-sky-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-sky-950">
            Consultorio Dental
          </h1>
          <p className="text-sm text-sky-700 mt-1">
            Ingresa con tu cuenta asignada para abrir tu panel.
          </p>

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-sky-900 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@consultorio.com"
                className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sky-900 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
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
              className="w-full rounded-lg bg-sky-600 text-white py-2.5 text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
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
    { id: "motivo_antecedentes", titulo: "2. Motivo y antecedentes" },
    { id: "clinico", titulo: "3. Signos y examen" },
    { id: "odontograma", titulo: "4. Odontograma" },
    { id: "diagnostico", titulo: "5. Diagnóstico y plan" },
    { id: "examenes", titulo: "6. Exámenes y fotos" },
    { id: "prescripciones", titulo: "7. Prescripciones" },
  ];

  function retrocederPestana() {
    const idxActual = pestanasHc.findIndex((p) => p.id === seccionHc);
    if (idxActual > 0) {
      const anterior = pestanasHc[idxActual - 1];
      setSeccionHc(anterior.id);
      setMensajeGuardado(
        `Cambios guardados. Volviste a "${anterior.titulo}".`
      );
    }
  }

  function guardarYAvanzarPestana() {
    const idxActual = pestanasHc.findIndex((p) => p.id === seccionHc);
    if (idxActual === -1) return;

    if (seccionHc === "odontograma") {
      setMensajeGuardado(
        "Primera fase finalizada (datos generales y odontograma guardados). Ya puedes continuar con el plan de tratamiento u otras secciones cuando lo requieras."
      );
      return;
    }

    if (idxActual < pestanasHc.length - 1) {
      const siguiente = pestanasHc[idxActual + 1];
      setSeccionHc(siguiente.id);
      setMensajeGuardado(
        `Sección guardada. Avanzaste a "${siguiente.titulo}".`
      );
    }
  }

  const tieneAlergiaActiva = pacienteActivo
    ? pacienteTieneAlergias(pacienteActivo.hc)
    : false;
  const leyendaAlergiaActiva = pacienteActivo
    ? obtenerLeyendaAlergia(pacienteActivo.hc)
    : "";
  const tieneEnfermedadSisActiva = pacienteActivo
    ? pacienteTieneEnfermedadSistemica(pacienteActivo.hc)
    : false;
  const detalleEnfermedadSisActiva = pacienteActivo
    ? obtenerDetalleEnfermedadesSistemicas(pacienteActivo.hc)
    : "";

  return (
    <main className="min-h-screen p-4 max-w-5xl mx-auto space-y-6 bg-sky-50/30">
      <header className="flex items-center justify-between bg-white border border-sky-200 rounded-2xl p-4 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-sky-700">
            Rol activo:{" "}
            <strong className="text-sky-950">{perfil.rol}</strong>
          </p>
          <h1 className="text-lg font-semibold text-sky-950">
            {perfil.nombre_completo || "Panel del Consultorio"}
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-900 hover:bg-sky-100"
        >
          Cerrar sesión
        </button>
      </header>

      {!moduloActivo ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setModuloActivo("historias")}
            className="text-left bg-sky-50/70 border border-sky-200 hover:border-sky-400 hover:bg-sky-100/70 rounded-xl p-4 shadow-sm transition"
          >
            <h2 className="font-medium text-sky-950">
              Historias Clínicas y Odontograma
            </h2>
            <p className="text-xs text-sky-700 mt-1">
              Pacientes ({pacientes.length}), historia clínica completa, fotos
              y CIE-10.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModuloActivo("agenda")}
            className="text-left bg-sky-50/70 border border-sky-200 hover:border-sky-400 hover:bg-sky-100/70 rounded-xl p-4 shadow-sm transition"
          >
            <h2 className="font-medium text-sky-950">Agenda y Recordatorios</h2>
            <p className="text-xs text-sky-700 mt-1">
              Citas programadas ({citas.length}) y confirmaciones.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModuloActivo("pagos")}
            className="text-left bg-sky-50/70 border border-sky-200 hover:border-sky-400 hover:bg-sky-100/70 rounded-xl p-4 shadow-sm transition"
          >
            <h2 className="font-medium text-sky-950">Presupuestos y Pagos</h2>
            <p className="text-xs text-sky-700 mt-1">
              Planes de tratamiento, abonos y saldos.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setModuloActivo("inventario")}
            className="text-left bg-sky-50/70 border border-sky-200 hover:border-sky-400 hover:bg-sky-100/70 rounded-xl p-4 shadow-sm transition"
          >
            <h2 className="font-medium text-sky-950">Inventario de Insumos</h2>
            <p className="text-xs text-sky-700 mt-1">
              Existencias y materiales del consultorio.
            </p>
          </button>
        </section>
      ) : (
        <section className="bg-white border border-sky-200 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <h2 className="text-base font-semibold text-sky-950">
              {moduloActivo === "historias" &&
                "Historias Clínicas y Odontograma"}
              {moduloActivo === "agenda" && "Agenda y Recordatorios"}
              {moduloActivo === "pagos" && "Presupuestos y Pagos"}
              {moduloActivo === "inventario" && "Inventario de Insumos"}
            </h2>
            <button
              type="button"
              onClick={() => setModuloActivo(null)}
              className="rounded-lg bg-sky-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-sky-700"
            >
              Volver al menú
            </button>
          </div>

          {moduloActivo === "historias" && (
            <div className="space-y-5">
              <form
                onSubmit={crearPaciente}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-sky-50/70 p-3.5 rounded-xl border border-sky-200"
              >
                <input
                  type="text"
                  required
                  value={nombresNuevo}
                  onChange={(e) => setNombresNuevo(e.target.value)}
                  placeholder="Nombres"
                  className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  value={apellidosNuevo}
                  onChange={(e) => setApellidosNuevo(e.target.value)}
                  placeholder="Apellidos"
                  className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={telefonoNuevo}
                  onChange={(e) => setTelefonoNuevo(e.target.value)}
                  placeholder="Teléfono / WhatsApp"
                  className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-700"
                >
                  + Crear paciente
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Paciente activo:
                </span>
                {pacientes.map((pac) => {
                  const alertaPac = pacienteTieneAlergias(pac.hc);
                  const detalleAlergiaPac = obtenerLeyendaAlergia(pac.hc);
                  const enfSisPac = pacienteTieneEnfermedadSistemica(pac.hc);
                  const detalleEnfPac =
                    obtenerDetalleEnfermedadesSistemicas(pac.hc);
                  return (
                    <button
                      key={pac.id}
                      type="button"
                      onClick={() => {
                        setPacienteSeleccionadoId(pac.id);
                        setMensajeGuardado(null);
                      }}
                      className={`inline-flex flex-wrap items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border ${
                        pac.id === pacienteActivo?.id
                          ? "bg-sky-200 text-sky-950 border-sky-400 font-semibold"
                          : "bg-white text-sky-800 border-sky-200 hover:bg-sky-50"
                      }`}
                    >
                      <span>{nombreCompletoPaciente(pac.hc)}</span>
                      {alertaPac && (
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                          {detalleAlergiaPac || "Alergia"}
                        </span>
                      )}
                      {enfSisPac && (
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-900 border border-rose-300">
                          {detalleEnfPac
                            ? `Enf. sistémica: ${detalleEnfPac}`
                            : "Paciente con enfermedad sistémica"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {pacienteActivo && (
                <div className="space-y-4 border border-sky-200 rounded-2xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-sky-950">
                          {nombreCompletoPaciente(pacienteActivo.hc)}
                        </h3>
                        {tieneAlergiaActiva && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                            {leyendaAlergiaActiva || "Padece alergias"}
                          </span>
                        )}
                        {tieneEnfermedadSisActiva && (
                          <span className="inline-flex items-center rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-xs font-semibold text-rose-900">
                            Paciente con enfermedad sistémica
                            {detalleEnfermedadSisActiva
                              ? `: ${detalleEnfermedadSisActiva}`
                              : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-sky-700 mt-0.5">
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

                  {tieneAlergiaActiva && (
                    <div className="rounded-xl bg-amber-50 border border-amber-300 px-3.5 py-2.5 text-xs font-medium text-amber-950">
                      <strong>Alerta de alergia:</strong> {leyendaAlergiaActiva}.
                    </div>
                  )}

                  {tieneEnfermedadSisActiva && (
                    <div className="rounded-xl bg-rose-50 border border-rose-300 px-3.5 py-2.5 text-xs font-medium text-rose-950">
                      <strong>Alarma clínica:</strong> Paciente con enfermedad
                      sistémica
                      {detalleEnfermedadSisActiva
                        ? ` (${detalleEnfermedadSisActiva})`
                        : ""}
                      .
                    </div>
                  )}

                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {pestanasHc.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSeccionHc(tab.id)}
                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                          seccionHc === tab.id
                            ? "bg-sky-200 text-sky-950 border-sky-400 font-semibold"
                            : "bg-sky-50/70 text-sky-800 border-sky-200 hover:bg-sky-100"
                        }`}
                      >
                        {tab.titulo}
                      </button>
                    ))}
                  </div>
                  {seccionHc === "identificacion" && (
                    <div className="space-y-4 text-sm">
                      <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-28 h-32 rounded-xl border border-sky-300 bg-white overflow-hidden flex items-center justify-center shrink-0">
                          {pacienteActivo.hc.fotoCarne ? (
                            <img
                              src={pacienteActivo.hc.fotoCarne}
                              alt={`Foto carné de ${nombreCompletoPaciente(
                                pacienteActivo.hc
                              )}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <SiluetaPersonaNeutral />
                          )}
                        </div>

                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <p className="text-xs font-semibold uppercase tracking-wide text-sky-900">
                            Fotografía de identificación
                          </p>
                          <p className="text-xs text-sky-700">
                            Si no se agrega fotografía, se muestra una silueta
                            neutral sin género.
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                            <label className="cursor-pointer rounded-lg bg-sky-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-sky-700">
                              Tomar foto pasaporte
                              <input
                                type="file"
                                accept="image/*"
                                capture="user"
                                onChange={handleSubirFotoCarne}
                                className="hidden"
                              />
                            </label>

                            <label className="cursor-pointer rounded-lg border border-sky-300 bg-white text-sky-900 px-3 py-1.5 text-xs font-medium hover:bg-sky-100">
                              Subir imagen carné
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleSubirFotoCarne}
                                className="hidden"
                              />
                            </label>

                            {pacienteActivo.hc.fotoCarne && (
                              <button
                                type="button"
                                onClick={quitarFotoCarne}
                                className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-xs font-medium hover:bg-red-100"
                              >
                                Quitar foto
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Nombres
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.nombres}
                            onChange={(e) =>
                              actualizarCampoHc("nombres", e.target.value)
                            }
                            placeholder="Nombres del paciente"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Apellidos
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.apellidos}
                            onChange={(e) =>
                              actualizarCampoHc("apellidos", e.target.value)
                            }
                            placeholder="Apellidos del paciente"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Documento de identidad
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.documento}
                            onChange={(e) =>
                              actualizarCampoHc("documento", e.target.value)
                            }
                            placeholder="Cédula / DNI / Pasaporte"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Fecha de nacimiento (Edad:{" "}
                            {calcularEdad(pacienteActivo.hc.fechaNacimiento)})
                          </label>
                          <input
                            type="date"
                            value={pacienteActivo.hc.fechaNacimiento}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "fechaNacimiento",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Género
                          </label>
                          <select
                            value={pacienteActivo.hc.genero}
                            onChange={(e) =>
                              actualizarCampoHc("genero", e.target.value)
                            }
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Seleccionar género</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Nacionalidad
                          </label>
                          <select
                            value={pacienteActivo.hc.nacionalidad}
                            onChange={(e) =>
                              actualizarCampoHc("nacionalidad", e.target.value)
                            }
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
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
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Teléfono
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.telefono}
                            onChange={(e) =>
                              actualizarCampoHc("telefono", e.target.value)
                            }
                            placeholder="Teléfono / WhatsApp"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Correo electrónico
                          </label>
                          <input
                            type="email"
                            value={pacienteActivo.hc.correo}
                            onChange={(e) =>
                              actualizarCampoHc("correo", e.target.value)
                            }
                            placeholder="correo@ejemplo.com"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Ocupación
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.ocupacion}
                            onChange={(e) =>
                              actualizarCampoHc("ocupacion", e.target.value)
                            }
                            placeholder="Ocupación actual"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Ciudad
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.ciudad}
                            onChange={(e) =>
                              actualizarCampoHc("ciudad", e.target.value)
                            }
                            placeholder="Ciudad de residencia"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Dirección o sector
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.direccion}
                            onChange={(e) =>
                              actualizarCampoHc("direccion", e.target.value)
                            }
                            placeholder="Calle, sector, referencia"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
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
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Seguro o convenio médico
                          </label>
                          <select
                            value={pacienteActivo.hc.seguroConvenio}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "seguroConvenio",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Seleccionar opción</option>
                            <option value="Particular">Particular</option>
                            <option value="Seguro">Seguro</option>
                            <option value="Convenio">Convenio</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-sky-900 mb-1">
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
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {seccionHc === "motivo_antecedentes" && (
                    <div className="space-y-5 text-sm">
                      <div className="border border-sky-200 rounded-xl p-4 space-y-3 bg-white">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
                          Motivo de consulta y enfermedad actual
                        </h4>

                        <div>
                          <label className="block text-xs font-medium text-sky-800 mb-1">
                            Motivo de consulta (en palabras del paciente)
                          </label>
                          <textarea
                            rows={2}
                            value={pacienteActivo.hc.motivoConsulta}
                            onChange={(e) =>
                              actualizarCampoHc("motivoConsulta", e.target.value)
                            }
                            placeholder="Ej. 'Me duele una muela al tomar algo frío'"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-800 mb-1">
                            Enfermedad actual (síntomas, inicio y evolución)
                          </label>
                          <textarea
                            rows={3}
                            value={pacienteActivo.hc.enfermedadActual}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "enfermedadActual",
                                e.target.value
                              )
                            }
                            placeholder="Cuándo inició, cómo ha evolucionado y qué lo agrava o alivia"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-xs font-medium text-sky-900">
                              Intensidad del dolor / molestia (1 al 10)
                            </label>
                            <label className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-1.5 text-xs font-medium text-sky-900 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pacienteActivo.hc.noPresentaDolor}
                                onChange={toggleNoPresentaDolor}
                                className="rounded border-sky-300"
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
                              actualizarCampoHc(
                                "intensidadDolor",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm disabled:bg-sky-50 disabled:text-sky-400"
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

                      <div className="border border-sky-200 rounded-xl p-4 space-y-4 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
                            Antecedentes médicos
                          </h4>
                          {tieneEnfermedadSisActiva && (
                            <span className="inline-flex items-center rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-xs font-semibold text-rose-900">
                              Paciente con enfermedad sistémica
                            </span>
                          )}
                        </div>

                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
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
                                  className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs font-medium text-sky-900 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={marcada}
                                    onChange={() =>
                                      toggleEnfermedadSistemica(enf)
                                    }
                                    className="rounded border-sky-300"
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
                              <label className="block text-xs font-medium text-sky-800 mb-1">
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
                                className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
                              Alergia a medicamentos
                            </label>
                            <label className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-1.5 text-xs font-medium text-sky-900 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  pacienteActivo.hc.alergicoMedicamentos
                                }
                                onChange={toggleAlergicoMedicamentos}
                                className="rounded border-sky-300"
                              />
                              <span>Alérgico a medicamentos</span>
                            </label>
                          </div>

                          {pacienteActivo.hc.alergicoMedicamentos && (
                            <div className="pt-1 space-y-1.5">
                              <label className="block text-xs font-medium text-amber-900">
                                Medicamento al cual es alérgico
                              </label>
                              <input
                                type="text"
                                value={pacienteActivo.hc.medicamentoAlergia}
                                onChange={(e) =>
                                  actualizarCampoHc(
                                    "medicamentoAlergia",
                                    e.target.value
                                  )
                                }
                                placeholder="Escriba el medicamento al cual es alérgico..."
                                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="border border-sky-200 rounded-xl p-3 bg-sky-50/60 space-y-2">
                            <label className="block text-xs font-medium text-sky-900">
                              ¿Tiene problemas de hemorragias?
                            </label>
                            <select
                              value={pacienteActivo.hc.problemasHemorragias}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "problemasHemorragias",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar opción</option>
                              <option value="No">No</option>
                              <option value="Sí">Sí</option>
                              <option value="No sabe / no refiere">
                                No sabe / no refiere
                              </option>
                            </select>
                            {pacienteActivo.hc.problemasHemorragias ===
                              "Sí" && (
                              <input
                                type="text"
                                value={pacienteActivo.hc.detalleHemorragias}
                                onChange={(e) =>
                                  actualizarCampoHc(
                                    "detalleHemorragias",
                                    e.target.value
                                  )
                                }
                                placeholder="Detalle el problema de hemorragias..."
                                className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </div>

                          <div className="border border-sky-200 rounded-xl p-3 bg-sky-50/60 space-y-2">
                            <label className="block text-xs font-medium text-sky-900">
                              ¿Tiene problemas con la anestesia dental?
                            </label>
                            <select
                              value={pacienteActivo.hc.problemasAnestesiaDental}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "problemasAnestesiaDental",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar opción</option>
                              <option value="No">No</option>
                              <option value="Sí">Sí</option>
                              <option value="Primera vez / no refiere">
                                Primera vez / no refiere
                              </option>
                            </select>
                            {pacienteActivo.hc.problemasAnestesiaDental ===
                              "Sí" && (
                              <input
                                type="text"
                                value={
                                  pacienteActivo.hc.detalleAnestesiaDental
                                }
                                onChange={(e) =>
                                  actualizarCampoHc(
                                    "detalleAnestesiaDental",
                                    e.target.value
                                  )
                                }
                                placeholder="Detalle la reacción o problema con anestesia..."
                                className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-sky-900 mb-1">
                              Otras alergias (materiales, alimentos, etc.)
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.alergias}
                              onChange={(e) =>
                                actualizarCampoHc("alergias", e.target.value)
                              }
                              placeholder="Látex, acrílicos, yodo, alimentos..."
                              className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-sky-900 mb-1">
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
                              className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-sky-900 mb-1">
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
                              className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-sky-900 mb-1">
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
                              className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="sm:col-span-2 border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="block text-xs font-medium text-sky-900">
                                Hábitos del paciente
                              </label>
                              <label className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-1.5 text-xs font-medium text-sky-900 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={pacienteActivo.hc.tieneHabitos}
                                  onChange={toggleTieneHabitos}
                                  className="rounded border-sky-300"
                                />
                                <span>Presenta hábitos</span>
                              </label>
                            </div>

                            <input
                              type="text"
                              disabled={!pacienteActivo.hc.tieneHabitos}
                              value={pacienteActivo.hc.habitosGenerales}
                              onChange={(e) =>
                                actualizarCampoHc(
                                  "habitosGenerales",
                                  e.target.value
                                )
                              }
                              placeholder={
                                pacienteActivo.hc.tieneHabitos
                                  ? "Escriba el hábito que presenta el paciente..."
                                  : "Marque la casilla para habilitar y escribir el hábito"
                              }
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm disabled:bg-sky-50 disabled:text-sky-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border border-sky-200 rounded-xl p-4 space-y-4 bg-white">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
                          Antecedentes odontológicos
                        </h4>

                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
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
                                  className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs font-medium text-sky-900 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={marcado}
                                    onChange={() =>
                                      toggleTratamientoPrevio(trat)
                                    }
                                    className="rounded border-sky-300"
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
                              <label className="block text-xs font-medium text-sky-800 mb-1">
                                Especificar otros tratamientos previos
                              </label>
                              <input
                                type="text"
                                value={
                                  pacienteActivo.hc.otrosTratamientosPrevios
                                }
                                onChange={(e) =>
                                  actualizarCampoHc(
                                    "otrosTratamientosPrevios",
                                    e.target.value
                                  )
                                }
                                placeholder="Escriba a qué tratamientos se refiere..."
                                className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="border border-sky-200 rounded-xl p-3 bg-sky-50/60 space-y-2">
                            <label className="block text-xs font-medium text-sky-900">
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
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar opción</option>
                              {OPCIONES_FRECUENCIA_VISITAS.map((op) => (
                                <option key={op} value={op}>
                                  {op}
                                </option>
                              ))}
                            </select>
                            {pacienteActivo.hc.frecuenciaVisitas ===
                              "Otros" && (
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
                                className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </div>

                          <div className="border border-sky-200 rounded-xl p-3 bg-sky-50/60 space-y-2">
                            <label className="block text-xs font-medium text-sky-900">
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
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
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
                                value={
                                  pacienteActivo.hc.otraExperienciaAnterior
                                }
                                onChange={(e) =>
                                  actualizarCampoHc(
                                    "otraExperienciaAnterior",
                                    e.target.value
                                  )
                                }
                                placeholder="Escriba a qué se refiere..."
                                className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </div>

                          <div className="border border-sky-200 rounded-xl p-3 bg-sky-50/60 space-y-2">
                            <label className="block text-xs font-medium text-sky-900">
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
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
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
                                className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </div>

                          <div className="border border-sky-200 rounded-xl p-3 bg-sky-50/60 space-y-2">
                            <label className="block text-xs font-medium text-sky-900">
                              Higiene oral habitual
                            </label>
                            <select
                              value={pacienteActivo.hc.higieneOral}
                              onChange={(e) =>
                                actualizarCampoHc("higieneOral", e.target.value)
                              }
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
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
                                className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {seccionHc === "clinico" && (
                    <div className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
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
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Pulso
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.pulso}
                            onChange={(e) =>
                              actualizarCampoHc("pulso", e.target.value)
                            }
                            placeholder="Ej. 72 lpm"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Temperatura
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.temperatura}
                            onChange={(e) =>
                              actualizarCampoHc("temperatura", e.target.value)
                            }
                            placeholder="Ej. 36.6 °C"
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
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
                            className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
                          Examen extraoral
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {OPCIONES_EXAMEN_EXTRAORAL.map((op) => {
                            const marcada =
                              pacienteActivo.hc.examenExtraoral.includes(op);
                            return (
                              <label
                                key={op}
                                className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs font-medium text-sky-900 cursor-pointer"
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
                                  className="rounded border-sky-300"
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
                            <label className="block text-xs font-medium text-sky-800 mb-1">
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
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
                          Examen intraoral
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {OPCIONES_EXAMEN_INTRAORAL.map((op) => {
                            const marcada =
                              pacienteActivo.hc.examenIntraoral.includes(op);
                            return (
                              <label
                                key={op}
                                className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs font-medium text-sky-900 cursor-pointer"
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
                                  className="rounded border-sky-300"
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
                            <label className="block text-xs font-medium text-sky-800 mb-1">
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
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
                          Tejidos blandos
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {OPCIONES_TEJIDOS_BLANDOS.map((op) => {
                            const marcada =
                              pacienteActivo.hc.tejidosBlandos.includes(op);
                            return (
                              <label
                                key={op}
                                className="flex items-center gap-2 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs font-medium text-sky-900 cursor-pointer"
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
                                  className="rounded border-sky-300"
                                />
                                <span>{op}</span>
                              </label>
                            );
                          })}
                        </div>
                        {pacienteActivo.hc.tejidosBlandos.includes("Otros") && (
                          <div className="pt-1">
                            <label className="block text-xs font-medium text-sky-800 mb-1">
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
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {seccionHc === "odontograma" && (() => {
                    const cpod = obtenerValoresCpod(pacienteActivo.hc);
                    return (
                      <div className="space-y-4 text-sm">
                        {renderOdontogramaMsp(pacienteActivo.hc)}

                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
                            Resumen general del odontograma
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
                            placeholder="Notas generales de piezas, restauraciones o patologías..."
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
                              Índice CPOD (sincronizado con odontograma)
                            </label>
                            <span className="text-xs font-semibold text-sky-950 bg-white border border-sky-200 rounded-lg px-2.5 py-1">
                              Total CPOD: {cpod.total}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse bg-white rounded-lg overflow-hidden">
                              <thead>
                                <tr className="bg-sky-100 text-sky-950">
                                  <th className="border border-sky-200 px-3 py-2 text-center">
                                    C (Cariados)
                                  </th>
                                  <th className="border border-sky-200 px-3 py-2 text-center">
                                    P (Perdidos)
                                  </th>
                                  <th className="border border-sky-200 px-3 py-2 text-center">
                                    O (Obturados)
                                  </th>
                                  <th className="border border-sky-200 px-3 py-2 text-center">
                                    Total CPOD
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border border-sky-200 p-2 text-center">
                                    <input
                                      type="number"
                                      min={0}
                                      value={cpod.cariados}
                                      onChange={(e) =>
                                        actualizarCpodManual(
                                          "cariados",
                                          e.target.value
                                        )
                                      }
                                      className="w-20 text-center rounded border border-sky-200 px-2 py-1 text-sm font-semibold text-red-700"
                                    />
                                  </td>
                                  <td className="border border-sky-200 p-2 text-center">
                                    <input
                                      type="number"
                                      min={0}
                                      value={cpod.perdidos}
                                      onChange={(e) =>
                                        actualizarCpodManual(
                                          "perdidos",
                                          e.target.value
                                        )
                                      }
                                      className="w-20 text-center rounded border border-sky-200 px-2 py-1 text-sm font-semibold text-sky-900"
                                    />
                                  </td>
                                  <td className="border border-sky-200 p-2 text-center">
                                    <input
                                      type="number"
                                      min={0}
                                      value={cpod.obturados}
                                      onChange={(e) =>
                                        actualizarCpodManual(
                                          "obturados",
                                          e.target.value
                                        )
                                      }
                                      className="w-20 text-center rounded border border-sky-200 px-2 py-1 text-sm font-semibold text-sky-700"
                                    />
                                  </td>
                                  <td className="border border-sky-200 p-2 text-center font-semibold text-sky-950">
                                    {cpod.total}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2">
                          <label className="block text-xs font-medium text-sky-900">
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
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">Seleccionar clasificación</option>
                            {OPCIONES_OCLUSION_ANGLE.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })()}

                  {seccionHc === "diagnostico" && (
                    <div className="space-y-4 text-sm">
                      {renderOdontogramaMsp(pacienteActivo.hc)}

                      <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-3">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
                          Diagnóstico CIE-10 (Códigos K y Z02.1)
                        </label>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <select
                            value={
                              CODIGOS_CIE10_ODONTO.some(
                                (c) =>
                                  c.codigo === pacienteActivo.hc.codigoCie10
                              )
                                ? pacienteActivo.hc.codigoCie10
                                : ""
                            }
                            onChange={(e) =>
                              seleccionarCie10DesdeLista(e.target.value)
                            }
                            className="flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-950"
                          >
                            <option value="">
                              Seleccionar código CIE-10 (K / Z02.1)...
                            </option>
                            {CODIGOS_CIE10_ODONTO.map((item) => (
                              <option key={item.codigo} value={item.codigo}>
                                {item.codigo} — {item.descripcion}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={registrarDiagnosticoSeleccionado}
                            className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold shrink-0"
                          >
                            Registrar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-sky-900 mb-1">
                              Código CIE-10
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.codigoCie10}
                              onChange={(e) =>
                                actualizarCampoHc("codigoCie10", e.target.value)
                              }
                              placeholder="Ej. K02.1 o Z02.1"
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-sky-900 mb-1">
                              Diagnóstico presuntivo o definitivo (CIE-10)
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.diagnostico}
                              onChange={(e) =>
                                actualizarCampoHc("diagnostico", e.target.value)
                              }
                              placeholder="Diagnóstico clínico según CIE-10"
                              className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        </div>

                        {(pacienteActivo.hc.diagnosticosRegistrados || [])
                          .length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <p className="text-xs font-semibold text-sky-900">
                              Diagnósticos registrados:
                            </p>
                            <ul className="space-y-1.5">
                              {pacienteActivo.hc.diagnosticosRegistrados.map(
                                (d) => (
                                  <li
                                    key={d.id}
                                    className="flex items-center justify-between gap-2 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs"
                                  >
                                    <div>
                                      <strong className="text-sky-950">
                                        {d.codigoCie10}
                                      </strong>{" "}
                                      — {d.descripcion}{" "}
                                      <span className="text-sky-700 font-medium">
                                        (Pieza: {d.pieza})
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        eliminarDiagnosticoRegistrado(d.id)
                                      }
                                      className="text-red-600 hover:underline shrink-0"
                                    >
                                      Quitar
                                    </button>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-3">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-sky-800">
                          Plan de tratamiento
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <select
                            value={pacienteActivo.hc.piezaPlanSeleccionada}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "piezaPlanSeleccionada",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-950"
                          >
                            <option value="">
                              Pieza dental ({
                                pacienteActivo.hc.piezasSeleccionadas[0] ||
                                  "General"
                              })
                            </option>
                            <option value="General">General</option>
                            {TODAS_LAS_PIEZAS.map((cod) => (
                              <option key={cod} value={cod}>
                                Pieza #{cod}
                              </option>
                            ))}
                          </select>

                          <select
                            value={
                              PROCEDIMIENTOS_MSP.some(
                                (p) =>
                                  p.titulo ===
                                  pacienteActivo.hc.procedimientoPlanSeleccionado
                              )
                                ? pacienteActivo.hc
                                    .procedimientoPlanSeleccionado
                                : ""
                            }
                            onChange={(e) =>
                              actualizarCampoHc(
                                "procedimientoPlanSeleccionado",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-950"
                          >
                            <option value="">
                              Seleccionar procedimiento...
                            </option>
                            {PROCEDIMIENTOS_MSP.map((p) => (
                              <option key={p.id} value={p.titulo}>
                                {p.titulo}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={agregarItemPlanTratamiento}
                            className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold"
                          >
                            + Añadir al plan
                          </button>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={pacienteActivo.hc.procedimientoPlanSeleccionado}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "procedimientoPlanSeleccionado",
                                e.target.value
                              )
                            }
                            placeholder="O escriba el procedimiento a realizar en la pieza..."
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>

                        {(pacienteActivo.hc.itemsPlanTratamiento || []).length >
                          0 && (
                          <ul className="space-y-1.5">
                            {pacienteActivo.hc.itemsPlanTratamiento.map(
                              (item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center justify-between gap-2 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs"
                                >
                                  <div>
                                    <strong className="text-sky-950">
                                      Pieza {item.pieza}
                                    </strong>{" "}
                                    — {item.procedimiento}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarItemPlanTratamiento(item.id)
                                    }
                                    className="text-red-600 hover:underline shrink-0"
                                  >
                                    Quitar
                                  </button>
                                </li>
                              )
                            )}
                          </ul>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-sky-900 mb-1">
                            Observaciones del plan de tratamiento
                          </label>
                          <textarea
                            rows={2}
                            value={pacienteActivo.hc.planTratamiento}
                            onChange={(e) =>
                              actualizarCampoHc("planTratamiento", e.target.value)
                            }
                            placeholder="Secuencia general de tratamientos y citas propuestas"
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {seccionHc === "examenes" && (
                    <div className="space-y-4 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-sky-900 mb-1">
                          Exámenes complementarios (radiografías, fotografías
                          clínicas, tomografías, laboratorio)
                        </label>
                        <textarea
                          rows={2}
                          value={pacienteActivo.hc.examenesComplementarios}
                          onChange={(e) =>
                            actualizarCampoHc(
                              "examenesComplementarios",
                              e.target.value
                            )
                          }
                          placeholder="Detalle o hallazgos de Rx periapical/panorámica, fotos clínicas, CBCT o análisis de laboratorio"
                          className="w-full rounded-lg border border-sky-200 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-sky-50/70 p-3.5 rounded-xl border border-sky-200">
                        <label className="cursor-pointer rounded-lg bg-sky-600 text-white px-3 py-2.5 text-center text-xs font-medium hover:bg-sky-700">
                          Tomar foto con cámara
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleSubirFoto}
                            className="hidden"
                          />
                        </label>

                        <label className="cursor-pointer rounded-lg border border-sky-300 bg-white text-sky-900 px-3 py-2.5 text-center text-xs font-medium hover:bg-sky-100">
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
                              className="border border-sky-200 rounded-xl overflow-hidden bg-white"
                            >
                              <img
                                src={foto.dataUrl}
                                alt={foto.nombreArchivo}
                                className="w-full h-36 object-cover bg-sky-50"
                              />
                              <div className="p-2.5 flex items-center justify-between gap-2 text-xs">
                                <div className="truncate">
                                  <p className="font-medium text-sky-950 truncate">
                                    {foto.nombreArchivo}
                                  </p>
                                  <p className="text-sky-600">{foto.fecha}</p>
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

                  {seccionHc === "prescripciones" && (
                    <div className="space-y-4 text-sm">
                      <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
                          Lista general de medicamentos
                        </h4>
                        <form
                          onSubmit={agregarMedicamentoCatalogo}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                        >
                          <input
                            type="text"
                            value={nuevoMedNombre}
                            onChange={(e) => setNuevoMedNombre(e.target.value)}
                            placeholder="Nombre del medicamento"
                            className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          />
                          <input
                            type="text"
                            value={nuevoMedPresentacion}
                            onChange={(e) =>
                              setNuevoMedPresentacion(e.target.value)
                            }
                            placeholder="Concentración / presentación"
                            className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold"
                          >
                            + Agregar a lista general
                          </button>
                        </form>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {catalogoMedicamentos.map((med) => {
                            const activa =
                              pacienteActivo.hc.medicamentoPrescribirId ===
                              med.id;
                            return (
                              <button
                                key={med.id}
                                type="button"
                                onClick={() =>
                                  actualizarCampoHc(
                                    "medicamentoPrescribirId",
                                    med.id
                                  )
                                }
                                className={`rounded-lg px-2.5 py-1 text-xs border transition ${
                                  activa
                                    ? "bg-sky-200 text-sky-950 border-sky-400 font-semibold"
                                    : "bg-white text-sky-800 border-sky-200 hover:bg-sky-100"
                                }`}
                              >
                                {med.nombre} · {med.presentacion}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-sky-900">
                            RP (Medicamentos a prescribir)
                          </label>
                          <select
                            value={pacienteActivo.hc.medicamentoPrescribirId}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "medicamentoPrescribirId",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-sky-950"
                          >
                            <option value="">
                              Seleccionar medicamento de la lista...
                            </option>
                            {catalogoMedicamentos.map((med) => (
                              <option key={med.id} value={med.id}>
                                {med.nombre} ({med.presentacion})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="border border-sky-200 rounded-xl p-3.5 bg-sky-50/60 space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-sky-900">
                            Indicaciones
                          </label>
                          <input
                            type="text"
                            value={pacienteActivo.hc.indicacionesPrescripcion}
                            onChange={(e) =>
                              actualizarCampoHc(
                                "indicacionesPrescripcion",
                                e.target.value
                              )
                            }
                            placeholder="Ej. Tomar 1 tableta cada 8 horas por 5 días"
                            className="w-full rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={agregarPrescripcionPaciente}
                          className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 text-xs font-semibold"
                        >
                          + Prescribir medicamento
                        </button>
                      </div>

                      {(pacienteActivo.hc.prescripciones || []).length > 0 && (
                        <div className="border border-sky-200 rounded-xl p-3.5 bg-white space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-sky-900">
                            RP e Indicaciones del paciente
                          </h4>
                          <ul className="divide-y divide-sky-100">
                            {pacienteActivo.hc.prescripciones.map((presc) => (
                              <li
                                key={presc.id}
                                className="py-2.5 flex items-start justify-between gap-3 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-sky-950">
                                    RP: {presc.medicamentoTexto}
                                  </p>
                                  <p className="text-sky-800">
                                    <strong>Indicaciones:</strong>{" "}
                                    {presc.indicaciones}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    eliminarPrescripcionPaciente(presc.id)
                                  }
                                  className="text-red-600 hover:underline shrink-0"
                                >
                                  Quitar
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {(() => {
                    const idxActual = pestanasHc.findIndex(
                      (p) => p.id === seccionHc
                    );
                    const mostrarAtras = idxActual > 0;
                    const esCierreOdontograma = seccionHc === "odontograma";
                    const mostrarSiguiente =
                      !esCierreOdontograma && idxActual < pestanasHc.length - 1;

                    return (
                      <div className="pt-2 flex items-center justify-between gap-2">
                        {mostrarAtras ? (
                          <button
                            type="button"
                            onClick={retrocederPestana}
                            className="rounded-lg border border-sky-300 bg-white text-sky-900 px-4 py-2 text-xs font-medium hover:bg-sky-50"
                          >
                            Atrás
                          </button>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-2">
                          {mostrarSiguiente && (
                            <button
                              type="button"
                              onClick={guardarYAvanzarPestana}
                              className="rounded-lg bg-sky-600 text-white px-4 py-2 text-xs font-medium hover:bg-sky-700"
                            >
                              Siguiente
                            </button>
                          )}

                          {esCierreOdontograma && (
                            <button
                              type="button"
                              onClick={guardarYAvanzarPestana}
                              className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-xs font-medium hover:bg-emerald-700"
                            >
                              Finalizar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
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
                  className="rounded-lg border border-sky-200 px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  required
                  value={motivoCita}
                  onChange={(e) => setMotivoCita(e.target.value)}
                  placeholder="Motivo de cita"
                  className="rounded-lg border border-sky-200 px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={horaCita}
                  onChange={(e) => setHoraCita(e.target.value)}
                  className="rounded-lg border border-sky-200 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 text-white px-3 py-2 text-sm font-medium hover:bg-sky-700"
                >
                  Agregar cita
                </button>
              </form>

              <ul className="divide-y divide-sky-100">
                {citas.map((cita) => (
                  <li
                    key={cita.id}
                    className="py-2.5 flex items-center justify-between gap-2 text-sm"
                  >
                    <div>
                      <strong className="text-sky-950">{cita.hora}</strong> —{" "}
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
                          : "bg-sky-100 text-sky-900"
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
            <p className="text-sm text-sky-800">
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
