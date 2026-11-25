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
  | "inventario"
  | "profesionales"
  | "servicios"
  | "proveedores";

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

interface ClinicaActiva {
  id: string;
  nombre: string;
  plan?: string | null;
  estado?: string | null;
}

interface Perfil {
  id: string;
  clinica_id: string | null;
  nombre_clinica: string;
  rol: RolUsuario;
  es_propietario: boolean;
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

type TipoCargoPersonal =
  | "Odontólogo"
  | "Auxiliar / Asistente"
  | "Recepcionista"
  | "Especialista";

type EsquemaPagoPersonal = "salario_fijo" | "porcentaje" | "mixto";

interface ProfesionalEquipo {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
  cargo: TipoCargoPersonal;
  especialidad: string;
  registroAces: string;
  codigoMsp: string;
  esquemaPago: EsquemaPagoPersonal;
  salarioMensual: string;
  porcentajePago: string;
  aplicaIess: boolean;
  porcentajeIess: string;
  horarioTrabajo: string;
}

type EspecialidadOdontologia =
  | "Odontología General"
  | "Operatoria y Estética Dental"
  | "Endodoncia"
  | "Periodoncia"
  | "Cirugía Oral y Maxilofacial"
  | "Rehabilitación Oral y Prótesis"
  | "Ortodoncia y Ortopedia"
  | "Odontopediatría"
  | "Implantología"
  | "Diagnóstico y Radiología";

interface CostoFijoItem {
  id: string;
  concepto: string;
  montoMensual: number;
}

interface CostoVariableItem {
  id: string;
  concepto: string;
  costoUnitario: number;
}

interface ServicioCartera {
  id: string;
  nombre: string;
  especialidad: EspecialidadOdontologia;
  duracionMin: number;
  precioNormal: number;
  precioConvenio: number;
  aplicaConvenio: boolean;
  costoVariableDirecto: number;
  honorarioTipo: "porcentaje" | "fijo";
  honorarioValor: number;
  descripcion: string;
}

interface CatalogoInsumoItem {
  nombre: string;
  categoria: string;
}

interface CatalogoEquipoItem {
  nombre: string;
  tipoBien: "Equipo odontológico" | "Instrumental clínico";
}

interface InsumoRapido {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  stockMinimo: number;
  costoUnitario: number;
  caducidad: string;
}

interface EquipoInstrumental {
  id: string;
  nombre: string;
  tipoBien: "Equipo odontológico" | "Instrumental clínico";
  cantidad: number;
  stockMinimo: number;
  valorAdquisicion: number;
  vidaUtilAnios: number;
  estado: "Operativo" | "Mantenimiento" | "Por renovar";
}

type CategoriaRubroPropiedad =
  | "Uniformes (dotación 5 uniformes)"
  | "Agasajos - Cumpleaños personal"
  | "Agasajos - Fiestas navideñas"
  | "Agasajos - Aniversario clínica"
  | "Seguro privado - Salud"
  | "Seguro privado - Contra demandas"
  | "Propiedad o equipo del consultorio";

interface RubroPropiedadSeguro {
  id: string;
  titulo: string;
  categoria: CategoriaRubroPropiedad;
  cantidadUnidades: number;
  costoUnitarioUsd: number;
  mesesProrrateo: number;
  incluirEnCostosFijos: boolean;
  notas: string;
}

type RubroProveedor =
  | "Laboratorios dentales"
  | "Servicios de marketing y redes sociales"
  | "Insumos y biomateriales"
  | "Equipos y mantenimiento"
  | "Arriendo y servicios básicos"
  | "Otros";

interface ProveedorRegistro {
  id: string;
  nombre: string;
  rubro: RubroProveedor;
  detalleServicio: string;
  modalidadPago: string;
  montoReferencial: string;
  contacto: string;
  notas: string;
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
const CATALOGO_INSUMOS_ODONTOLOGIA: CatalogoInsumoItem[] = [
  { nombre: "Guantes de nitrilo (caja x100)", categoria: "Bioseguridad" },
  { nombre: "Guantes de látex (caja x100)", categoria: "Bioseguridad" },
  { nombre: "Mascarillas quirúrgicas / KN95 (caja x50)", categoria: "Bioseguridad" },
  { nombre: "Gorros descartables (paquete x100)", categoria: "Bioseguridad" },
  { nombre: "Eyectores de saliva descartables (bolsa x100)", categoria: "Bioseguridad" },
  { nombre: "Campos quirúrgicos / baberos descartables", categoria: "Bioseguridad" },
  { nombre: "Bolsas para esterilización en autoclave", categoria: "Esterilización" },
  { nombre: "Hipoclorito de sodio / desinfectante clínico", categoria: "Bioseguridad" },
  { nombre: "Anestesia lidocaína 2% con epinefrina (caja x50)", categoria: "Anestesia" },
  { nombre: "Anestesia mepivacaína / articaína (caja x50)", categoria: "Anestesia" },
  { nombre: "Agujas cortas / largas para cárpule (caja x100)", categoria: "Anestesia" },
  { nombre: "Anestésico tópico en gel", categoria: "Anestesia" },
  { nombre: "Resina compuesta nanohíbrida (jeringa)", categoria: "Operatoria" },
  { nombre: "Resina fluida / flow (jeringa)", categoria: "Operatoria" },
  { nombre: "Ácido grabador fosfórico al 37%", categoria: "Operatoria" },
  { nombre: "Sistema adhesivo universal / bonding", categoria: "Operatoria" },
  { nombre: "Microbrush / aplicadores descartables", categoria: "Operatoria" },
  { nombre: "Discos y gomas para pulido de resina", categoria: "Operatoria" },
  { nombre: "Ionómero de vidrio restaurador / cementación", categoria: "Operatoria" },
  { nombre: "Hidróxido de calcio fraguable", categoria: "Endodoncia" },
  { nombre: "Conos de gutapercha / conos de papel", categoria: "Endodoncia" },
  { nombre: "Pasta profiláctica (envase / tubos)", categoria: "Profilaxis" },
  { nombre: "Rollos de algodón odontológicos (paquete)", categoria: "Profilaxis" },
  { nombre: "Gasas estériles (paquete)", categoria: "Cirugía" },
  { nombre: "Hojas de bisturí N° 15 / sutura", categoria: "Cirugía" },
  { nombre: "Alginato para impresión dental", categoria: "Rehabilitación" },
  { nombre: "Yeso tipo III / IV para modelos", categoria: "Rehabilitación" },
  { nombre: "Silicona de impresión (masilla y fluida)", categoria: "Rehabilitación" },
];

const CATALOGO_EQUIPOS_INSTRUMENTAL: CatalogoEquipoItem[] = [
  { nombre: "Unidad / sillón dental completo", tipoBien: "Equipo odontológico" },
  { nombre: "Autoclave de vapor clase B", tipoBien: "Equipo odontológico" },
  { nombre: "Lámpara de fotocurado LED inalámbrica", tipoBien: "Equipo odontológico" },
  { nombre: "Ultrasonido / scaler periodontal", tipoBien: "Equipo odontológico" },
  { nombre: "Compresor odontológico silencioso libre de aceite", tipoBien: "Equipo odontológico" },
  { nombre: "Pieza de mano de alta velocidad (turbina)", tipoBien: "Equipo odontológico" },
  { nombre: "Pieza de mano de baja velocidad (micromotor + contraángulo + pieza recta)", tipoBien: "Equipo odontológico" },
  { nombre: "Localizador apical electrónico", tipoBien: "Equipo odontológico" },
  { nombre: "Motor de endodoncia rotatoria", tipoBien: "Equipo odontológico" },
  { nombre: "Equipo de rayos X dental / sensor RVG", tipoBien: "Equipo odontológico" },
  { nombre: "Selladora de bolsas para esterilización", tipoBien: "Equipo odontológico" },
  { nombre: "Juego básico de exploración (espejo, sonda, pinza, cucharilla)", tipoBien: "Instrumental clínico" },
  { nombre: "Jeringa cárpule metálica", tipoBien: "Instrumental clínico" },
  { nombre: "Espátulas y condensadores para resina", tipoBien: "Instrumental clínico" },
  { nombre: "Loseta de vidrio y espátula para cemento", tipoBien: "Instrumental clínico" },
  { nombre: "Juego de fórceps y elevadores para exodoncia", tipoBien: "Instrumental clínico" },
  { nombre: "Curetas periodontales / raspadores (Gracey / universal)", tipoBien: "Instrumental clínico" },
  { nombre: "Kit de limas de endodoncia y regla calibradora", tipoBien: "Instrumental clínico" },
  { nombre: "Arco, perforadora y pinza portagrapas para dique de goma", tipoBien: "Instrumental clínico" },
  { nombre: "Cubetas para impresión (metálicas / plásticas)", tipoBien: "Instrumental clínico" },
];

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

const OPCIONES_OCLUSION_ANGLE = ["Clase I", "Clase II", "Clase III"];

const ESPECIALIDADES_ODONTOLOGIA: EspecialidadOdontologia[] = [
  "Odontología General",
  "Operatoria y Estética Dental",
  "Endodoncia",
  "Periodoncia",
  "Cirugía Oral y Maxilofacial",
  "Rehabilitación Oral y Prótesis",
  "Ortodoncia y Ortopedia",
  "Odontopediatría",
  "Implantología",
  "Diagnóstico y Radiología",
];

const CATEGORIAS_RUBRO_PROPIEDAD: CategoriaRubroPropiedad[] = [
  "Uniformes (dotación 5 uniformes)",
  "Agasajos - Cumpleaños personal",
  "Agasajos - Fiestas navideñas",
  "Agasajos - Aniversario clínica",
  "Seguro privado - Salud",
  "Seguro privado - Contra demandas",
  "Propiedad o equipo del consultorio",
];

const RUBROS_PROVEEDOR: RubroProveedor[] = [
  "Laboratorios dentales",
  "Servicios de marketing y redes sociales",
  "Insumos y biomateriales",
  "Equipos y mantenimiento",
  "Arriendo y servicios básicos",
  "Otros",
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

const PROFESIONALES_INICIALES: ProfesionalEquipo[] = [
  {
    id: "prof-1",
    nombre: "Dra. Valeria Paredes",
    telefono: "0994123456",
    direccion: "Av. Mariana de Jesús y Alemania, Quito",
    cargo: "Odontólogo",
    especialidad: "Odontología general y estética",
    registroAces: "ACES-OD-10482",
    codigoMsp: "MSP-1718293041",
    esquemaPago: "mixto",
    salarioMensual: "850",
    porcentajePago: "25",
    aplicaIess: true,
    porcentajeIess: "11.15",
    horarioTrabajo: "Lun a Vie 08:30 - 16:30",
  },
  {
    id: "prof-2",
    nombre: "Camila Herrera",
    telefono: "0987321987",
    direccion: "Sector La Carolina, Quito",
    cargo: "Auxiliar / Asistente",
    especialidad: "Asistencia clínica y esterilización",
    registroAces: "ACES-AX-20911",
    codigoMsp: "",
    esquemaPago: "salario_fijo",
    salarioMensual: "520",
    porcentajePago: "0",
    aplicaIess: true,
    porcentajeIess: "11.15",
    horarioTrabajo: "Lun a Vie 08:00 - 17:00",
  },
  {
    id: "prof-3",
    nombre: "Andrea López",
    telefono: "0991122334",
    direccion: "Sector Iñaquito, Quito",
    cargo: "Recepcionista",
    especialidad: "Agenda, caja y atención al paciente",
    registroAces: "N/A",
    codigoMsp: "",
    esquemaPago: "salario_fijo",
    salarioMensual: "500",
    porcentajePago: "0",
    aplicaIess: true,
    porcentajeIess: "11.15",
    horarioTrabajo: "Lun a Sáb 08:30 - 14:30",
  },
  {
    id: "prof-4",
    nombre: "Dr. Esteban Molina",
    telefono: "0996554433",
    direccion: "González Suárez, Quito",
    cargo: "Especialista",
    especialidad: "Endodoncia",
    registroAces: "ACES-ES-30554",
    codigoMsp: "MSP-1711223344",
    esquemaPago: "porcentaje",
    salarioMensual: "0",
    porcentajePago: "40",
    aplicaIess: false,
    porcentajeIess: "11.15",
    horarioTrabajo: "Mié y Vie 14:00 - 19:00",
  },
];

const RUBROS_PROPIEDAD_INICIALES: RubroPropiedadSeguro[] = [
  {
    id: "rub-1",
    titulo: "Dotación de 5 uniformes clínicos",
    categoria: "Uniformes (dotación 5 uniformes)",
    cantidadUnidades: 5,
    costoUnitarioUsd: 24,
    mesesProrrateo: 12,
    incluirEnCostosFijos: true,
    notas: "5 uniformes completos para el equipo.",
  },
  {
    id: "rub-2",
    titulo: "Agasajos cumpleaños del personal",
    categoria: "Agasajos - Cumpleaños personal",
    cantidadUnidades: 1,
    costoUnitarioUsd: 180,
    mesesProrrateo: 12,
    incluirEnCostosFijos: true,
    notas: "Presupuesto anual prorrateado mensualmente.",
  },
  {
    id: "rub-3",
    titulo: "Agasajos fiestas navideñas y aniversario clínica",
    categoria: "Agasajos - Fiestas navideñas",
    cantidadUnidades: 1,
    costoUnitarioUsd: 360,
    mesesProrrateo: 12,
    incluirEnCostosFijos: true,
    notas: "Incluye celebración de fin de año y aniversario.",
  },
  {
    id: "rub-4",
    titulo: "Seguro privado (salud y contra demandas)",
    categoria: "Seguro privado - Contra demandas",
    cantidadUnidades: 1,
    costoUnitarioUsd: 600,
    mesesProrrateo: 12,
    incluirEnCostosFijos: true,
    notas: "Cobertura de responsabilidad profesional / salud.",
  },
];

const COSTOS_FIJOS_INICIALES: CostoFijoItem[] = [
  { id: "cf-1", concepto: "Arriendo del consultorio", montoMensual: 550 },
  { id: "cf-2", concepto: "Servicios básicos, internet y telefonía", montoMensual: 110 },
  { id: "cf-3", concepto: "Bioseguridad, esterilización y software", montoMensual: 95 },
];

const COSTOS_VARIABLES_INICIALES: CostoVariableItem[] = [
  { id: "cv-1", concepto: "Kit bioseguridad descartable (guantes, mascarilla, eyector, campo)", costoUnitario: 2.2 },
  { id: "cv-2", concepto: "Cartucho anestesia + aguja tópica/cárpule", costoUnitario: 2.8 },
  { id: "cv-3", concepto: "Resina compuesta, grabador, adhesivo y pulido", costoUnitario: 7.5 },
  { id: "cv-4", concepto: "Insumos endodoncia (limas, irrigantes, conos, cemento)", costoUnitario: 24.0 },
];

const SERVICIOS_INICIALES: ServicioCartera[] = [
  {
    id: "srv-1",
    nombre: "Consulta y diagnóstico odontológico",
    especialidad: "Odontología General",
    duracionMin: 30,
    precioNormal: 20,
    precioConvenio: 15,
    aplicaConvenio: true,
    costoVariableDirecto: 2.2,
    honorarioTipo: "porcentaje",
    honorarioValor: 30,
    descripcion: "Evaluación clínica, revisión periodontal y plan de tratamiento.",
  },
  {
    id: "srv-2",
    nombre: "Restauración estética con resina",
    especialidad: "Operatoria y Estética Dental",
    duracionMin: 45,
    precioNormal: 45,
    precioConvenio: 36,
    aplicaConvenio: true,
    costoVariableDirecto: 12.5,
    honorarioTipo: "porcentaje",
    honorarioValor: 30,
    descripcion: "Obturación directa estética por superficie o cavidad.",
  },
  {
    id: "srv-3",
    nombre: "Endodoncia unirradicular",
    especialidad: "Endodoncia",
    duracionMin: 90,
    precioNormal: 140,
    precioConvenio: 115,
    aplicaConvenio: true,
    costoVariableDirecto: 29.0,
    honorarioTipo: "porcentaje",
    honorarioValor: 40,
    descripcion: "Tratamiento de conductos con instrumentación y obturación.",
  },
];

const INSUMOS_INICIALES: InsumoRapido[] = [
  {
    id: "ins-1",
    nombre: "Resina compuesta nanohíbrida (jeringa)",
    categoria: "Operatoria",
    cantidad: 2,
    stockMinimo: 3,
    costoUnitario: 28,
    caducidad: "2027-08",
  },
  {
    id: "ins-2",
    nombre: "Anestesia lidocaína 2% con epinefrina (caja x50)",
    categoria: "Anestesia",
    cantidad: 4,
    stockMinimo: 2,
    costoUnitario: 26,
    caducidad: "2027-05",
  },
  {
    id: "ins-3",
    nombre: "Guantes de nitrilo (caja x100)",
    categoria: "Bioseguridad",
    cantidad: 6,
    stockMinimo: 3,
    costoUnitario: 8.5,
    caducidad: "2028-01",
  },
];

const EQUIPOS_INICIALES: EquipoInstrumental[] = [
  {
    id: "eq-1",
    nombre: "Lámpara de fotocurado LED inalámbrica",
    tipoBien: "Equipo odontológico",
    cantidad: 1,
    stockMinimo: 1,
    valorAdquisicion: 420,
    vidaUtilAnios: 5,
    estado: "Operativo",
  },
  {
    id: "eq-2",
    nombre: "Autoclave de vapor clase B",
    tipoBien: "Equipo odontológico",
    cantidad: 1,
    stockMinimo: 1,
    valorAdquisicion: 2400,
    vidaUtilAnios: 8,
    estado: "Operativo",
  },
  {
    id: "eq-3",
    nombre: "Juego básico de exploración (espejo, sonda, pinza, cucharilla)",
    tipoBien: "Instrumental clínico",
    cantidad: 4,
    stockMinimo: 3,
    valorAdquisicion: 240,
    vidaUtilAnios: 4,
    estado: "Operativo",
  },
];

const PROVEEDORES_INICIALES: ProveedorRegistro[] = [
  {
    id: "prv-1",
    nombre: "Laboratorio Dental Andes",
    rubro: "Laboratorios dentales",
    detalleServicio: "Coronas en zirconio, prótesis removibles y guardas",
    modalidadPago: "Por trabajo / caso",
    montoReferencial: "Variable según orden",
    contacto: "0998112233",
    notas: "Entrega en 4 días hábiles.",
  },
  {
    id: "prv-2",
    nombre: "Agencia Pulso Dental Digital",
    rubro: "Servicios de marketing y redes sociales",
    detalleServicio: "Gestión de Instagram, TikTok, reels educativos y pauta local",
    modalidadPago: "Mensualidad fija",
    montoReferencial: "$180/mes",
    contacto: "0987654321",
    notas: "Enfocado en pacientes con agenda limitada y citas programadas.",
  },
];
const LINEA_DIAGRAMA_TENUE = "#94a3b8";

function requiereNecesidadCompra(cantidad: number, stockMinimo: number): boolean {
  return (cantidad || 0) <= Math.max(0, stockMinimo || 0);
}

function requiereLicenciaMsp(cargo: TipoCargoPersonal): boolean {
  return cargo === "Odontólogo" || cargo === "Especialista";
}

function calcularAportePatronalIess(prof: ProfesionalEquipo): number {
  if (!prof.aplicaIess) return 0;
  const salario = parseFloat(prof.salarioMensual || "0") || 0;
  const pct = parseFloat(prof.porcentajeIess || "11.15") || 0;
  return Number(((salario * pct) / 100).toFixed(2));
}

function calcularDepreciacionMensualEquipo(eq: EquipoInstrumental): number {
  const vidaMeses = Math.max(1, (eq.vidaUtilAnios || 1) * 12);
  return Number(((eq.valorAdquisicion || 0) / vidaMeses).toFixed(2));
}

function calcularTotalRubroUsd(rub: {
  cantidadUnidades: number;
  costoUnitarioUsd: number;
}): number {
  return Number(
    (
      Math.max(1, rub.cantidadUnidades || 1) * Math.max(0, rub.costoUnitarioUsd || 0)
    ).toFixed(2)
  );
}

function calcularMensualRubroUsd(rub: {
  cantidadUnidades: number;
  costoUnitarioUsd: number;
  mesesProrrateo: number;
}): number {
  const total = calcularTotalRubroUsd(rub);
  const meses = Math.max(1, rub.mesesProrrateo || 12);
  return Number((total / meses).toFixed(2));
}

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
  return color === "azul" ? "#0284c7" : "#e11d48";
}

function estadoCaraPorColor(color: ColorMsp): EstadoColorDiente {
  return color === "azul" ? "realizado" : "por_realizar";
}

function fillPorEstado(estado: EstadoColorDiente): string {
  if (estado === "realizado") return "#7dd3fc";
  if (estado === "por_realizar") return "#fda4af";
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
      med ? `Alérgico a medicamentos: ${med}` : "Alérgico a medicamentos"
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
      className="w-24 h-28 text-teal-500"
      role="img"
      aria-label="Silueta general sin género"
    >
      <circle cx="60" cy="44" r="22" fill="currentColor" opacity="0.25" />
      <path
        d="M 24 126 C 24 94 38 78 60 78 C 82 78 96 94 96 126 Z"
        fill="currentColor"
        opacity="0.25"
      />
    </svg>
  );
}

function IconoModulo({ modulo }: { modulo: Exclude<ModuloActivo, null> }) {
  switch (modulo) {
    case "historias":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "agenda":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "pagos":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "inventario":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "profesionales":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "servicios":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case "proveedores":
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
  }
}
export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [clinicaActiva, setClinicaActiva] = useState<ClinicaActiva | null>(null);
  const [moduloActivo, setModuloActivo] = useState<ModuloActivo>(null);
  const [mostrarVista3D, setMostrarVista3D] = useState(false);

