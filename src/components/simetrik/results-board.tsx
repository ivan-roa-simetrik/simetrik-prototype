"use client";

import type { ReactElement } from "react";

import { Bar, BarChart, CartesianGrid, Label as RechartsLabel, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowRightLeftIcon,
  BellRingIcon,
  DollarSignIcon,
  EllipsisVerticalIcon,
  FileCheck2Icon,
  PercentIcon,
  ReceiptTextIcon,
  ScaleIcon,
  WalletIcon,
} from "lucide-react";

// Tablero de resultados del caso: lo que el mapa configura, acá se ve ejecutado.
// Datos reales del caso UC7/NovaPay — Reference/caso-uc7-novapay; los agregados
// diarios y por comercio se calcularon con sqlite3 sobre los CSV (no editar a mano).

const menuItems = ["Compartir", "Actualizar", "Refrescar"];

type UsageStatus = "ok" | "warn" | "crit";

const statusStyles: Record<UsageStatus, { label: string; className: string }> = {
  ok: { label: "Al día", className: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
  warn: { label: "Atención", className: "border-amber-500/40 text-amber-600 dark:text-amber-400" },
  crit: { label: "Crítico", className: "border-destructive/30 text-destructive" },
};

type UsageStat = {
  icon: ReactElement;
  title: string;
  status: UsageStatus;
  highlightLabel: string;
  highlightValue: string;
  highlightUnit?: string;
  progress: number;
  footLeft: string;
  footRight: string;
};

type ReportRow = { icon: ReactElement; title: string; amount: string; iconClassName: string };

type BoardData = {
  usage: UsageStat[];
  daily: { day: string; conciliadas: number; alarmas: number }[];
  dailyTitle: string;
  dailySubtitle: string;
  report: ReportRow[];
  reportSubtitle: string;
  deltaBars: { day: string; monto: number; highlight?: boolean }[];
  deltaTitle: string;
  deltaAmount: string;
  deltaChange: string;
  donut: { name: string; monto: number }[];
  donutTitle: string;
  donutAmount: string;
  donutCenter: string;
  alarm: { rule: string; channel: string };
};

const NOVAPAY_BOARD: BoardData = {
  usage: [
    {
      icon: <ArrowRightLeftIcon />,
      title: "Conciliación automática",
      status: "ok",
      highlightLabel: "Tasa de match",
      highlightValue: "98.4%",
      progress: 98.4,
      footLeft: "Meta 95%",
      footRight: "30 transacciones · 3 comercios",
    },
    {
      icon: <BellRingIcon />,
      title: "Alarmas activas",
      status: "crit",
      highlightLabel: "Dispararon el umbral",
      highlightValue: "15",
      highlightUnit: "de 30",
      progress: 50,
      footLeft: "50% del total",
      footRight: "delta_pct > 5%",
    },
    {
      icon: <DollarSignIcon />,
      title: "Sobrepago acumulado",
      status: "warn",
      highlightLabel: "Fee cobrado de más",
      highlightValue: "$1,216.03",
      progress: 13,
      footLeft: "13% sobre el fee teórico",
      footRight: "$9,336.25 teórico",
    },
    {
      icon: <FileCheck2Icon />,
      title: "Cobertura de contratos",
      status: "ok",
      highlightLabel: "Filas con tarifa vigente",
      highlightValue: "30",
      highlightUnit: "de 30",
      progress: 100,
      footLeft: "0 sin match",
      footRight: "4 vigencias contractuales",
    },
  ],
  dailyTitle: "Conciliación diaria",
  dailySubtitle: "01–10 jul · transacciones conciliadas vs. con alarma",
  daily: [
    { day: "01", conciliadas: 2, alarmas: 1 },
    { day: "02", conciliadas: 3, alarmas: 0 },
    { day: "03", conciliadas: 1, alarmas: 2 },
    { day: "04", conciliadas: 1, alarmas: 2 },
    { day: "05", conciliadas: 1, alarmas: 2 },
    { day: "06", conciliadas: 1, alarmas: 2 },
    { day: "07", conciliadas: 1, alarmas: 2 },
    { day: "08", conciliadas: 2, alarmas: 1 },
    { day: "09", conciliadas: 2, alarmas: 1 },
    { day: "10", conciliadas: 1, alarmas: 2 },
  ],
  reportSubtitle: "Fee cobrado vs. contrato",
  report: [
    {
      icon: <ReceiptTextIcon className="size-4.5" />,
      title: "Fee cobrado",
      amount: "$10,552.28",
      iconClassName: "bg-chart-1/10 text-chart-1",
    },
    {
      icon: <ScaleIcon className="size-4.5" />,
      title: "Fee teórico (contrato)",
      amount: "$9,336.25",
      iconClassName: "bg-chart-2/10 text-chart-2",
    },
    {
      icon: <WalletIcon className="size-4.5" />,
      title: "Total sobrepagado",
      amount: "$1,216.03",
      iconClassName: "bg-chart-4/10 text-chart-4",
    },
  ],
  deltaTitle: "Sobrecobro por día",
  deltaAmount: "$1,216.03",
  deltaChange: "+13% vs. contrato",
  deltaBars: [
    { day: "01", monto: 88.4 },
    { day: "02", monto: 4.49 },
    { day: "03", monto: 181.96 },
    { day: "04", monto: 127.74 },
    { day: "05", monto: 90.88 },
    { day: "06", monto: 154.36 },
    { day: "07", monto: 220.59, highlight: true },
    { day: "08", monto: 80.1 },
    { day: "09", monto: 102.92 },
    { day: "10", monto: 164.59 },
  ],
  donutTitle: "Sobrecobro por comercio",
  donutAmount: "3 de 3",
  donutCenter: "$1,216",
  donut: [
    { name: "NOVA-001", monto: 547.08 },
    { name: "NOVA-002", monto: 276.86 },
    { name: "NOVA-003", monto: 392.09 },
  ],
  alarm: {
    rule: "Fee cobrado vs. fee teórico del contrato vigente · umbral 5%",
    channel: "Alarma dentro de Simetrik",
  },
};

const genericBoard = (sourceNames: [string, string], threshold: string, channel: string): BoardData => ({
  usage: [
    {
      icon: <ArrowRightLeftIcon />,
      title: "Conciliación automática",
      status: "ok",
      highlightLabel: "Tasa de match",
      highlightValue: "98.2%",
      progress: 98.2,
      footLeft: "Meta 95%",
      footRight: "1,240 registros",
    },
    {
      icon: <BellRingIcon />,
      title: "Alarmas activas",
      status: "warn",
      highlightLabel: "Superaron el umbral",
      highlightValue: "22",
      highlightUnit: "de 1,240",
      progress: 1.8,
      footLeft: "1.8% del total",
      footRight: `umbral ${threshold}`,
    },
    {
      icon: <DollarSignIcon />,
      title: "Diferencia acumulada",
      status: "warn",
      highlightLabel: "Entre fuentes",
      highlightValue: "$4,830.50",
      progress: 8,
      footLeft: "8% del monto en excepción",
      footRight: "22 registros",
    },
    {
      icon: <PercentIcon />,
      title: "Cobertura de fuentes",
      status: "ok",
      highlightLabel: "Fuentes sincronizadas",
      highlightValue: "2",
      highlightUnit: "de 2",
      progress: 100,
      footLeft: "Sin atrasos",
      footRight: `${sourceNames[0]} + ${sourceNames[1]}`,
    },
  ],
  dailyTitle: "Conciliación diaria",
  dailySubtitle: "Últimos 7 días · registros conciliados vs. con alarma",
  daily: [
    { day: "Lun", conciliadas: 168, alarmas: 2 },
    { day: "Mar", conciliadas: 175, alarmas: 4 },
    { day: "Mié", conciliadas: 172, alarmas: 3 },
    { day: "Jue", conciliadas: 180, alarmas: 5 },
    { day: "Vie", conciliadas: 176, alarmas: 4 },
    { day: "Sáb", conciliadas: 174, alarmas: 2 },
    { day: "Dom", conciliadas: 173, alarmas: 2 },
  ],
  reportSubtitle: "Diferencias entre fuentes",
  report: [
    {
      icon: <ReceiptTextIcon className="size-4.5" />,
      title: sourceNames[0],
      amount: "$2,610.20",
      iconClassName: "bg-chart-1/10 text-chart-1",
    },
    {
      icon: <ScaleIcon className="size-4.5" />,
      title: sourceNames[1],
      amount: "$2,220.30",
      iconClassName: "bg-chart-2/10 text-chart-2",
    },
    {
      icon: <WalletIcon className="size-4.5" />,
      title: "Diferencia total",
      amount: "$4,830.50",
      iconClassName: "bg-chart-4/10 text-chart-4",
    },
  ],
  deltaTitle: "Diferencias por día",
  deltaAmount: "$4,830.50",
  deltaChange: "22 excepciones",
  deltaBars: [
    { day: "Lun", monto: 410.2 },
    { day: "Mar", monto: 820.5 },
    { day: "Mié", monto: 615.4 },
    { day: "Jue", monto: 1240.8, highlight: true },
    { day: "Vie", monto: 890.1 },
    { day: "Sáb", monto: 460.3 },
    { day: "Dom", monto: 393.2 },
  ],
  donutTitle: "Diferencias por fuente",
  donutAmount: "2 fuentes",
  donutCenter: "$4,830",
  donut: [
    { name: sourceNames[0], monto: 2610.2 },
    { name: sourceNames[1], monto: 2220.3 },
  ],
  alarm: { rule: `Diferencia entre fuentes · umbral ${threshold}`, channel },
});

const dailyChartConfig = {
  conciliadas: { label: "Conciliadas", color: "var(--chart-2)" },
  alarmas: { label: "Alarmas", color: "var(--chart-4)" },
} satisfies ChartConfig;

const deltaChartConfig = {
  monto: { label: "Monto" },
} satisfies ChartConfig;

const DONUT_COLORS = [
  "var(--primary)",
  "color-mix(in oklab, var(--primary) 60%, transparent)",
  "color-mix(in oklab, var(--primary) 25%, transparent)",
];

const donutChartConfig = {
  monto: { label: "Monto" },
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
      ? { onClick: () => onPickData(label, value), role: "button" as const }
      : {};

  return (
    <div className="h-full w-full overflow-y-auto p-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        {/* Fila 1 — tarjetas de uso (statistics-component-15) */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {data.usage.map((stat) => (
            <Card
              key={stat.title}
              className={cn("py-5", isSelectionMode && "hover:border-primary cursor-pointer transition-colors")}
              {...pickable(stat.title, `${stat.highlightValue}${stat.highlightUnit ? ` ${stat.highlightUnit}` : ""}`)}
            >
              <CardContent className="flex flex-col gap-4 px-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="rounded-sm after:border-0">
                      <AvatarFallback className="bg-primary/10 text-primary shrink-0 rounded-sm [&>svg]:size-4.5">
                        {stat.icon}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">{stat.title}</span>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", statusStyles[stat.status].className)}>
                    {statusStyles[stat.status].label}
                  </Badge>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">{stat.highlightLabel}</p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {stat.highlightValue}
                    {stat.highlightUnit && (
                      <span className="text-muted-foreground ml-1.5 text-sm font-normal">{stat.highlightUnit}</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Progress value={stat.progress} className="*:data-[slot=progress-track]:h-1.5" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground truncate text-xs">{stat.footLeft}</span>
                    <span className="text-muted-foreground truncate text-xs">{stat.footRight}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fila 2 — tarjeta grande de conciliación + reporte (chart-component-11) */}
        <Card className="grid grid-cols-1 gap-x-2 gap-y-4 lg:grid-cols-5">
          <div className="flex flex-col gap-8 max-lg:border-b max-lg:pb-6 lg:col-span-3 lg:border-r lg:pr-2">
            <CardHeader className="flex justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">{data.dailyTitle}</span>
                <span className="text-muted-foreground text-sm">{data.dailySubtitle}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" className="text-muted-foreground size-6 rounded-full" />}
                >
                  <EllipsisVerticalIcon />
                  <span className="sr-only">Menú</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    {menuItems.map((item) => (
                      <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1">
              <ChartContainer config={dailyChartConfig} className="h-full min-h-56 w-full">
                <BarChart accessibilityLayer data={data.daily} barSize={14} margin={{ left: -24, bottom: -5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="4" stroke="var(--border)" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis tickLine={false} tickMargin={8} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="conciliadas" stackId="a" fill="var(--color-conciliadas)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="alarmas" stackId="a" fill="var(--color-alarmas)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </div>
          <div className="flex flex-col gap-8 lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold">Reporte</span>
                <span className="text-muted-foreground text-sm">{data.reportSubtitle}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-5 text-base">
              {data.report.map((row) => (
                <div
                  key={row.title}
                  className={cn("flex items-center gap-3", isSelectionMode && "hover:bg-muted -mx-2 cursor-pointer rounded-md px-2 py-1")}
                  {...pickable(row.title, row.amount)}
                >
                  <Avatar className="size-9 rounded-sm after:border-0">
                    <AvatarFallback className={cn("shrink-0 rounded-sm [&>svg]:size-4.5", row.iconClassName)}>
                      {row.icon}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{row.title}</span>
                    <span className="text-muted-foreground text-sm">{row.amount}</span>
                  </div>
                </div>
              ))}

              <Button size="lg">Ver reporte completo</Button>
            </CardContent>
          </div>
        </Card>

        {/* Fila 3 — mini estadísticas (statistics-component-10) */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="flex justify-between gap-6 max-sm:flex-col sm:items-center">
              <div className="flex h-full flex-col justify-between gap-6 md:shrink-0">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold">{data.deltaTitle}</span>
                  <span className="text-muted-foreground text-sm">Reporte del período</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-2xl font-semibold">{data.deltaAmount}</span>
                  <Badge className="bg-destructive/10 text-destructive h-4.5 w-fit rounded-sm px-1.5 py-px">
                    {data.deltaChange}
                  </Badge>
                </div>
              </div>
              <div className="h-37.5 min-w-0 flex-1">
                <ChartContainer config={deltaChartConfig} className="size-full">
                  <BarChart
                    accessibilityLayer
                    data={data.deltaBars.map((bar) => ({
                      ...bar,
                      // el día pico va en color pleno; el resto atenuado, como en el bloque de referencia
                      fill: bar.highlight ? "var(--primary)" : "color-mix(in oklab, var(--primary) 20%, transparent)",
                    }))}
                    barSize={12}
                    margin={{ left: -8, right: -8 }}
                  >
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      tickMargin={5.5}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="monto" radius={6} fill="var(--primary)" />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex justify-between gap-6 max-sm:flex-col sm:items-center">
              <div className="flex h-full flex-col justify-between gap-6 md:shrink-0 md:grow">
                <div className="flex flex-col gap-1">
                  <span className="text-base font-semibold">{data.donutTitle}</span>
                  <span className="text-muted-foreground text-sm">Reporte del período</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-2xl font-semibold">{data.donutAmount}</span>
                  <span className="text-muted-foreground text-sm">con diferencias detectadas</span>
                </div>
              </div>
              <div className="h-37.5 sm:pl-6">
                <ChartContainer config={donutChartConfig} className="h-37.5 w-full px-4.5">
                  <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={data.donut.map((slice, i) => ({ ...slice, fill: DONUT_COLORS[i % DONUT_COLORS.length] }))}
                      dataKey="monto"
                      nameKey="name"
                      innerRadius={55}
                      strokeWidth={20}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      <RechartsLabel
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-medium">
                                  {data.donutCenter}
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de la alarma configurada */}
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
