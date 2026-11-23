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

function obtenerEstiloPieza3D(
  estado: EstadoPiezaMsp | undefined,
  seleccionada: boolean
) {
  const perdida = (estado?.simbolos || []).some(
    (s) =>
      s.color === "azul" &&
      (s.tipo === "extraccion_perdida_caries" ||
        s.tipo === "perdida_otra_causa")
  );

  if (perdida) {
    return {
      perdida: true,
      clase:
        "bg-slate-800/30 border-dashed border-slate-600 text-slate-500 opacity-40",
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
      perdida: false,
      clase:
        "bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 border-amber-100 text-slate-950 shadow-lg shadow-amber-400/30 -translate-y-1.5",
      etiqueta: "Seleccionada",
    };
  }

  if (tieneRojo) {
    return {
      perdida: false,
      clase:
        "bg-gradient-to-b from-red-400 via-red-500 to-red-700 border-red-200 text-white shadow-md shadow-red-950/50 -translate-y-1",
      etiqueta: "Por realizar",
    };
  }

  if (tieneAzul) {
    return {
      perdida: false,
      clase:
        "bg-gradient-to-b from-sky-300 via-blue-500 to-blue-700 border-blue-200 text-white shadow-md shadow-blue-950/50 -translate-y-0.5",
      etiqueta: "Realizado",
    };
  }

  return {
    perdida: false,
    clase:
      "bg-gradient-to-b from-white via-slate-100 to-slate-300 border-slate-200 text-slate-900 shadow-md shadow-black/40",
    etiqueta: "Sano / sin marca",
  };
}

export default function Odontograma3D({
  odontogramaMsp,
  piezaSeleccionada,
  onSeleccionarPieza,
}: Props) {
  const [inclinacionX, setInclinacionX] = useState(24);
  const [rotacionY, setRotacionY] = useState(-10);

  const renderFilaArcada = (lista: string[], esSuperior: boolean) => (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 min-w-[680px]">
      {lista.map((codigo, idx) => {
        const centro = (lista.length - 1) / 2;
        const distCentro = Math.abs(idx - centro);
        const curvaturaY = esSuperior
          ? distCentro * 1.4
          : -distCentro * 1.4;
        const info = obtenerEstiloPieza3D(
          odontogramaMsp[codigo],
          piezaSeleccionada === codigo
        );

        return (
          <button
            key={codigo}
            type="button"
            onClick={() => onSeleccionarPieza(codigo)}
            style={{
              transform: `translateY(${curvaturaY}px)`,
            }}
            title={`Pieza ${codigo} (${info.etiqueta})`}
            className={`w-9 h-12 sm:w-10 sm:h-14 rounded-t-xl rounded-b-md border flex flex-col items-center justify-between py-1 text-[11px] font-bold transition-all duration-200 ${info.clase}`}
          >
            <span>{codigo}</span>
            <span className="w-4 h-1.5 rounded-full bg-black/15" />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-2xl border border-sky-200 bg-slate-950 p-4 text-white space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-sky-200">
            Vista 3D interactiva para el paciente
          </p>
          <p className="text-[11px] text-slate-400">
            Ajusta el ángulo de vista y toca una pieza para resaltarla.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
            Base
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            Por realizar
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            Realizado
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-xs">
        <label className="space-y-1">
          <span className="text-slate-300 text-[11px]">
            Inclinación vertical ({inclinacionX}°)
          </span>
          <input
            type="range"
            min={0}
            max={45}
            value={inclinacionX}
            onChange={(e) => setInclinacionX(Number(e.target.value))}
            className="w-full accent-sky-400"
          />
        </label>

        <label className="space-y-1">
          <span className="text-slate-300 text-[11px]">
            Rotación lateral ({rotacionY}°)
          </span>
          <input
            type="range"
            min={-35}
            max={35}
            value={rotacionY}
            onChange={(e) => setRotacionY(Number(e.target.value))}
            className="w-full accent-sky-400"
          />
        </label>
      </div>

      <div
        style={{ perspective: "900px" }}
        className="overflow-x-auto py-4 px-2 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800"
      >
        <div
          style={{
            transform: `rotateX(${inclinacionX}deg) rotateY(${rotacionY}deg)`,
            transformStyle: "preserve-3d",
          }}
          className="transition-transform duration-150 space-y-5 py-2"
        >
          {renderFilaArcada(SUPERIOR, true)}
          <div className="border-t border-dashed border-slate-700/80 mx-6" />
          {renderFilaArcada(INFERIOR, false)}
        </div>
      </div>
    </div>
  );
}
