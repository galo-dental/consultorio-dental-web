"use client";

import { useEffect, useRef, useState } from "react";

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
  tipo: Exclude<TipoProcedimientoMsp, "ninguno"> | string;
  color: ColorMsp;
}

interface EstadoPiezaMsp {
  O: EstadoColorDiente;
  V: EstadoColorDiente;
  L: EstadoColorDiente;
  M: EstadoColorDiente;
  D: EstadoColorDiente;
  simbolos: SimboloAplicado[];
}

interface Props {
  odontogramaMsp: Record<string, EstadoPiezaMsp>;
  piezaSeleccionada?: string;
  onSeleccionarPieza?: (codigo: string) => void;
}

const PERMANENTE_SUPERIOR = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
];

const TEMPORAL_SUPERIOR = [
  "55", "54", "53", "52", "51",
  "61", "62", "63", "64", "65",
];

const TEMPORAL_INFERIOR = [
  "85", "84", "83", "82", "81",
  "71", "72", "73", "74", "75",
];

const PERMANENTE_INFERIOR = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
];

type TipoAnatomico =
  | "molar_sup"
  | "premolar"
  | "canino"
  | "incisivo"
  | "molar_inf";

function obtenerTipoAnatomico(codigo: string): TipoAnatomico {
  const ult = Number(codigo.slice(-1));
  const esSup =
    codigo.startsWith("1") ||
    codigo.startsWith("2") ||
    codigo.startsWith("5") ||
    codigo.startsWith("6");

  if (
    codigo.startsWith("5") ||
    codigo.startsWith("6") ||
    codigo.startsWith("7") ||
    codigo.startsWith("8")
  ) {
    if (ult === 5 || ult === 4) return esSup ? "molar_sup" : "molar_inf";
    if (ult === 3) return "canino";
    return "incisivo";
  }

  if (ult >= 6) return esSup ? "molar_sup" : "molar_inf";
  if (ult === 4 || ult === 5) return "premolar";
  if (ult === 3) return "canino";
  return "incisivo";
}

function esCuadranteDerecho(codigo: string): boolean {
  return (
    codigo.startsWith("1") ||
    codigo.startsWith("4") ||
    codigo.startsWith("5") ||
    codigo.startsWith("8")
  );
}

function esArcadaSuperior(codigo: string): boolean {
  return (
    codigo.startsWith("1") ||
    codigo.startsWith("2") ||
    codigo.startsWith("5") ||
    codigo.startsWith("6")
  );
}

function obtenerCarasRelativas(codigo: string): {
  arriba: CaraDiente;
  abajo: CaraDiente;
  izq: CaraDiente;
  der: CaraDiente;
} {
  const superior = esArcadaSuperior(codigo);
  const derecho = esCuadranteDerecho(codigo);
  return {
    arriba: superior ? "V" : "L",
    abajo: superior ? "L" : "V",
    izq: derecho ? "M" : "D",
    der: derecho ? "D" : "M",
  };
}

function fillCara(
  estado: EstadoColorDiente | undefined,
  base: string
): string {
  if (estado === "por_realizar") return "#ef4444";
  if (estado === "realizado") return "#2563eb";
  return base;
}

function hexColorSimbolo(color: ColorMsp): string {
  return color === "azul" ? "#1d4ed8" : "#dc2626";
}

function renderEndodonciaEnRaices(
  tipo: TipoAnatomico,
  superior: boolean,
  color: string,
  key: string
) {
  if (superior) {
    if (tipo === "molar_sup") {
      return (
        <g
          key={key}
          stroke={color}
          strokeWidth="2.1"
          strokeLinecap="round"
          fill="none"
          pointerEvents="none"
        >
          <line x1="13.5" y1="40" x2="13.5" y2="11" />
          <line x1="22.5" y1="40" x2="22.5" y2="9" />
          <line x1="30.5" y1="40" x2="30.5" y2="13" />
        </g>
      );
    }
    return (
      <g
        key={key}
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        pointerEvents="none"
      >
        <line x1="22" y1="40" x2="22" y2="10" />
      </g>
    );
  }

  if (tipo === "molar_inf") {
    return (
      <g
        key={key}
        stroke={color}
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
        pointerEvents="none"
      >
        <line x1="15.5" y1="29" x2="15.5" y2="57" />
        <line x1="28" y1="29" x2="28" y2="56" />
      </g>
    );
  }

  return (
    <g
      key={key}
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
      pointerEvents="none"
    >
      <line x1="22" y1="29" x2="22" y2="58" />
    </g>
  );
}

