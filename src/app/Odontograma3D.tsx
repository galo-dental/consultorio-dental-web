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

const SUPERIOR = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
];

const INFERIOR = [
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
  const esSup = codigo.startsWith("1") || codigo.startsWith("2");
  if (ult >= 6) return esSup ? "molar_sup" : "molar_inf";
  if (ult === 4 || ult === 5) return "premolar";
  if (ult === 3) return "canino";
  return "incisivo";
}

function esCuadranteDerecho(codigo: string): boolean {
  return codigo.startsWith("1") || codigo.startsWith("4");
}

function esArcadaSuperior(codigo: string): boolean {
  return codigo.startsWith("1") || codigo.startsWith("2");
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
          <path d="M13.5 41 L13.5 12" />
          <path d="M22.5 41 L22.5 10" />
          <path d="M30.5 41 L30.5 14" />
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
        <path d="M22 41 L22 11" />
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
        <path d="M15.5 29 L15.5 57" />
        <path d="M28 29 L28 56" />
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
      <path d="M22 29 L22 58" />
    </g>
  );
}

function renderImplanteEspiral(
  superior: boolean,
  color: string,
  key: string
) {
  const yStart = superior ? 12 : 33;
  const dir = superior ? 1 : -1;
  const y1 = yStart + dir * 4;
  const y2 = yStart + dir * 9;
  const y3 = yStart + dir * 14;
  const y4 = yStart + dir * 19;
  const yEnd = yStart + dir * 23;

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
      {/* Cuello/plataforma */}
      <line x1="16.5" y1={yStart} x2="27.5" y2={yStart} strokeWidth="2.4" />
      {/* Espiral roscada del tornillo */}
      <path
        d={`M17.5 ${y1} L26.5 ${y1 + dir * 1.5}
            M17.5 ${y2} L26.5 ${y2 + dir * 1.5}
            M17.5 ${y3} L26.5 ${y3 + dir * 1.5}
            M17.5 ${y4} L26.5 ${y4 + dir * 1.5}`}
      />
      {/* Ápice cónico del tornillo */}
      <path d={`M18 ${y4 + dir * 1.5} L22 ${yEnd} L26 ${y4 + dir * 1.5}`} />
    </g>
  );
}

function renderOtrosSimbolosOverlay(
  sim: SimboloAplicado,
  idx: number,
  xCenter = 22,
  yCenter = 22,
  scale = 0.72
) {
  if (sim.tipo === "endodoncia" || sim.tipo === "implante") return null;

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
      {sim.tipo === "protesis_fija" && (
        <g stroke={color} strokeWidth="3.4" fill="none">
          <circle cx="7" cy="22" r="3.5" />
          <line x1="11" y1="22" x2="33" y2="22" strokeDasharray="3 2" />
          <circle cx="37" cy="22" r="3.5" />
        </g>
      )}
      {sim.tipo === "protesis_removible" && (
        <g stroke={color} strokeWidth="3.4" fill="none">
          <path d="M10 9 Q4 22 10 35" />
          <line x1="13" y1="22" x2="31" y2="22" strokeDasharray="3 2" />
          <path d="M34 9 Q40 22 34 35" />
        </g>
      )}
      {sim.tipo === "protesis_total" && (
        <g stroke={color} strokeWidth="3.8" strokeLinecap="round">
          <line x1="6" y1="17" x2="38" y2="17" />
          <line x1="6" y1="27" x2="38" y2="27" />
        </g>
      )}
      {sim.tipo === "corona" && (
        <g stroke={color} strokeWidth="3.3" fill="none">
          <rect x="6" y="6" width="32" height="32" />
          <rect x="13" y="13" width="18" height="18" />
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
            fillOpacity="0.8"
          />
          <line x1="3" y1="22" x2="11" y2="22" />
          <line x1="33" y1="22" x2="41" y2="22" />
          <line x1="22" y1="11" x2="22" y2="33" />
        </g>
      )}
    </g>
  );
}

