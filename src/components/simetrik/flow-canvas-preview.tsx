"use client";

import { useRef, useState, type PointerEvent, type WheelEvent } from "react";
import {
  ArchiveIcon,
  CombineIcon,
  ArrowRightLeftIcon,
  FileBarChartIcon,
  SearchIcon,
  Maximize2Icon,
  ZoomInIcon,
  ZoomOutIcon,
  RefreshCwIcon,
  PencilIcon,
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

const NODE_WIDTH = 178;
const NODE_HEIGHT = 58;
const CANVAS_WIDTH = 860;
const CANVAS_HEIGHT = 232;

export type NodeType = "repositorio" | "union" | "conciliacion" | "reporte";

export type NodeMetric = {
  label: string;
  value: string;
};

export type FlowNode = {
  id: string;
  label: string;
  type: NodeType;
  icon: typeof ArchiveIcon;
  x: number;
  y: number;
  metrics: NodeMetric[];
  /** Configuración mockeada por defecto del nodo (SQL, regla, export) — visible en el panel de detalle. */
  config: string;
  /** Interpretación de la configuración en lenguaje no técnico — pestaña "Reglas" del panel de detalle. */
  rules: string[];
};

export const typeStyles: Record<NodeType, { badge: string; icon: string; subtitle: string }> = {
  repositorio: {
    badge: "bg-violet-100 dark:bg-violet-500/20",
    icon: "text-violet-600 dark:text-violet-400",
    subtitle: "Repositorio",
  },
  union: {
    badge: "bg-amber-100 dark:bg-amber-500/20",
    icon: "text-amber-600 dark:text-amber-400",
    subtitle: "Unión",
  },
  conciliacion: {
    badge: "bg-blue-100 dark:bg-blue-500/20",
    icon: "text-blue-600 dark:text-blue-400",
    subtitle: "Conciliación",
  },
  reporte: {
    badge: "bg-emerald-100 dark:bg-emerald-500/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    subtitle: "Reporte",
  },
};

export const flowNodes: FlowNode[] = [
  {
    id: "repo-visa",
    label: "Repositorio Visa AR",
    type: "repositorio",
    icon: ArchiveIcon,
    x: 14,
    y: 16,
    metrics: [
      { label: "Archivos", value: "1,204" },
      { label: "Nuevos hoy", value: "86" },
      { label: "Tamaño", value: "2.1 GB" },
      { label: "Última sync", value: "hace 4 min" },
    ],
    config:
      "-- source-visa_ar\n" +
      "SELECT transaction_id, date, amount, fee\n" +
      "FROM raw.visa_ar_settlement\n" +
      "WHERE date >= CURRENT_DATE - INTERVAL '30 days'",
    rules: [
      "Trae las transacciones de Visa AR de los últimos 30 días.",
      "De cada transacción guarda: identificador, fecha, monto y comisión.",
      "Se actualiza solo, con cada sincronización de archivos.",
    ],
  },
  {
    id: "repo-mc",
    label: "Repositorio Mastercard AR",
    type: "repositorio",
    icon: ArchiveIcon,
    x: 14,
    y: 146,
    metrics: [
      { label: "Archivos", value: "986" },
      { label: "Nuevos hoy", value: "64" },
      { label: "Tamaño", value: "1.6 GB" },
      { label: "Última sync", value: "hace 6 min" },
    ],
    config:
      "-- source-mastercard_ar\n" +
      "SELECT transaction_id, date, amount, fee\n" +
      "FROM raw.mastercard_ar_settlement\n" +
      "WHERE date >= CURRENT_DATE - INTERVAL '30 days'",
    rules: [
      "Trae las transacciones de Mastercard AR de los últimos 30 días.",
      "De cada transacción guarda: identificador, fecha, monto y comisión.",
      "Se actualiza solo, con cada sincronización de archivos.",
    ],
  },
  {
    id: "union",
    label: "Unión AR",
    type: "union",
    icon: CombineIcon,
    x: 258,
    y: 81,
    metrics: [
      { label: "Registros", value: "48,392" },
      { label: "Duplicados removidos", value: "312" },
      { label: "Tasa de match", value: "99.1%" },
      { label: "Última corrida", value: "hace 4 min" },
    ],
    config:
      "-- sql_transform-union_ar\n" +
      "SELECT v.transaction_id, v.date, v.amount AS amount_visa, m.amount AS amount_mc\n" +
      "FROM visa_ar v\n" +
      "FULL OUTER JOIN mastercard_ar m\n" +
      "  ON v.transaction_id = m.transaction_id AND v.date = m.date",
    rules: [
      "Junta las transacciones de Visa y Mastercard en una sola tabla.",
      "Empareja los registros que tienen el mismo identificador y la misma fecha.",
      "Si un registro aparece en una sola fuente, se conserva igual para poder revisarlo.",
    ],
  },
  {
    id: "con",
    label: "Conciliación AR",
    type: "conciliacion",
    icon: ArrowRightLeftIcon,
    x: 502,
    y: 81,
    metrics: [
      { label: "Conciliado", value: "98.4%" },
      { label: "Matches", value: "47,890" },
      { label: "Excepciones", value: "502" },
      { label: "Monto conciliado", value: "$18.4M" },
    ],
    config:
      "-- if_else-conciliacion_ar\n" +
      "diferencia = ABS(amount_visa - amount_mc)\n\n" +
      "CASE WHEN diferencia > amount_visa * 0.05 THEN 'alarma'\n" +
      "     ELSE 'conciliado' END",
    rules: [
      "Compara el monto reportado por Visa contra el de Mastercard.",
      "Si la diferencia supera el 5% del monto, marca la transacción con alarma.",
      "El resto queda marcado como conciliado.",
    ],
  },
  {
    id: "reporte",
    label: "Reporte Cash In",
    type: "reporte",
    icon: FileBarChartIcon,
    x: 668,
    y: 81,
    metrics: [
      { label: "Última exportación", value: "hoy 06:00" },
      { label: "Destino", value: "Finance (SAP)" },
      { label: "Formato", value: "CSV" },
      { label: "Próximo envío", value: "mañana 06:00" },
    ],
    config:
      "-- report-cash_in\n" +
      "SELECT date, COUNT(*) AS registros,\n" +
      "  SUM(CASE WHEN estado='conciliado' THEN 1 ELSE 0 END) AS conciliados,\n" +
      "  SUM(diferencia) AS diferencia_total\n" +
      "FROM conciliacion_ar\n" +
      "GROUP BY date ORDER BY date DESC",
    rules: [
      "Resume la conciliación día por día.",
      "Cuenta cuántos registros hubo, cuántos quedaron conciliados y cuánto suma la diferencia.",
      "Se exporta a Finance (SAP) todos los días a las 06:00.",
    ],
  },
];

type Position = { x: number; y: number };

const defaultPositions = (): Record<string, Position> =>
  Object.fromEntries(flowNodes.map((n) => [n.id, { x: n.x, y: n.y }]));

const nodeIndexById = (id: string) => flowNodes.findIndex((n) => n.id === id);
const left = (pos: Position) => ({ x: pos.x, y: pos.y + NODE_HEIGHT / 2 });
const right = (pos: Position) => ({ x: pos.x + NODE_WIDTH, y: pos.y + NODE_HEIGHT / 2 });
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const edges: { from: string; to: string }[] = [
  { from: "repo-visa", to: "union" },
  { from: "repo-mc", to: "union" },
  { from: "union", to: "con" },
  { from: "con", to: "reporte" },
];

const bezierPath = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const midX = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`;
};

const hasIncoming = (id: string) => edges.some((e) => e.to === id);
const hasOutgoing = (id: string) => edges.some((e) => e.from === id);

export type NodeOverride = {
  label?: string;
  metrics?: NodeMetric[];
  /** La configuración real del nodo (SQL, regex, expresión condicional) — se muestra en el panel de configuración. */
  config?: string;
  /** Interpretación de la configuración en lenguaje no técnico — pestaña "Reglas" del panel. */
  rules?: string[];
};

type FlowCanvasPreviewProps = {
  /** Cuántos nodos ya están construidos, en orden. Por defecto se muestran todos. */
  revealCount?: number;
  /** Id del nodo seleccionado para configurar (se resalta en el canvas). */
  selectedId?: string | null;
  /** Se llama al hacer click en un nodo, para abrir su panel de configuración. */
  onNodeSelect?: (id: string) => void;
  /** Permite sobrescribir label/metrics de un nodo por id (ej. según lo que respondió el usuario). */
  nodeOverrides?: Record<string, NodeOverride>;
  /** Se llama al hacer doble click en un nodo, para abrir la vista de tabla con sus registros. */
  onNodeOpenRecords?: (id: string) => void;
  /** Modo selección activo: las métricas de cada nodo se pueden clickear para agregarlas como contexto del chat. */
  isSelectionMode?: boolean;
  /** Se llama al clickear una métrica en modo selección, con su label y valor. */
  onPickData?: (label: string, value: string) => void;
};

type DragState = {
  id: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
};

type PanState = {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;

export const FlowCanvasPreview = ({
  revealCount = flowNodes.length,
  selectedId,
  onNodeSelect,
  nodeOverrides,
  onNodeOpenRecords,
  isSelectionMode,
  onPickData,
}: FlowCanvasPreviewProps) => {
  const [positions, setPositions] = useState<Record<string, Position>>(defaultPositions);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const dragRef = useRef<DragState | null>(null);
  const panRef = useRef<PanState | null>(null);

  const handlePointerDown = (id: string) => (e: PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      originX: positions[id].x,
      originY: positions[id].y,
      moved: false,
    };
  };

  const handlePointerMove = (id: string) => (e: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== id) return;
    const dx = (e.clientX - drag.startX) / viewport.zoom;
    const dy = (e.clientY - drag.startY) / viewport.zoom;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
    setPositions((prev) => ({
      ...prev,
      [id]: {
        x: drag.originX + dx,
        y: drag.originY + dy,
      },
    }));
  };

  const handleClick = (id: string) => () => {
    if (dragRef.current?.id === id && dragRef.current.moved) {
      dragRef.current = null;
      return;
    }
    dragRef.current = null;

    if (isSelectionMode) {
      const node = flowNodes.find((n) => n.id === id);
      const override = nodeOverrides?.[id];
      const label = override?.label ?? node?.label ?? id;
      const metrics = override?.metrics ?? node?.metrics ?? [];
      const summary = metrics.map((m) => `${m.label}: ${m.value}`).join(", ");
      onPickData?.(label, summary);
    }
    // El detalle se abre con el botón "Editar" del hover card; la tabla, con doble click.
  };

  const handleDoubleClick = (id: string) => () => {
    if (isSelectionMode) return;
    onNodeOpenRecords?.(id);
  };

  const handleCanvasPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    panRef.current = { startX: e.clientX, startY: e.clientY, originX: viewport.x, originY: viewport.y };
  };

  const handleCanvasPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan) return;
    setViewport((v) => ({
      ...v,
      x: pan.originX + (e.clientX - pan.startX),
      y: pan.originY + (e.clientY - pan.startY),
    }));
  };

  const handleCanvasPointerUp = () => {
    panRef.current = null;
  };

  const zoomIn = () => setViewport((v) => ({ ...v, zoom: clamp(v.zoom + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX) }));
  const zoomOut = () => setViewport((v) => ({ ...v, zoom: clamp(v.zoom - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX) }));
  const resetView = () => setViewport({ x: 0, y: 0, zoom: 1 });

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setViewport((v) => ({ ...v, zoom: clamp(v.zoom - e.deltaY * 0.001, ZOOM_MIN, ZOOM_MAX) }));
  };

  return (
    <div
      className="relative flex h-full w-full cursor-grab touch-none items-center justify-center overflow-hidden active:cursor-grabbing"
      style={{
        backgroundImage:
          "radial-gradient(color-mix(in oklab, var(--foreground) 12%, transparent) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onWheel={handleWheel}
    >
      <div
        className="relative"
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {edges.map((edge) => {
            const a = right(positions[edge.from]);
            const b = left(positions[edge.to]);
            const isBuilt = nodeIndexById(edge.to) < revealCount;
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={bezierPath(a, b)}
                stroke="var(--border)"
                strokeWidth={1.5}
                strokeDasharray={isBuilt ? undefined : "4 4"}
                fill="none"
                className={cn("transition-opacity duration-500", !isBuilt && "opacity-30")}
              />
            );
          })}
        </svg>

        {flowNodes.map((node, index) => {
          const { id, type, icon: Icon } = node;
          const override = nodeOverrides?.[id];
          const label = override?.label ?? node.label;
          const metrics = override?.metrics ?? node.metrics;
          const pos = positions[id];
          const style = typeStyles[type];
          const isActive = index === revealCount;
          const isPending = index > revealCount;
          const isSelected = id === selectedId;
          return (
            <div
              key={id}
              className={cn(
                "absolute transition-opacity duration-500",
                isPending && "pointer-events-none opacity-30 grayscale",
              )}
              style={{ left: pos.x, top: pos.y, width: NODE_WIDTH }}
            >
              {hasIncoming(id) && (
                <span
                  className="bg-background absolute top-1/2 -left-[5px] size-2.5 -translate-y-1/2 rounded-full border-2"
                  style={{ borderColor: "var(--border)" }}
                />
              )}
              <HoverCard>
                <HoverCardTrigger
                  render={
                    <button
                      type="button"
                      onClick={handleClick(id)}
                      onDoubleClick={handleDoubleClick(id)}
                      onPointerDown={handlePointerDown(id)}
                      onPointerMove={handlePointerMove(id)}
                      className={cn(
                        "bg-card flex w-full cursor-grab touch-none items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left shadow-sm transition-shadow select-none hover:shadow-md active:cursor-grabbing",
                        isActive && "border-primary ring-primary/30 animate-pulse ring-4",
                        isSelected && "border-primary ring-primary/40 ring-4",
                        isSelectionMode && "hover:ring-primary/50 cursor-pointer hover:ring-4 active:cursor-pointer",
                      )}
                      style={{ height: NODE_HEIGHT }}
                    />
                  }
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", style.badge)}>
                    <Icon className={cn("size-4", style.icon)} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold leading-tight">{label}</span>
                    <span className="text-muted-foreground truncate text-xs leading-tight">{style.subtitle}</span>
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="w-72" side="top">
                  <div className="flex items-center gap-2">
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", style.badge)}>
                      <Icon className={cn("size-4", style.icon)} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{label}</p>
                      <p className="text-muted-foreground text-xs">{style.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      // El hover card se cierra en pointerdown y desmonta el botón antes del click,
                      // así que la acción se dispara en pointerdown directamente.
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onNodeSelect?.(id);
                      }}
                      title="Editar nodo"
                      aria-label={`Editar ${label}`}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3">
                    {metrics.map((metric) =>
                      isSelectionMode ? (
                        <button
                          key={metric.label}
                          type="button"
                          onClick={() => onPickData?.(metric.label, metric.value)}
                          className="hover:bg-primary/10 hover:ring-primary/40 flex flex-col gap-0.5 rounded-md p-1 -m-1 text-left transition-colors hover:ring-2"
                        >
                          <span className="text-muted-foreground text-xs">{metric.label}</span>
                          <span className="text-sm font-medium">{metric.value}</span>
                        </button>
                      ) : (
                        <div key={metric.label} className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-xs">{metric.label}</span>
                          <span className="text-sm font-medium">{metric.value}</span>
                        </div>
                      ),
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
              {hasOutgoing(id) && (
                <span
                  className="bg-background absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2"
                  style={{ borderColor: "var(--border)", left: NODE_WIDTH - 5 }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2" onPointerDown={(e) => e.stopPropagation()}>
        <div className="bg-card/90 flex items-center gap-3 rounded-full border px-4 py-2 shadow-md backdrop-blur">
          <button type="button" aria-label="Buscar en el mapa" title="Buscar en el mapa" className="text-muted-foreground hover:text-foreground">
            <SearchIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Restablecer vista"
            title="Restablecer vista"
            onClick={resetView}
            className="text-muted-foreground hover:text-foreground"
          >
            <Maximize2Icon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Acercar"
            title="Acercar"
            onClick={zoomIn}
            disabled={viewport.zoom >= ZOOM_MAX}
            className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ZoomInIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Alejar"
            title="Alejar"
            onClick={zoomOut}
            disabled={viewport.zoom <= ZOOM_MIN}
            className="text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ZoomOutIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Restablecer posición de los nodos"
            title="Restablecer posición de los nodos"
            onClick={() => setPositions(defaultPositions())}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCwIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowCanvasPreview;