// Espiral de tornillo colocada estrictamente sobre la zona radicular
function renderImplanteSobreRaiz(
  superior: boolean,
  color: string,
  key: string
) {
  const yTop = superior ? 9 : 34;
  const yBot = superior ? 36 : 60;
  const step = (yBot - yTop) / 5;

  return (
    <g
      key={key}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      pointerEvents="none"
    >
      <line x1="16" y1={yTop} x2="28" y2={yTop} strokeWidth="2.4" />
      {[1, 2, 3, 4].map((n) => {
        const y = yTop + step * n;
        return (
          <path
            key={n}
            d={`M17 ${y - 1.5} L27 ${y + 1.5}`}
          />
        );
      })}
      <path d={`M17.5 ${yBot - 2} L22 ${yBot} L26.5 ${yBot - 2}`} />
    </g>
  );
}

// Cobertura total de corona o prótesis sobre la corona (vista lateral)
function renderCoberturaTotalCoronaLateral(
  sim: SimboloAplicado,
  superior: boolean,
  key: string
) {
  const esCoberturaCorona =
    sim.tipo === "corona" ||
    sim.tipo === "protesis_fija" ||
    sim.tipo === "protesis_removible" ||
    sim.tipo === "protesis_total";

  if (!esCoberturaCorona) return null;

  const color = hexColorSimbolo(sim.color);
  const pathCorona = superior
    ? "M8.5 40.5 Q22 38 35.5 40.5 Q37.8 52 34.8 63.5 Q22 66.5 9.2 63.5 Q6.2 52 8.5 40.5 Z"
    : "M8.5 5.5 Q22 3 35.5 5.5 Q37.8 17 34.8 28.5 Q22 31 9.2 28.5 Q6.2 17 8.5 5.5 Z";

  return (
    <path
      key={key}
      d={pathCorona}
      fill={color}
      fillOpacity="0.28"
      stroke={color}
      strokeWidth="2.2"
      pointerEvents="none"
    />
  );
}

// Cobertura total de corona o prótesis sobre la corona (vista oclusal)
function renderCoberturaTotalCoronaOclusal(
  sim: SimboloAplicado,
  key: string
) {
  const esCoberturaCorona =
    sim.tipo === "corona" ||
    sim.tipo === "protesis_fija" ||
    sim.tipo === "protesis_removible" ||
    sim.tipo === "protesis_total";

  if (!esCoberturaCorona) return null;

  const color = hexColorSimbolo(sim.color);

  return (
    <rect
      key={key}
      x="4"
      y="4"
      width="36"
      height="36"
      rx="6"
      fill={color}
      fillOpacity="0.26"
      stroke={color}
      strokeWidth="2.3"
      pointerEvents="none"
    />
  );
}

function renderOtrosSimbolos(
  sim: SimboloAplicado,
  idx: number,
  xCenter = 22,
  yCenter = 22,
  scale = 0.72
) {
  if (
    sim.tipo === "endodoncia" ||
    sim.tipo === "implante" ||
    sim.tipo === "corona" ||
    sim.tipo === "protesis_fija" ||
    sim.tipo === "protesis_removible" ||
    sim.tipo === "protesis_total"
  ) {
    return null;
  }

  const color = hexColorSimbolo(sim.color);
  const offset = (idx - 0.5) * 6;

  return (
    <g
      key={`${sim.tipo}-${sim.color}-${idx}`}
      transform={`translate(${xCenter + offset}, ${yCenter}) scale(${scale}) translate(-22, -22)`}
      pointerEvents="none"
    >
      {sim.tipo === "sellante" && (
        <g stroke={color} strokeWidth="3.6" strokeLinecap="round">
          <line x1="22" y1="6" x2="22" y2="38" />
          <line x1="8" y1="14" x2="36" y2="30" />
          <line x1="36" y1="14" x2="8" y2="30" />
        </g>
      )}
      {(sim.tipo === "extraccion_perdida_caries" ||
        sim.tipo === "perdida_otra_causa") && (
        <g stroke={color} strokeWidth="4" strokeLinecap="round">
          <line x1="7" y1="7" x2="37" y2="37" />
          <line x1="37" y1="7" x2="7" y2="37" />
          {sim.tipo === "perdida_otra_causa" && (
            <circle cx="22" cy="22" r="15" fill="none" strokeWidth="3" />
          )}
        </g>
      )}
      {sim.tipo === "ortodoncia" && (
        <g stroke={color} strokeWidth="3.2" fill="none">
          <rect
            x="11"
            y="11"
            width="22"
            height="22"
            rx="2"
            fill="#ffffff"
            fillOpacity="0.85"
          />
          <line x1="3" y1="22" x2="11" y2="22" />
          <line x1="33" y1="22" x2="41" y2="22" />
          <line x1="22" y1="11" x2="22" y2="33" />
        </g>
      )}
    </g>
  );
}

