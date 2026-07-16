"use client";

import { Bar, BarChart, CartesianGrid, type TooltipContentProps } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";
import { assetPath } from "@/lib/asset-path";

type Props = {
  className?: string;
};

const cashInVolumeData = [
  { volumen: 820, fill: "color-mix(in oklab, var(--primary) 12%, var(--card))" },
  { volumen: 1420, fill: "color-mix(in oklab, var(--primary) 12%, var(--card))" },
  { volumen: 1180, fill: "color-mix(in oklab, var(--primary) 12%, var(--card))" },
  { volumen: 2340, fill: "var(--primary)" },
  { volumen: 1560, fill: "color-mix(in oklab, var(--primary) 12%, var(--card))" },
  { volumen: 980, fill: "color-mix(in oklab, var(--primary) 12%, var(--card))" },
  { volumen: 1720, fill: "color-mix(in oklab, var(--primary) 12%, var(--card))" },
];

const chartConfig = {
  volumen: { label: "transacciones reconciliadas" },
} satisfies ChartConfig;

const CustomTooltip = ({ active, payload }: Partial<TooltipContentProps<number, string>>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary text-primary-foreground mx-2 space-y-1 rounded-md px-3 py-1.5 shadow-lg">
        <div className="text-xs">{payload[0].value?.toLocaleString()}</div>
        <div className="text-xs opacity-70">transacciones reconciliadas</div>
      </div>
    );
  }
  return null;
};

export const AnomalyDetectedCard = ({ className }: Props) => {
  return (
    <Card className={cn("relative gap-8", className)}>
      <BorderBeam
        duration={2.5}
        borderWidth={2}
        size={80}
        fadeCorner="bottom-right"
        className="from-[#fd42e7] via-[#a300f4] to-[#4692ff]"
      />
      <CardHeader className="flex justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-semibold">Diferencia detectada</span>
          <span className="text-muted-foreground text-sm">
            El volumen de Cash In creció 3x este trimestre.
          </span>
          <span className="text-primary mt-1 flex items-center gap-1.5 text-xs font-medium">
            {/* eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida */}
            <img src={assetPath("/agent-icon.svg")} alt="" className="size-3.5" />
            Detectado por el Agente Simetrik
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-8">
        <ChartContainer config={chartConfig} className="min-h-36 w-full flex-1">
          <BarChart
            accessibilityLayer
            data={cashInVolumeData}
            barSize={22.5}
            margin={{ top: 7, left: -4, right: -4 }}
          >
            <CartesianGrid strokeDasharray="4" stroke="var(--border)" vertical={false} />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Bar dataKey="volumen" radius={2} />
          </BarChart>
        </ChartContainer>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-semibold">98.4%</span>
            <span className="text-muted-foreground text-sm">Meta de conciliación automática 95%</span>
          </div>
          <Button variant="outline" size="sm" className="rounded-full">
            Ver detalle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnomalyDetectedCard;