function VistaRaiz3DSvg({
  codigo,
  superior,
  estado,
}: {
  codigo: string;
  superior: boolean;
  estado: EstadoPiezaMsp | undefined;
}) {
  const tipo = obtenerTipoAnatomico(codigo);
  const caras = obtenerCarasRelativas(codigo);
  const simbolos = estado?.simbolos || [];
  const gradId = `esmalte-3d-${codigo}`;

  const colorCoronaBase =
    estado?.V === "por_realizar"
      ? "#fca5a5"
      : estado?.V === "realizado"
      ? "#93c5fd"
      : "#fbf7ea";

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
      className={`w-8 h-12 sm:w-9 sm:h-14 select-none ${
        perdida ? "opacity-30" : ""
      }`}
      aria-label={`Raíz y corona ${codigo}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.34" />
        </linearGradient>
      </defs>

      {superior ? (
        <g>
          {/* Raíces superiores estilizadas */}
          {tipo === "molar_sup" && (
            <g fill={colorRaizBase} stroke="#57534e" strokeWidth="1.25">
              <path d="M10.5 40 C9.5 23 11.5 10 14 5 C16.5 13 17 26 17 40 Z" />
              <path d="M19.5 40 C19.5 18 21.2 7 23 3 C25 10 25.8 24 25.5 40 Z" />
              <path d="M27.5 40 C28.5 24 30.2 12 33 7 C34 15 33 27 32 40 Z" />
            </g>
          )}
          {tipo === "premolar" && (
            <path
              d="M14.5 40 C14.5 21 17.5 10 22 5 C26.5 10 29 21 29 40 Z"
              fill={colorRaizBase}
              stroke="#57534e"
              strokeWidth="1.25"
            />
          )}
          {tipo === "canino" && (
            <path
              d="M15.5 41 C15.5 19 18.5 7 22 2 C25.5 7 28 19 28 41 Z"
              fill={colorRaizBase}
              stroke="#57534e"
              strokeWidth="1.25"
            />
          )}
          {tipo === "incisivo" && (
            <path
              d="M16.5 41 C16.5 21 19 10 22 5 C25 10 27 21 27 41 Z"
              fill={colorRaizBase}
              stroke="#57534e"
              strokeWidth="1.25"
            />
          )}

          {/* Corona superior con contorno anatómico */}
          <path
            d="M8.5 40 Q22 37.5 35.5 40 Q37.5 52.5 34.5 64 Q22 66.5 9.5 64 Q6.5 52.5 8.5 40 Z"
            fill={colorCoronaBase}
            stroke="#475569"
            strokeWidth="1.35"
          />
          <rect
            x="8.5"
            y="45"
            width="5"
            height="14"
            rx="1.5"
            fill={fillCara(estado?.[caras.izq], "transparent")}
          />
          <rect
            x="30.5"
            y="45"
            width="5"
            height="14"
            rx="1.5"
            fill={fillCara(estado?.[caras.der], "transparent")}
          />
          <path
            d="M8.5 40 Q22 37.5 35.5 40 Q37.5 52.5 34.5 64 Q22 66.5 9.5 64 Q6.5 52.5 8.5 40 Z"
            fill={`url(#${gradId})`}
            pointerEvents="none"
          />
        </g>
      ) : (
        <g>
          {/* Corona inferior con contorno anatómico */}
          <path
            d="M8.5 5 Q22 3 35.5 5 Q37.5 17 34.5 29 Q22 31 9.5 29 Q6.5 17 8.5 5 Z"
            fill={colorCoronaBase}
            stroke="#475569"
            strokeWidth="1.35"
          />
          <rect
            x="8.5"
            y="10"
            width="5"
            height="14"
            rx="1.5"
            fill={fillCara(estado?.[caras.izq], "transparent")}
          />
          <rect
            x="30.5"
            y="10"
            width="5"
            height="14"
            rx="1.5"
            fill={fillCara(estado?.[caras.der], "transparent")}
          />
          <path
            d="M8.5 5 Q22 3 35.5 5 Q37.5 17 34.5 29 Q22 31 9.5 29 Q6.5 17 8.5 5 Z"
            fill={`url(#${gradId})`}
            pointerEvents="none"
          />

          {/* Raíces inferiores estilizadas */}
          {tipo === "molar_inf" && (
            <g fill={colorRaizBase} stroke="#57534e" strokeWidth="1.25">
              <path d="M11.5 29 C11.5 45 13.5 57 16 64 C18.5 55 19 42 20 29 Z" />
              <path d="M23.5 29 C24.5 42 25.5 55 28 63 C30.5 55 31.5 44 31.5 29 Z" />
            </g>
          )}
          {tipo !== "molar_inf" && (
            <path
              d="M16.5 29 C16.5 46 19 57 22 65 C25 57 27 46 27 29 Z"
              fill={colorRaizBase}
              stroke="#57534e"
              strokeWidth="1.25"
            />
          )}
        </g>
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
        renderImplanteEspiral(
          superior,
          hexColorSimbolo(sim.color),
          `imp-${codigo}-${i}`
        )
      )}

      {simbolos
        .filter((s) => s.tipo !== "endodoncia" && s.tipo !== "implante")
        .slice(0, 2)
        .map((sim, i) =>
          renderOtrosSimbolosOverlay(sim, i, 22, superior ? 52 : 17, 0.55)
        )}
    </svg>
  );
}

