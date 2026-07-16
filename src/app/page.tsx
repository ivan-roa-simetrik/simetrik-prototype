"use client";

import { useEffect, useState } from "react";

import { LoadingScreen } from "@/components/simetrik/loading-screen";
import { Header } from "@/components/simetrik/header";
import { HeroSection } from "@/components/simetrik/hero-section";
import { MotionPreset } from "@/components/ui/motion-preset";
import { navigationData } from "@/components/simetrik/navigation-data";

const INTRO_DURATION_MS = 2200;

// Vive a nivel de módulo (no de componente) para que sobreviva a que Next
// remonte o reutilice la página al navegar — el intro se ve una sola vez
// por sesión de navegador, no cada vez que se vuelve a "/".
let hasShownIntro = false;

export default function Home() {
  const [showIntro, setShowIntro] = useState(() => !hasShownIntro);

  useEffect(() => {
    if (!showIntro) return;
    hasShownIntro = true;
    const timer = setTimeout(() => setShowIntro(false), INTRO_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showIntro]);

  if (showIntro) {
    return <LoadingScreen />;
  }

  return (
    <MotionPreset fade transition={{ duration: 0.6 }} className="flex flex-col">
      <Header navigationData={navigationData} />
      <main className="flex flex-col">
        <HeroSection />
      </main>
    </MotionPreset>
  );
}
