"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { flowNodes, typeStyles } from "@/components/simetrik/flow-canvas-preview";
import { cn } from "@/lib/utils";

// Registros reales del caso UC7/NovaPay — Reference/caso-uc7-novapay.
// Los campos calculados (fee teórico, delta, delta %) se generaron con el SQL
// de schema_and_queries.sql vía sqlite3; no editar a mano.
// [merchant, fecha, monto, fee real, tarifa contrato, fee teórico, delta, delta %]
export const NOVAPAY_ROWS: [string, string, number, number, number, number, number, number][] = [
  ["NOVA-001", "2026-07-01", 16230.83, 444.32, 0.022, 357.08, 87.24, 24.4],
  ["NOVA-001", "2026-07-02", 9571.37, 211.58, 0.022, 210.57, 1.01, 0.5],
  ["NOVA-001", "2026-07-03", 20274.87, 569.92, 0.022, 446.05, 123.87, 27.8],
  ["NOVA-001", "2026-07-04", 6476.76, 184.76, 0.022, 142.49, 42.27, 29.7],
  ["NOVA-001", "2026-07-05", 6424.58, 187.92, 0.022, 141.34, 46.58, 33.0],
  ["NOVA-001", "2026-07-06", 14719.06, 426.06, 0.022, 323.82, 102.24, 31.6],
  ["NOVA-001", "2026-07-07", 18950.89, 569.08, 0.022, 416.92, 152.16, 36.5],
  ["NOVA-001", "2026-07-08", 17170.23, 374.2, 0.022, 377.75, -3.55, 0.9],
  ["NOVA-001", "2026-07-09", 21315.41, 463.73, 0.022, 468.94, -5.21, 1.1],
  ["NOVA-001", "2026-07-10", 7547.46, 166.51, 0.022, 166.04, 0.47, 0.3],
  ["NOVA-002", "2026-07-01", 18914.05, 416.52, 0.022, 416.11, 0.41, 0.1],
  ["NOVA-002", "2026-07-02", 21569.85, 475.21, 0.022, 474.54, 0.67, 0.1],
  ["NOVA-002", "2026-07-03", 19270.47, 428.13, 0.022, 423.95, 4.18, 1.0],
  ["NOVA-002", "2026-07-04", 15237.63, 331.08, 0.022, 335.23, -4.15, 1.2],
  ["NOVA-002", "2026-07-05", 9646.37, 254.65, 0.022, 212.22, 42.43, 20.0],
  ["NOVA-002", "2026-07-06", 9724.65, 246.91, 0.02, 194.49, 52.42, 27.0],
  ["NOVA-002", "2026-07-07", 16170.95, 322.16, 0.02, 323.42, -1.26, 0.4],
  ["NOVA-002", "2026-07-08", 9352.11, 268.25, 0.02, 187.04, 81.21, 43.4],
  ["NOVA-002", "2026-07-09", 16368.57, 324.14, 0.02, 327.37, -3.23, 1.0],
  ["NOVA-002", "2026-07-10", 17666.03, 457.5, 0.02, 353.32, 104.18, 29.5],
  ["NOVA-003", "2026-07-01", 21832.37, 481.06, 0.022, 480.31, 0.75, 0.2],
  ["NOVA-003", "2026-07-02", 16953.83, 375.79, 0.022, 372.98, 2.81, 0.8],
  ["NOVA-003", "2026-07-03", 9664.77, 266.53, 0.022, 212.62, 53.91, 25.4],
  ["NOVA-003", "2026-07-04", 10283.85, 315.86, 0.022, 226.24, 89.62, 39.6],
  ["NOVA-003", "2026-07-05", 20021.88, 442.35, 0.022, 440.48, 1.87, 0.4],
  ["NOVA-003", "2026-07-06", 12330.11, 270.96, 0.022, 271.26, -0.3, 0.1],
  ["NOVA-003", "2026-07-07", 10238.08, 294.93, 0.022, 225.24, 69.69, 30.9],
  ["NOVA-003", "2026-07-08", 10203.87, 226.92, 0.022, 224.49, 2.43, 1.1],
  ["NOVA-003", "2026-07-09", 12390.41, 383.95, 0.022, 272.59, 111.36, 40.9],
  ["NOVA-003", "2026-07-10", 14152.42, 371.3, 0.022, 311.35, 59.95, 19.3],
];

