"use client";

import { useEffect, useState } from "react";
import { PlusIcon, AtSignIcon, PaperclipIcon, SlidersHorizontalIcon, MicIcon } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { assetPath } from "@/lib/asset-path";

const toolbarIcons = [PlusIcon, AtSignIcon, SlidersHorizontalIcon, PaperclipIcon];

const prompts = [
  "Conciliá mis pagos de Visa y Mastercard todos los días",
  "Alertame si un fee cobrado no coincide con el contrato",
  "Cerrá el mes y generá el reporte para el auditor",
  "Detectá duplicados antes de liquidar pagos salientes",
];

const TYPE_SPEED_MS = 38;
const DELETE_SPEED_MS = 18;
const PAUSE_AFTER_TYPE_MS = 1700;
const PAUSE_AFTER_DELETE_MS = 350;

const useTypewriter = (phrases: string[]) => {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lee una capacidad del navegador que no existe durante SSR
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const current = phrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), TYPE_SPEED_MS);
    } else if (!isDeleting && text.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE_MS);
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), DELETE_SPEED_MS);
    } else {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }, PAUSE_AFTER_DELETE_MS);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex, phrases, reducedMotion]);

  return reducedMotion ? phrases[0] : text;
};

export const AiBuilderChat = () => {
  const text = useTypewriter(prompts);

  return (
    <div className="bg-card border-primary relative w-[420px] shrink-0 rounded-2xl border-2 p-5 shadow-lg">
      <BorderBeam
        duration={2.5}
        borderWidth={2}
        size={90}
        fadeCorner="bottom-right"
        className="from-[#fd42e7] via-[#a300f4] to-[#4692ff]"
      />
      <div className="mb-3 flex items-center gap-2 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida, no necesita optimización de next/image */}
        <img src={assetPath("/agent-icon.svg")} alt="" className="size-6" />
        <span className="text-muted-foreground text-sm font-medium">Agente Simetrik</span>
      </div>
      <p className="text-foreground min-h-14 px-1 pt-1 pb-4 text-lg">
        {text}
        <span className="bg-foreground/70 ml-0.5 inline-block h-5 w-0.5 animate-pulse align-middle motion-reduce:hidden" />
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {toolbarIcons.map((Icon, i) => (
            <Icon key={i} className="text-muted-foreground size-5" />
          ))}
        </div>
        <ShimmerButton type="button" className="size-9 p-0" aria-label="Hablar con el agente">
          <MicIcon className="size-4" />
        </ShimmerButton>
      </div>
    </div>
  );
};

export default AiBuilderChat;
