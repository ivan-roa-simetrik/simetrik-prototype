"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NOVAPAY_ROWS } from "@/components/simetrik/node-records";
import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BellIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  Loader2Icon,
  MousePointerClickIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
} from "lucide-react";

// Simulación de Google Sheets con el settlement real de NovaPay: el usuario ve
// sus datos donde vive hoy (una hoja de cálculo) y el Agente Simetrik aparece
// como asistente flotante que detecta alertas y responde consultas sobre celdas.
// El mock se mantiene SIEMPRE en claro, como el producto real que imita.

const SHEET_MENUS = ["Archivo", "Editar", "Ver", "Insertar", "Formato", "Datos", "Herramientas", "Extensiones", "Ayuda"];
const SHEET_COLUMNS = ["A", "B", "C", "D", "E", "F", "G", "H"];

type SheetAlert = {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  realFee: number;
  theoFee: number;
  delta: number;
  deltaPct: number;
  row: number;
};

const alerts: SheetAlert[] = NOVAPAY_ROWS.map(([merchant, date, amount, realFee, , theoFee, delta, deltaPct], i) => ({
  id: `${merchant}-${date}`,
  merchant,
  date,
  amount,
  realFee,
  theoFee,
  delta,
  deltaPct,
  row: i + 2,
})).filter((a) => a.deltaPct > 5);

const alarmRowIds = new Set(alerts.map((a) => a.row));

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Agregados reales del caso (calculados con sqlite3 sobre los CSV de referencia)
const MERCHANT_SUMMARY: Record<string, { delta: number; alarms: number }> = {
  "NOVA-001": { delta: 547.08, alarms: 6 },
  "NOVA-002": { delta: 276.86, alarms: 4 },
  "NOVA-003": { delta: 392.09, alarms: 5 },
};

const DAILY_SUMMARY: Record<string, { ok: number; alarms: number; delta: number }> = {
  "2026-07-01": { ok: 2, alarms: 1, delta: 88.4 },
  "2026-07-02": { ok: 3, alarms: 0, delta: 4.49 },
  "2026-07-03": { ok: 1, alarms: 2, delta: 181.96 },
  "2026-07-04": { ok: 1, alarms: 2, delta: 127.74 },
  "2026-07-05": { ok: 1, alarms: 2, delta: 90.88 },
  "2026-07-06": { ok: 1, alarms: 2, delta: 154.36 },
  "2026-07-07": { ok: 1, alarms: 2, delta: 220.59 },
  "2026-07-08": { ok: 2, alarms: 1, delta: 80.1 },
  "2026-07-09": { ok: 2, alarms: 1, delta: 102.92 },
  "2026-07-10": { ok: 1, alarms: 2, delta: 164.59 },
};

type SelectedCell = { ref: string; colIndex: number; rowNumber: number; value: string };

const buildCellAnswer = (cell: SelectedCell): string => {
  const dataRow = NOVAPAY_ROWS[cell.rowNumber - 2];
  if (cell.rowNumber === 1 || !dataRow || cell.colIndex > 3) {
    return `La celda ${cell.ref} no tiene un dato asociado en Simetrik. Las columnas conectadas de esta hoja son merchant_id, date, amount y real_fee del caso "Fees & Billing — NovaPay".`;
  }

  const [merchant, date, amount, realFee, rate, theo, delta, pct] = dataRow;
  const isAlarm = pct > 5;

  switch (cell.colIndex) {
    case 0: {
      const summary = MERCHANT_SUMMARY[merchant];
      return `${merchant} está conectado al caso "Fees & Billing — NovaPay" en Simetrik. En el período 01–10 jul acumula +${money(summary.delta)} cobrados de más, con ${summary.alarms} de 10 transacciones en alarma.`;
    }
    case 1: {
      const summary = DAILY_SUMMARY[date];
      return `El ${date} Simetrik procesó 3 transacciones de esta hoja: ${summary.ok} conciliaron y ${summary.alarms} dispararon alarma. La diferencia acumulada de ese día es +${money(summary.delta)}.`;
    }
    case 2:
      return `${cell.ref} es el monto liquidado de ${merchant} el ${date}: ${money(amount)}. En Simetrik se usó para calcular el fee teórico del contrato vigente: ${money(amount)} × ${(rate * 100).toFixed(1)}% = ${money(theo)}.`;
    case 3:
      return isAlarm
        ? `${cell.ref} es el fee cobrado a ${merchant} el ${date}: ${money(realFee)}. Según el contrato vigente (${(rate * 100).toFixed(1)}%) el fee teórico es ${money(theo)}: hay +${money(delta)} cobrados de más (${pct.toFixed(1)}%). En Simetrik esta fila está en la cola de excepciones con alarma activa.`
        : `${cell.ref} es el fee cobrado a ${merchant} el ${date}: ${money(realFee)}. Coincide con el contrato vigente (${(rate * 100).toFixed(1)}%, teórico ${money(theo)}, desvío ${pct.toFixed(1)}%): en Simetrik esta fila está conciliada.`;
    default:
      return `La celda ${cell.ref} no tiene un dato asociado en Simetrik.`;
  }
};

