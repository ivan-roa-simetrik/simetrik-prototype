import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  ShieldAlertIcon,
  PercentIcon,
  WorkflowIcon,
  BookOpenCheckIcon,
  FileBarChartIcon,
  RadarIcon,
  BuildingIcon,
  MessageCircleIcon,
  LifeBuoyIcon,
} from "lucide-react";

import type { Navigation } from "@/components/simetrik/hero-navigation";

export const navigationData: Navigation[] = [
  {
    title: "Casos de uso",
    contentClassName: "!w-141 grid-cols-2",
    splitItems: true,
    items: [
      {
        type: "section",
        title: "Flujo de fondos y rentabilidad",
        items: [
          {
            title: "Cash In",
            href: "#casos-de-uso",
            description: "Confirma que cada cobro llegó completo y a tiempo.",
            icon: <ArrowDownToLineIcon className="size-4" />,
          },
          {
            title: "Cash Out",
            href: "#casos-de-uso",
            description: "Ejecuta pagos salientes sin duplicados ni fugas.",
            icon: <ArrowUpFromLineIcon className="size-4" />,
          },
          {
            title: "Claims & Chargebacks",
            href: "#casos-de-uso",
            description: "Contiene pérdidas por disputas y contracargos.",
            icon: <ShieldAlertIcon className="size-4" />,
          },
          {
            title: "Fees & Billing",
            href: "#casos-de-uso",
            description: "Valida que las comisiones cobradas coincidan con el contrato.",
            icon: <PercentIcon className="size-4" />,
          },
        ],
      },
      {
        type: "section",
        title: "Cierre y cumplimiento",
        items: [
          {
            title: "Accounting Automation",
            href: "#casos-de-uso",
            description: "Automatiza asientos contables, acumulaciones y provisiones.",
            icon: <WorkflowIcon className="size-4" />,
          },
          {
            title: "Accounting Operations",
            href: "#casos-de-uso",
            description: "Sostiene la integridad contable y acelera el cierre.",
            icon: <BookOpenCheckIcon className="size-4" />,
          },
          {
            title: "Reporting & Regulations",
            href: "#casos-de-uso",
            description: "Genera reportes audit-ready, listos para el regulador.",
            icon: <FileBarChartIcon className="size-4" />,
          },
          {
            title: "Unified Oversight & Alerts",
            href: "#casos-de-uso",
            description: "Tableros y alertas tempranas en tiempo real.",
            icon: <RadarIcon className="size-4" />,
          },
        ],
      },
    ],
  },
  {
    title: "Cómo funciona",
    href: "#como-funciona",
  },
  {
    title: "Clientes",
    href: "#clientes",
  },
  {
    title: "Contacto",
    contentClassName: "!w-70",
    items: [
      {
        title: "Hablar con ventas",
        href: "#",
        description: "Coordina una demo con nuestro equipo",
        icon: <MessageCircleIcon className="size-4" />,
      },
      {
        title: "Centro de ayuda",
        href: "#",
        description: "Soporte para clientes activos",
        icon: <LifeBuoyIcon className="size-4" />,
      },
      {
        title: "Oficinas",
        href: "#",
        description: "Nueva York, Bogotá, São Paulo",
        icon: <BuildingIcon className="size-4" />,
      },
    ],
  },
];
