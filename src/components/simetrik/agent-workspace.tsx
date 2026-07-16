"use client";

import { Fragment, useEffect, useRef, useState } from "react";

import { assetPath } from "@/lib/asset-path";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BorderBeam } from "@/components/ui/border-beam";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FlowCanvasPreview, flowNodes, typeStyles, type NodeOverride } from "@/components/simetrik/flow-canvas-preview";
import { ResultsBoard, getIndicatorExplanation } from "@/components/simetrik/results-board";
import { NodeRecordsDialog } from "@/components/simetrik/node-records";
import {
  PromptInput,
  PromptInputHeader,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Tool, ToolHeader, ToolContent, ToolOutput } from "@/components/ai-elements/tool";
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from "@/components/ai-elements/confirmation";
import {
  SparklesIcon,
  HomeIcon,
  UserIcon,
  CloudIcon,
  PackageIcon,
  BarChart3Icon,
  CircleHelpIcon,
  SettingsIcon,
  PlusIcon,
  SearchIcon,
  PaperclipIcon,
  MicIcon,
  ArrowUpIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  Loader2Icon,
  XIcon,
  MousePointerClickIcon,
  MapIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AI_GRADIENT = "from-[#fd42e7] via-[#a300f4] to-[#4692ff]";
const STEP_DURATION_MS = 900;

type NavView = "agente" | "resumen" | "workspace";

const primaryNavItems: { label: string; icon: typeof SparklesIcon; view: NavView }[] = [
  { label: "Agente Simetrik", icon: SparklesIcon, view: "agente" },
  { label: "Resumen", icon: HomeIcon, view: "resumen" },
  { label: "dLocal Brasil", icon: UserIcon, view: "workspace" },
];

const secondaryNavItems = [
  { label: "Panel de administración", icon: CloudIcon },
  { label: "Plantillas", icon: PackageIcon },
  { label: "Insights", icon: BarChart3Icon },
  { label: "Ayuda", icon: CircleHelpIcon },
  { label: "Configuración", icon: SettingsIcon },
];

const examplePrompts = [
  {
    title: "Conciliá Visa y Mastercard",
    description: "Unificá tus dos fuentes de red y conciliá todos los días.",
    prompt: "Conciliá mis pagos de Visa y Mastercard todos los días",
  },
  {
    title: "Detectá fees cobrados de más",
    description: "Compará el fee cobrado contra el contrato automáticamente.",
    prompt: "Alertame si un fee cobrado no coincide con el contrato",
  },
  {
    title: "Cerrá el mes sin sorpresas",
    description: "Generá el reporte de cierre listo para el auditor.",
    prompt: "Cerrá el mes y generá el reporte para el auditor",
  },
  {
    title: "Evitá pagos duplicados",
    description: "Detectá duplicados antes de liquidar pagos salientes.",
    prompt: "Detectá duplicados antes de liquidar pagos salientes",
  },
];

// --- Descubrimiento guiado ---------------------------------------------

type DiscoveryQuestion = {
  id: string;
  text: string;
  type: "choice" | "text";
  options?: string[];
};

const discoveryQuestions: DiscoveryQuestion[] = [
  {
    id: "sources",
    text: "¿Con qué fuentes trabajamos?",
    type: "choice",
    options: ["Visa y Mastercard", "Repositorio interno y banco", "Otra fuente"],
  },
  {
    id: "channel",
    text: "¿Cómo querés que te avise?",
    type: "choice",
    options: ["Alarma dentro de Simetrik", "Email", "Alarma + Email"],
  },
  {
    id: "threshold",
    text: '¿A partir de qué diferencia te aviso? Ej: "5% de diferencia" o "más de US$50".',
    type: "text",
  },
  {
    id: "report",
    text: "¿Sumo un reporte de auditoría con lo detectado?",
    type: "choice",
    options: ["Sí, agregalo", "No, solo la alarma"],
  },
];

type DiscoveryAnswers = Partial<Record<string, string>>;

// Caso con datos reales y verificados — ver Reference/caso-uc7-novapay/README.md
const NOVAPAY_SOURCES = "Settlement y Contratos (NovaPay)";

const detectFromPrompt = (text: string): DiscoveryAnswers => {
  const lower = text.toLowerCase();
  const detected: DiscoveryAnswers = {};

  const isNovaPayCase = /fee/.test(lower) && /(contrato|cobrado)/.test(lower);
  if (isNovaPayCase) {
    detected.sources = NOVAPAY_SOURCES;
    // Umbral fijo del caso real (ver schema_and_queries.sql: delta_pct > 0.05) — no se detecta de un
    // número en el texto porque los datos ya vienen pre-calculados contra ese umbral específico.
    detected.threshold = "5% de diferencia (umbral del caso NovaPay)";
    if (/email/.test(lower)) detected.channel = "Email";
    if (/reporte/.test(lower)) detected.report = "Sí, agregalo";
    return detected;
  }

  if (/visa/.test(lower) && /mastercard/.test(lower)) {
    detected.sources = "Visa y Mastercard";
  }

  const pctMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (pctMatch) {
    detected.threshold = `${pctMatch[1]}% de diferencia`;
  } else {
    const usdMatch = lower.match(/(?:us\$|u\$s|\$)\s?(\d+)/);
    if (usdMatch) detected.threshold = `más de US$${usdMatch[1]}`;
  }

  if (/email/.test(lower)) detected.channel = "Email";
  if (/reporte/.test(lower)) detected.report = "Sí, agregalo";

  return detected;
};

const nextUnansweredIndex = (answers: DiscoveryAnswers, from: number) => {
  for (let i = from; i < discoveryQuestions.length; i++) {
    if (!(discoveryQuestions[i].id in answers)) return i;
  }
  return discoveryQuestions.length;
};

// --- Turno / construcción -------------------------------------------------

type TurnPhase = "discovery" | "preconfirm" | "building" | "postconfirm";
type ApprovalState = "approval-requested" | "approval-responded";
type WorkspaceStatus = "building" | "active" | "discarded";

type Turn = {
  id: string;
  prompt: string;
  phase: TurnPhase;
  questionIndex: number;
  answers: DiscoveryAnswers;
  stepIndex: number;
  approvalState: ApprovalState;
  approved: boolean | undefined;
};

type Workspace = {
  id: string;
  name: string;
  prompt: string;
  status: WorkspaceStatus;
};

const deriveWorkspaceName = (text: string) => (text.length > 42 ? `${text.slice(0, 42)}…` : text);

const workspaceStatusLabel: Record<WorkspaceStatus, string> = {
  building: "Construyendo",
  active: "Activo",
  discarded: "Descartado",
};

const splitSources = (sources: string): [string, string] =>
  sources === "Otra fuente" ? ["Fuente A", "Fuente B"] : (sources.split(" y ") as [string, string]);

// Datos reales del caso UC7/NovaPay — Reference/caso-uc7-novapay (verificado con sqlite3, ver README.md ahí)
const NOVAPAY_REPORT = [
  { merchant: "NOVA-001", delta: "+$547.08" },
  { merchant: "NOVA-002", delta: "+$276.86" },
  { merchant: "NOVA-003", delta: "+$392.09" },
];
const NOVAPAY_TOTAL_DELTA = "$1,216.03";
const NOVAPAY_WORST_CASE = "NOVA-002 · 08/07 · +43.4%";

const getBuildSteps = (turn: Turn) => {
  const isNovaPay = turn.answers.sources === NOVAPAY_SOURCES;
  const channel = turn.answers.channel ?? "Alarma dentro de Simetrik";
  const wantsReport = turn.answers.report !== "No, solo la alarma";

  if (isNovaPay) {
    return [
      {
        id: "repo-visa",
        label: "Archivo de settlement — NovaPay",
        running: "Sincronizando archivo de settlement",
        result: "30 filas · 3 comercios (NOVA-001/002/003) · 10 días (01–10 jul)",
      },
      {
        id: "repo-mc",
        label: "Tabla de contratos — NovaPay",
        running: "Leyendo tarifas contractuales vigentes",
        result: "4 vigencias · renegociación NOVA-002 el 06/07 (2.2% → 2.0%)",
      },
      {
        id: "union",
        label: "Join temporal settlement + contrato vigente",
        running: "Uniendo por la tarifa vigente a cada fecha (no por igualdad exacta)",
        result: "30 filas unidas · 0 sin match",
      },
      {
        id: "con",
        label: "Fee teórico, delta y umbral (delta_pct > 5%)",
        running: "Calculando fee teórico y aplicando el umbral",
        result: `15 OK · 15 disparan alarma · peor caso: ${NOVAPAY_WORST_CASE} · aviso: ${channel}`,
      },
      {
        id: "reporte",
        label: wantsReport ? "Reporte de auditoría por comercio" : "Cierre del caso",
        running: wantsReport ? "Generando reporte audit-ready" : "Cerrando el caso",
        result: wantsReport
          ? `${NOVAPAY_REPORT.map((r) => `${r.merchant} ${r.delta}`).join(" · ")} · total sobrepagado ${NOVAPAY_TOTAL_DELTA}`
          : "Caso activo, sin reporte adicional",
      },
    ];
  }

  const [source1, source2] = splitSources(turn.answers.sources ?? "Visa y Mastercard");
  const threshold = turn.answers.threshold ?? "5% de diferencia";

  return [
    {
      id: "repo-visa",
      label: `Repositorio ${source1}`,
      running: "Sincronizando archivos crudos",
      result: `Fuente conectada: ${source1}`,
    },
    {
      id: "repo-mc",
      label: `Repositorio ${source2}`,
      running: "Sincronizando archivos crudos",
      result: `Fuente conectada: ${source2}`,
    },
    {
      id: "union",
      label: `Unión ${source1} + ${source2}`,
      running: "Combinando fuentes",
      result: "Registros combinados sin duplicados",
    },
    {
      id: "con",
      label: "Regla de diferencia",
      running: "Aplicando umbral configurado",
      result: `Umbral: ${threshold} · aviso: ${channel}`,
    },
    {
      id: "reporte",
      label: wantsReport ? "Reporte de auditoría" : "Cierre del caso",
      running: wantsReport ? "Generando reporte audit-ready" : "Cerrando el caso",
      result: wantsReport ? "Reporte listo para exportar a Finance" : "Caso activo, sin reporte adicional",
    },
  ];
};

const getNodeOverridesForTurn = (turn: Turn): Record<string, NodeOverride> => {
  const isNovaPay = turn.answers.sources === NOVAPAY_SOURCES;

  if (isNovaPay) {
    return {
      "repo-visa": {
        label: "Settlement — NovaPay",
        config: "type: source\nformat: csv\nfile: settlement_novapay.csv\ncolumns: merchant_id, date, amount, real_fee",
        rules: [
          "Lee el archivo de settlement de NovaPay (CSV).",
          "Cada fila es una liquidación: comercio, fecha, monto y comisión cobrada.",
          "Cubre 3 comercios entre el 01 y el 10 de julio.",
        ],
        metrics: [
          { label: "Filas", value: "30" },
          { label: "Comercios", value: "3" },
          { label: "Rango", value: "01–10 jul 2026" },
          { label: "Formato", value: "CSV" },
        ],
      },
      "repo-mc": {
        label: "Contratos — NovaPay",
        config:
          "type: source\nformat: csv\nfile: contracts_novapay.csv\ncolumns: merchant_id, effective_date, contract_rate",
        rules: [
          "Lee la tabla de tarifas pactadas por contrato.",
          "Cada fila dice desde qué fecha rige una tarifa para un comercio.",
          "Incluye la renegociación de NOVA-002 del 06/07 (2.2% → 2.0%).",
        ],
        metrics: [
          { label: "Vigencias", value: "4" },
          { label: "Renegociación", value: "NOVA-002 · 06/07" },
          { label: "Tarifa anterior", value: "2.2%" },
          { label: "Tarifa nueva", value: "2.0%" },
        ],
      },
      union: {
        label: "Join temporal (vigencia por fecha)",
        config:
          "-- sql_transform-join\n" +
          "SELECT s.merchant_id, s.date, s.amount, s.real_fee,\n" +
          "  (SELECT c.contract_rate FROM contracts c\n" +
          "    WHERE c.merchant_id = s.merchant_id AND c.effective_date <= s.date\n" +
          "    ORDER BY c.effective_date DESC LIMIT 1) AS contract_rate\n" +
          "FROM settlement s",
        rules: [
          "A cada liquidación le asigna la tarifa que estaba vigente ese día.",
          "No exige fechas exactas: usa la última tarifa anterior o igual a la fecha de la liquidación.",
          "Las 30 filas encontraron su tarifa; ninguna quedó sin match.",
        ],
        metrics: [
          { label: "Filas unidas", value: "30" },
          { label: "Sin match", value: "0" },
          { label: "Tipo de join", value: "Temporal (≤ fecha)" },
          { label: "Motor", value: "SQL Transform" },
        ],
      },
      con: {
        label: "Regla: delta_pct > 5%",
        config:
          "-- math-delta\n" +
          "theoretical_fee = ROUND(amount * contract_rate, 2)\n" +
          "delta = ROUND(real_fee - theoretical_fee, 2)\n" +
          "delta_pct = ROUND(ABS(delta) / theoretical_fee, 4)\n\n" +
          "-- if_else-threshold\n" +
          "CASE WHEN delta_pct > 0.05 THEN 'alarma' ELSE 'conciliado' END",
        rules: [
          "Calcula cuánto debió cobrarse según el contrato (monto × tarifa vigente).",
          "Compara contra lo que realmente se cobró y saca la diferencia.",
          "Si la diferencia supera el 5%, dispara alarma: 15 de 30 la dispararon.",
        ],
        metrics: [
          { label: "Conciliado (OK)", value: "15 / 30" },
          { label: "Excepciones", value: "15 / 30" },
          { label: "Peor caso", value: NOVAPAY_WORST_CASE },
          { label: "Umbral", value: "delta_pct > 0.05" },
        ],
      },
      reporte: {
        label: "Reporte audit-ready",
        config:
          "-- report-fees\n" +
          "SELECT merchant_id,\n" +
          "  COUNT(*) AS total_transacciones,\n" +
          "  SUM(CASE WHEN branch='true' THEN 1 ELSE 0 END) AS transacciones_con_drift,\n" +
          "  SUM(real_fee) AS total_fee_cobrado,\n" +
          "  SUM(theoretical_fee) AS total_fee_teorico,\n" +
          "  SUM(delta) AS total_delta\n" +
          "FROM v_flagged\n" +
          "GROUP BY merchant_id",
        rules: [
          "Agrupa los resultados por comercio.",
          "Muestra cuántas transacciones tuvieron sobrecobro y cuánto suma cada una.",
          "Total sobrepagado: $1,216.03 — listo para auditoría.",
        ],
        metrics: [
          ...NOVAPAY_REPORT.map((r) => ({ label: r.merchant, value: r.delta })),
          { label: "Total sobrepagado", value: NOVAPAY_TOTAL_DELTA },
        ],
      },
    };
  }

  const [genericSource1, genericSource2] = splitSources(turn.answers.sources ?? "Visa y Mastercard");
  const genericThreshold = turn.answers.threshold ?? "5% de diferencia";

  const genericConfig: Record<string, string> = {
    "repo-visa": `type: source\nformat: archivo\nfuente: ${genericSource1}`,
    "repo-mc": `type: source\nformat: archivo\nfuente: ${genericSource2}`,
    union: `type: union\njoin: por comercio y fecha\nfuentes: ${genericSource1}, ${genericSource2}`,
    con: `type: if_else\nexpression: ${genericThreshold}`,
    reporte: "type: report\naudience: auditor\nformat: pdf_audit_ready",
  };

  const genericRules: Record<string, string[]> = {
    "repo-visa": [
      `Trae los registros de ${genericSource1}.`,
      "Cada registro guarda su identificador, fecha y monto.",
      "Se actualiza solo, con cada sincronización.",
    ],
    "repo-mc": [
      `Trae los registros de ${genericSource2}.`,
      "Cada registro guarda su identificador, fecha y monto.",
      "Se actualiza solo, con cada sincronización.",
    ],
    union: [
      `Junta los registros de ${genericSource1} y ${genericSource2} en una sola tabla.`,
      "Empareja por comercio y fecha.",
      "Si un registro está en una sola fuente, se conserva para revisarlo.",
    ],
    con: [
      "Compara los montos entre las dos fuentes.",
      `Si la diferencia supera el umbral (${genericThreshold}), marca el registro con alarma.`,
      "El resto queda como conciliado.",
    ],
    reporte: [
      "Resume el resultado de la conciliación.",
      "Queda en formato listo para auditoría.",
      "Se puede exportar y compartir con Finance.",
    ],
  };

  return Object.fromEntries(
    getBuildSteps(turn).map((step) => [
      step.id,
      {
        label: step.label,
        config: genericConfig[step.id],
        rules: genericRules[step.id],
        metrics: [{ label: "Estado", value: step.result }],
      },
    ]),
  );
};

export const AgentWorkspace = () => {
  const [prompt, setPrompt] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [navView, setNavView] = useState<NavView>("agente");
  const [isChatPanelCollapsed, setIsChatPanelCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [configDraft, setConfigDraft] = useState<Record<string, string>>({});
  const [configText, setConfigText] = useState("");
  const [configRules, setConfigRules] = useState<string[]>([]);
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [pickedContext, setPickedContext] = useState<{ id: string; label: string; value: string }[]>([]);
  const [canvasView, setCanvasView] = useState<"mapa" | "tablero">("mapa");
  const [recordsNodeId, setRecordsNodeId] = useState<string | null>(null);
  const [qaExchanges, setQaExchanges] = useState<{ id: string; question: string; answer: string | null }[]>([]);
  const qaCounter = useRef(0);
  const turnCounter = useRef(0);
  const pickCounter = useRef(0);

  const pickData = (label: string, value: string) => {
    pickCounter.current += 1;
    setPickedContext((prev) => [...prev, { id: `pick-${pickCounter.current}`, label, value }]);
  };

  const removePickedContext = (id: string) => {
    setPickedContext((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    if (!isSelectionMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSelectionMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectionMode]);

  const lastTurn = turns.at(-1);
  const nodeOverrides = lastTurn ? getNodeOverridesForTurn(lastTurn) : undefined;

  const baseSelectedNode = selectedNodeId ? flowNodes.find((n) => n.id === selectedNodeId) : undefined;
  const selectedNode = baseSelectedNode
    ? { ...baseSelectedNode, ...(nodeOverrides?.[baseSelectedNode.id] ?? {}) }
    : undefined;

  const selectNode = (id: string) => {
    const next = selectedNodeId === id ? null : id;
    setSelectedNodeId(next);
    if (!next) {
      setConfigDraft({});
      setConfigText("");
      setConfigRules([]);
      return;
    }
    const base = flowNodes.find((n) => n.id === next);
    const metrics = nodeOverrides?.[next]?.metrics ?? base?.metrics ?? [];
    setConfigDraft(Object.fromEntries(metrics.map((m) => [m.label, m.value])));
    setConfigText(nodeOverrides?.[next]?.config ?? base?.config ?? "");
    setConfigRules(nodeOverrides?.[next]?.rules ?? base?.rules ?? []);
  };

  useEffect(() => {
    const last = turns.at(-1);
    if (!last || last.phase !== "building") return;
    const stepCount = getBuildSteps(last).length;

    if (last.stepIndex >= stepCount) {
      const timer = setTimeout(() => {
        setTurns((prev) => {
          const idx = prev.length - 1;
          if (idx < 0 || prev[idx].id !== last.id) return prev;
          const updated = [...prev];
          updated[idx] = { ...updated[idx], phase: "postconfirm" };
          return updated;
        });
      }, STEP_DURATION_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setTurns((prev) => {
        const idx = prev.length - 1;
        if (idx < 0 || prev[idx].id !== last.id) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], stepIndex: updated[idx].stepIndex + 1 };
        return updated;
      });
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [turns]);

  const answerQuestion = (turnId: string, value: string) => {
    setTurns((prev) =>
      prev.map((t) => {
        if (t.id !== turnId || t.phase !== "discovery") return t;
        const q = discoveryQuestions[t.questionIndex];
        const nextAnswers = { ...t.answers, [q.id]: value };
        const nextIndex = nextUnansweredIndex(nextAnswers, t.questionIndex + 1);
        const phase: TurnPhase = nextIndex >= discoveryQuestions.length ? "preconfirm" : "discovery";
        return { ...t, answers: nextAnswers, questionIndex: nextIndex, phase };
      }),
    );
  };

  const startBuilding = (turnId: string) => {
    setTurns((prev) => prev.map((t) => (t.id === turnId ? { ...t, phase: "building", stepIndex: 0 } : t)));
  };

  const restartDiscovery = (turnId: string) => {
    setTurns((prev) =>
      prev.map((t) => {
        if (t.id !== turnId) return t;
        const detected = detectFromPrompt(t.prompt);
        const startIndex = nextUnansweredIndex(detected, 0);
        return { ...t, answers: detected, questionIndex: startIndex, phase: "discovery" };
      }),
    );
  };

  const handleSubmit = (message: PromptInputMessage) => {
    const typed = message.text.trim();
    const contextPrefix = pickedContext.map((p) => `[${p.label}: ${p.value}]`).join(" ");
    const text = [contextPrefix, typed].filter(Boolean).join(" ").trim();
    if (!text) return;

    const currentQuestion = lastTurn?.phase === "discovery" ? discoveryQuestions[lastTurn.questionIndex] : undefined;

    if (lastTurn && currentQuestion?.type === "text") {
      answerQuestion(lastTurn.id, text);
      setPrompt("");
      setPickedContext([]);
      return;
    }

    turnCounter.current += 1;
    const id = `turn-${turnCounter.current}`;
    const detected = detectFromPrompt(text);
    const startIndex = nextUnansweredIndex(detected, 0);
    const phase: TurnPhase = startIndex >= discoveryQuestions.length ? "preconfirm" : "discovery";

    setTurns((prev) => [
      ...prev,
      {
        id,
        prompt: text,
        phase,
        questionIndex: startIndex,
        answers: detected,
        stepIndex: 0,
        approvalState: "approval-requested",
        approved: undefined,
      },
    ]);
    setWorkspaces((prev) => [{ id, name: deriveWorkspaceName(text), prompt: text, status: "building" }, ...prev]);
    setPrompt("");
    setPickedContext([]);
    setIsChatPanelCollapsed(false);
    setCanvasView("mapa");
  };

  const respond = (turnId: string, accepted: boolean) => {
    setTurns((prev) =>
      prev.map((t) => (t.id === turnId ? { ...t, approved: accepted, approvalState: "approval-responded" } : t)),
    );
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === turnId ? { ...w, status: accepted ? "active" : "discarded" } : w)),
    );
  };

  const reset = () => {
    setTurns([]);
    setPrompt("");
    setCanvasView("mapa");
    setQaExchanges([]);
  };

  const currentQuestion = lastTurn?.phase === "discovery" ? discoveryQuestions[lastTurn.questionIndex] : undefined;
  const awaitingTextAnswer = currentQuestion?.type === "text";
  const turnSettled = !!lastTurn && lastTurn.phase === "postconfirm" && lastTurn.approvalState === "approval-responded";
  const isBusy = !!lastTurn && !turnSettled && !awaitingTextAnswer;
  const buildStepsForLastTurn = lastTurn ? getBuildSteps(lastTurn) : [];
  const revealCount =
    !lastTurn || lastTurn.phase === "discovery" || lastTurn.phase === "preconfirm"
      ? -1
      : Math.min(lastTurn.stepIndex, buildStepsForLastTurn.length);
  const autoCollapsed = navView === "agente" && turns.length > 0;
  const collapsed = sidebarOverride ?? autoCollapsed;
  const toggleSidebar = () => setSidebarOverride(!collapsed);

  // El tablero (resultado) se habilita cuando el mapa (configuración) empezó a construirse
  const boardAvailable = !!lastTurn && (lastTurn.phase === "building" || lastTurn.phase === "postconfirm");
  const activeCanvasView = boardAvailable ? canvasView : "mapa";
  const boardIsNovaPay = lastTurn?.answers.sources === NOVAPAY_SOURCES;
  const boardSourceNames = splitSources(lastTurn?.answers.sources ?? "Visa y Mastercard");

  const askIndicator = (indicator: string) => {
    qaCounter.current += 1;
    const id = `qa-${qaCounter.current}`;
    const answer = getIndicatorExplanation(indicator, {
      isNovaPay: boardIsNovaPay,
      sourceNames: boardSourceNames,
      threshold: lastTurn?.answers.threshold ?? "5% de diferencia",
    });
    setQaExchanges((prev) => [...prev, { id, question: `¿Cómo se está calculando «${indicator}»?`, answer: null }]);
    setIsChatPanelCollapsed(false);
    // Simula el tiempo de respuesta del agente antes de mostrar la explicación.
    setTimeout(() => {
      setQaExchanges((prev) => prev.map((qa) => (qa.id === id ? { ...qa, answer } : qa)));
    }, 900);
  };

  return (
    <div className="flex h-dvh">
      <aside
        className={cn(
          "bg-background flex shrink-0 flex-col justify-between border-r py-4 transition-[width] duration-300",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <div className="flex flex-col gap-4">
          <div className={cn("flex", collapsed ? "flex-col items-center gap-2 px-2" : "items-center justify-between px-4")}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida, no necesita optimización de next/image */}
            <img
              src={assetPath(collapsed ? "/simetrik-isologo.png" : "/simetrik-logo.svg")}
              alt="Simetrik"
              className="h-5 w-auto"
            />
            <div className="flex items-center gap-1">
              {!collapsed && (
                <>
                  <Button variant="ghost" size="icon-sm" aria-label="Nuevo" onClick={reset}>
                    <PlusIcon />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Buscar">
                    <SearchIcon />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
                onClick={toggleSidebar}
              >
                {collapsed ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
              </Button>
            </div>
          </div>

          <nav className="flex flex-col gap-0.5 px-2">
            {primaryNavItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setNavView(item.view)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  navView === item.view
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {!collapsed && item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <nav className="flex flex-col gap-0.5 px-2">
            {secondaryNavItems.map((item) => (
              <button
                key={item.label}
                type="button"
                title={collapsed ? item.label : undefined}
                className={cn(
                  "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon className="size-4" />
                {!collapsed && item.label}
              </button>
            ))}
          </nav>

          <div
            className={cn(
              "flex items-center gap-2 border-t px-2.5 pt-3",
              collapsed && "justify-center px-0",
            )}
          >
            <Avatar className="size-7 shrink-0 rounded-lg">
              <AvatarImage src={assetPath("/user-profile.jpg")} alt="" />
              <AvatarFallback className="rounded-lg text-xs">U</AvatarFallback>
            </Avatar>
            {!collapsed && <span className="truncate text-sm">dLocal Brasil</span>}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {navView === "resumen" ? (
          <main className="flex-1 overflow-y-auto px-4 pb-16">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-10">
              <div>
                <h1 className="text-2xl font-semibold">Resumen</h1>
                <p className="text-muted-foreground text-sm">Espacios de trabajo creados por el Agente Simetrik.</p>
              </div>

              {workspaces.length === 0 ? (
                <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
                  Todavía no creaste ningún flujo. Andá a &quot;Agente Simetrik&quot; y contale qué querés conciliar.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() =>
                        isSelectionMode
                          ? pickData(workspace.name, `${workspaceStatusLabel[workspace.status]} · ${workspace.prompt}`)
                          : setNavView("agente")
                      }
                      className={cn(
                        "hover:bg-muted/70 flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors",
                        isSelectionMode && "hover:ring-primary/40 hover:ring-2",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{workspace.name}</p>
                        <p className="text-muted-foreground truncate text-xs">{workspace.prompt}</p>
                      </div>
                      <Badge
                        variant={
                          workspace.status === "active"
                            ? "default"
                            : workspace.status === "discarded"
                              ? "outline"
                              : "secondary"
                        }
                        className="shrink-0 gap-1"
                      >
                        {workspace.status === "building" && <Loader2Icon className="size-3 animate-spin" />}
                        {workspaceStatusLabel[workspace.status]}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </main>
        ) : turns.length === 0 ? (
          <main className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-16">
            <div className="flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 py-10">
              <h1 className="flex items-center justify-center gap-2 text-center text-2xl font-semibold text-foreground">
                {/* eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida, no necesita optimización de next/image */}
                <img src={assetPath("/agent-icon.svg")} alt="" className="size-6" />
                ¿Qué querés conciliar hoy?
              </h1>

              <PromptInput onSubmit={handleSubmit} className="relative">
                <BorderBeam duration={2.5} borderWidth={2} size={90} fadeCorner="bottom-right" className={AI_GRADIENT} />
                <PromptInputTextarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tip: pedime sugerencias si no sabés qué construir"
                  className="min-h-24 px-3 pt-3 text-base"
                />
                <PromptInputFooter className="px-2 pb-2">
                  <PromptInputTools>
                    <PromptInputButton type="button" tooltip="Adjuntar archivo">
                      <PaperclipIcon />
                    </PromptInputButton>
                    <PromptInputButton type="button" tooltip="Grabar audio">
                      <MicIcon />
                    </PromptInputButton>
                  </PromptInputTools>
                  <PromptInputSubmit disabled={!prompt.trim()}>
                    <ArrowUpIcon className="size-4" />
                  </PromptInputSubmit>
                </PromptInputFooter>
              </PromptInput>

              <div>
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <p className="font-medium">Empezá desde un ejemplo</p>
                    <p className="text-muted-foreground text-sm">Elegidos para vos. Cambiá lo que quieras.</p>
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Ver más
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {examplePrompts.map((example) => (
                    <button
                      key={example.title}
                      type="button"
                      onClick={() => setPrompt(example.prompt)}
                      className="bg-muted hover:bg-muted/70 rounded-xl border p-4 text-left transition-colors"
                    >
                      <p className="text-sm font-semibold">{example.title}</p>
                      <p className="text-muted-foreground mt-1 text-sm">{example.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {selectedNode && (
              <aside className="bg-background flex w-80 shrink-0 flex-col border-r">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                        typeStyles[selectedNode.type].badge,
                      )}
                    >
                      <selectedNode.icon className={cn("size-3.5", typeStyles[selectedNode.type].icon)} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{selectedNode.label}</p>
                      <p className="text-muted-foreground text-xs">{typeStyles[selectedNode.type].subtitle}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Cerrar configuración"
                    onClick={() => setSelectedNodeId(null)}
                  >
                    <XIcon />
                  </Button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto p-4">
                  {(configText || configRules.length > 0) && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="node-config-text"
                        onClick={
                          isSelectionMode
                            ? (e) => {
                                e.preventDefault();
                                pickData("Configuración", configText);
                              }
                            : undefined
                        }
                        className={cn(
                          "text-muted-foreground text-xs",
                          isSelectionMode && "hover:text-primary cursor-pointer",
                        )}
                      >
                        Configuración
                      </Label>
                      <Tabs defaultValue="sql">
                        <TabsList className="w-full">
                          <TabsTrigger value="sql" className="flex-1">
                            SQL
                          </TabsTrigger>
                          <TabsTrigger value="reglas" className="flex-1">
                            Reglas
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="sql">
                          <Textarea
                            id="node-config-text"
                            value={configText}
                            onChange={(e) => setConfigText(e.target.value)}
                            className="min-h-32 font-mono text-xs"
                          />
                        </TabsContent>
                        <TabsContent value="reglas">
                          <ol className="space-y-2">
                            {configRules.map((rule, i) => (
                              <li key={i} className="flex items-start gap-2.5 rounded-md border p-2.5">
                                <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                                  {i + 1}
                                </span>
                                <span className="text-sm leading-snug">{rule}</span>
                              </li>
                            ))}
                          </ol>
                          <p className="text-muted-foreground mt-2 text-xs">
                            Esta es la interpretación del SQL en lenguaje simple. Si editas el SQL, el agente la
                            actualiza al guardar.
                          </p>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-muted-foreground text-xs font-medium">Resultado</p>
                    {Object.entries(configDraft).map(([label, value]) => (
                      <div key={label} className="space-y-1.5">
                        <Label
                          htmlFor={`config-${label}`}
                          onClick={
                            isSelectionMode
                              ? (e) => {
                                  e.preventDefault();
                                  pickData(label, value);
                                }
                              : undefined
                          }
                          className={cn(
                            "text-muted-foreground text-xs",
                            isSelectionMode && "hover:text-primary cursor-pointer",
                          )}
                        >
                          {label}
                        </Label>
                        <Input
                          id={`config-${label}`}
                          value={value}
                          onChange={(e) => setConfigDraft((prev) => ({ ...prev, [label]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t p-3">
                  <Button className="w-full" onClick={() => setSelectedNodeId(null)}>
                    Guardar cambios
                  </Button>
                </div>
              </aside>
            )}

            <div className="flex-1 overflow-hidden p-4">
              <div className="bg-muted/40 relative h-full w-full overflow-hidden rounded-2xl border">
                {activeCanvasView === "mapa" ? (
                  <FlowCanvasPreview
                    revealCount={revealCount}
                    selectedId={selectedNodeId}
                    onNodeSelect={selectNode}
                    nodeOverrides={nodeOverrides}
                    onNodeOpenRecords={setRecordsNodeId}
                    isSelectionMode={isSelectionMode}
                    onPickData={pickData}
                  />
                ) : (
                  <ResultsBoard
                    isNovaPay={boardIsNovaPay}
                    sourceNames={boardSourceNames}
                    threshold={lastTurn?.answers.threshold ?? "5% de diferencia"}
                    channel={lastTurn?.answers.channel ?? "Alarma dentro de Simetrik"}
                    isSelectionMode={isSelectionMode}
                    onPickData={pickData}
                    onAskIndicator={askIndicator}
                  />
                )}
                {boardAvailable && (
                  <div className="bg-card/90 absolute top-4 left-4 z-10 flex items-center gap-0.5 rounded-lg border p-0.5 shadow-sm backdrop-blur">
                    <Button
                      variant={activeCanvasView === "mapa" ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setCanvasView("mapa")}
                    >
                      <MapIcon className="size-3.5" />
                      Mapa
                    </Button>
                    <Button
                      variant={activeCanvasView === "tablero" ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setCanvasView("tablero");
                        setSelectedNodeId(null);
                      }}
                    >
                      <LayoutDashboardIcon className="size-3.5" />
                      Tablero
                    </Button>
                  </div>
                )}
                {isSelectionMode && (
                  <div className="bg-primary text-primary-foreground pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-xs font-medium shadow-md">
                    Modo selección — click en un dato para agregarlo. Esc para salir.
                  </div>
                )}
                {isChatPanelCollapsed && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-card/90 absolute top-4 right-4 backdrop-blur"
                    aria-label="Mostrar chat"
                    onClick={() => setIsChatPanelCollapsed(false)}
                  >
                    <PanelRightOpenIcon />
                  </Button>
                )}
              </div>
            </div>

            {!isChatPanelCollapsed && (
              <aside className="bg-background flex w-96 shrink-0 flex-col border-l">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- ícono de marca con imagen embebida */}
                    <img src={assetPath("/agent-icon.svg")} alt="" className="size-4" />
                    <span className="text-sm font-medium">Agente Simetrik</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Colapsar chat"
                    onClick={() => setIsChatPanelCollapsed(true)}
                  >
                    <PanelRightCloseIcon />
                  </Button>
                </div>

                <Conversation>
                  <ConversationContent>
                    {turns.map((turn) => {
                      const steps = getBuildSteps(turn);
                      const [source1, source2] = splitSources(turn.answers.sources ?? "Visa y Mastercard");
                      const wantsReport = turn.answers.report !== "No, solo la alarma";

                      return (
                        <Fragment key={turn.id}>
                          <Message from="user">
                            <MessageContent>{turn.prompt}</MessageContent>
                          </Message>

                          {discoveryQuestions.slice(0, turn.questionIndex).map((q) =>
                            turn.answers[q.id] ? (
                              <Fragment key={q.id}>
                                <Message from="assistant">
                                  <MessageContent>{q.text}</MessageContent>
                                </Message>
                                <Message from="user">
                                  <MessageContent>{turn.answers[q.id]}</MessageContent>
                                </Message>
                              </Fragment>
                            ) : null,
                          )}

                          {turn.phase === "discovery" &&
                            turn.questionIndex < discoveryQuestions.length &&
                            (() => {
                              const q = discoveryQuestions[turn.questionIndex];
                              return (
                                <Message from="assistant">
                                  <MessageContent className="w-full max-w-full gap-2">
                                    <p className="text-sm">{q.text}</p>
                                    {q.type === "choice" && (
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        {q.options?.map((opt) => (
                                          <button
                                            key={opt}
                                            type="button"
                                            onClick={() => answerQuestion(turn.id, opt)}
                                            className="hover:bg-muted rounded-full border px-3 py-1.5 text-sm transition-colors"
                                          >
                                            {opt}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </MessageContent>
                                </Message>
                              );
                            })()}

                          {turn.phase === "preconfirm" && (
                            <Message from="assistant">
                              <MessageContent className="w-full max-w-full">
                                <Confirmation approval={{ id: turn.id }} state="approval-requested">
                                  <ConfirmationRequest>
                                    <ConfirmationTitle>
                                      <p className="mb-2">Esto es lo que voy a construir:</p>
                                      <ul className="list-disc space-y-1 pl-4 text-sm">
                                        <li>
                                          Fuentes: {source1} y {source2}
                                        </li>
                                        <li>Umbral de aviso: {turn.answers.threshold ?? "5% de diferencia"}</li>
                                        <li>Notificación: {turn.answers.channel ?? "Alarma dentro de Simetrik"}</li>
                                        <li>Reporte de auditoría: {wantsReport ? "sí" : "no"}</li>
                                      </ul>
                                    </ConfirmationTitle>
                                    <ConfirmationActions>
                                      <ConfirmationAction variant="outline" onClick={() => restartDiscovery(turn.id)}>
                                        Cambiar algo
                                      </ConfirmationAction>
                                      <ConfirmationAction onClick={() => startBuilding(turn.id)}>
                                        Construir en el mapa
                                      </ConfirmationAction>
                                    </ConfirmationActions>
                                  </ConfirmationRequest>
                                </Confirmation>
                              </MessageContent>
                            </Message>
                          )}

                          {(turn.phase === "building" || turn.phase === "postconfirm") && (
                            <Message from="assistant">
                              <MessageContent className="w-full max-w-full gap-3">
                                <p className="text-sm font-medium">Construyendo tu flujo — {steps.length} pasos</p>
                                <div className="space-y-3">
                                  {steps.map((step, index) => {
                                    const state =
                                      index < turn.stepIndex
                                        ? "output-available"
                                        : index === turn.stepIndex
                                          ? "input-available"
                                          : "input-streaming";

                                    return (
                                      <Tool key={step.id} defaultOpen={index === 0}>
                                        <ToolHeader type="dynamic-tool" toolName={step.label} state={state} />
                                        <ToolContent>
                                          <ToolOutput
                                            errorText={undefined}
                                            output={
                                              index < turn.stepIndex ? (
                                                <p className="text-sm">{step.result}</p>
                                              ) : index === turn.stepIndex ? (
                                                <p className="text-muted-foreground text-sm">{step.running}</p>
                                              ) : undefined
                                            }
                                          />
                                        </ToolContent>
                                      </Tool>
                                    );
                                  })}
                                </div>

                                {turn.phase === "postconfirm" && (
                                  <Confirmation
                                    approval={
                                      turn.approved === undefined
                                        ? { id: turn.id }
                                        : { id: turn.id, approved: turn.approved }
                                    }
                                    state={turn.approvalState}
                                  >
                                    <ConfirmationRequest>
                                      <ConfirmationTitle>
                                        ¿Activar este flujo de conciliación en dLocal Brasil?
                                      </ConfirmationTitle>
                                      <ConfirmationActions>
                                        <ConfirmationAction variant="outline" onClick={() => respond(turn.id, false)}>
                                          Rechazar
                                        </ConfirmationAction>
                                        <ConfirmationAction onClick={() => respond(turn.id, true)}>
                                          Activar
                                        </ConfirmationAction>
                                      </ConfirmationActions>
                                    </ConfirmationRequest>
                                    <ConfirmationAccepted>
                                      <ConfirmationTitle>
                                        Flujo activado — corre todos los días a las 6 AM.
                                      </ConfirmationTitle>
                                    </ConfirmationAccepted>
                                    <ConfirmationRejected>
                                      <ConfirmationTitle>
                                        Cambios descartados. Contame qué ajustar y lo vuelvo a armar.
                                      </ConfirmationTitle>
                                    </ConfirmationRejected>
                                  </Confirmation>
                                )}
                              </MessageContent>
                            </Message>
                          )}
                        </Fragment>
                      );
                    })}

                    {qaExchanges.map((qa) => (
                      <Fragment key={qa.id}>
                        <Message from="user">
                          <MessageContent>{qa.question}</MessageContent>
                        </Message>
                        <Message from="assistant">
                          <MessageContent>
                            {qa.answer ?? (
                              <span className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Loader2Icon className="size-3.5 animate-spin" />
                                Revisando cómo se calcula…
                              </span>
                            )}
                          </MessageContent>
                        </Message>
                      </Fragment>
                    ))}
                  </ConversationContent>
                </Conversation>

                <div className="border-t p-3">
                  <PromptInput onSubmit={handleSubmit} className="relative">
                    <BorderBeam duration={2.5} borderWidth={2} size={70} fadeCorner="bottom-right" className={AI_GRADIENT} />
                    {pickedContext.length > 0 && (
                      <PromptInputHeader>
                        {pickedContext.map((item) => (
                          <Badge key={item.id} variant="secondary" className="max-w-48 gap-1 py-1 pr-1">
                            <span className="truncate">
                              {item.label}: {item.value}
                            </span>
                            <button
                              type="button"
                              aria-label={`Quitar ${item.label}`}
                              onClick={() => removePickedContext(item.id)}
                              className="hover:bg-muted-foreground/20 shrink-0 rounded-full p-0.5"
                            >
                              <XIcon className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </PromptInputHeader>
                    )}
                    <PromptInputTextarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        awaitingTextAnswer
                          ? "Escribí tu respuesta…"
                          : isBusy
                            ? "El agente está trabajando…"
                            : "Escribile al agente…"
                      }
                      disabled={isBusy}
                      className="min-h-16 px-3 pt-3 text-sm"
                    />
                    <PromptInputFooter className="px-2 pb-2">
                      <PromptInputTools>
                        <PromptInputButton type="button" tooltip="Adjuntar archivo">
                          <PaperclipIcon />
                        </PromptInputButton>
                        <PromptInputButton
                          type="button"
                          variant={isSelectionMode ? "default" : "ghost"}
                          tooltip="Seleccionar un dato de la interfaz"
                          onClick={() => setIsSelectionMode((v) => !v)}
                        >
                          <MousePointerClickIcon />
                        </PromptInputButton>
                      </PromptInputTools>
                      <PromptInputSubmit disabled={(!prompt.trim() && pickedContext.length === 0) || isBusy}>
                        <ArrowUpIcon className="size-4" />
                      </PromptInputSubmit>
                    </PromptInputFooter>
                  </PromptInput>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>

      <NodeRecordsDialog
        nodeId={recordsNodeId}
        nodeLabel={recordsNodeId ? (nodeOverrides?.[recordsNodeId]?.label ?? undefined) : undefined}
        onClose={() => setRecordsNodeId(null)}
        isNovaPay={boardIsNovaPay}
        sourceNames={boardSourceNames}
        threshold={lastTurn?.answers.threshold ?? "5% de diferencia"}
      />
    </div>
  );
};

export default AgentWorkspace;