  const [catalogoMedicamentos, setCatalogoMedicamentos] = useState<
    MedicamentoCatalogo[]
  >(CATALOGO_MEDICAMENTOS_INICIAL);
  const [nuevoMedNombre, setNuevoMedNombre] = useState("");
  const [nuevoMedPresentacion, setNuevoMedPresentacion] = useState("");

  // Profesionales y Equipo
  const [profesionales, setProfesionales] = useState<ProfesionalEquipo[]>(
    PROFESIONALES_INICIALES
  );
  const [profNombre, setProfNombre] = useState("");
  const [profTelefono, setProfTelefono] = useState("");
  const [profDireccion, setProfDireccion] = useState("");
  const [profCargo, setProfCargo] = useState<TipoCargoPersonal>("Odontólogo");
  const [profEspecialidad, setProfEspecialidad] = useState("");
  const [profRegistroAces, setProfRegistroAces] = useState("");
  const [profCodigoMsp, setProfCodigoMsp] = useState("");
  const [profEsquemaPago, setProfEsquemaPago] =
    useState<EsquemaPagoPersonal>("salario_fijo");
  const [profSalario, setProfSalario] = useState("");
  const [profPorcentaje, setProfPorcentaje] = useState("");
  const [profAplicaIess, setProfAplicaIess] = useState(true);
  const [profPorcentajeIess, setProfPorcentajeIess] = useState("11.15");
  const [profHorario, setProfHorario] = useState("");

  // Costos fijos y variables + Cartera de Servicios
  const [horasAtencionMensual, setHorasAtencionMensual] = useState("160");
  const [costosFijos, setCostosFijos] = useState<CostoFijoItem[]>(
    COSTOS_FIJOS_INICIALES
  );
  const [nuevoCfConcepto, setNuevoCfConcepto] = useState("");
  const [nuevoCfMonto, setNuevoCfMonto] = useState("");

  const [costosVariables, setCostosVariables] = useState<CostoVariableItem[]>(
    COSTOS_VARIABLES_INICIALES
  );
  const [nuevoCvConcepto, setNuevoCvConcepto] = useState("");
  const [nuevoCvMonto, setNuevoCvMonto] = useState("");

  const [servicios, setServicios] = useState<ServicioCartera[]>(
    SERVICIOS_INICIALES
  );
  const [srvNombre, setSrvNombre] = useState("");
  const [srvEspecialidad, setSrvEspecialidad] =
    useState<EspecialidadOdontologia>("Odontología General");
  const [srvDuracion, setSrvDuracion] = useState("45");
  const [srvPrecioNormal, setSrvPrecioNormal] = useState("");
  const [srvPrecioConvenio, setSrvPrecioConvenio] = useState("");
  const [srvAplicaConvenio, setSrvAplicaConvenio] = useState(true);
  const [srvCostoVariable, setSrvCostoVariable] = useState("5");
  const [srvHonorarioTipo, setSrvHonorarioTipo] = useState<
    "porcentaje" | "fijo"
  >("porcentaje");
  const [srvHonorarioValor, setSrvHonorarioValor] = useState("30");
  const [srvDescripcion, setSrvDescripcion] = useState("");
  const [filtroEspecialidadSrv, setFiltroEspecialidadSrv] =
    useState<string>("Todas");

  // Inventario dividido en Insumos, Equipos/Instrumental y Propiedades/Rubros
  const [tabInventario, setTabInventario] = useState<
    "insumos" | "equipos" | "propiedades"
  >("insumos");

