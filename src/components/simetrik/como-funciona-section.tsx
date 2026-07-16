"use client";

import Link from "next/link";
import { ArrowRightIcon, BellRingIcon, HistoryIcon, SlidersHorizontalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GlowEffect } from "@/components/ui/glow-effect";
import { MotionPreset } from "@/components/ui/motion-preset";
import { AnomalyDetectedCard } from "@/components/simetrik/anomaly-detected-card";
import { FlowCanvasPreview, flowNodes } from "@/components/simetrik/flow-canvas-preview";
import { ReconciliationStatusCard } from "@/components/simetrik/reconciliation-status-card";

const monitoreoPoints = [
  {
    icon: BellRingIcon,
    title: "Nunca falla en silencio",
    description:
      "Una excepción se detiene con sus datos, queda visible y es corregible. No se pierde ni se reintenta a ciegas.",
  },
  {
    icon: SlidersHorizontalIcon,
    title: "Alarmas que se configuran y editan",
    description:
      "Nada de un email genérico: reglas de negocio propias, por caso, que el equipo ajusta cuando cambia el contexto.",
  },
  {
    icon: HistoryIcon,
    title: "Todo queda registrado para auditoría",
    description:
      "Cada corrida, cada excepción, cada decisión del agente es replay-able. Nada de caja negra.",
  },
];

export const ComoFuncionaSection = () => {
  return (
    <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <MotionPreset fade slide={{ direction: "up", offset: 30 }} transition={{ duration: 0.5 }}>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="secondary" className="h-6 px-3 text-sm">
            Cómo funciona
          </Badge>
          <h2>Un agente que construye y después se queda vigilando</h2>
          <p className="text-muted-foreground text-lg">
            No es un builder de agentes genérico: es un agente que monitorea y controla tu
            conciliación y contabilidad de forma continua y auditable.
          </p>
        </div>
      </MotionPreset>

      {/* Momento 1 — Construcción guiada */}
      <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:mt-24 lg:grid-cols-2 lg:gap-16">
        <MotionPreset
          fade
          slide={{ direction: "up", offset: 30 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4"
        >
          <span className="text-primary text-sm font-semibold">Momento 1 — Construcción guiada</span>
          <h3>Se lo pedís en español, el agente pregunta lo que le falta, y lo arma en el mapa</h3>
          <p className="text-muted-foreground text-lg">
            Escribís lo que necesitás conciliar o controlar. El Agente Simetrik pregunta lo que le
            falta y arma el flujo, nodo por nodo, en el mapa &mdash; sin plantillas rígidas ni
            configuraciones frágiles.
          </p>
          <div>
            <Button size="lg" render={<Link href="/dashboard" />} nativeButton={false} className="group w-fit">
              Probar la demo en vivo
              <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </MotionPreset>

        <MotionPreset
          fade
          slide={{ direction: "up", offset: 30 }}
          transition={{ duration: 0.5 }}
          delay={0.15}
        >
          <Card className="gap-0 overflow-hidden p-0">
            <div className="h-80 sm:h-96">
              <FlowCanvasPreview revealCount={flowNodes.length - 1} />
            </div>
          </Card>
        </MotionPreset>
      </div>

      {/* Momento 2 — Monitoreo y control continuo */}
      <div className="mt-24 lg:mt-32">
        <MotionPreset
          fade
          slide={{ direction: "up", offset: 30 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
        >
          <span className="text-primary text-sm font-semibold">
            Momento 2 — Monitoreo y control continuo
          </span>
          <h3>Una vez construido, el agente no se va</h3>
          <p className="text-muted-foreground text-lg">
            Se queda vigilando la ejecución todos los días, detecta excepciones y avisa antes de
            que se conviertan en un problema de cierre.
          </p>
        </MotionPreset>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {monitoreoPoints.map((point, index) => (
            <MotionPreset
              key={point.title}
              fade
              slide={{ direction: "up", offset: 30 }}
              transition={{ duration: 0.5 }}
              delay={index * 0.1}
            >
              <Card className="h-full gap-3">
                <div className="px-(--card-spacing)">
                  <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                    <point.icon className="size-4.5" />
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 px-(--card-spacing)">
                  <h4 className="text-base">{point.title}</h4>
                  <p className="text-muted-foreground text-sm">{point.description}</p>
                </div>
              </Card>
            </MotionPreset>
          ))}
        </div>

        <MotionPreset
          fade
          slide={{ direction: "up", offset: 30 }}
          transition={{ duration: 0.5 }}
          delay={0.3}
          className="mt-12 grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:gap-12"
        >
          <div className="relative mx-auto w-full max-w-90">
            <GlowEffect
              colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]}
              mode="colorShift"
              blur="medium"
              className="opacity-30"
            />
            <AnomalyDetectedCard className="relative w-full" />
          </div>
          <div className="relative mx-auto w-full max-w-90">
            <GlowEffect
              colors={["var(--chart-4)", "var(--chart-3)", "var(--chart-2)", "var(--chart-1)"]}
              mode="colorShift"
              blur="medium"
              className="opacity-30"
            />
            <ReconciliationStatusCard className="relative w-full" />
          </div>
        </MotionPreset>
      </div>
    </section>
  );
};

export default ComoFuncionaSection;