type Consulta = { id: string; cellRef: string; question: string; answer: string | null };

export function SheetsMock() {
  const [selectedAlert, setSelectedAlert] = useState<SheetAlert | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [justSentId, setJustSentId] = useState<string | null>(null);

  const [agentOpen, setAgentOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"notificaciones" | "consultas">("notificaciones");
  const [pickingCell, setPickingCell] = useState(false);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [question, setQuestion] = useState("");
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const consultaCounter = useRef(0);

  useEffect(() => {
    if (!pickingCell) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPickingCell(false);
        setAgentOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pickingCell]);

  const sendToSimetrik = (alert: SheetAlert) => {
    setSentIds((prev) => new Set(prev).add(alert.id));
    setJustSentId(alert.id);
  };

  const startCellPicking = () => {
    setPickingCell(true);
    setAgentOpen(false);
  };

  const handleCellClick = (colIndex: number, rowNumber: number, value: string) => {
    if (!pickingCell) return;
    setSelectedCell({ ref: `${SHEET_COLUMNS[colIndex]}${rowNumber}`, colIndex, rowNumber, value });
    setPickingCell(false);
    setPanelTab("consultas");
    setAgentOpen(true);
  };

  const submitConsulta = () => {
    if (!selectedCell) return;
    consultaCounter.current += 1;
    const id = `consulta-${consultaCounter.current}`;
    const q = question.trim() || `¿Qué es ${selectedCell.ref} en Simetrik?`;
    const answer = buildCellAnswer(selectedCell);
    setConsultas((prev) => [...prev, { id, cellRef: selectedCell.ref, question: q, answer: null }]);
    setQuestion("");
    // Simula el tiempo de respuesta del agente antes de mostrar la explicación.
    setTimeout(() => {
      setConsultas((prev) => prev.map((c) => (c.id === id ? { ...c, answer } : c)));
    }, 900);
  };

  return (
    <div className="flex h-dvh flex-col bg-white text-neutral-800">
      {/* Barra superior de Sheets */}
      <header className="flex items-center gap-3 px-4 pt-2">
        <Link href="/" title="Volver al sitio" className="flex items-center text-neutral-500 hover:text-neutral-800">
          <ChevronLeftIcon className="size-5" />
        </Link>
        {/* Ícono de hoja de cálculo, dibujado inline para no depender de assets externos */}
        <span className="flex size-9 items-center justify-center rounded bg-[#188038]">
          <span className="grid size-5 grid-cols-2 gap-px rounded-[2px] bg-white/90 p-[3px]">
            <span className="bg-[#188038]" />
            <span className="bg-[#188038]" />
            <span className="bg-[#188038]" />
            <span className="bg-[#188038]" />
          </span>
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-lg text-neutral-800">settlement_novapay_julio</span>
            <StarIcon className="size-4 text-neutral-400" />
          </div>
          <nav className="flex gap-3 text-[13px] text-neutral-600">
            {SHEET_MENUS.map((menu) => (
              <span key={menu} className="cursor-default rounded px-1 hover:bg-neutral-100">
                {menu}
              </span>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" className="rounded-full bg-[#c2e7ff] px-5 py-2 text-sm font-medium text-[#001d35]">
            Compartir
          </button>
          <span className="flex size-8 items-center justify-center rounded-full bg-[#188038] text-sm font-medium text-white">
            I
          </span>
        </div>
      </header>

      {/* Barra de fórmulas */}
      <div className="mx-4 mt-2 flex items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm">
        <span className="w-10 shrink-0 border-r border-neutral-300 pr-3 text-center text-neutral-600">
          {selectedCell?.ref ?? "D2"}
        </span>
        <span className="text-neutral-400 italic">fx</span>
        <span className="text-neutral-700">{selectedCell ? selectedCell.value || "—" : "444.32"}</span>
      </div>

      {/* Grilla */}
      <div className="mt-2 flex-1 overflow-auto">
        <table className={cn("w-full border-collapse text-[13px]", pickingCell && "cursor-crosshair")}>
          <thead>
            <tr>
              <th className="sticky top-0 z-10 w-12 border border-neutral-200 bg-neutral-100 py-1 font-normal text-neutral-500" />
              {SHEET_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="sticky top-0 z-10 min-w-28 border border-neutral-200 bg-neutral-100 py-1 text-center font-normal text-neutral-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-200 bg-neutral-100 text-center text-neutral-500">1</td>
              {["merchant_id", "date", "amount", "real_fee", "", "", "", ""].map((header, i) => (
                <td
                  key={i}
                  onClick={() => handleCellClick(i, 1, header)}
                  className={cn(
                    "border border-neutral-200 px-2 py-1 font-medium text-neutral-700",
                    pickingCell && "hover:bg-blue-50",
                  )}
                >
                  {header}
                </td>
              ))}
            </tr>
            {NOVAPAY_ROWS.map(([merchant, date, amount, realFee], i) => {
              const rowNumber = i + 2;
              const isAlarm = alarmRowIds.has(rowNumber);
              const cells = [merchant, date, amount.toFixed(2), realFee.toFixed(2), "", "", "", ""];
              return (
                <tr key={`${merchant}-${date}`}>
                  <td className="border border-neutral-200 bg-neutral-100 text-center text-neutral-500">{rowNumber}</td>
                  {cells.map((value, colIndex) => {
                    const ref = `${SHEET_COLUMNS[colIndex]}${rowNumber}`;
                    const isSelected = selectedCell?.ref === ref;
                    return (
                      <td
                        key={colIndex}
                        onClick={() => handleCellClick(colIndex, rowNumber, value)}
                        className={cn(
                          "border border-neutral-200 px-2 py-1",
                          colIndex >= 2 && "tabular-nums",
                          colIndex === 3 && isAlarm && "bg-red-50 font-medium text-red-700",
                          pickingCell && "hover:bg-blue-50",
                          isSelected && "ring-2 ring-inset ring-[#1a73e8]",
                        )}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pestañas de hojas */}
      <footer className="flex items-center gap-1 border-t border-neutral-200 bg-neutral-50 px-4 py-1 text-[13px]">
        <PlusIcon className="size-4 text-neutral-500" />
        <span className="rounded-t border-x border-t border-neutral-300 bg-white px-4 py-1 font-medium text-[#188038]">
          settlement_julio
        </span>
        <span className="px-3 py-1 text-neutral-500">contratos</span>
      </footer>

      {/* Aviso de modo selección de celda */}
      {pickingCell && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white shadow-lg">
          Haz clic en una celda de la hoja — Esc para cancelar
        </div>
      )}

      {/* Agente Simetrik flotante */}
      <Popover open={agentOpen} onOpenChange={setAgentOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label="Agente Simetrik"
              className="fixed right-5 bottom-5 z-50 flex size-14 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-xl transition-transform hover:scale-105"
            />
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida, no necesita optimización de next/image */}
          <img src={assetPath("/simetrik-isologo.png")} alt="Simetrik" className="size-7" />
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
            {alerts.length}
          </span>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-96 p-0">
          <div className="flex items-center gap-2 border-b p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida */}
            <img src={assetPath("/simetrik-isologo.png")} alt="" className="size-5" />
            <p className="text-sm font-semibold">Agente Simetrik</p>
            <Badge variant="outline" className="border-destructive/30 text-destructive ml-auto gap-1">
              <BellIcon className="size-3" />
              {alerts.length}
            </Badge>
          </div>

          <Tabs value={panelTab} onValueChange={(v) => setPanelTab(v as "notificaciones" | "consultas")}>
            <TabsList className="mx-3 mt-2 w-[calc(100%-1.5rem)]">
              <TabsTrigger value="notificaciones" className="flex-1">
                Notificaciones
              </TabsTrigger>
              <TabsTrigger value="consultas" className="flex-1">
                Consultas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notificaciones">
              {selectedAlert ? (
                /* Detalle de una alerta */
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 border-b p-3">
                    <Button variant="ghost" size="icon-sm" aria-label="Volver" onClick={() => setSelectedAlert(null)}>
                      <ArrowLeftIcon className="size-4" />
                    </Button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {selectedAlert.merchant} · {selectedAlert.date}
                      </p>
                      <p className="text-muted-foreground text-xs">Fila {selectedAlert.row} de la hoja</p>
                    </div>
                    <Badge variant="outline" className="border-destructive/30 text-destructive ml-auto shrink-0">
                      +{selectedAlert.deltaPct.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Monto</p>
                      <p className="font-medium tabular-nums">{money(selectedAlert.amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Fee cobrado</p>
                      <p className="font-medium tabular-nums">{money(selectedAlert.realFee)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Fee según contrato</p>
                      <p className="font-medium tabular-nums">{money(selectedAlert.theoFee)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Cobrado de más</p>
                      <p className="text-destructive font-medium tabular-nums">+{money(selectedAlert.delta)}</p>
                    </div>
                    <p className="text-muted-foreground col-span-2 text-xs">
                      El fee cobrado supera en {selectedAlert.deltaPct.toFixed(1)}% al pactado en el contrato vigente a
                      esa fecha. Umbral del caso: 5%.
                    </p>
                  </div>
                  <div className="border-t p-3">
                    {sentIds.has(selectedAlert.id) ? (
                      <div className="flex flex-col gap-2">
                        <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2Icon className="size-4" />
                          {justSentId === selectedAlert.id
                            ? "Enviada a Simetrik — quedó en la cola de excepciones."
                            : "Ya está en revisión en Simetrik."}
                        </p>
                        <Button variant="outline" size="sm" render={<Link href="/dashboard" />} nativeButton={false}>
                          Abrir en Simetrik
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full" onClick={() => sendToSimetrik(selectedAlert)}>
                        <SendIcon className="size-4" />
                        Enviar a Simetrik a revisar
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Lista de alertas */
                <div className="flex flex-col">
                  <p className="text-muted-foreground border-b px-3 py-2 text-xs">
                    Detecté fees cobrados fuera del contrato en esta hoja. Toca una alerta para ver el detalle.
                  </p>
                  <div className="max-h-64 overflow-y-auto">
                    {alerts.map((alert) => (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => setSelectedAlert(alert)}
                        className="hover:bg-muted flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0"
                      >
                        <span className="bg-destructive/10 text-destructive flex size-7 shrink-0 items-center justify-center rounded-md">
                          <AlertTriangleIcon className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {alert.merchant} · {alert.date}
                          </span>
                          <span className="text-muted-foreground block text-xs">
                            Cobrado de más +{money(alert.delta)} ({alert.deltaPct.toFixed(1)}%)
                          </span>
                        </span>
                        {sentIds.has(alert.id) ? (
                          <CheckCircle2Icon className="size-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Badge variant="outline" className="border-destructive/30 text-destructive shrink-0">
                            +{alert.deltaPct.toFixed(1)}%
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="consultas">
              <div className="flex flex-col">
                <p className="text-muted-foreground border-b px-3 py-2 text-xs">
                  Selecciona una celda de la hoja y pregúntame: la busco en Simetrik y te cuento qué es.
                </p>

                {consultas.length > 0 && (
                  <div className="max-h-56 space-y-3 overflow-y-auto border-b p-3">
                    {consultas.map((consulta) => (
                      <div key={consulta.id} className="space-y-1.5">
                        <div className="flex items-start justify-end gap-2">
                          <p className="bg-primary text-primary-foreground max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs">
                            <span className="bg-primary-foreground/20 mr-1.5 rounded px-1 py-px font-mono text-[10px]">
                              {consulta.cellRef}
                            </span>
                            {consulta.question}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <p className="bg-muted max-w-[90%] rounded-lg px-2.5 py-1.5 text-xs leading-relaxed">
                            {consulta.answer ?? (
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Loader2Icon className="size-3 animate-spin" />
                                Buscando en Simetrik…
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 p-3">
                  {selectedCell ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="shrink-0 font-mono">
                        {selectedCell.ref}
                      </Badge>
                      <span className="text-muted-foreground truncate text-xs">
                        {selectedCell.value || "celda vacía"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 px-2 text-xs"
                        onClick={startCellPicking}
                      >
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={startCellPicking}>
                      <MousePointerClickIcon className="size-4" />
                      Seleccionar celda de la hoja
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitConsulta();
                      }}
                      placeholder="¿Qué quieres saber de esta celda?"
                      disabled={!selectedCell}
                      className="h-8 text-xs"
                    />
                    <Button size="sm" className="h-8 shrink-0" disabled={!selectedCell} onClick={submitConsulta}>
                      <SearchIcon className="size-3.5" />
                      Buscar
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SheetsMock;