  const [insumos, setInsumos] = useState<InsumoRapido[]>(INSUMOS_INICIALES);
  const [insSeleccionCatalogo, setInsSeleccionCatalogo] = useState<string>(
    CATALOGO_INSUMOS_ODONTOLOGIA[0].nombre
  );
  const [insNombreExtra, setInsNombreExtra] = useState("");
  const [insCategoria, setInsCategoria] = useState<string>(
    CATALOGO_INSUMOS_ODONTOLOGIA[0].categoria
  );
  const [insCantidad, setInsCantidad] = useState("1");
  const [insStockMinimo, setInsStockMinimo] = useState("2");
  const [insCostoUnitario, setInsCostoUnitario] = useState("");
  const [insCaducidad, setInsCaducidad] = useState("");

  const [equipos, setEquipos] = useState<EquipoInstrumental[]>(
    EQUIPOS_INICIALES
  );
  const [eqSeleccionCatalogo, setEqSeleccionCatalogo] = useState<string>(
    CATALOGO_EQUIPOS_INSTRUMENTAL[0].nombre
  );
  const [eqNombreExtra, setEqNombreExtra] = useState("");
  const [eqTipoBien, setEqTipoBien] = useState<
    "Equipo odontológico" | "Instrumental clínico"
  >(CATALOGO_EQUIPOS_INSTRUMENTAL[0].tipoBien);
  const [eqCantidad, setEqCantidad] = useState("1");
  const [eqStockMinimo, setEqStockMinimo] = useState("1");
  const [eqValorAdquisicion, setEqValorAdquisicion] = useState("");
  const [eqVidaUtilAnios, setEqVidaUtilAnios] = useState("5");
  const [eqEstado, setEqEstado] = useState<
    "Operativo" | "Mantenimiento" | "Por renovar"
  >("Operativo");

  const [rubrosPropiedad, setRubrosPropiedad] = useState<
    RubroPropiedadSeguro[]
  >(RUBROS_PROPIEDAD_INICIALES);
  const [rubTitulo, setRubTitulo] = useState("");
  const [rubCategoria, setRubCategoria] = useState<CategoriaRubroPropiedad>(
    "Uniformes (dotación 5 uniformes)"
  );
  const [rubCantidad, setRubCantidad] = useState("5");
  const [rubCostoUnitario, setRubCostoUnitario] = useState("");
  const [rubMesesProrrateo, setRubMesesProrrateo] = useState("12");
  const [rubIncluirFijos, setRubIncluirFijos] = useState(true);
  const [rubNotas, setRubNotas] = useState("");

  // Proveedores
  const [proveedores, setProveedores] = useState<ProveedorRegistro[]>(
    PROVEEDORES_INICIALES
  );
  const [prvNombre, setPrvNombre] = useState("");
  const [prvRubro, setPrvRubro] = useState<RubroProveedor>(
    "Servicios de marketing y redes sociales"
  );
  const [prvDetalle, setPrvDetalle] = useState("");
  const [prvModalidad, setPrvModalidad] = useState("Mensualidad fija");
  const [prvMonto, setPrvMonto] = useState("");
  const [prvContacto, setPrvContacto] = useState("");
  const [prvNotas, setPrvNotas] = useState("");