const NOVAPAY_CONTRACTS: [string, string, number][] = [
  ["NOVA-001", "2026-07-01", 0.022],
  ["NOVA-002", "2026-07-01", 0.022],
  ["NOVA-002", "2026-07-06", 0.02],
  ["NOVA-003", "2026-07-01", 0.022],
];

const money = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;
const estado = (deltaPct: number) => (deltaPct > 5 ? "Alarma" : "OK");

export type RecordTable = {
  columns: string[];
  rows: (string | number)[][];
  note?: string;
};

const novaPayRecords = (nodeId: string): RecordTable | undefined => {
  switch (nodeId) {
    case "repo-visa":
      return {
        columns: ["merchant_id", "date", "amount", "real_fee"],
        rows: NOVAPAY_ROWS.map(([m, d, amount, fee]) => [m, d, money(amount), money(fee)]),
        note: "settlement_novapay.csv · 30 filas · 3 comercios · 01–10 jul 2026",
      };
    case "repo-mc":
      return {
        columns: ["merchant_id", "effective_date", "contract_rate"],
        rows: NOVAPAY_CONTRACTS.map(([m, d, rate]) => [m, d, pct(rate)]),
        note: "contracts_novapay.csv · 4 vigencias · renegociación NOVA-002 el 06/07 (2.2% → 2.0%)",
      };
    case "union":
      return {
        columns: ["merchant_id", "date", "amount", "real_fee", "contract_rate"],
        rows: NOVAPAY_ROWS.map(([m, d, amount, fee, rate]) => [m, d, money(amount), money(fee), pct(rate)]),
        note: "Join temporal: a cada fila se le asigna la tarifa vigente a su fecha · 30 filas · 0 sin match",
      };
    case "con":
      return {
        columns: ["merchant_id", "date", "real_fee", "fee_teorico", "delta", "delta_pct", "estado"],
        rows: NOVAPAY_ROWS.map(([m, d, , fee, , theo, delta, deltaPct]) => [
          m,
          d,
          money(fee),
          money(theo),
          money(delta),
          `${deltaPct.toFixed(1)}%`,
          estado(deltaPct),
        ]),
        note: "Regla: delta_pct > 5% dispara alarma · 15 OK · 15 alarmas",
      };
    case "reporte":
      return {
        columns: ["merchant_id", "transacciones", "con_drift", "fee_cobrado", "fee_teorico", "delta_total"],
        rows: [
          ["NOVA-001", 10, 6, money(3598.08), money(3050.99), "+$547.08"],
          ["NOVA-002", 10, 4, money(3524.55), money(3247.69), "+$276.86"],
          ["NOVA-003", 10, 5, money(3429.65), money(3037.57), "+$392.09"],
          ["Total", 30, 15, money(10552.28), money(9336.25), "+$1,216.03"],
        ],
        note: "Agregado por comercio · total sobrepagado $1,216.03",
      };
    default:
      return undefined;
  }
};

