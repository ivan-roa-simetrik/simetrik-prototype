"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { AlertTriangleIcon, BellRingIcon, CheckCircle2Icon, FileBarChartIcon } from "lucide-react";

// Tablero de resultados del caso: lo que el mapa configura, acá se ve ejecutado.
// Datos reales del caso UC7/NovaPay — Reference/caso-uc7-novapay (verificado con sqlite3).

type BoardKpi = { label: string; value: string; hint?: string; alert?: boolean };
type BoardRow = { label: string; detail: string; value: string; share: number; alert: boolean };

type BoardData = {
  kpis: BoardKpi[];
  chart: { name: string; monto: number }[];
  chartTitle: string;
  rows: BoardRow[];
  rowsTitle: string;
  alarm: { rule: string; channel: string };
};

const NOVAPAY_BOARD: BoardData = {
  kpis: [
    { label: "Transacciones analizadas", value: "30", hint: "3 comercios · 01–10 jul" },
    { label: "Con alarma", value: "15", hint: "delta_pct > 5%", alert: true },
    { label: "Total sobrepagado", value: "$1,216.03", hint: "fee cobrado vs. contrato", alert: true },
    { label: "Peor caso", value: "+43.4%", hint: "NOVA-002 · 08/07", alert: true },
  ],
  chartTitle: "Sobrecobro por comercio (USD)",
  chart: [
    { name: "NOVA-001", monto: 547.08 },
    { name: "NOVA-002", monto: 276.86 },
    { name: "NOVA-003", monto: 392.09 },
  ],
  rowsTitle: "Reporte por comercio",
  rows: [
    { label: "NOVA-001", detail: "Tarifa contractual estable", value: "+$547.08", share: 45, alert: true },
    { label: "NOVA-002", detail: "Renegociación 06/07 (2.2% → 2.0%) no aplicada", value: "+$276.86", share: 23, alert: true },
    { label: "NOVA-003", detail: "Drift de tarifa sostenido", value: "+$392.09", share: 32, alert: true },
  ],
  alarm: { rule: "Fee cobrado vs. fee teórico del contrato vigente · umbral 5%", channel: "Alarma dentro de Simetrik" },
};

const genericBoard = (sourceNames: [string, string], threshold: string, channel: string): BoardData => ({
  kpis: [
    { label: "Registros analizados", value: "1,240", hint: `${sourceNames[0]} + ${sourceNames[1]}` },
    { label: "Conciliados", value: "1,218", hint: "98.2% de match" },
    { label: "Con alarma", value: "22", hint: `umbral ${threshold}`, alert: true },
    { label: "Diferencia acumulada", value: "$4,830.50", alert: true },
  ],
  chartTitle: "Diferencias por fuente (USD)",
  chart: [
    { name: sourceNames[0], monto: 2610.2 },
    { name: sourceNames[1], monto: 2220.3 },
  ],
  rowsTitle: "Excepciones abiertas",
  rows: [
    { label: "Sin match en contraparte", detail: "Registros presentes en una sola fuente", value: "14", share: 64, alert: true },
    { label: "Monto distinto", detail: `Diferencia sobre el umbral de ${threshold}`, value: "6", share: 27, alert: true },
    { label: "Fecha desfasada", detail: "Match encontrado fuera de la ventana", value: "2", share: 9, alert: false },
  ],
  alarm: { rule: `Diferencia entre fuentes · umbral ${threshold}`, channel },
});

const boardChartConfig = {
  monto: { label: "Monto", color: "var(--chart-1)" },
} satisfies ChartConfig;

type ResultsBoardProps = {
  isNovaPay: boolean;
  sourceNames: [string, string];
  threshold: string;
  channel: string;
  isSelectionMode?: boolean;
  onPickData?: (label: string, value: string) => void;
};

export function ResultsBoard({ isNovaPay, sourceNames, threshold, channel, isSelectionMode, onPickData }: ResultsBoardProps) {
  const data = isNovaPay ? NOVAPAY_BOARD : genericBoard(sourceNames, threshold, channel);

  const pickable = (label: string, value: string) =>
    isSelectionMode && onPickData
      ? {
          onClick: () => onPickData(label, value),
          className: "cursor-pointer",
          role: "button" as const,
        }
      : {};

  return (
    <div className="h-full w-full overflow-y-auto p-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {data.kpis.map((kpi) => (
            <Card
              key={kpi.label}
              className={isSelectionMode ? "hover:border-primary cursor-pointer gap-1 py-4 transition-colors" : "gap-1 py-4"}
              {...pickable(kpi.label, kpi.value)}
            >
              <CardHeader className="px-4">
                <CardTitle className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  {kpi.alert ? <AlertTriangleIcon className="text-destructive size-3.5" /> : <CheckCircle2Icon className="size-3.5 text-emerald-500" />}
                  {kpi.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-2xl font-semibold">{kpi.value}</p>
                {kpi.hint && <p className="text-muted-foreground text-xs">{kpi.hint}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileBarChartIcon className="text-muted-foreground size-4" />
                {data.chartTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={boardChartConfig} className="h-52 w-full">
                <BarChart accessibilityLayer data={data.chart} margin={{ top: 8, left: -12, right: 8 }}>
                  <CartesianGrid strokeDasharray="4" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="monto" fill="var(--chart-1)" radius={4} barSize={36} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Detail rows */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{data.rowsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.rows.map((row) => (
                <div
                  key={row.label}
                  className={isSelectionMode ? "hover:bg-muted -mx-2 cursor-pointer space-y-1.5 rounded-md px-2 py-1" : "space-y-1.5"}
                  {...pickable(row.label, row.value)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{row.label}</span>
                      {row.alert && (
                        <Badge variant="outline" className="text-destructive border-destructive/30 h-5 px-1.5 text-[10px]">
                          Alarma
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{row.value}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{row.detail}</p>
                  <Progress value={row.share} className="**:data-[slot=progress-track]:h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Alarm config summary */}
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-4">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
              <BellRingIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{data.alarm.rule}</p>
              <p className="text-muted-foreground text-xs">Aviso configurado: {data.alarm.channel}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
