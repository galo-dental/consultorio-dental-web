"use client";

import { useState } from "react";

type ColorMsp = "rojo" | "azul";
type EstadoColorDiente = "ninguno" | "realizado" | "por_realizar";

interface SimboloAplicado {
  tipo: string;
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
  piezaSeleccionada: string;
  onSeleccionarPieza: (codigo: string) => void;
}

const SUPERIOR = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
];

const INFERIOR = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
];

type AnatomiaPieza = "molar_sup" | "premolar" | "canino" | "incisivo" | "molar_inf";

function obtenerAnatomia(codigo: string): AnatomiaPieza {
  const ult = Number(codigo.slice(-1));
  const superior = codigo.startsWith("1") || codigo.startsWith("2");

  if (ult >= 6) {
    return superior ? "molar_sup" : "molar_inf";
  }
  if (ult === 4 || ult === 5) {
    return "premolar";
  }
  if (ult === 3) {
    return "canino";
  }
  return "incisivo";
}

function obtenerEstadoVisual(
  estado: EstadoPiezaMsp | undefined,
  seleccionada: boolean
): {
  esmalteBase: string;
  sombra: string;
  borde: string;
  ausente: boolean;
  etiqueta: string;
} {
  const ausente = (estado?.simbolos || []).some(
    (s) =>
      s.color === "azul" &&
      (s.tipo === "extraccion_perdida_caries" ||
        s.tipo === "perdida_otra_causa")
  );

  if (ausente) {
    return {
      esmalteBase: "#cbd5e1",
      sombra: "#94a3b8",
      borde: "#64748b",
      ausente: true,
      etiqueta: "Ausente",
    };
  }

  const tieneRojo =
    estado?.O === "por_realizar" ||
    estado?.V === "por_realizar" ||
    estado?.L === "por_realizar" ||
    estado?.M === "por_realizar" ||
    estado?.D === "por_realizar" ||
    (estado?.simbolos || []).some((s) => s.color === "rojo");

  const tieneAzul =
    estado?.O === "realizado" ||
    estado?.V === "realizado" ||
    estado?.L === "realizado" ||
    estado?.M === "realizado" ||
    estado?.D === "realizado" ||
    (estado?.simbolos || []).some((s) => s.color === "azul");

  if (seleccionada) {
    return {
      esmalteBase: "#fde68a",
      sombra: "#f59e0b",
      borde: "#b45309",
      ausente: false,
      etiqueta: "Seleccionada",
    };
  }

  if (tieneRojo) {
    return {
      esmalteBase: "#fca5a5",
      sombra: "#dc2626",
      borde: "#991b1b",
      ausente: false,
      etiqueta: "Por realizar",
    };
  }

  if (tieneAzul) {
    return {
      esmalteBase: "#93c5fd",
      sombra: "#2563eb",
      borde: "#1e40af",
      ausente: false,
      etiqueta: "Realizado",
    };
  }

  return {
    esmalteBase: "#f5f0dc",
    sombra: "#d6ccb0",
    borde: "#8c826a",
    ausente: false,
    etiqueta: "Normal",
  };
}

