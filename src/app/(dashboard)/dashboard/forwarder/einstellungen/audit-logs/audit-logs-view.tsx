"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Loader2, FileText } from "lucide-react";
import { formatGermanDateTime } from "@/lib/date-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ACTION_LABELS: Record<string, string> = {
  create: "Erstellt",
  update: "Geändert",
  read: "Gelesen",
  delete: "Gelöscht",
};

const ENTITY_LABELS: Record<string, string> = {
  inquiry: "Frachtanfrage",
  quotation: "Angebot",
  connection: "Verbindung",
  user: "Benutzer",
  organization: "Organisation",
};

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "E-Mail",
  type: "Typ",
  description: "Beschreibung",
  phone: "Telefon",
  website: "Website",
  address: "Adresse",
  city: "Stadt",
  postalCode: "PLZ",
  country: "Land",
  vatNumber: "USt-ID",
  registrationNumber: "Handelsregisternummer",
  logo: "Logo",
};

function formatMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "—";
  const changed = metadata.changedFields as string[] | undefined;
  if (Array.isArray(changed) && changed.length > 0) {
    const labels = changed.map((f) => FIELD_LABELS[f] ?? f);
    return labels.join(", ");
  }
  return JSON.stringify(metadata);
}

type AuditLogRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date | string;
  actorName: string | null;
};

const columns: ColumnDef<AuditLogRow>[] = [
  {
    accessorKey: "createdAt",
    header: "Datum",
    cell: ({ row }) => (
      <span className="text-[12px] text-muted-foreground">
        {formatGermanDateTime(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "actorName",
    header: "Benutzer",
    cell: ({ row }) => (
      <span className="text-[12px]">{row.original.actorName ?? "—"}</span>
    ),
  },
  {
    accessorKey: "action",
    header: "Aktion",
    cell: ({ row }) => (
      <span className="text-[12px]">
        {ACTION_LABELS[row.original.action] ?? row.original.action}
      </span>
    ),
  },
  {
    accessorKey: "entityType",
    header: "Entität",
    cell: ({ row }) => (
      <span className="text-[12px]">
        {ENTITY_LABELS[row.original.entityType] ?? row.original.entityType}
      </span>
    ),
  },
  {
    accessorKey: "metadata",
    header: "Details",
    cell: ({ row }) => {
      const m = row.original.metadata;
      const display = formatMetadata(m);
      const raw = m ? JSON.stringify(m, null, 2) : "";
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[12px] text-muted-foreground block max-w-[280px]">
              {display}
            </span>
          </TooltipTrigger>
          {raw && raw !== display && (
            <TooltipContent side="left" variant="neutral" className="max-w-sm font-mono text-[11px] whitespace-pre-wrap">
              {raw}
            </TooltipContent>
          )}
        </Tooltip>
      );
    },
  },
];

export default function AuditLogsView() {
  const trpc = useTRPC();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string | "all">("all");
  const [entityFilter, setEntityFilter] = useState<string | "all">("all");

  useEffect(() => {
    setPage(1);
  }, [actionFilter, entityFilter]);

  const { data, isLoading } = useQuery(
    trpc.dashboard.forwarder.getAuditLogs.queryOptions({
      page,
      limit: 20,
      action: actionFilter === "all" ? undefined : (actionFilter as "create" | "update" | "read" | "delete"),
      entityType: entityFilter === "all" ? undefined : entityFilter,
    })
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  const table = useReactTable({
    data: items as AuditLogRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const columnCount = columns.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[140px] h-9 text-[12px]">
            <SelectValue placeholder="Aktion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Aktionen</SelectItem>
            <SelectItem value="create">Erstellt</SelectItem>
            <SelectItem value="update">Geändert</SelectItem>
            <SelectItem value="read">Gelesen</SelectItem>
            <SelectItem value="delete">Gelöscht</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[160px] h-9 text-[12px]">
            <SelectValue placeholder="Entität" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Entitäten</SelectItem>
            <SelectItem value="inquiry">Frachtanfrage</SelectItem>
            <SelectItem value="quotation">Angebot</SelectItem>
            <SelectItem value="connection">Verbindung</SelectItem>
            <SelectItem value="user">Benutzer</SelectItem>
            <SelectItem value="organization">Organisation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[11px] font-bold uppercase">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-[12px] text-muted-foreground">Lade Audit-Logs…</p>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-32 text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-[13px] font-medium text-foreground">Keine Audit-Logs vorhanden</p>
                  <p className="mt-1 text-[12px] text-muted-foreground max-w-sm mx-auto">
                    Sobald relevante Aktionen protokolliert werden, erscheinen sie hier.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-[12px]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            {total} Einträge · Seite {page} von {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px]"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px]"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Weiter
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