function VistaRaizSvg({
  codigo,
  superior,
  estado,
  esTemporal,
}: {
  codigo: string;
  superior: boolean;
  estado: EstadoPiezaMsp | undefined;
  esTemporal: boolean;
}) {
  const tipo = obtenerTipoAnatomico(codigo);
  const caras = obtenerCarasRelativas(codigo);
  const simbolos = estado?.simbolos || [];

  const colorCoronaBase =
    estado?.V === "por_realizar"
      ? "#fca5a5"
      : estado?.V === "realizado"
      ? "#93c5fd"
      : "#f8f5ea";

  const colorRaizBase = "#e6d8b5";

  const perdida = simbolos.some(
    (s) =>
      s.color === "azul" &&
      (s.tipo === "extraccion_perdida_caries" ||
        s.tipo === "perdida_otra_causa")
  );

  const endodoncias = simbolos.filter((s) => s.tipo === "endodoncia");
  const implantes = simbolos.filter((s) => s.tipo === "implante");

  return (
    <svg
      viewBox="0 0 44 68"
      className={`${
        esTemporal ? "w-7 h-10 sm:w-8 sm:h-12" : "w-8 h-12 sm:w-9 sm:h-14"
      } select-none ${perdida ? "opacity-30" : ""}`}
      aria-label={`Raíz y corona ${codigo}`}
    >
      {superior ? (
        <g>
          {tipo === "molar_sup" && (
            <g fill={colorRaizBase} stroke="#5c5346" strokeWidth="1.2">
              <path d="M10.5 40.5 C9.2 26 10.8 12 13.8 5 C16.2 12 17.2 26 17.2 40.5 Z" />
              <path d="M19.5 40.5 C19.5 22 20.8 9 23 3 C25.2 9 26.2 22 25.8 40.5 Z" />
              <path d="M27.5 40.5 C28.2 26 30 14 33.2 8 C34.5 16 33.5 28 32 40.5 Z" />
            </g>
          )}
          {tipo === "premolar" && (
            <path
              d="M14.2 40.5 C14.2 23 17.2 11 22 5.5 C26.8 11 29.2 23 29.2 40.5 Z"
              fill={colorRaizBase}
              stroke="#5c5346"
              strokeWidth="1.2"
            />
          )}
          {tipo === "canino" && (
            <path
              d="M15 41.5 C15 21 18.2 8 22 2 C25.8 8 28.5 21 28.5 41.5 Z"
              fill={colorRaizBase}
              stroke="#5c5346"
              strokeWidth="1.2"
            />
          )}
          {tipo === "incisivo" && (
            <path
              d="M16 41.5 C16 22 18.8 11 22 5.5 C25.2 11 27.5 22 27.5 41.5 Z"
              fill={colorRaizBase}
              stroke="#5c5346"
              strokeWidth="1.2"
            />
          )}

          <path
            d="M8.5 40.5 Q22 38 35.5 40.5 Q37.8 52 34.8 63.5 Q22 66.5 9.2 63.5 Q6.2 52 8.5 40.5 Z"
            fill={colorCoronaBase}
            stroke="#475569"
            strokeWidth="1.3"
          />
          <path
            d="M8.5 43 L13.5 44 L13.5 62 L9.5 62.5 Z"
            fill={fillCara(estado?.[caras.izq], "transparent")}
          />
          <path
            d="M35.5 43 L30.5 44 L30.5 62 L34.5 62.5 Z"
            fill={fillCara(estado?.[caras.der], "transparent")}
          />
        </g>
      ) : (
        <g>
          <path
            d="M8.5 5.5 Q22 3 35.5 5.5 Q37.8 17 34.8 28.5 Q22 31 9.2 28.5 Q6.2 17 8.5 5.5 Z"
            fill={colorCoronaBase}
            stroke="#475569"
            strokeWidth="1.3"
          />
          <path
            d="M8.8 7 L13.5 7.5 L13.5 26.5 L8.8 27.5 Z"
            fill={fillCara(estado?.[caras.izq], "transparent")}
          />
          <path
            d="M35.2 7 L30.5 7.5 L30.5 26.5 L35.2 27.5 Z"
            fill={fillCara(estado?.[caras.der], "transparent")}
          />

          {tipo === "molar_inf" && (
            <g fill={colorRaizBase} stroke="#5c5346" strokeWidth="1.2">
              <path d="M11 28.5 C10.8 44 12.8 56 16 64 C18.5 55 19.2 42 20 28.5 Z" />
              <path d="M23.5 28.5 C24.2 42 25.2 55 28 63 C31 55 32 43 32 28.5 Z" />
            </g>
          )}
          {tipo !== "molar_inf" && (
            <path
              d="M16 28.5 C16 45 18.8 57 22 65 C25.2 57 27.5 45 27.5 28.5 Z"
              fill={colorRaizBase}
              stroke="#5c5346"
              strokeWidth="1.2"
            />
          )}
        </g>
      )}

      {simbolos.map((sim, idx) =>
        renderCoberturaTotalCoronaLateral(sim, superior, `cov-lat-${codigo}-${idx}`)
      )}

      {endodoncias.map((sim, i) =>
        renderEndodonciaEnRaices(
          tipo,
          superior,
          hexColorSimbolo(sim.color),
          `endo-${codigo}-${i}`
        )
      )}

      {implantes.map((sim, i) =>
        renderImplanteSobreRaiz(
          superior,
          hexColorSimbolo(sim.color),
          `imp-${codigo}-${i}`
        )
      )}

      {simbolos.map((sim, idx) =>
        renderOtrosSimbolos(sim, idx, 22, superior ? 52 : 17, 0.55)
      )}
    </svg>
  );
}