function DienteAnatomicoSvg({
  codigo,
  superior,
  colores,
  ausente,
}: {
  codigo: string;
  superior: boolean;
  colores: { esmalteBase: string; sombra: string; borde: string };
  ausente: boolean;
}) {
  const tipo = obtenerAnatomia(codigo);
  const gradId = `grad-${codigo}`;

  const contenidoAnatomia = () => {
    if (superior) {
      // Raíces arriba (y: 4..42), corona abajo (y: 42..68)
      if (tipo === "molar_sup") {
        return (
          <g>
            {/* Tres raíces */}
            <path
              d="M10 42 C9 24 11 10 14 5 C16 12 17 26 17 42 Z"
              fill={`url(#${gradId})`}
              stroke={colores.borde}
              strokeWidth="1.3"
            />
            <path
              d="M19 42 C19 20 21 8 23 3 C25 10 26 24 25 42 Z"
              fill={`url(#${gradId})`}
              stroke={colores.borde}
              strokeWidth="1.3"
            />
            <path
              d="M27 42 C28 25 30 12 33 7 C34 15 33 28 32 42 Z"
              fill={`url(#${gradId})`}
              stroke={colores.borde}
              strokeWidth="1.3"
            />
            {/* Corona */}
            <path
              d="M8 42 Q22 39 36 42 Q38 55 35 66 Q22 69 9 66 Q6 55 8 42 Z"
              fill={`url(#${gradId})`}
              stroke={colores.borde}
              strokeWidth="1.4"
            />
          </g>
        );
      }
      if (tipo === "premolar") {
        return (
          <g>
            <path
              d="M14 42 C14 22 17 10 22 5 C27 10 29 22 29 42 Z"
              fill={`url(#${gradId})`}
              stroke={colores.borde}
              strokeWidth="1.3"
            />
            <path
              d="M11 42 Q22 39 33 42 Q35 54 32 66 Q22 68 12 66 Q9 54 11 42 Z"
              fill={`url(#${gradId})`}
              stroke={colores.borde}
              strokeWidth="1.4"
            />
          </g>
        );
      }
      if (tipo === "canino") {
        return (
          <g>
            <path
              d="M15 43 C15 20 18 7 22 2 C26 7 28 20 28 43 Z"
              fill={`url(#${gradId})`}
              stroke={colores.borde}
              strokeWidth="1.3"
            />
            <path
              d="M12 43 Q22 40 32 43 Q33 56 29 66 Q22 69 15 66 Q11 56 12 43 Z"
              fill={`url(#${gradId})`}
              stroke={colores.borde}
              strokeWidth="1.4"
            />
          </g>
        );
      }
      // Incisivo superior
      return (
        <g>
          <path
            d="M16 43 C16 22 19 10 22 5 C25 10 27 22 27 43 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.3"
          />
          <path
            d="M12 43 Q22 41 32 43 L31 66 Q22 68 13 66 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.4"
          />
        </g>
      );
    }

    // Arcada inferior: corona arriba (y: 4..30), raíces abajo (y: 30..68)
    if (tipo === "molar_inf") {
      return (
        <g>
          {/* Corona */}
          <path
            d="M8 6 Q22 4 36 6 Q38 18 35 30 Q22 32 9 30 Q6 18 8 6 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.4"
          />
          {/* Dos raíces */}
          <path
            d="M11 30 C11 46 13 58 16 66 C18 56 19 43 20 30 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.3"
          />
          <path
            d="M23 30 C24 43 25 56 28 65 C31 57 32 45 32 30 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.3"
          />
        </g>
      );
    }
    if (tipo === "premolar") {
      return (
        <g>
          <path
            d="M11 6 Q22 4 33 6 Q34 18 32 30 Q22 32 12 30 Q10 18 11 6 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.4"
          />
          <path
            d="M15 30 C15 46 18 58 22 65 C26 58 28 46 28 30 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.3"
          />
        </g>
      );
    }
    if (tipo === "canino") {
      return (
        <g>
          <path
            d="M12 6 Q22 4 32 6 Q33 18 29 30 Q22 32 15 30 Q11 18 12 6 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.4"
          />
          <path
            d="M16 30 C16 48 19 60 22 68 C25 60 27 48 27 30 Z"
            fill={`url(#${gradId})`}
            stroke={colores.borde}
            strokeWidth="1.3"
          />
        </g>
      );
    }
    // Incisivo inferior
    return (
      <g>
        <path
          d="M13 6 Q22 5 31 6 L30 30 Q22 32 14 30 Z"
          fill={`url(#${gradId})`}
          stroke={colores.borde}
          strokeWidth="1.4"
        />
        <path
          d="M17 30 C17 46 19 57 22 64 C25 57 26 46 26 30 Z"
          fill={`url(#${gradId})`}
          stroke={colores.borde}
          strokeWidth="1.3"
        />
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 44 70"
      className={`w-8 h-14 sm:w-9 sm:h-16 select-none transition-transform ${
        ausente ? "opacity-35" : ""
      }`}
      aria-label={`Pieza anatómica ${codigo}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colores.esmalteBase} />
          <stop offset="65%" stopColor={colores.esmalteBase} />
          <stop offset="100%" stopColor={colores.sombra} />
        </linearGradient>
      </defs>
      {contenidoAnatomia()}
    </svg>
  );
}

export default function Odontograma3D({
  odontogramaMsp,
  piezaSeleccionada,
  onSeleccionarPieza,
}: Props) {
  const [anguloPerspectiva, setAnguloPerspectiva] = useState(8);

  const renderCuadrante = (
    codigos: string[],
    superior: boolean,
    etiquetaLado: string
  ) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-end justify-center gap-0.5 sm:gap-1">
        {codigos.map((codigo) => {
          const estado = odontogramaMsp[codigo];
          const seleccionada = piezaSeleccionada === codigo;
          const visual = obtenerEstadoVisual(estado, seleccionada);

          return (
            <button
              key={codigo}
              type="button"
              onClick={() => onSeleccionarPieza(codigo)}
              title={`Pieza ${codigo} (${visual.etiqueta})`}
              className={`group flex flex-col items-center px-0.5 py-1 rounded-lg border transition ${
                seleccionada
                  ? "bg-amber-100/90 border-amber-500 ring-1 ring-amber-400 -translate-y-0.5"
                  : "border-transparent hover:border-sky-400/60 hover:bg-white/40"
              }`}
            >
              {superior ? (
                <>
                  <DienteAnatomicoSvg
                    codigo={codigo}
                    superior={true}
                    colores={visual}
                    ausente={visual.ausente}
                  />
                  <span className="mt-1 text-[10px] sm:text-[11px] font-semibold text-slate-800">
                    {codigo}
                  </span>
                </>
              ) : (
                <>
                  <span className="mb-1 text-[10px] sm:text-[11px] font-semibold text-slate-800">
                    {codigo}
                  </span>
                  <DienteAnatomicoSvg
                    codigo={codigo}
                    superior={false}
                    colores={visual}
                    ausente={visual.ausente}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>
      <span className="text-[10px] text-sky-900/70 font-medium px-1">
        {etiquetaLado}
      </span>
    </div>
  );

  return (
    <div className="rounded-2xl border border-sky-300 bg-gradient-to-b from-sky-100 via-sky-200/80 to-sky-100 p-3.5 sm:p-4 text-slate-900 space-y-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-sky-950">
            Vista anatómica con raíces para el paciente
          </p>
          <p className="text-[11px] text-sky-800">
            Toca una pieza para seleccionarla · Rojo: por realizar · Azul:
            realizado
          </p>
        </div>

        <label className="flex items-center gap-2 text-[11px] font-semibold text-sky-950 bg-white/80 border border-sky-300 rounded-lg px-2.5 py-1">
          <span>Profundidad ({anguloPerspectiva}°)</span>
          <input
            type="range"
            min={0}
            max={20}
            value={anguloPerspectiva}
            onChange={(e) => setAnguloPerspectiva(Number(e.target.value))}
            className="w-20 accent-sky-700"
          />
        </label>
      </div>

      <div
        style={{ perspective: "800px" }}
        className="overflow-x-auto rounded-xl bg-sky-100/90 border border-sky-300/80 p-2.5"
      >
        <div
          style={{
            transform: `rotateX(${anguloPerspectiva}deg)`,
            transformStyle: "preserve-3d",
          }}
          className="min-w-[740px] transition-transform duration-150"
        >
          {/* Fila superior: 18..11 | 21..28 */}
          <div className="grid grid-cols-[1fr_2px_1fr] items-stretch gap-2 pb-2">
            {renderCuadrante(SUPERIOR.slice(0, 8), true, "Superior derecho")}
            <div className="bg-sky-700/70 w-[2px] self-stretch" />
            {renderCuadrante(SUPERIOR.slice(8), true, "Superior izquierdo")}
          </div>

          {/* Línea media horizontal */}
          <div className="border-t-2 border-sky-700/75 my-1" />

          {/* Fila inferior: 48..41 | 31..38 */}
          <div className="grid grid-cols-[1fr_2px_1fr] items-stretch gap-2 pt-2">
            {renderCuadrante(INFERIOR.slice(0, 8), false, "Inferior derecho")}
            <div className="bg-sky-700/70 w-[2px] self-stretch" />
            {renderCuadrante(INFERIOR.slice(8), false, "Inferior izquierdo")}
          </div>
        </div>
      </div>
    </div>
  );
}