function VistaOclusalCarasSvg({
  codigo,
  estado,
}: {
  codigo: string;
  estado: EstadoPiezaMsp | undefined;
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
      className={`w-8 h-8 sm:w-9 sm:h-9 select-none ${
        perdida ? "opacity-30" : ""
      }`}
      aria-label={`Caras oclusales ${codigo}`}
    >
      {esMolarOPremolar ? (
        <g stroke="#475569" strokeWidth="1.2">
          <polygon
            points="3,3 41,3 32,12 12,12"
            fill={fillCara(estado?.[caras.arriba], "#fbf7ea")}
          />
          <polygon
            points="12,32 32,32 41,41 3,41"
            fill={fillCara(estado?.[caras.abajo], "#f2e7ca")}
          />
          <polygon
            points="3,3 12,12 12,32 3,41"
            fill={fillCara(estado?.[caras.izq], "#f6eed8")}
          />
          <polygon
            points="32,12 41,3 41,41 32,32"
            fill={fillCara(estado?.[caras.der], "#e8d9b7")}
          />
          <rect
            x="12"
            y="12"
            width="20"
            height="20"
            rx="3.5"
            fill={fillCara(estado?.O, "#fffdf6")}
          />
          <path
            d="M15 22 H29 M22 15 V29"
            stroke="#94a3b8"
            strokeWidth="1.05"
            fill="none"
            pointerEvents="none"
          />
        </g>
      ) : (
        <g stroke="#475569" strokeWidth="1.2">
          <polygon
            points="4,4 40,4 31,13 13,13"
            fill={fillCara(estado?.[caras.arriba], "#fbf7ea")}
          />
          <polygon
            points="13,31 31,31 40,40 4,40"
            fill={fillCara(estado?.[caras.abajo], "#f2e7ca")}
          />
          <polygon
            points="4,4 13,13 13,31 4,40"
            fill={fillCara(estado?.[caras.izq], "#f6eed8")}
          />
          <polygon
            points="31,13 40,4 40,40 31,31"
            fill={fillCara(estado?.[caras.der], "#e8d9b7")}
          />
          <ellipse
            cx="22"
            cy="22"
            rx="9"
            ry="9"
            fill={fillCara(estado?.O, "#fffdf6")}
          />
        </g>
      )}

      {simbolos.map((sim, idx) =>
        renderOtrosSimbolosOverlay(sim, idx, 22, 22, 0.72)
      )}
    </svg>
  );
}

export default function Odontograma3D({
  odontogramaMsp,
}: Props) {
  const [visible, setVisible] = useState(true);
  const [inclinacion, setInclinacion] = useState(6);
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

  const renderFilaDoble = (codigos: string[], superior: boolean) => (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 min-w-[760px]">
      {codigos.map((codigo) => {
        const estado = odontogramaMsp[codigo];

        return (
          <div
            key={codigo}
            className="flex flex-col items-center px-0.5 py-1 rounded-lg"
          >
            {superior ? (
              <>
                <VistaRaiz3DSvg
                  codigo={codigo}
                  superior={true}
                  estado={estado}
                />
                <VistaOclusalCarasSvg codigo={codigo} estado={estado} />
                <span className="mt-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-800">
                  {codigo}
                </span>
              </>
            ) : (
              <>
                <span className="mb-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-800">
                  {codigo}
                </span>
                <VistaOclusalCarasSvg codigo={codigo} estado={estado} />
                <VistaRaiz3DSvg
                  codigo={codigo}
                  superior={false}
                  estado={estado}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={contenedorRef}
      className={
        pantallaCompleta
          ? "fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 p-4 sm:p-6 text-slate-900 flex flex-col justify-center space-y-4"
          : "rounded-2xl border border-slate-300 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 p-3.5 sm:p-4 text-slate-900 space-y-3 shadow-sm"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-900">
            Vista anatómica 3D (solo visualización)
          </p>
          <p className="text-[11px] text-slate-700">
            Refleja las caras y símbolos cargados en el odontograma inicial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {visible && (
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-800 bg-white/85 border border-slate-300 rounded-lg px-2.5 py-1">
              <span>Ángulo ({inclinacion}°)</span>
              <input
                type="range"
                min={0}
                max={18}
                value={inclinacion}
                onChange={(e) => setInclinacion(Number(e.target.value))}
                className="w-20 accent-sky-700"
              />
            </label>
          )}

          {visible && (
            <button
              type="button"
              onClick={alternarPantallaCompleta}
              className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold transition"
            >
              {pantallaCompleta ? "Salir de pantalla completa" : "Pantalla completa"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 text-xs font-semibold transition"
          >
            {visible ? "Ocultar vista" : "Mostrar vista"}
          </button>
        </div>
      </div>

      {visible && (
        <div
          style={{ perspective: "850px" }}
          className="overflow-x-auto rounded-xl bg-slate-300/80 border border-slate-400/50 p-2.5"
        >
          <div
            style={{
              transform: `rotateX(${inclinacion}deg)`,
              transformStyle: "preserve-3d",
            }}
            className="space-y-2 transition-transform duration-150"
          >
            {renderFilaDoble(SUPERIOR, true)}
            <div className="border-t-2 border-slate-500/70 my-1" />
            {renderFilaDoble(INFERIOR, false)}
          </div>
        </div>
      )}
    </div>
  );
}
