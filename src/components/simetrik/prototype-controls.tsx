"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { assetPath } from "@/lib/asset-path";
import { SunIcon, MoonIcon, RotateCcwIcon } from "lucide-react";

const THEME_STORAGE_KEY = "simetrik-theme";

export const PrototypeControls = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee una clase del DOM que no existe durante SSR
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
  };

  const restart = () => {
    window.location.href = assetPath("/");
  };

  return (
    <div className="bg-card/90 fixed bottom-4 right-4 z-50 flex items-center gap-1 rounded-full border p-1.5 shadow-lg backdrop-blur">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        title={isDark ? "Modo claro" : "Modo oscuro"}
        onClick={toggleTheme}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Reiniciar prototipo"
        title="Reiniciar prototipo"
        onClick={restart}
      >
        <RotateCcwIcon />
      </Button>
    </div>
  );
};

export default PrototypeControls;