function VistaOclusalSvg({
  codigo,
  estado,
  esTemporal,
}: {
  codigo: string;
  estado: EstadoPiezaMsp | undefined;
  esTemporal: boolean;
}) {
  const tipo = obtenerTipoAnatomico(codigo);
  const caras = obtenerCarasRelativas(codigo);
  const simbolos = estado?.simbolos || [];
  const esMolarOPremolar =
    tipo === "molar_sup" || tipo === "molar_inf" || tipo === "premolar";

  const perdida = simbolos.some(
    (s) =>
      s.color === "azul" &&
      (s.tipo === "extraccion_perdida_caries" ||
        s.tipo === "perdida_otra_causa")
  );

  return (
    <svg
      viewBox="0 0 44 44"
      className={`${
        esTemporal ? "w-7 h-7 sm:w-8 sm:h-8" : "w-8 h-8 sm:w-9 sm:h-9"
      } select-none ${perdida ? "opacity-30" : ""}`}
      aria-label={`Caras oclusales ${codigo}`}
    >
      {esMolarOPremolar ? (
        <g stroke="#475569" strokeWidth="1.15">
          <path
            d="M5 6 Q22 2 39 6 L31 13 Q22 11 13 13 Z"
            fill={fillCara(estado?.[caras.arriba], "#f8f5ea")}
          />
          <path
            d="M13 31 Q22 33 31 31 L39 38 Q22 42 5 38 Z"
            fill={fillCara(estado?.[caras.abajo], "#efe5c8")}
          />
          <path
            d="M5 6 Q2 22 5 38 L13 31 Q11 22 13 13 Z"
            fill={fillCara(estado?.[caras.izq], "#f5eed8")}
          />
          <path
            d="M39 6 Q42 22 39 38 L31 31 Q33 22 31 13 Z"
            fill={fillCara(estado?.[caras.der], "#e8d6ad")}
          />
          <rect
            x="13"
            y="13"
            width="18"
            height="18"
            rx="4"
            fill={fillCara(estado?.O, "#fcfaf2")}
          />
          <path
            d="M15.5 22 H28.5 M22 15.5 V28.5"
            stroke="#78716c"
            strokeWidth="1.05"
            strokeLinecap="round"
            fill="none"
            pointerEvents="none"
          />
        </g>
      ) : (
        <g stroke="#475569" strokeWidth="1.15">
          <path
            d="M6 6 Q22 3 38 6 L30 13 Q22 11.5 14 13 Z"
            fill={fillCara(estado?.[caras.arriba], "#f8f5ea")}
          />
          <path
            d="M14 31 Q22 32.5 30 31 L38 38 Q22 41 6 38 Z"
            fill={fillCara(estado?.[caras.abajo], "#efe5c8")}
          />
          <path
            d="M6 6 Q3 22 6 38 L14 31 Q12.5 22 14 13 Z"
            fill={fillCara(estado?.[caras.izq], "#f5eed8")}
          />
          <path
            d="M38 6 Q41 22 38 38 L30 31 Q31.5 22 30 13 Z"
            fill={fillCara(estado?.[caras.der], "#e8d6ad")}
          />
          <ellipse
            cx="22"
            cy="22"
            rx="8.5"
            ry="8.5"
            fill={fillCara(estado?.O, "#fcfaf2")}
          />
        </g>
      )}

      {simbolos.map((sim, idx) =>
        renderCoberturaTotalCoronaOclusal(sim, `cov-oc-${codigo}-${idx}`)
      )}

      {simbolos.map((sim, idx) =>
        renderOtrosSimbolos(sim, idx, 22, 22, 0.72)
      )}
    </svg>
  );
}

