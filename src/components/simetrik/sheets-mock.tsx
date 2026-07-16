"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NOVAPAY_ROWS } from "@/components/simetrik/node-records";
import { assetPath } from "@/lib/asset-path";
import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BellIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  PlusIcon,
  SendIcon,
  StarIcon,
} from "lucide-react";

// Simulación de Google Sheets con el settlement real de NovaPay: el usuario ve
// sus datos donde vive hoy (una hoja de cálculo) y el Agente Simetrik aparece
// como asistente flotante que detecta las alertas sobre esos mismos datos.
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

export function SheetsMock() {
  const [selectedAlert, setSelectedAlert] = useState<SheetAlert | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [justSentId, setJustSentId] = useState<string | null>(null);

  const sendToSimetrik = (alert: SheetAlert) => {
    setSentIds((prev) => new Set(prev).add(alert.id));
    setJustSentId(alert.id);
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
          <button
            type="button"
            className="rounded-full bg-[#c2e7ff] px-5 py-2 text-sm font-medium text-[#001d35]"
          >
            Compartir
          </button>
          <span className="flex size-8 items-center justify-center rounded-full bg-[#188038] text-sm font-medium text-white">
            I
          </span>
        </div>
      </header>

      {/* Barra de fórmulas */}
      <div className="mx-4 mt-2 flex items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm">
        <span className="w-10 shrink-0 border-r border-neutral-300 pr-3 text-center text-neutral-600">D2</span>
        <span className="text-neutral-400 italic">fx</span>
        <span className="text-neutral-700">444.32</span>
      </div>

      {/* Grilla */}
      <div className="mt-2 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[13px]">
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
                <td key={i} className="border border-neutral-200 px-2 py-1 font-medium text-neutral-700">
                  {header}
                </td>
              ))}
            </tr>
            {NOVAPAY_ROWS.map(([merchant, date, amount, realFee], i) => {
              const rowNumber = i + 2;
              const isAlarm = alarmRowIds.has(rowNumber);
              return (
                <tr key={`${merchant}-${date}`}>
                  <td className="border border-neutral-200 bg-neutral-100 text-center text-neutral-500">{rowNumber}</td>
                  <td className="border border-neutral-200 px-2 py-1">{merchant}</td>
                  <td className="border border-neutral-200 px-2 py-1">{date}</td>
                  <td className="border border-neutral-200 px-2 py-1 tabular-nums">{amount.toFixed(2)}</td>
                  <td
                    className={cn(
                      "border border-neutral-200 px-2 py-1 tabular-nums",
                      isAlarm && "bg-red-50 font-medium text-red-700",
                    )}
                  >
                    {realFee.toFixed(2)}
                  </td>
                  <td className="border border-neutral-200 px-2 py-1" />
                  <td className="border border-neutral-200 px-2 py-1" />
                  <td className="border border-neutral-200 px-2 py-1" />
                  <td className="border border-neutral-200 px-2 py-1" />
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

      {/* Agente Simetrik flotante */}
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label="Agente Simetrik"
              className="fixed right-5 bottom-20 z-50 flex size-14 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-xl transition-transform hover:scale-105"
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
                  El fee cobrado supera en {selectedAlert.deltaPct.toFixed(1)}% al pactado en el contrato vigente a esa
                  fecha. Umbral del caso: 5%.
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
              <div className="flex items-center gap-2 border-b p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida */}
                <img src={assetPath("/simetrik-isologo.png")} alt="" className="size-5" />
                <p className="text-sm font-semibold">Agente Simetrik</p>
                <Badge variant="outline" className="border-destructive/30 text-destructive ml-auto gap-1">
                  <BellIcon className="size-3" />
                  {alerts.length} alertas
                </Badge>
              </div>
              <p className="text-muted-foreground border-b px-3 py-2 text-xs">
                Detecté fees cobrados fuera del contrato en esta hoja. Toca una alerta para ver el detalle.
              </p>
              <div className="max-h-72 overflow-y-auto">
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
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SheetsMock;
