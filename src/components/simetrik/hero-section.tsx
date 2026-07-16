"use client";

import { MotionPreset } from "@/components/ui/motion-preset";
import { Button } from "@/components/ui/button";
import { GlowEffect } from "@/components/ui/glow-effect";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { AnomalyDetectedCard } from "@/components/simetrik/anomaly-detected-card";
import { ReconciliationStatusCard } from "@/components/simetrik/reconciliation-status-card";
import { assetPath } from "@/lib/asset-path";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

const checklist = [
  { text: "Cierre de libros hasta 5 días más rápido", icon: "check" as const },
  { text: "Detección de discrepancias en tiempo real", icon: "check" as const },
  { text: "Auditoría lista desde el día 1", icon: "check" as const },
  { text: "Un Agente que construye y corrige tus conciliaciones por ti", icon: "agent" as const },
];

export const HeroSection = () => {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden lg:h-[calc(100dvh-4rem)]">
      <div className="relative flex flex-1 flex-col justify-center py-8 sm:py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 max-xl:justify-center sm:gap-12 sm:px-6 lg:gap-20 lg:px-8 xl:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <MotionPreset
                fade
                slide={{ direction: "up", offset: 50 }}
                blur
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-2xl font-semibold sm:text-3xl lg:text-5xl">
                  Sin reconciliación, tus estados financieros son suposiciones.{" "}
                  <span className="text-primary">Con Simetrik, son evidencia.</span>
                </h1>
              </MotionPreset>
              <MotionPreset
                fade
                slide={{ direction: "up", offset: 50 }}
                blur
                transition={{ duration: 0.5 }}
                delay={0.2}
              >
                <p className="text-muted-foreground text-lg lg:text-xl">
                  Automatizamos reconciliación y controles financieros en 8 dominios operativos, para
                  que Finance y Ops cierren más rápido, detecten discrepancias en tiempo real y
                  escalen sin sumar headcount.
                </p>
              </MotionPreset>
              <MotionPreset
                component="div"
                fade
                slide={{ direction: "up", offset: 50 }}
                blur
                transition={{ duration: 0.5 }}
                delay={0.4}
                className="flex flex-wrap items-center gap-4"
              >
                <Button
                  size="lg"
                  className="group relative w-fit overflow-hidden before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] before:bg-size-[250%_250%,100%_100%] before:bg-position-[200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000 hover:before:bg-position-[-100%_0,0_0] dark:before:bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_50%,transparent_75%,transparent_100%)]"
                  render={<a href="#casos-de-uso" />}
                  nativeButton={false}
                >
                  Ver casos de uso
                  <ArrowRightIcon className="transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button
                  className="bg-primary/10 text-primary [a]:hover:bg-primary/20 hover:bg-primary/20 focus-visible:ring-primary/20 dark:focus-visible:ring-primary/40"
                  size="lg"
                  render={<a href="#como-funciona" />}
                  nativeButton={false}
                >
                  Cómo funciona
                </Button>
              </MotionPreset>
            </div>

            <MotionPreset
              fade
              slide={{ direction: "up", offset: 50 }}
              transition={{ duration: 0.5 }}
              delay={0.6}
              className="space-y-3 ps-2"
            >
              {checklist.map((item) => (
                <div key={item.text} className="flex items-center gap-4">
                  <span className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full">
                    {item.icon === "agent" ? (
                      // eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida
                      <img src={assetPath("/agent-icon.svg")} alt="" className="size-4" />
                    ) : (
                      <CheckIcon className="size-3.5" />
                    )}
                  </span>
                  <p>{item.text}</p>
                </div>
              ))}
            </MotionPreset>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative max-xl:max-w-135 md:mt-8 md:ml-3 md:grow">
              <div className="w-fit -rotate-10">
                <GlowEffect
                  colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]}
                  mode="colorShift"
                  blur="medium"
                  className="opacity-40"
                />
                <AnomalyDetectedCard className="relative w-full max-w-85" />
              </div>
              <div className="ms-auto -mt-50 rotate-6 md:w-fit">
                <GlowEffect
                  colors={["var(--chart-4)", "var(--chart-3)", "var(--chart-2)", "var(--chart-1)"]}
                  mode="colorShift"
                  blur="medium"
                  className="opacity-40"
                />
                <ReconciliationStatusCard className="relative ms-auto w-full max-w-85" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BackgroundBeams className="right-0 -z-1 h-full w-1/2 max-xl:hidden" />
    </section>
  );
};

export default HeroSection;