const genericRecords = (nodeId: string, sourceNames: [string, string], threshold: string): RecordTable | undefined => {
  const [source1, source2] = sourceNames;
  const sourceRows = (prefix: string): (string | number)[][] => [
    [`${prefix}-90211`, "2026-07-14", money(1240.5), "Procesado"],
    [`${prefix}-90212`, "2026-07-14", money(310.0), "Procesado"],
    [`${prefix}-90213`, "2026-07-14", money(5480.75), "Procesado"],
    [`${prefix}-90214`, "2026-07-15", money(92.3), "Procesado"],
    [`${prefix}-90215`, "2026-07-15", money(2210.9), "Pendiente"],
    [`${prefix}-90216`, "2026-07-15", money(764.2), "Procesado"],
  ];

  switch (nodeId) {
    case "repo-visa":
      return {
        columns: ["transaction_id", "fecha", "monto", "estado"],
        rows: sourceRows("TX"),
        note: `Fuente: ${source1} · muestra de registros sincronizados`,
      };
    case "repo-mc":
      return {
        columns: ["transaction_id", "fecha", "monto", "estado"],
        rows: sourceRows("RF"),
        note: `Fuente: ${source2} · muestra de registros sincronizados`,
      };
    case "union":
      return {
        columns: ["transaction_id", "fecha", `monto_${source1.toLowerCase().replace(/\s+/g, "_")}`, `monto_${source2.toLowerCase().replace(/\s+/g, "_")}`, "match"],
        rows: [
          ["TX-90211", "2026-07-14", money(1240.5), money(1240.5), "Sí"],
          ["TX-90212", "2026-07-14", money(310.0), money(310.0), "Sí"],
          ["TX-90213", "2026-07-14", money(5480.75), money(5480.75), "Sí"],
          ["TX-90214", "2026-07-15", money(92.3), money(92.3), "Sí"],
          ["TX-90215", "2026-07-15", money(2210.9), "—", "No"],
          ["TX-90216", "2026-07-15", money(764.2), money(764.2), "Sí"],
        ],
        note: `Unión ${source1} + ${source2} · combinados sin duplicados`,
      };
    case "con":
      return {
        columns: ["transaction_id", "fecha", "diferencia", "estado"],
        rows: [
          ["TX-90211", "2026-07-14", money(0), "OK"],
          ["TX-90212", "2026-07-14", money(0), "OK"],
          ["TX-90213", "2026-07-14", money(0), "OK"],
          ["TX-90214", "2026-07-15", money(0), "OK"],
          ["TX-90215", "2026-07-15", money(2210.9), "Alarma"],
          ["TX-90216", "2026-07-15", money(0), "OK"],
        ],
        note: `Umbral configurado: ${threshold}`,
      };
    case "reporte":
      return {
        columns: ["fuente", "registros", "conciliados", "excepciones", "diferencia"],
        rows: [
          [source1, 620, 612, 8, money(2840.2)],
          [source2, 620, 606, 14, money(1990.3)],
          ["Total", 1240, 1218, 22, money(4830.5)],
        ],
        note: "Resumen listo para exportar a Finance",
      };
    default:
      return undefined;
  }
};

export const getNodeRecords = (
  nodeId: string,
  opts: { isNovaPay: boolean; sourceNames: [string, string]; threshold: string },
): RecordTable | undefined =>
  opts.isNovaPay ? novaPayRecords(nodeId) : genericRecords(nodeId, opts.sourceNames, opts.threshold);

type NodeRecordsDialogProps = {
  nodeId: string | null;
  nodeLabel?: string;
  onClose: () => void;
  isNovaPay: boolean;
  sourceNames: [string, string];
  threshold: string;
};

export function NodeRecordsDialog({ nodeId, nodeLabel, onClose, isNovaPay, sourceNames, threshold }: NodeRecordsDialogProps) {
  const node = nodeId ? flowNodes.find((n) => n.id === nodeId) : undefined;
  const records = nodeId ? getNodeRecords(nodeId, { isNovaPay, sourceNames, threshold }) : undefined;
  const style = node ? typeStyles[node.type] : undefined;
  const Icon = node?.icon;

  return (
    <Dialog open={!!nodeId && !!records} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            {Icon && style && (
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", style.badge)}>
                <Icon className={cn("size-4", style.icon)} />
              </span>
            )}
            {nodeLabel ?? node?.label}
          </DialogTitle>
          {records?.note && <DialogDescription>{records.note}</DialogDescription>}
        </DialogHeader>

        {records && (
          <div className="max-h-[55vh] overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/80 sticky top-0 backdrop-blur">
                <tr>
                  {records.columns.map((col) => (
                    <th key={col} className="text-muted-foreground px-3 py-2 text-left text-xs font-medium whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/40 border-t">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 whitespace-nowrap tabular-nums">
                        {cell === "Alarma" ? (
                          <Badge variant="outline" className="text-destructive border-destructive/30 h-5 px-1.5 text-[10px]">
                            Alarma
                          </Badge>
                        ) : cell === "OK" ? (
                          <Badge variant="outline" className="h-5 border-emerald-500/30 px-1.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                            OK
                          </Badge>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-muted-foreground text-xs">
          {records ? `${records.rows.length} registros` : ""}
        </p>
      </DialogContent>
    </Dialog>
  );
}