  // Pacientes y HC
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
      setClinicaActiva(null);
      setLoading(false);
      return;
    }

    const { data: membresia } = await supabase
      .from("miembros_clinica")
      .select("clinica_id, rol, es_propietario")
      .eq("usuario_id", user.id)
      .limit(1)
      .maybeSingle();

    const { data: perfilDb } = await supabase
      .from("perfiles")
      .select("id, rol, nombre_completo")
      .eq("id", user.id)
      .maybeSingle();

    const clinicaId: string | null = membresia?.clinica_id || null;
    let nombreClinica = "Consultorio Dental";

    if (clinicaId) {
      const { data: clinicaData } = await supabase
        .from("clinicas")
        .select("id, nombre, plan, estado")
        .eq("id", clinicaId)
        .maybeSingle();

      if (clinicaData) {
        nombreClinica = clinicaData.nombre || nombreClinica;
        setClinicaActiva(clinicaData);
      } else {
        setClinicaActiva({ id: clinicaId, nombre: nombreClinica });
      }
    } else {
      setClinicaActiva(null);
    }

    const rolResuelto =
      membresia?.rol || perfilDb?.rol || inferirRolRespaldo(user.email);

    setPerfil({
      id: user.id,
      clinica_id: clinicaId,
      nombre_clinica: nombreClinica,
      rol: rolResuelto,
      es_propietario: Boolean(membresia?.es_propietario),
      nombre_completo:
        perfilDb?.nombre_completo || user.email || "Usuario del Consultorio",
    });

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
    setClinicaActiva(null);
    setModuloActivo(null);
    setPassword("");
  }

  function handleCambiarCargoProfesional(nuevoCargo: TipoCargoPersonal) {
    setProfCargo(nuevoCargo);
    if (!requiereLicenciaMsp(nuevoCargo)) {
      setProfCodigoMsp("");
    }
  }

  function agregarProfesional(e: React.FormEvent) {
    e.preventDefault();
    if (!profNombre.trim()) return;

    const aplicaLicencia = requiereLicenciaMsp(profCargo);

    const nuevo: ProfesionalEquipo = {
      id: `prof-${Date.now()}`,
      nombre: profNombre.trim(),
      telefono: profTelefono.trim() || "Sin teléfono",
      direccion: profDireccion.trim() || "Sin dirección",
      cargo: profCargo,
      especialidad: profEspecialidad.trim() || "Práctica general",
      registroAces: profRegistroAces.trim() || "Pendiente",
      codigoMsp: aplicaLicencia
        ? profCodigoMsp.trim() || "Pendiente"
        : "No aplica",
      esquemaPago: profEsquemaPago,
      salarioMensual: profSalario.trim() || "0",
      porcentajePago: profPorcentaje.trim() || "0",
      aplicaIess: profAplicaIess,
      porcentajeIess: profPorcentajeIess.trim() || "11.15",
      horarioTrabajo: profHorario.trim() || "Por definir",
    };

    setProfesionales((prev) => [nuevo, ...prev]);
    setProfNombre("");
    setProfTelefono("");
    setProfDireccion("");
    setProfEspecialidad("");
    setProfRegistroAces("");
    setProfCodigoMsp("");
    setProfSalario("");
    setProfPorcentaje("");
    setProfHorario("");
  }

  function eliminarProfesional(id: string) {
    setProfesionales((prev) => prev.filter((p) => p.id !== id));
  }

  const totalSalariosFijosEquipo = profesionales.reduce(
    (acc, p) => acc + (parseFloat(p.salarioMensual || "0") || 0),
    0
  );
  const totalAportesIessPatronales = profesionales.reduce(
    (acc, p) => acc + calcularAportePatronalIess(p),
    0
  );
  const totalDepreciacionMensualEquipos = equipos.reduce(
    (acc, eq) => acc + calcularDepreciacionMensualEquipo(eq),
    0
  );
  const totalProrrateoMensualRubrosFijos = rubrosPropiedad.reduce(
    (acc, rub) =>
      rub.incluirEnCostosFijos ? acc + calcularMensualRubroUsd(rub) : acc,
    0
  );
  const totalRubrosPropiedadUsd = rubrosPropiedad.reduce(
    (acc, rub) => acc + calcularTotalRubroUsd(rub),
    0
  );
  const totalCostosFijosRegistrados = costosFijos.reduce(
    (acc, cf) => acc + (cf.montoMensual || 0),
    0
  );
  const costoFijoTotalMensualOperativo = Number(
    (
      totalCostosFijosRegistrados +
      totalSalariosFijosEquipo +
      totalAportesIessPatronales +
      totalDepreciacionMensualEquipos +
      totalProrrateoMensualRubrosFijos
    ).toFixed(2)
  );

  const horasMes = Math.max(1, parseFloat(horasAtencionMensual || "160") || 160);
  const minutosMes = horasMes * 60;
  const costoFijoPorMinuto = costoFijoTotalMensualOperativo / minutosMes;

  const alarmasInsumos = insumos.filter((i) =>
    requiereNecesidadCompra(i.cantidad, i.stockMinimo)
  ).length;
  const alarmasEquipos = equipos.filter((eq) =>
    requiereNecesidadCompra(eq.cantidad, eq.stockMinimo)
  ).length;
  const totalAlarmasCompra = alarmasInsumos + alarmasEquipos;

  function calcularEconomiaServicio(srv: {
    duracionMin: number;
    precioNormal: number;
    precioConvenio: number;
    aplicaConvenio: boolean;
    costoVariableDirecto: number;
    honorarioTipo: "porcentaje" | "fijo";
    honorarioValor: number;
  }) {
    const duracion = Math.max(1, srv.duracionMin || 30);
    const costoFijoAsignado = duracion * costoFijoPorMinuto;
    const costoVariable = Math.max(0, srv.costoVariableDirecto || 0);
    const costoTotalOperativo = costoFijoAsignado + costoVariable;

    const calcularParaTarifa = (precioVenta: number) => {
      const honorario =
        srv.honorarioTipo === "fijo"
          ? Math.max(0, srv.honorarioValor || 0)
          : (precioVenta * Math.max(0, srv.honorarioValor || 0)) / 100;
      const utilidadNeta = precioVenta - costoTotalOperativo - honorario;
      const margenPorcentaje =
        precioVenta > 0 ? (utilidadNeta / precioVenta) * 100 : 0;
      return {
        precioVenta,
        honorario,
        utilidadNeta,
        margenPorcentaje,
      };
    };

    const normal = calcularParaTarifa(Math.max(0, srv.precioNormal || 0));
    const convenio = calcularParaTarifa(Math.max(0, srv.precioConvenio || 0));

    return {
      costoFijoAsignado,
      costoVariable,
      costoTotalOperativo,
      normal,
      convenio,
    };
  }

  function agregarCostoFijo(e: React.FormEvent) {
    e.preventDefault();
    const monto = parseFloat(nuevoCfMonto || "0") || 0;
    if (!nuevoCfConcepto.trim() || monto <= 0) return;
    setCostosFijos((prev) => [
      ...prev,
      {
        id: `cf-${Date.now()}`,
        concepto: nuevoCfConcepto.trim(),
        montoMensual: monto,
      },
    ]);
    setNuevoCfConcepto("");
    setNuevoCfMonto("");
  }

  function eliminarCostoFijo(id: string) {
    setCostosFijos((prev) => prev.filter((c) => c.id !== id));
  }

  function agregarCostoVariable(e: React.FormEvent) {
    e.preventDefault();
    const monto = parseFloat(nuevoCvMonto || "0") || 0;
    if (!nuevoCvConcepto.trim() || monto <= 0) return;
    setCostosVariables((prev) => [
      ...prev,
      {
        id: `cv-${Date.now()}`,
        concepto: nuevoCvConcepto.trim(),
        costoUnitario: monto,
      },
    ]);
    setNuevoCvConcepto("");
    setNuevoCvMonto("");
  }

  function eliminarCostoVariable(id: string) {
    setCostosVariables((prev) => prev.filter((c) => c.id !== id));
  }

  function agregarServicioCartera(e: React.FormEvent) {
    e.preventDefault();
    if (!srvNombre.trim()) return;

    const precioNorm = parseFloat(srvPrecioNormal || "0") || 0;
    const precioConv = srvAplicaConvenio
      ? parseFloat(srvPrecioConvenio || "0") || precioNorm
      : precioNorm;

    const nuevo: ServicioCartera = {
      id: `srv-${Date.now()}`,
      nombre: srvNombre.trim(),
      especialidad: srvEspecialidad,
      duracionMin: Math.max(5, parseInt(srvDuracion || "30", 10) || 30),
      precioNormal: precioNorm,
      precioConvenio: precioConv,
      aplicaConvenio: srvAplicaConvenio,
      costoVariableDirecto: parseFloat(srvCostoVariable || "0") || 0,
      honorarioTipo: srvHonorarioTipo,
      honorarioValor: parseFloat(srvHonorarioValor || "0") || 0,
      descripcion: srvDescripcion.trim() || "Procedimiento odontológico",
    };

    setServicios((prev) => [nuevo, ...prev]);
    setSrvNombre("");
    setSrvPrecioNormal("");
    setSrvPrecioConvenio("");
    setSrvDescripcion("");
  }

  function eliminarServicioCartera(id: string) {
    setServicios((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSeleccionarInsumoCatalogo(nombreSeleccionado: string) {
    setInsSeleccionCatalogo(nombreSeleccionado);
    const encontrado = CATALOGO_INSUMOS_ODONTOLOGIA.find(
      (i) => i.nombre === nombreSeleccionado
    );
    if (encontrado) {
      setInsCategoria(encontrado.categoria);
    } else if (nombreSeleccionado === "__OTRO__") {
      setInsCategoria("General");
    }
  }

  function agregarInsumo(e: React.FormEvent) {
    e.preventDefault();
    const nombreFinal =
      insSeleccionCatalogo === "__OTRO__"
        ? insNombreExtra.trim()
        : insSeleccionCatalogo.trim();
    if (!nombreFinal) return;

    const nuevo: InsumoRapido = {
      id: `ins-${Date.now()}`,
      nombre: nombreFinal,
      categoria: insCategoria.trim() || "General",
      cantidad: Math.max(0, parseInt(insCantidad || "0", 10) || 0),
      stockMinimo: Math.max(0, parseInt(insStockMinimo || "0", 10) || 0),
      costoUnitario: parseFloat(insCostoUnitario || "0") || 0,
      caducidad: insCaducidad.trim() || "Sin fecha",
    };
    setInsumos((prev) => [nuevo, ...prev]);
    setInsNombreExtra("");
    setInsCantidad("1");
    setInsCostoUnitario("");
    setInsCaducidad("");
  }

  function ajustarCantidadInsumo(id: string, delta: number) {
    setInsumos((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(0, item.cantidad + delta) }
          : item
      )
    );
  }

  function eliminarInsumo(id: string) {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSeleccionarEquipoCatalogo(nombreSeleccionado: string) {
    setEqSeleccionCatalogo(nombreSeleccionado);
    const encontrado = CATALOGO_EQUIPOS_INSTRUMENTAL.find(
      (eq) => eq.nombre === nombreSeleccionado
    );
    if (encontrado) {
      setEqTipoBien(encontrado.tipoBien);
    }
  }

  function agregarEquipoInstrumental(e: React.FormEvent) {
    e.preventDefault();
    const nombreFinal =
      eqSeleccionCatalogo === "__OTRO__"
        ? eqNombreExtra.trim()
        : eqSeleccionCatalogo.trim();
    if (!nombreFinal) return;

    const nuevo: EquipoInstrumental = {
      id: `eq-${Date.now()}`,
      nombre: nombreFinal,
      tipoBien: eqTipoBien,
      cantidad: Math.max(0, parseInt(eqCantidad || "0", 10) || 0),
      stockMinimo: Math.max(0, parseInt(eqStockMinimo || "0", 10) || 0),
      valorAdquisicion: parseFloat(eqValorAdquisicion || "0") || 0,
      vidaUtilAnios: Math.max(1, parseFloat(eqVidaUtilAnios || "5") || 5),
      estado: eqEstado,
    };
    setEquipos((prev) => [nuevo, ...prev]);
    setEqNombreExtra("");
    setEqCantidad("1");
    setEqValorAdquisicion("");
    setEqVidaUtilAnios("5");
  }

  function ajustarCantidadEquipo(id: string, delta: number) {
    setEquipos((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(0, item.cantidad + delta) }
          : item
      )
    );
  }

  function eliminarEquipoInstrumental(id: string) {
    setEquipos((prev) => prev.filter((eq) => eq.id !== id));
  }

  function handleCambiarCategoriaRubro(cat: CategoriaRubroPropiedad) {
    setRubCategoria(cat);
    if (cat === "Uniformes (dotación 5 uniformes)") {
      setRubCantidad("5");
    }
  }

  function agregarRubroPropiedad(e: React.FormEvent) {
    e.preventDefault();
    if (!rubTitulo.trim()) return;

    const nuevo: RubroPropiedadSeguro = {
      id: `rub-${Date.now()}`,
      titulo: rubTitulo.trim(),
      categoria: rubCategoria,
      cantidadUnidades: Math.max(1, parseInt(rubCantidad || "1", 10) || 1),
      costoUnitarioUsd: parseFloat(rubCostoUnitario || "0") || 0,
      mesesProrrateo: Math.max(1, parseInt(rubMesesProrrateo || "12", 10) || 12),
      incluirEnCostosFijos: rubIncluirFijos,
      notas: rubNotas.trim() || "",
    };

    setRubrosPropiedad((prev) => [nuevo, ...prev]);
    setRubTitulo("");
    setRubCostoUnitario("");
    setRubNotas("");
  }

  function eliminarRubroPropiedad(id: string) {
    setRubrosPropiedad((prev) => prev.filter((r) => r.id !== id));
  }

  function agregarProveedor(e: React.FormEvent) {
    e.preventDefault();
    if (!prvNombre.trim()) return;
    const nuevo: ProveedorRegistro = {
      id: `prv-${Date.now()}`,
      nombre: prvNombre.trim(),
      rubro: prvRubro,
      detalleServicio: prvDetalle.trim() || "Prestación de servicios",
      modalidadPago: prvModalidad.trim() || "Por definir",
      montoReferencial: prvMonto.trim() || "Por definir",
      contacto: prvContacto.trim() || "Sin teléfono",
      notas: prvNotas.trim() || "",
    };
    setProveedores((prev) => [nuevo, ...prev]);
    setPrvNombre("");
    setPrvDetalle("");
    setPrvMonto("");
    setPrvContacto("");
    setPrvNotas("");
  }

  function eliminarProveedor(id: string) {
    setProveedores((prev) => prev.filter((p) => p.id !== id));
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
            ? "opacity-40 border-slate-100 bg-slate-50/40"
            : seleccionada
            ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
            : "border-transparent hover:border-slate-200"
        }`}
      >
        {superior ? (
          <>
            <span className="text-[11px] font-semibold text-slate-800 leading-tight mb-0.5">
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
            <span className="text-[11px] font-semibold text-slate-800 leading-tight mt-0.5">
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
            className="w-12 text-center text-[10px] border border-slate-200 rounded bg-white text-slate-700 px-0.5 py-0.5"
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
            className="w-12 text-center text-[10px] border border-slate-200 rounded bg-white text-slate-700 px-0.5 py-0.5"
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
      <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-800">
            Odontograma clínico interactivo
          </span>
          <button
            type="button"
            onClick={() => setMostrarVista3D((prev) => !prev)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition"
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

        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">
              Caries / por realizar (Rojo) y Restauración (Azul) — se marcan al
              tocar las caras
            </span>
            {modoCarasActivo && (
              <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
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
                    ? "bg-rose-50 text-rose-950 border-rose-400 ring-1 ring-rose-300"
                    : "bg-slate-50/70 text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                  <span>Caries / por realizar</span>
                </span>
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200">
                  Rojo
                </span>
              </button>

              <button
                type="button"
                onClick={() => activarModoCarieORestauracion("restauracion")}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-left transition ${
                  hc.procedimientoActivo === "restauracion"
                    ? "bg-sky-50 text-sky-950 border-sky-400 ring-1 ring-sky-300"
                    : "bg-slate-50/70 text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-sky-600 inline-block" />
                  <span>Restauración</span>
                </span>
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold border bg-sky-50 text-sky-700 border-sky-200">
                  Azul
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={borrarCariesYRestauraciones}
                className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 text-xs font-semibold transition"
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={() =>
                  cargarInformacionSeleccionada(procParaCargarCaras)
                }
                className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold transition"
              >
                Cargar
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">
              Piezas seleccionadas (
              {piezasSel.length > 0 ? `#${piezasSel.join(", #")}` : "ninguna"})
            </span>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => alternarArcadaCompleta("superior")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                  superiorCompleta
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
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
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {inferiorCompleta
                  ? "✓ Arcada inferior completa"
                  : "Seleccionar arcada inferior"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5">
            <span><strong className="text-slate-800">V</strong> = Vestibular</span>
            <span><strong className="text-slate-800">P</strong> = Palatino / <strong className="text-slate-800">L</strong> = Lingual</span>
            <span><strong className="text-slate-800">M</strong> = Mesial</span>
            <span><strong className="text-slate-800">D</strong> = Distal</span>
            <span><strong className="text-slate-800">O</strong> = Oclusal</span>
            <span>
              <strong className="text-slate-800">M</strong> = Movilidad (M0–M3) · <strong className="text-slate-800">R</strong> = Retracción (R-I..R-IV)
            </span>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="relative min-w-[780px] py-1">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-slate-200 z-0"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-slate-200 z-0"
              />

              <div className="relative z-10 space-y-2">
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center justify-end gap-0.5 pr-2">
                    <span className="text-[10px] font-medium text-slate-400 mr-1">V</span>
                    {SUP_DER_PERM.map((p) => renderDienteMsp(p, hc))}
                  </div>
                  <div className="flex items-center justify-start gap-0.5 pl-2">
                    {SUP_IZQ_PERM.map((p) => renderDienteMsp(p, hc))}
                    <span className="text-[10px] font-medium text-slate-400 ml-1">V</span>
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
                    <span className="text-[10px] font-medium text-slate-400 mr-1">V</span>
                    {INF_DER_PERM.map((p) => renderDienteMsp(p, hc))}
                  </div>
                  <div className="flex items-center justify-start gap-0.5 pl-2">
                    {INF_IZQ_PERM.map((p) => renderDienteMsp(p, hc))}
                    <span className="text-[10px] font-medium text-slate-400 ml-1">V</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-[11px] text-slate-700">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-900">
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
              <p className="font-semibold text-slate-900">
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

        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800">
              Simbología clínica
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
                      ? "bg-teal-50 text-teal-950 border-teal-500 font-semibold"
                      : "bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{proc.titulo}</span>
                  <span
                    className={`font-bold shrink-0 ${
                      seleccionado ? "text-teal-700" : "text-slate-500"
                    }`}
                  >
                    {proc.muestra}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 mr-1">
              Estado:
            </span>

            <button
              type="button"
              onClick={() => seleccionarColorMsp("rojo")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition ${
                hc.colorMspActivo === "rojo"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-rose-50/70 text-rose-700 border-rose-200 hover:bg-rose-50"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white inline-block" />
              Rojo (Por realizar)
            </button>

            <button
              type="button"
              onClick={() => seleccionarColorMsp("azul")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold border transition ${
                hc.colorMspActivo === "azul"
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/70"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-white inline-block" />
              Azul (Realizado)
            </button>

            <div
              className={`ml-auto flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                hc.colorMspActivo === "rojo"
                  ? "bg-rose-50/80 border-rose-200 text-rose-800"
                  : "bg-sky-50/80 border-sky-200 text-sky-900"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hc.colorMspActivo === "rojo" ? "bg-rose-500" : "bg-sky-600"
                }`}
              />
              <span>
                {hc.colorMspActivo === "rojo"
                  ? "Rojo (Por realizar)"
                  : "Azul (Realizado)"}
              </span>
            </div>
          </div>

          <div className="pt-2.5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={borrarInformacionSeleccionada}
              className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 text-xs font-semibold transition"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => cargarInformacionSeleccionada()}
              className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold transition"
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
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
          <span>Cargando sistema clínico...</span>
        </div>
      </main>
    );
  }

  if (!perfil) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-sm bg-white border border-slate-200/90 rounded-2xl p-7 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center mb-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Consultorio Dental
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Inicia sesión con tu cuenta asignada para acceder al panel clínico.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@consultorio.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-teal-600 text-white py-2.5 text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 shadow-xs transition"
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

  const serviciosFiltrados =
    filtroEspecialidadSrv === "Todas"
      ? servicios
      : servicios.filter((s) => s.especialidad === filtroEspecialidadSrv);

  const simulacionEconomica = calcularEconomiaServicio({
    duracionMin: Math.max(5, parseInt(srvDuracion || "30", 10) || 30),
    precioNormal: parseFloat(srvPrecioNormal || "0") || 0,
    precioConvenio: srvAplicaConvenio
      ? parseFloat(srvPrecioConvenio || "0") ||
        (parseFloat(srvPrecioNormal || "0") || 0)
      : parseFloat(srvPrecioNormal || "0") || 0,
    aplicaConvenio: srvAplicaConvenio,
    costoVariableDirecto: parseFloat(srvCostoVariable || "0") || 0,
    honorarioTipo: srvHonorarioTipo,
    honorarioValor: parseFloat(srvHonorarioValor || "0") || 0,
  });

  const muestraLicenciaMspEnForm = requiereLicenciaMsp(profCargo);

  const tarjetasMenu: {
    id: Exclude<ModuloActivo, null>;
    titulo: string;
    descripcion: string;
    meta: string;
    alerta?: string;
  }[] = [
    {
      id: "historias",
      titulo: "Historias Clínicas y Odontograma",
      descripcion: "Expedientes, odontograma 2D/3D, fotografías clínicas y CIE-10.",
      meta: `${pacientes.length} paciente(s)`,
    },
    {
      id: "agenda",
      titulo: "Agenda y Recordatorios",
      descripcion: "Programación de citas, horarios y confirmación de asistencia.",
      meta: `${citas.length} cita(s)`,
    },
    {
      id: "pagos",
      titulo: "Presupuestos y Pagos",
      descripcion: "Planes financieros, abonos parciales y control de saldos.",
      meta: "USD ($)",
    },
    {
      id: "inventario",
      titulo: "Inventario, Equipos y Rubros",
      descripcion: "Insumos clínicos, instrumental, depreciación y alertas de stock.",
      meta: `${insumos.length} insumos · ${equipos.length} equipos`,
      alerta:
        totalAlarmasCompra > 0
          ? `Necesidad de compra (${totalAlarmasCompra})`
          : undefined,
    },
    {
      id: "profesionales",
      titulo: "Profesionales y Equipo",
      descripcion: "Nómina, porcentajes, registros ACES/MSP y cálculo patronal IESS.",
      meta: `${profesionales.length} integrante(s)`,
    },
    {
      id: "servicios",
      titulo: "Cartera de Servicios",
      descripcion: "Tarifario particular y convenios, costos fijos/variables y utilidad.",
      meta: `${servicios.length} servicio(s)`,
    },
    {
      id: "proveedores",
      titulo: "Proveedores",
      descripcion: "Laboratorios dentales, marketing digital y servicios externos.",
      meta: `${proveedores.length} proveedor(es)`,
    },
  ];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setModuloActivo(null)}
              className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs hover:bg-teal-700 transition"
              title="Inicio del consultorio"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-900 truncate">
                  {clinicaActiva?.nombre ||
                    perfil.nombre_clinica ||
                    "Panel del Consultorio"}
                </h1>
                <span className="hidden sm:inline-flex items-center rounded-full bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-teal-800">
                  {perfil.rol}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {perfil.nombre_completo} · Moneda USD ($)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {moduloActivo && (
              <button
                type="button"
                onClick={() => setModuloActivo(null)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Inicio
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {!moduloActivo ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                  Espacio de trabajo clínico
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Selecciona un módulo para gestionar pacientes, operaciones o finanzas del consultorio.
                </p>
              </div>
              {totalAlarmasCompra > 0 && (
                <button
                  type="button"
                  onClick={() => setModuloActivo("inventario")}
                  className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100/70 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>Necesidad de compra: {totalAlarmasCompra} ítem(s)</span>
                </button>
              )}
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tarjetasMenu.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setModuloActivo(card.id)}
                  className="group text-left bg-white border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-teal-50 border border-slate-200/80 group-hover:border-teal-200 text-slate-700 group-hover:text-teal-700 flex items-center justify-center transition-colors">
                        <IconoModulo modulo={card.id} />
                      </div>
                      {card.alerta ? (
                        <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
                          {card.alerta}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-teal-600 transition-colors">
                          Abrir →
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-teal-900 transition-colors">
                        {card.titulo}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {card.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>{card.meta}</span>
                    <span className="text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ingresar
                    </span>
                  </div>
                </button>
              ))}
            </section>
          </div>
        ) : (
          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center">
                  <IconoModulo modulo={moduloActivo} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                    {moduloActivo === "historias" &&
                      "Historias Clínicas y Odontograma"}
                    {moduloActivo === "agenda" && "Agenda y Recordatorios"}
                    {moduloActivo === "pagos" && "Presupuestos y Pagos (USD $)"}
                    {moduloActivo === "inventario" &&
                      "Inventario, Equipos / Instrumental y Rubros (USD $)"}
                    {moduloActivo === "profesionales" && "Profesionales y Equipo"}
                    {moduloActivo === "servicios" &&
                      "Cartera de Servicios, Costos y Utilidad (USD $)"}
                    {moduloActivo === "proveedores" && "Proveedores del Consultorio"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {clinicaActiva?.nombre || perfil.nombre_clinica} · Módulo activo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModuloActivo(null)}
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 text-xs font-semibold transition"
              >
                ← Volver al menú
              </button>
            </div>
            {moduloActivo === "historias" && (
              <div className="space-y-5">
                <form
                  onSubmit={crearPaciente}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80"
                >
                  <input
                    type="text"
                    required
                    value={nombresNuevo}
                    onChange={(e) => setNombresNuevo(e.target.value)}
                    placeholder="Nombres"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    required
                    value={apellidosNuevo}
                    onChange={(e) => setApellidosNuevo(e.target.value)}
                    placeholder="Apellidos"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={telefonoNuevo}
                    onChange={(e) => setTelefonoNuevo(e.target.value)}
                    placeholder="Teléfono / WhatsApp"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition"
                  >
                    + Crear paciente
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                        className={`inline-flex flex-wrap items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium border transition ${
                          pac.id === pacienteActivo?.id
                            ? "bg-teal-50 text-teal-950 border-teal-500 font-semibold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span>{nombreCompletoPaciente(pac.hc)}</span>
                        {alertaPac && (
                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                            {detalleAlergiaPac || "Alergia"}
                          </span>
                        )}
                        {enfSisPac && (
                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-900 border border-rose-300">
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
                  <div className="space-y-4 border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">
                            {nombreCompletoPaciente(pacienteActivo.hc)}
                          </h3>
                          {tieneAlergiaActiva && (
                            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                              {leyendaAlergiaActiva || "Padece alergias"}
                            </span>
                          )}
                          {tieneEnfermedadSisActiva && (
                            <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-300 px-2.5 py-0.5 text-xs font-semibold text-rose-900">
                              Paciente con enfermedad sistémica
                              {detalleEnfermedadSisActiva
                                ? `: ${detalleEnfermedadSisActiva}`
                                : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Edad calculada:{" "}
                          <strong className="text-slate-700">
                            {calcularEdad(pacienteActivo.hc.fechaNacimiento)}
                          </strong>{" "}
                          · Doc: {pacienteActivo.hc.documento || "Sin registro"} ·
                          Fotos: {pacienteActivo.hc.fotos.length}
                        </p>
                      </div>
                      {mensajeGuardado && (
                        <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 font-medium">
                          {mensajeGuardado}
                        </span>
                      )}
                    </div>

                    {tieneAlergiaActiva && (
                      <div className="rounded-xl bg-amber-50/80 border border-amber-300 px-3.5 py-2.5 text-xs font-medium text-amber-950">
                        <strong>Alerta de alergia:</strong> {leyendaAlergiaActiva}.
                      </div>
                    )}

                    {tieneEnfermedadSisActiva && (
                      <div className="rounded-xl bg-rose-50/80 border border-rose-300 px-3.5 py-2.5 text-xs font-medium text-rose-950">
                        <strong>Alarma clínica:</strong> Paciente con enfermedad
                        sistémica
                        {detalleEnfermedadSisActiva
                          ? ` (${detalleEnfermedadSisActiva})`
                          : ""}
                        .
                      </div>
                    )}

                    <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
                      {pestanasHc.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSeccionHc(tab.id)}
                          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                            seccionHc === tab.id
                              ? "bg-teal-600 text-white border-teal-600 font-semibold"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {tab.titulo}
                        </button>
                      ))}
                    </div>

                    {seccionHc === "identificacion" && (
                      <div className="space-y-4 text-sm">
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-28 h-32 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
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
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-800">
                              Fotografía de identificación
                            </p>
                            <p className="text-xs text-slate-500">
                              Si no se agrega fotografía, se muestra una silueta
                              neutral sin género.
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                              <label className="cursor-pointer rounded-lg bg-teal-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-teal-700 transition">
                                Tomar foto pasaporte
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="user"
                                  onChange={handleSubirFotoCarne}
                                  className="hidden"
                                />
                              </label>

                              <label className="cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-800 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 transition">
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
                                  className="rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1.5 text-xs font-medium hover:bg-rose-100 transition"
                                >
                                  Quitar foto
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Nombres
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.nombres}
                              onChange={(e) =>
                                actualizarCampoHc("nombres", e.target.value)
                              }
                              placeholder="Nombres del paciente"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Apellidos
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.apellidos}
                              onChange={(e) =>
                                actualizarCampoHc("apellidos", e.target.value)
                              }
                              placeholder="Apellidos del paciente"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Documento de identidad
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.documento}
                              onChange={(e) =>
                                actualizarCampoHc("documento", e.target.value)
                              }
                              placeholder="Cédula / DNI / Pasaporte"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Género
                            </label>
                            <select
                              value={pacienteActivo.hc.genero}
                              onChange={(e) =>
                                actualizarCampoHc("genero", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar género</option>
                              <option value="Masculino">Masculino</option>
                              <option value="Femenino">Femenino</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Nacionalidad
                            </label>
                            <select
                              value={pacienteActivo.hc.nacionalidad}
                              onChange={(e) =>
                                actualizarCampoHc("nacionalidad", e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Teléfono
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.telefono}
                              onChange={(e) =>
                                actualizarCampoHc("telefono", e.target.value)
                              }
                              placeholder="Teléfono / WhatsApp"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Correo electrónico
                            </label>
                            <input
                              type="email"
                              value={pacienteActivo.hc.correo}
                              onChange={(e) =>
                                actualizarCampoHc("correo", e.target.value)
                              }
                              placeholder="correo@ejemplo.com"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Ocupación
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.ocupacion}
                              onChange={(e) =>
                                actualizarCampoHc("ocupacion", e.target.value)
                              }
                              placeholder="Ocupación actual"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Ciudad
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.ciudad}
                              onChange={(e) =>
                                actualizarCampoHc("ciudad", e.target.value)
                              }
                              placeholder="Ciudad de residencia"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Dirección o sector
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.direccion}
                              onChange={(e) =>
                                actualizarCampoHc("direccion", e.target.value)
                              }
                              placeholder="Calle, sector, referencia"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                              <option value="">Seleccionar opción</option>
                              <option value="Particular">Particular</option>
                              <option value="Seguro">Seguro</option>
                              <option value="Convenio">Convenio</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {seccionHc === "motivo_antecedentes" && (
                      <div className="space-y-5 text-sm">
                        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                            Motivo de consulta y enfermedad actual
                          </h4>

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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                                actualizarCampoHc(
                                  "enfermedadActual",
                                  e.target.value
                                )
                              }
                              placeholder="Cuándo inició, cómo ha evolucionado y qué lo agrava o alivia"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="block text-xs font-medium text-slate-800">
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
                                actualizarCampoHc(
                                  "intensidadDolor",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
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

                        <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-white">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                              Antecedentes médicos
                            </h4>
                            {tieneEnfermedadSisActiva && (
                              <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-300 px-2.5 py-0.5 text-xs font-semibold text-rose-900">
                                Paciente con enfermedad sistémica
                              </span>
                            )}
                          </div>

                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                />
                              </div>
                            )}
                          </div>

                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
                                Alergia a medicamentos
                              </label>
                              <label className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={
                                    pacienteActivo.hc.alergicoMedicamentos
                                  }
                                  onChange={toggleAlergicoMedicamentos}
                                  className="rounded border-slate-300"
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
                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2">
                              <label className="block text-xs font-medium text-slate-800">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                />
                              )}
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2">
                              <label className="block text-xs font-medium text-slate-800">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                />
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Otras alergias (materiales, alimentos, etc.)
                              </label>
                              <input
                                type="text"
                                value={pacienteActivo.hc.alergias}
                                onChange={(e) =>
                                  actualizarCampoHc("alergias", e.target.value)
                                }
                                placeholder="Látex, acrílicos, yodo, alimentos..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              />
                            </div>

                            <div className="sm:col-span-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="block text-xs font-medium text-slate-800">
                                  Hábitos del paciente
                                </label>
                                <label className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={pacienteActivo.hc.tieneHabitos}
                                    onChange={toggleTieneHabitos}
                                    className="rounded border-slate-300"
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-white">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                            Antecedentes odontológicos
                          </h4>

                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2">
                              <label className="block text-xs font-medium text-slate-800">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                />
                              )}
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2">
                              <label className="block text-xs font-medium text-slate-800">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                />
                              )}
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2">
                              <label className="block text-xs font-medium text-slate-800">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                />
                              )}
                            </div>

                            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2">
                              <label className="block text-xs font-medium text-slate-800">
                                Higiene oral habitual
                              </label>
                              <select
                                value={pacienteActivo.hc.higieneOral}
                                onChange={(e) =>
                                  actualizarCampoHc("higieneOral", e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Pulso
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.pulso}
                              onChange={(e) =>
                                actualizarCampoHc("pulso", e.target.value)
                              }
                              placeholder="Ej. 72 lpm"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Temperatura
                            </label>
                            <input
                              type="text"
                              value={pacienteActivo.hc.temperatura}
                              onChange={(e) =>
                                actualizarCampoHc("temperatura", e.target.value)
                              }
                              placeholder="Ej. 36.6 °C"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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

                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
                                Índice CPOD (sincronizado con odontograma)
                              </label>
                              <span className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                                Total CPOD: {cpod.total}
                              </span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs border-collapse bg-white rounded-lg overflow-hidden">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-800">
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
                                        value={cpod.cariados}
                                        onChange={(e) =>
                                          actualizarCpodManual(
                                            "cariados",
                                            e.target.value
                                          )
                                        }
                                        className="w-20 text-center rounded border border-slate-200 px-2 py-1 text-sm font-semibold text-rose-700"
                                      />
                                    </td>
                                    <td className="border border-slate-200 p-2 text-center">
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
                                        className="w-20 text-center rounded border border-slate-200 px-2 py-1 text-sm font-semibold text-slate-900"
                                      />
                                    </td>
                                    <td className="border border-slate-200 p-2 text-center">
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
                                        className="w-20 text-center rounded border border-slate-200 px-2 py-1 text-sm font-semibold text-sky-700"
                                      />
                                    </td>
                                    <td className="border border-slate-200 p-2 text-center font-semibold text-slate-900">
                                      {cpod.total}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2">
                            <label className="block text-xs font-medium text-slate-800">
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
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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

                        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
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
                              className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold shrink-0 transition"
                            >
                              Registrar
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Código CIE-10
                              </label>
                              <input
                                type="text"
                                value={pacienteActivo.hc.codigoCie10}
                                onChange={(e) =>
                                  actualizarCampoHc("codigoCie10", e.target.value)
                                }
                                placeholder="Ej. K02.1 o Z02.1"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                Diagnóstico presuntivo o definitivo (CIE-10)
                              </label>
                              <input
                                type="text"
                                value={pacienteActivo.hc.diagnostico}
                                onChange={(e) =>
                                  actualizarCampoHc("diagnostico", e.target.value)
                                }
                                placeholder="Diagnóstico clínico según CIE-10"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                          </div>

                          {(pacienteActivo.hc.diagnosticosRegistrados || [])
                            .length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <p className="text-xs font-semibold text-slate-800">
                                Diagnósticos registrados:
                              </p>
                              <ul className="space-y-1.5">
                                {pacienteActivo.hc.diagnosticosRegistrados.map(
                                  (d) => (
                                    <li
                                      key={d.id}
                                      className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                                    >
                                      <div>
                                        <strong className="text-slate-900">
                                          {d.codigoCie10}
                                        </strong>{" "}
                                        — {d.descripcion}{" "}
                                        <span className="text-teal-700 font-medium">
                                          (Pieza: {d.pieza})
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          eliminarDiagnosticoRegistrado(d.id)
                                        }
                                        className="text-rose-600 hover:underline shrink-0"
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

                        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
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
                                servicios.some(
                                  (s) =>
                                    s.nombre ===
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
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                            >
                              <option value="">
                                Seleccionar de Cartera de Servicios...
                              </option>
                              {servicios.map((srv) => (
                                <option key={srv.id} value={srv.nombre}>
                                  {srv.nombre} (${srv.precioNormal.toFixed(2)})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={agregarItemPlanTratamiento}
                              className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold transition"
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
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          {(pacienteActivo.hc.itemsPlanTratamiento || []).length >
                            0 && (
                            <ul className="space-y-1.5">
                              {pacienteActivo.hc.itemsPlanTratamiento.map(
                                (item) => (
                                  <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                                  >
                                    <div>
                                      <strong className="text-slate-900">
                                        Pieza {item.pieza}
                                      </strong>{" "}
                                      — {item.procedimiento}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        eliminarItemPlanTratamiento(item.id)
                                      }
                                      className="text-rose-600 hover:underline shrink-0"
                                    >
                                      Quitar
                                    </button>
                                  </li>
                                )
                              )}
                            </ul>
                          )}

                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Observaciones del plan de tratamiento
                            </label>
                            <textarea
                              rows={2}
                              value={pacienteActivo.hc.planTratamiento}
                              onChange={(e) =>
                                actualizarCampoHc("planTratamiento", e.target.value)
                              }
                              placeholder="Secuencia general de tratamientos y citas propuestas"
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {seccionHc === "examenes" && (
                      <div className="space-y-4 text-sm">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">
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
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                          <label className="cursor-pointer rounded-lg bg-teal-600 text-white px-3 py-2.5 text-center text-xs font-medium hover:bg-teal-700 transition">
                            Tomar foto con cámara
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleSubirFoto}
                              className="hidden"
                            />
                          </label>

                          <label className="cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-800 px-3 py-2.5 text-center text-xs font-medium hover:bg-slate-50 transition">
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
                                  className="w-full h-36 object-cover bg-slate-50"
                                />
                                <div className="p-2.5 flex items-center justify-between gap-2 text-xs">
                                  <div className="truncate">
                                    <p className="font-medium text-slate-900 truncate">
                                      {foto.nombreArchivo}
                                    </p>
                                    <p className="text-slate-500">{foto.fecha}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => eliminarFoto(foto.id)}
                                    className="text-rose-600 hover:underline shrink-0"
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
                        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              value={nuevoMedPresentacion}
                              onChange={(e) =>
                                setNuevoMedPresentacion(e.target.value)
                              }
                              placeholder="Concentración / presentación"
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                            <button
                              type="submit"
                              className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold transition"
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
                                      ? "bg-teal-50 text-teal-950 border-teal-500 font-semibold"
                                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {med.nombre} · {med.presentacion}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
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

                          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-700">
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
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={agregarPrescripcionPaciente}
                            className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-xs font-semibold transition"
                          >
                            + Prescribir medicamento
                          </button>
                        </div>

                        {(pacienteActivo.hc.prescripciones || []).length > 0 && (
                          <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                              RP e Indicaciones del paciente
                            </h4>
                            <ul className="divide-y divide-slate-100">
                              {pacienteActivo.hc.prescripciones.map((presc) => (
                                <li
                                  key={presc.id}
                                  className="py-2.5 flex items-start justify-between gap-3 text-xs"
                                >
                                  <div className="space-y-0.5">
                                    <p className="font-semibold text-slate-900">
                                      RP: {presc.medicamentoTexto}
                                    </p>
                                    <p className="text-slate-600">
                                      <strong>Indicaciones:</strong>{" "}
                                      {presc.indicaciones}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarPrescripcionPaciente(presc.id)
                                    }
                                    className="text-rose-600 hover:underline shrink-0"
                                  >
                               
            {moduloActivo === "agenda" && (
              <div className="space-y-4">
                <form
                  onSubmit={agregarCita}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80"
                >
                  <input
                    type="text"
                    required
                    value={pacienteCita}
                    onChange={(e) => setPacienteCita(e.target.value)}
                    placeholder="Nombre del paciente"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    required
                    value={motivoCita}
                    onChange={(e) => setMotivoCita(e.target.value)}
                    placeholder="Motivo de cita"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={horaCita}
                    onChange={(e) => setHoraCita(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-600 text-white px-3 py-2 text-sm font-medium hover:bg-teal-700 transition"
                  >
                    + Agregar cita
                  </button>
                </form>

                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
                  {citas.map((cita) => (
                    <li
                      key={cita.id}
                      className="p-3.5 flex items-center justify-between gap-2 text-sm"
                    >
                      <div>
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 mr-2">
                          {cita.hora}
                        </span>
                        <strong className="text-slate-900">{cita.paciente}</strong>{" "}
                        <span className="text-slate-500">({cita.motivo})</span>
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
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                          cita.confirmada
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {cita.confirmada ? "✓ Confirmada" : "Marcar recordatorio"}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {moduloActivo === "profesionales" && (
              <div className="space-y-5 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <p className="text-xs text-slate-500">Salarios fijos del mes</p>
                    <p className="text-xl font-semibold tracking-tight text-slate-900 mt-0.5">
                      ${totalSalariosFijosEquipo.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5">
                    <p className="text-xs text-amber-800">
                      Aporte patronal IESS total
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-amber-950 mt-0.5">
                      ${totalAportesIessPatronales.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5">
                    <p className="text-xs text-emerald-800">
                      Nómina fija + Aporte patronal
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-emerald-950 mt-0.5">
                      $
                      {(
                        totalSalariosFijosEquipo + totalAportesIessPatronales
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={agregarProfesional}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre del profesional o colaborador
                    </label>
                    <input
                      type="text"
                      required
                      value={profNombre}
                      onChange={(e) => setProfNombre(e.target.value)}
                      placeholder="Ej. Dra. Sofía Ruiz"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Número telefónico
                    </label>
                    <input
                      type="text"
                      value={profTelefono}
                      onChange={(e) => setProfTelefono(e.target.value)}
                      placeholder="Ej. 0991234567"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={profDireccion}
                      onChange={(e) => setProfDireccion(e.target.value)}
                      placeholder="Sector, calle principal y secundaria"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Rol o cargo
                    </label>
                    <select
                      value={profCargo}
                      onChange={(e) =>
                        handleCambiarCargoProfesional(
                          e.target.value as TipoCargoPersonal
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="Odontólogo">Odontólogo</option>
                      <option value="Especialista">Especialista</option>
                      <option value="Auxiliar / Asistente">
                        Auxiliar / Asistente
                      </option>
                      <option value="Recepcionista">Recepcionista</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Especialidad o función
                    </label>
                    <input
                      type="text"
                      value={profEspecialidad}
                      onChange={(e) => setProfEspecialidad(e.target.value)}
                      placeholder="Ej. Ortodoncia, asistente, recepción"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Registro ACES
                    </label>
                    <input
                      type="text"
                      value={profRegistroAces}
                      onChange={(e) => setProfRegistroAces(e.target.value)}
                      placeholder="Ej. ACES-OD-12345"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  {muestraLicenciaMspEnForm && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Código / licencia MSP
                      </label>
                      <input
                        type="text"
                        value={profCodigoMsp}
                        onChange={(e) => setProfCodigoMsp(e.target.value)}
                        placeholder="Ej. MSP-1712345678"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Esquema de pago
                    </label>
                    <select
                      value={profEsquemaPago}
                      onChange={(e) =>
                        setProfEsquemaPago(
                          e.target.value as EsquemaPagoPersonal
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="salario_fijo">Salario fijo (USD $)</option>
                      <option value="porcentaje">
                        Porcentaje de producción (%)
                      </option>
                      <option value="mixto">Mixto (Salario fijo + %)</option>
                    </select>
                  </div>

                  {(profEsquemaPago === "salario_fijo" ||
                    profEsquemaPago === "mixto") && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Salario mensual (USD $)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={profSalario}
                        onChange={(e) => setProfSalario(e.target.value)}
                        placeholder="Ej. 800"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  {(profEsquemaPago === "porcentaje" ||
                    profEsquemaPago === "mixto") && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Porcentaje de pago (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={profPorcentaje}
                        onChange={(e) => setProfPorcentaje(e.target.value)}
                        placeholder="Ej. 30"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profAplicaIess}
                        onChange={(e) => setProfAplicaIess(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      <span>Aplica aporte patronal IESS</span>
                    </label>
                    {profAplicaIess && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-600">Tasa (%):</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={profPorcentajeIess}
                          onChange={(e) =>
                            setProfPorcentajeIess(e.target.value)
                          }
                          className="w-20 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium"
                        />
                        <span className="text-slate-700 font-semibold ml-auto">
                          $
                          {(
                            ((parseFloat(profSalario || "0") || 0) *
                              (parseFloat(profPorcentajeIess || "11.15") ||
                                0)) /
                            100
                          ).toFixed(2)}
                          /mes
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Horario o disponibilidad
                    </label>
                    <input
                      type="text"
                      value={profHorario}
                      onChange={(e) => setProfHorario(e.target.value)}
                      placeholder="Ej. Lun-Vie 09:00-18:00 o Sábados"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition"
                    >
                      + Guardar integrante del equipo
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profesionales.map((prof) => {
                    const salarioNum = parseFloat(prof.salarioMensual || "0") || 0;
                    const pctNum = parseFloat(prof.porcentajePago || "0") || 0;
                    const aporteIess = calcularAportePatronalIess(prof);
                    const muestraMspTarjeta =
                      requiereLicenciaMsp(prof.cargo) ||
                      (prof.codigoMsp && prof.codigoMsp !== "No aplica");

                    let resumenPago = "";
                    if (prof.esquemaPago === "salario_fijo") {
                      resumenPago = `Salario fijo: $${salarioNum.toFixed(2)}/mes`;
                    } else if (prof.esquemaPago === "porcentaje") {
                      resumenPago = `Porcentaje: ${pctNum}% de producción`;
                    } else {
                      resumenPago = `Mixto: $${salarioNum.toFixed(
                        2
                      )}/mes + ${pctNum}%`;
                    }

                    return (
                      <div
                        key={prof.id}
                        className="border border-slate-200 rounded-xl p-4 bg-white space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {prof.nombre}
                            </p>
                            <p className="text-xs font-medium text-teal-700">
                              {prof.cargo} · {prof.especialidad}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarProfesional(prof.id)}
                            className="text-xs text-rose-600 hover:underline shrink-0"
                          >
                            Eliminar
                          </button>
                        </div>

                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p>
                            <strong>Teléfono:</strong> {prof.telefono} ·{" "}
                            <strong>Dirección:</strong> {prof.direccion}
                          </p>
                          <p>
                            <strong>Registro ACES:</strong> {prof.registroAces}
                            {muestraMspTarjeta && (
                              <>
                                {" "}
                                · <strong>MSP:</strong> {prof.codigoMsp}
                              </>
                            )}
                          </p>
                          <p>
                            <strong>Esquema:</strong> {resumenPago}
                          </p>
                          <p>
                            <strong>IESS patronal:</strong>{" "}
                            {prof.aplicaIess
                              ? `Sí (${prof.porcentajeIess}%) → $${aporteIess.toFixed(
                                  2
                                )}/mes`
                              : "No aplica"}
                          </p>
                          <p>
                            <strong>Horario:</strong> {prof.horarioTrabajo}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {moduloActivo === "servicios" && (
              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <p className="text-xs text-slate-500">
                      Costo fijo mensual total
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-slate-900 mt-0.5">
                      ${costoFijoTotalMensualOperativo.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Fijos ${totalCostosFijosRegistrados.toFixed(0)} + Nómina $
                      {(
                        totalSalariosFijosEquipo + totalAportesIessPatronales
                      ).toFixed(0)}{" "}
                      + Depr. ${totalDepreciacionMensualEquipos.toFixed(0)} +
                      Rubros ${totalProrrateoMensualRubrosFijos.toFixed(0)}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <p className="text-xs text-slate-500">
                      Horas de atención / mes
                    </p>
                    <input
                      type="number"
                      min="1"
                      value={horasAtencionMensual}
                      onChange={(e) => setHorasAtencionMensual(e.target.value)}
                      className="w-28 mt-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm font-semibold text-slate-900"
                    />
                  </div>

                  <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3.5">
                    <p className="text-xs text-teal-800">
                      Costo fijo por minuto
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-teal-950 mt-0.5">
                      ${costoFijoPorMinuto.toFixed(2)}/min
                    </p>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      30 min = ${(costoFijoPorMinuto * 30).toFixed(2)} · 60 min
                      = ${(costoFijoPorMinuto * 60).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
                    <p className="text-xs text-emerald-800">
                      Servicios registrados
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-emerald-950 mt-0.5">
                      {servicios.length}
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Particular y convenios
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-800">
                        Costos fijos mensuales base
                      </h3>
                      <span className="text-xs font-semibold text-slate-700">
                        ${totalCostosFijosRegistrados.toFixed(2)}/mes
                      </span>
                    </div>

                    <form
                      onSubmit={agregarCostoFijo}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        type="text"
                        value={nuevoCfConcepto}
                        onChange={(e) => setNuevoCfConcepto(e.target.value)}
                        placeholder="Ej. Arriendo, luz, agua, internet"
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={nuevoCfMonto}
                        onChange={(e) => setNuevoCfMonto(e.target.value)}
                        placeholder="Monto USD"
                        className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-teal-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-teal-700 transition"
                      >
                        + Agregar
                      </button>
                    </form>

                    <ul className="divide-y divide-slate-100 text-xs">
                      {costosFijos.map((cf) => (
                        <li
                          key={cf.id}
                          className="py-2 flex items-center justify-between gap-2"
                        >
                          <span className="text-slate-700">{cf.concepto}</span>
                          <div className="flex items-center gap-3">
                            <strong className="text-slate-900">
                              ${cf.montoMensual.toFixed(2)}
                            </strong>
                            <button
                              type="button"
                              onClick={() => eliminarCostoFijo(cf.id)}
                              className="text-rose-600 hover:underline"
                            >
                              Quitar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-800">
                        Referencia de costos variables (insumos)
                      </h3>
                      <span className="text-xs text-slate-500">Por uso</span>
                    </div>

                    <form
                      onSubmit={agregarCostoVariable}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        type="text"
                        value={nuevoCvConcepto}
                        onChange={(e) => setNuevoCvConcepto(e.target.value)}
                        placeholder="Ej. Kit resina, anestesia, endodoncia"
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={nuevoCvMonto}
                        onChange={(e) => setNuevoCvMonto(e.target.value)}
                        placeholder="Costo USD"
                        className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-teal-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-teal-700 transition"
                      >
                        + Agregar
                      </button>
                    </form>

                    <ul className="divide-y divide-slate-100 text-xs">
                      {costosVariables.map((cv) => (
                        <li
                          key={cv.id}
                          className="py-2 flex items-center justify-between gap-2"
                        >
                          <span className="text-slate-700">{cv.concepto}</span>
                          <div className="flex items-center gap-3">
                            <strong className="text-slate-900">
                              ${cv.costoUnitario.toFixed(2)}
                            </strong>
                            <button
                              type="button"
                              onClick={() => eliminarCostoVariable(cv.id)}
                              className="text-rose-600 hover:underline"
                            >
                              Quitar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <form
                  onSubmit={agregarServicioCartera}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-4"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-800">
                    Nuevo servicio en cartera y calculadora de rentabilidad
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nombre del servicio o tratamiento
                      </label>
                      <input
                        type="text"
                        required
                        value={srvNombre}
                        onChange={(e) => setSrvNombre(e.target.value)}
                        placeholder="Ej. Profilaxis ultrasónica + fluorización"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Especialidad odontológica
                      </label>
                      <select
                        value={srvEspecialidad}
                        onChange={(e) =>
                          setSrvEspecialidad(
                            e.target.value as EspecialidadOdontologia
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        {ESPECIALIDADES_ODONTOLOGIA.map((esp) => (
                          <option key={esp} value={esp}>
                            {esp}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Duración estimada (min)
                      </label>
                      <input
                        type="number"
                        min="5"
                        value={srvDuracion}
                        onChange={(e) => setSrvDuracion(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Precio normal particular (USD $)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={srvPrecioNormal}
                        onChange={(e) => setSrvPrecioNormal(e.target.value)}
                        placeholder="Ej. 35.00"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="border border-slate-200 rounded-xl p-2.5 bg-white space-y-1.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={srvAplicaConvenio}
                          onChange={(e) =>
                            setSrvAplicaConvenio(e.target.checked)
                          }
                          className="rounded border-slate-300"
                        />
                        <span>Precio convenio / seguro</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={!srvAplicaConvenio}
                        value={srvPrecioConvenio}
                        onChange={(e) => setSrvPrecioConvenio(e.target.value)}
                        placeholder="Ej. 28.00"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Costo variable directo (USD $)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={srvCostoVariable}
                        onChange={(e) => setSrvCostoVariable(e.target.value)}
                        placeholder="Insumos/materiales del caso"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="border border-slate-200 rounded-xl p-2.5 bg-white space-y-1.5">
                      <label className="block text-xs font-medium text-slate-700">
                        Honorario / comisión profesional
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          value={srvHonorarioTipo}
                          onChange={(e) =>
                            setSrvHonorarioTipo(
                              e.target.value as "porcentaje" | "fijo"
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
                        >
                          <option value="porcentaje">%</option>
                          <option value="fijo">USD $</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={srvHonorarioValor}
                          onChange={(e) => setSrvHonorarioValor(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-4">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Descripción clínica / alcance del servicio
                      </label>
                      <input
                        type="text"
                        value={srvDescripcion}
                        onChange={(e) => setSrvDescripcion(e.target.value)}
                        placeholder="Detalles incluidos en el procedimiento"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="border border-teal-200/80 bg-teal-50/70 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-slate-600">
                        Costo fijo asignado ({srvDuracion || 30} min) + Variable
                      </p>
                      <p className="font-semibold text-slate-900 text-sm mt-0.5">
                        ${simulacionEconomica.costoFijoAsignado.toFixed(2)} + $
                        {simulacionEconomica.costoVariable.toFixed(2)} = $
                        {simulacionEconomica.costoTotalOperativo.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600">
                        Utilidad neta tarifa normal ($
                        {simulacionEconomica.normal.precioVenta.toFixed(2)})
                      </p>
                      <p
                        className={`font-semibold text-sm mt-0.5 ${
                          simulacionEconomica.normal.utilidadNeta >= 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        ${simulacionEconomica.normal.utilidadNeta.toFixed(2)} (
                        {simulacionEconomica.normal.margenPorcentaje.toFixed(1)}
                        %)
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600">
                        Utilidad neta convenio ($
                        {simulacionEconomica.convenio.precioVenta.toFixed(2)})
                      </p>
                      <p
                        className={`font-semibold text-sm mt-0.5 ${
                          simulacionEconomica.convenio.utilidadNeta >= 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        ${simulacionEconomica.convenio.utilidadNeta.toFixed(2)} (
                        {simulacionEconomica.convenio.margenPorcentaje.toFixed(
                          1
                        )}
                        %)
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition"
                    >
                      + Guardar servicio en cartera
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                      Servicios configurados
                    </h3>
                    <select
                      value={filtroEspecialidadSrv}
                      onChange={(e) => setFiltroEspecialidadSrv(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium"
                    >
                      <option value="Todas">Todas las especialidades</option>
                      {ESPECIALIDADES_ODONTOLOGIA.map((esp) => (
                        <option key={esp} value={esp}>
                          {esp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serviciosFiltrados.map((srv) => {
                      const econ = calcularEconomiaServicio(srv);
                      return (
                        <div
                          key={srv.id}
                          className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {srv.nombre}
                              </p>
                              <p className="text-xs text-teal-700 font-medium">
                                {srv.especialidad} · {srv.duracionMin} min
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarServicioCartera(srv.id)}
                              className="text-xs text-rose-600 hover:underline shrink-0"
                            >
                              Eliminar
                            </button>
                          </div>

                          <p className="text-xs text-slate-600">
                            {srv.descripcion}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                            <div>
                              <p className="text-slate-500">Tarifa normal</p>
                              <p className="font-semibold text-slate-900">
                                ${srv.precioNormal.toFixed(2)}
                              </p>
                              <p
                                className={
                                  econ.normal.utilidadNeta >= 0
                                    ? "text-emerald-700 font-medium"
                                    : "text-rose-700 font-medium"
                                }
                              >
                                Utilidad: ${econ.normal.utilidadNeta.toFixed(2)}{" "}
                                ({econ.normal.margenPorcentaje.toFixed(1)}%)
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">
                                {srv.aplicaConvenio
                                  ? "Tarifa convenio"
                                  : "Convenio no aplica"}
                              </p>
                              <p className="font-semibold text-slate-900">
                                ${srv.precioConvenio.toFixed(2)}
                              </p>
                              <p
                                className={
                                  econ.convenio.utilidadNeta >= 0
                                    ? "text-emerald-700 font-medium"
                                    : "text-rose-700 font-medium"
                                }
                              >
                                Utilidad: $
                                {econ.convenio.utilidadNeta.toFixed(2)} (
                                {econ.convenio.margenPorcentaje.toFixed(1)}%)
                              </p>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>
                              Costo fijo asignado: $
                              {econ.costoFijoAsignado.toFixed(2)}
                            </span>
                            <span>
                              Costo variable: ${econ.costoVariable.toFixed(2)}
                            </span>
                            <span>
                              Honorario:{" "}
                              {srv.honorarioTipo === "fijo"
                                ? `$${srv.honorarioValor.toFixed(2)}`
                                : `${srv.honorarioValor}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {moduloActivo === "pagos" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Control de planes de tratamiento, cuotas y pagos en USD ($).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50">
                    <p className="text-xs text-slate-500">
                      Presupuestos emitidos
                    </p>
                    <p className="text-xl font-semibold tracking-tight text-slate-900 mt-1">
                      $0.00
                    </p>
                  </div>
                  <div className="border border-emerald-200/80 rounded-xl p-4 bg-emerald-50/70">
                    <p className="text-xs text-emerald-800">Abonos recibidos</p>
                    <p className="text-xl font-semibold tracking-tight text-emerald-950 mt-1">
                      $0.00
                    </p>
                  </div>
                  <div className="border border-amber-200/80 rounded-xl p-4 bg-amber-50/70">
                    <p className="text-xs text-amber-800">Saldo pendiente</p>
                    <p className="text-xl font-semibold tracking-tight text-amber-950 mt-1">
                      $0.00
                    </p>
                  </div>
                </div>
              </div>
            )}
            {moduloActivo === "inventario" && (
              <div className="space-y-5 text-sm">
                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
                  <button
                    type="button"
                    onClick={() => setTabInventario("insumos")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-medium border transition ${
                      tabInventario === "insumos"
                        ? "bg-teal-600 text-white border-teal-600 font-semibold"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Insumos y materiales ({insumos.length})
                    {alarmasInsumos > 0 ? ` · ${alarmasInsumos} alerta` : ""}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTabInventario("equipos")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-medium border transition ${
                      tabInventario === "equipos"
                        ? "bg-teal-600 text-white border-teal-600 font-semibold"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Equipos e instrumental ({equipos.length})
                    {alarmasEquipos > 0 ? ` · ${alarmasEquipos} alerta` : ""}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTabInventario("propiedades")}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-medium border transition ${
                      tabInventario === "propiedades"
                        ? "bg-teal-600 text-white border-teal-600 font-semibold"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Uniformes, agasajos y seguros ({rubrosPropiedad.length})
                  </button>
                </div>

                {tabInventario === "insumos" && (
                  <div className="space-y-4">
                    <form
                      onSubmit={agregarInsumo}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Insumo o material odontológico
                        </label>
                        <select
                          value={insSeleccionCatalogo}
                          onChange={(e) =>
                            handleSeleccionarInsumoCatalogo(e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          {CATALOGO_INSUMOS_ODONTOLOGIA.map((item) => (
                            <option key={item.nombre} value={item.nombre}>
                              {item.nombre} ({item.categoria})
                            </option>
                          ))}
                          <option value="__OTRO__">
                            Otro insumo personalizado...
                          </option>
                        </select>
                      </div>

                      {insSeleccionCatalogo === "__OTRO__" && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Nombre del nuevo insumo
                          </label>
                          <input
                            type="text"
                            required
                            value={insNombreExtra}
                            onChange={(e) => setInsNombreExtra(e.target.value)}
                            placeholder="Escriba el insumo o biomaterial"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Categoría
                        </label>
                        <input
                          type="text"
                          value={insCategoria}
                          onChange={(e) => setInsCategoria(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Cantidad actual
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={insCantidad}
                          onChange={(e) => setInsCantidad(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Stock mínimo (alarma si ≤)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={insStockMinimo}
                          onChange={(e) => setInsStockMinimo(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Costo unitario (USD $)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={insCostoUnitario}
                          onChange={(e) => setInsCostoUnitario(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Caducidad / lote
                        </label>
                        <input
                          type="text"
                          value={insCaducidad}
                          onChange={(e) => setInsCaducidad(e.target.value)}
                          placeholder="Ej. 2027-10"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                        <button
                          type="submit"
                          className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition"
                        >
                          + Agregar insumo
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2.5">
                      {insumos.map((item) => {
                        const necesitaCompra = requiereNecesidadCompra(
                          item.cantidad,
                          item.stockMinimo
                        );
                        return (
                          <div
                            key={item.id}
                            className={`border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              necesitaCompra
                                ? "border-rose-300 bg-rose-50/70"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {item.nombre}
                                </p>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  {item.categoria}
                                </span>
                                {necesitaCompra && (
                                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                                    Necesidad de compra
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600">
                                Stock: <strong>{item.cantidad}</strong> · Mínimo:{" "}
                                <strong>{item.stockMinimo}</strong> · Costo
                                unitario: ${item.costoUnitario.toFixed(2)} ·
                                Caducidad: {item.caducidad}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => ajustarCantidadInsumo(item.id, -1)}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-50"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => ajustarCantidadInsumo(item.id, 1)}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-50"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => eliminarInsumo(item.id)}
                                className="text-xs text-rose-600 hover:underline ml-1"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tabInventario === "equipos" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate-500">
                          Depreciación mensual acumulada de equipos e
                          instrumental
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          ${totalDepreciacionMensualEquipos.toFixed(2)}/mes
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        Incluida en costos fijos operativos
                      </span>
                    </div>

                    <form
                      onSubmit={agregarEquipoInstrumental}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Equipo odontológico o instrumental clínico
                        </label>
                        <select
                          value={eqSeleccionCatalogo}
                          onChange={(e) =>
                            handleSeleccionarEquipoCatalogo(e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          {CATALOGO_EQUIPOS_INSTRUMENTAL.map((eq) => (
                            <option key={eq.nombre} value={eq.nombre}>
                              {eq.nombre} ({eq.tipoBien})
                            </option>
                          ))}
                          <option value="__OTRO__">
                            Otro equipo o instrumental...
                          </option>
                        </select>
                      </div>

                      {eqSeleccionCatalogo === "__OTRO__" && (
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Nombre del equipo o instrumental
                          </label>
                          <input
                            type="text"
                            required
                            value={eqNombreExtra}
                            onChange={(e) => setEqNombreExtra(e.target.value)}
                            placeholder="Escriba el nombre"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Tipo de bien
                        </label>
                        <select
                          value={eqTipoBien}
                          onChange={(e) =>
                            setEqTipoBien(
                              e.target.value as
                                | "Equipo odontológico"
                                | "Instrumental clínico"
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="Equipo odontológico">
                            Equipo odontológico
                          </option>
                          <option value="Instrumental clínico">
                            Instrumental clínico
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={eqCantidad}
                          onChange={(e) => setEqCantidad(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Stock mínimo (alarma si ≤)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={eqStockMinimo}
                          onChange={(e) => setEqStockMinimo(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Valor de adquisición (USD $)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={eqValorAdquisicion}
                          onChange={(e) =>
                            setEqValorAdquisicion(e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Vida útil (años)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={eqVidaUtilAnios}
                          onChange={(e) => setEqVidaUtilAnios(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Estado operativo
                        </label>
                        <select
                          value={eqEstado}
                          onChange={(e) =>
                            setEqEstado(
                              e.target.value as
                                | "Operativo"
                                | "Mantenimiento"
                                | "Por renovar"
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="Operativo">Operativo</option>
                          <option value="Mantenimiento">Mantenimiento</option>
                          <option value="Por renovar">Por renovar</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                        <button
                          type="submit"
                          className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition"
                        >
                          + Guardar equipo / instrumental
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2.5">
                      {equipos.map((eq) => {
                        const necesitaCompra = requiereNecesidadCompra(
                          eq.cantidad,
                          eq.stockMinimo
                        );
                        const deprMensual = calcularDepreciacionMensualEquipo(eq);
                        return (
                          <div
                            key={eq.id}
                            className={`border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              necesitaCompra
                                ? "border-rose-300 bg-rose-50/70"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {eq.nombre}
                                </p>
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  {eq.tipoBien} · {eq.estado}
                                </span>
                                {necesitaCompra && (
                                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                                    Necesidad de compra
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600">
                                Cantidad: <strong>{eq.cantidad}</strong> · Mínimo:{" "}
                                <strong>{eq.stockMinimo}</strong> · Valor: $
                                {eq.valorAdquisicion.toFixed(2)} · Vida:{" "}
                                {eq.vidaUtilAnios} años · Depreciación: $
                                {deprMensual.toFixed(2)}/mes
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => ajustarCantidadEquipo(eq.id, -1)}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-50"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => ajustarCantidadEquipo(eq.id, 1)}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white font-semibold hover:bg-slate-50"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  eliminarEquipoInstrumental(eq.id)
                                }
                                className="text-xs text-rose-600 hover:underline ml-1"
                              >
                                Quitar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tabInventario === "propiedades" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                        <p className="text-xs text-slate-500">
                          Total rubros registrados (USD $)
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          ${totalRubrosPropiedadUsd.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3.5">
                        <p className="text-xs text-teal-800">
                          Prorrateo mensual en costos fijos
                        </p>
                        <p className="text-lg font-semibold text-teal-950">
                          ${totalProrrateoMensualRubrosFijos.toFixed(2)}/mes
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={agregarRubroPropiedad}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Concepto / título del rubro
                        </label>
                        <input
                          type="text"
                          required
                          value={rubTitulo}
                          onChange={(e) => setRubTitulo(e.target.value)}
                          placeholder="Ej. Dotación 5 uniformes, seguro contra demandas"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Categoría
                        </label>
                        <select
                          value={rubCategoria}
                          onChange={(e) =>
                            handleCambiarCategoriaRubro(
                              e.target.value as CategoriaRubroPropiedad
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          {CATEGORIAS_RUBRO_PROPIEDAD.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Unidades
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={rubCantidad}
                          onChange={(e) => setRubCantidad(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Costo unitario / anual (USD $)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rubCostoUnitario}
                          onChange={(e) => setRubCostoUnitario(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Meses de prorrateo
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={rubMesesProrrateo}
                          onChange={(e) => setRubMesesProrrateo(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rubIncluirFijos}
                            onChange={(e) =>
                              setRubIncluirFijos(e.target.checked)
                            }
                            className="rounded border-slate-300"
                          />
                          <span>Incluir prorrateo en costos fijos</span>
                        </label>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Notas o cobertura
                        </label>
                        <input
                          type="text"
                          value={rubNotas}
                          onChange={(e) => setRubNotas(e.target.value)}
                          placeholder="Detalles adicionales"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                        <button
                          type="submit"
                          className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition"
                        >
                          + Guardar rubro
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2.5">
                      {rubrosPropiedad.map((rub) => {
                        const totalUsd = calcularTotalRubroUsd(rub);
                        const mensualUsd = calcularMensualRubroUsd(rub);
                        return (
                          <div
                            key={rub.id}
                            className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-900">
                                {rub.titulo}{" "}
                                <span className="text-xs font-normal text-teal-700">
                                  ({rub.categoria})
                                </span>
                              </p>
                              <p className="text-xs text-slate-600">
                                {rub.cantidadUnidades} ud. × $
                                {rub.costoUnitarioUsd.toFixed(2)} = Total $
                                {totalUsd.toFixed(2)} · Prorrateo (
                                {rub.mesesProrrateo} meses): $
                                {mensualUsd.toFixed(2)}/mes
                                {rub.incluirEnCostosFijos
                                  ? " · En costos fijos"
                                  : " · No en costos fijos"}
                              </p>
                              {rub.notas && (
                                <p className="text-xs text-slate-500">
                                  {rub.notas}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarRubroPropiedad(rub.id)}
                              className="text-xs text-rose-600 hover:underline self-start sm:self-center shrink-0"
                            >
                              Quitar
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {moduloActivo === "proveedores" && (
              <div className="space-y-5 text-sm">
                <form
                  onSubmit={agregarProveedor}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre del proveedor o laboratorio
                    </label>
                    <input
                      type="text"
                      required
                      value={prvNombre}
                      onChange={(e) => setPrvNombre(e.target.value)}
                      placeholder="Ej. Laboratorio Dental Sur"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Rubro
                    </label>
                    <select
                      value={prvRubro}
                      onChange={(e) =>
                        setPrvRubro(e.target.value as RubroProveedor)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      {RUBROS_PROVEEDOR.map((rub) => (
                        <option key={rub} value={rub}>
                          {rub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Teléfono o contacto
                    </label>
                    <input
                      type="text"
                      value={prvContacto}
                      onChange={(e) => setPrvContacto(e.target.value)}
                      placeholder="Ej. 0991234567"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Servicio o producto que presta
                    </label>
                    <input
                      type="text"
                      value={prvDetalle}
                      onChange={(e) => setPrvDetalle(e.target.value)}
                      placeholder="Ej. Prótesis fijas, gestión de redes sociales, insumos"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Modalidad de pago
                    </label>
                    <input
                      type="text"
                      value={prvModalidad}
                      onChange={(e) => setPrvModalidad(e.target.value)}
                      placeholder="Ej. Mensualidad fija, por orden"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Monto referencial (USD $)
                    </label>
                    <input
                      type="text"
                      value={prvMonto}
                      onChange={(e) => setPrvMonto(e.target.value)}
                      placeholder="Ej. $150/mes o según trabajo"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Notas o acuerdos
                    </label>
                    <input
                      type="text"
                      value={prvNotas}
                      onChange={(e) => setPrvNotas(e.target.value)}
                      placeholder="Tiempos de entrega, condiciones, etc."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="rounded-lg bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition"
                    >
                      + Guardar proveedor
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {proveedores.map((prv) => (
                    <div
                      key={prv.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {prv.nombre}
                          </p>
                          <p className="text-xs font-medium text-teal-700">
                            {prv.rubro}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarProveedor(prv.id)}
                          className="text-xs text-rose-600 hover:underline shrink-0"
                        >
                          Eliminar
                        </button>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>Servicio:</strong> {prv.detalleServicio}
                      </p>
                      <p className="text-xs text-slate-600">
                        <strong>Pago:</strong> {prv.modalidadPago} ·{" "}
                        <strong>Referencia:</strong> {prv.montoReferencial}
                      </p>
                      <p className="text-xs text-slate-600">
                        <strong>Contacto:</strong> {prv.contacto}
                      </p>
                      {prv.notas && (
                        <p className="text-xs text-slate-500">{prv.notas}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
