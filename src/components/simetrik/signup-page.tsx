"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SVGAttributes } from "react";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/simetrik/logo";
import { AiBuilderChat } from "@/components/simetrik/ai-builder-chat";
import { FlowCanvasPreview } from "@/components/simetrik/flow-canvas-preview";
import { SignupForm } from "@/components/simetrik/signup-form";
import { ChevronLeftIcon } from "lucide-react";

const GoogleIcon = (props: SVGAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.43 3.58v2.98h3.93c2.3-2.12 3.62-5.24 3.62-8.8Z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.93-2.98c-1.09.73-2.48 1.16-4 1.16-3.08 0-5.68-2.08-6.61-4.87H1.34v3.07C3.31 21.3 7.31 24 12 24Z"
      fill="#34A853"
    />
    <path
      d="M5.39 14.39A7.2 7.2 0 0 1 5 12c0-.83.14-1.64.39-2.39V6.54H1.34A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.34 5.46l4.05-3.07Z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.48-3.48C17.94 1.19 15.24 0 12 0 7.31 0 3.31 2.7 1.34 6.54l4.05 3.07C6.32 6.83 8.92 4.75 12 4.75Z"
      fill="#EA4335"
    />
  </svg>
);

export const SignupPage = () => {
  const router = useRouter();

  return (
    <div className="h-dvh overflow-hidden lg:grid lg:grid-cols-6">
      {/* Panel de contexto de producto — el mapa ocupa todo el panel, el chat flota encima */}
      <div className="max-lg:hidden lg:col-span-3 xl:col-span-4">
        <div className="bg-muted relative z-1 h-full w-full">
          <FlowCanvasPreview />
          <div className="absolute inset-0 z-10 flex items-center justify-center px-10">
            <div className="translate-y-[200px]">
              <AiBuilderChat />
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de registro */}
      <div className="flex h-full flex-col items-center justify-center overflow-y-auto py-6 sm:px-5 lg:col-span-3 xl:col-span-2">
        <div className="w-full max-w-md px-6">
          <Link href="/" className="text-muted-foreground group mb-6 flex items-center gap-2 sm:mb-8">
            <ChevronLeftIcon className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            <p>Volver al sitio</p>
          </Link>

          <div className="flex flex-col gap-5">
            <Logo />

            <div>
              <h2 className="mb-1.5 text-2xl font-semibold">Empezá tu prueba gratis</h2>
              <p className="text-muted-foreground text-sm">
                Reconciliación y controles financieros en 8 dominios, sin tarjeta de crédito.
              </p>
            </div>

            <SignupForm />

            <div className="space-y-3">
              <p className="text-muted-foreground text-center text-sm">
                ¿Ya tenés cuenta?{" "}
                <a href="#" className="text-foreground hover:underline">
                  Iniciar sesión
                </a>
              </p>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <p className="text-muted-foreground text-sm">o</p>
                <Separator className="flex-1" />
              </div>

              <Button
                variant="ghost"
                className="w-full"
                type="button"
                onClick={() => router.push("/dashboard")}
              >
                <GoogleIcon className="size-4" />
                Continuar con Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
