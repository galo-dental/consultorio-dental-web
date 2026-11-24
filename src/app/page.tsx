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

  // Cálculos de costos fijos, depreciación, rubros (uniformes, agasajos, seguros) y servicios
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
            on