export default function Odontograma3D({ odontogramaMsp }: Props) {
  const [mostrarParaPaciente, setMostrarParaPaciente] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const manejarCambioFullscreen = () => {
      setPantallaCompleta(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", manejarCambioFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", manejarCambioFullscreen);
  }, []);

  async function alternarPantallaCompleta() {
    try {
      if (!document.fullscreenElement && contenedorRef.current?.requestFullscreen) {
        await contenedorRef.current.requestFullscreen();
        setPantallaCompleta(true);
      } else if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        setPantallaCompleta(false);
      } else {
        setPantallaCompleta((prev) => !prev);
      }
    } catch {
      setPantallaCompleta((prev) => !prev);
    }
  }

  const renderFila = (
    codigos: string[],
    superior: boolean,
    esTemporal: boolean
  ) => (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
      {codigos.map((codigo) => {
        const estado = odontogramaMsp[codigo];

        return (
          <div
            key={codigo}
            className="flex flex-col items-center px-0.5 py-0.5 select-none"
          >
            {superior ? (
              <>
                <VistaRaizSvg
                  codigo={codigo}
                  superior={true}
                  estado={estado}
                  esTemporal={esTemporal}
                />
                <VistaOclusalSvg
                  codigo={codigo}
                  estado={estado}
                  esTemporal={esTemporal}
                />
                <span
                  className={`mt-0.5 font-semibold text-slate-800 ${
                    esTemporal
                      ? "text-[9px] sm:text-[10px]"
                      : "text-[10px] sm:text-[11px]"
                  }`}
                >
                  {codigo}
                </span>
              </>
            ) : (
              <>
                <span
                  className={`mb-0.5 font-semibold text-slate-800 ${
                    esTemporal
                      ? "text-[9px] sm:text-[10px]"
                      : "text-[10px] sm:text-[11px]"
                  }`}
                >
                  {codigo}
                </span>
                <VistaOclusalSvg
                  codigo={codigo}
                  estado={estado}
                  esTemporal={esTemporal}
                />
                <VistaRaizSvg
                  codigo={codigo}
                  superior={false}
                  estado={estado}
                  esTemporal={esTemporal}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  if (!mostrarParaPaciente) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setMostrarParaPaciente(true)}
          className="rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 text-xs font-semibold transition"
        >
          Mostrar para el paciente
        </button>
      </div>
    );
  }

  return (
    <div
      ref={contenedorRef}
      className={
        pantallaCompleta
          ? "fixed inset-0 z-50 overflow-y-auto bg-slate-200 p-4 sm:p-6 text-slate-900 flex flex-col justify-center space-y-4"
          : "rounded-2xl border border-slate-300 bg-slate-200 p-3.5 sm:p-4 text-slate-900 space-y-3 shadow-sm"
      }
    >
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={alternarPantallaCompleta}
          className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold transition"
        >
          Pantalla completa
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-slate-300/80 border border-slate-400/50 p-3">
        <div className="min-w-[760px] space-y-2">
          {renderFila(PERMANENTE_SUPERIOR, true, false)}

          <div className="pt-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 text-center mb-0.5">
              Temporal superior
            </p>
            {renderFila(TEMPORAL_SUPERIOR, true, true)}
          </div>

          <div className="border-t-2 border-slate-500/75 my-1.5" />

          <div className="pb-0.5">
            {renderFila(TEMPORAL_INFERIOR, false, true)}
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 text-center mt-0.5">
              Temporal inferior
            </p>
          </div>

          {renderFila(PERMANENTE_INFERIOR, false, false)}
        </div>
      </div>
    </div>
  );
}
