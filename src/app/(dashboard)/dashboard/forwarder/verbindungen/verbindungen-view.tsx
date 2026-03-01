"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DotLoading } from "@/components/ui/dot-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  UnplugIcon,
  Mail,
  Search,
  ArrowRight,
  Inbox,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { formatGermanDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

const ForwarderConnectionsView = () => {
  const trpcOptions = useTRPC();
  const queryClient = useQueryClient();

  const { data: pendingData, isLoading: pendingLoading } = useQuery(
    trpcOptions.connections.forwarder.listPendingInvites.queryOptions(),
  );
  const { data: connectedData, isLoading: connectedLoading } = useQuery(
    trpcOptions.connections.forwarder.listConnectedShippers.queryOptions(),
  );

  const hasPending = (pendingData?.items?.length ?? 0) > 0;
  const defaultTab = hasPending ? "pending" : "active";
  const [activeTab, setActiveTab] = useState(defaultTab);

  const acceptInvitation = useMutation(
    trpcOptions.connections.forwarder.acceptInvitation.mutationOptions({
      onSuccess: async () => {
        toast.success("Einladung angenommen");
        await Promise.all([
          queryClient.invalidateQueries(trpcOptions.connections.forwarder.listPendingInvites.queryFilter()),
          queryClient.invalidateQueries(trpcOptions.connections.forwarder.listConnectedShippers.queryFilter()),
        ]);
      },
    }),
  );

  const removeConnection = useMutation(
    trpcOptions.connections.forwarder.removeConnection.mutationOptions({
      onSuccess: async () => {
        toast.success("Verbindung getrennt");
        await queryClient.invalidateQueries(trpcOptions.connections.forwarder.listConnectedShippers.queryFilter());
      },
    }),
  );

  const [searchQuery, setSearchQuery] = useState("");
  const filteredConnections = useMemo(() => {
    const items = connectedData?.items ?? [];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(
      (c) =>
        c.shipper?.name?.toLowerCase().includes(q) ||
        c.shipper?.city?.toLowerCase().includes(q) ||
        c.shipper?.email?.toLowerCase().includes(q),
    );
  }, [connectedData?.items, searchQuery]);

  if (pendingLoading || connectedLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <DotLoading size="md" className="text-muted-foreground" />
      </div>
    );
  }

  const canManage = pendingData?.canManage ?? connectedData?.canManage ?? false;
  const pendingCount = pendingData?.items?.length ?? 0;
  const partnerCount = connectedData?.items?.length ?? 0;
  const showSearch = activeTab === "active" && partnerCount > 0;

  return (
    <div className="w-full mt-2 pb-24">
      {/* Header-Bereich: Intro + Stats in einer Zeile */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-6 border-b border-border">
        <p className="text-[13px] text-muted-foreground max-w-xl leading-relaxed">
          Ihre Kunden können Sie einladen.
        </p>
        <div className="flex gap-6 shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{pendingCount}</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Anfragen</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums">{partnerCount}</span>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Partner</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4 mb-6 min-h-[44px]">
          <TabsList className="inline-flex h-auto p-0 gap-0 bg-transparent rounded-none">
            <TabsTrigger
              value="pending"
              className={cn(
                "rounded-none border-transparent -mb-px px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground",
                "data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent",
                "transition-colors duration-200"
              )}
            >
              <Inbox className="size-3.5 mr-2 opacity-70" />
              Einladungen
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-sm px-1.5">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className={cn(
                "rounded-none border-transparent -mb-px px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground",
                "data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent",
                "transition-colors duration-200"
              )}
            >
              <Users className="size-3.5 mr-2 opacity-70" />
              Partner
              <span className="ml-2 text-[10px] font-normal text-muted-foreground/80">({partnerCount})</span>
            </TabsTrigger>
          </TabsList>

          <div className="w-full sm:w-64 sm:min-w-[200px] h-10">
            {showSearch ? (
              <div className="relative h-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Partner suchen…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full bg-muted/40 border border-border pl-10 pr-4 text-[12px] placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 transition-colors"
                />
              </div>
            ) : (
              <div className="h-full w-full" aria-hidden />
            )}
          </div>
        </div>

        <TabsContent value="active" className="mt-0 outline-none">
          {filteredConnections.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="group relative pl-5 py-5 pr-5 bg-card border border-border hover:border-foreground/20 transition-all duration-200"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 min-w-0 flex-1">
                      <div className="h-11 w-11 border border-border flex items-center justify-center bg-muted/50 shrink-0 overflow-hidden">
                        {connection.shipper?.logo ? (
                          <img
                            src={connection.shipper.logo}
                            alt={connection.shipper.name ?? ""}
                            className="object-cover h-full w-full"
                          />
                        ) : (
                          <Building2 size={18} className="text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold tracking-tight truncate">
                          {connection.shipper?.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="shrink-0 opacity-60" />
                          {connection.shipper?.city ?? "—"}
                        </p>
                      </div>
                    </div>
                    {canManage && (
                      <ConfirmationDialog
                        title="Verbindung trennen"
                        description={`Möchten Sie die Partnerschaft mit ${connection.shipper?.name} wirklich beenden?`}
                        confirmText="Verbindung trennen"
                        variant="destructive"
                        loading={removeConnection.isPending}
                        onConfirm={() => removeConnection.mutate({ connectionId: connection.id })}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[10px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 shrink-0"
                        >
                          <UnplugIcon className="h-3 w-3 mr-1.5" />
                          Trennen
                        </Button>
                      </ConfirmationDialog>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Partner seit {connection.acceptedAt ? formatGermanDate(connection.acceptedAt) : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Keine Partner"
              description={
                searchQuery.trim()
                  ? "Keine Partner entsprechen Ihrer Suche."
                  : "Sobald Sie eine Kundenanfrage annehmen, erscheint sie hier."
              }
              action={
                !searchQuery.trim() && hasPending
                  ? { label: "Anfragen prüfen", onClick: () => setActiveTab("pending") }
                  : undefined
              }
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-0 outline-none">
          {pendingData?.items?.length ? (
            <div className="space-y-3">
              {pendingData.items.map((invite) => (
                <div
                  key={invite.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border hover:border-foreground/15 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 border border-border flex items-center justify-center bg-muted/40 shrink-0 overflow-hidden">
                      {invite.shipper?.logo ? (
                        <img
                          src={invite.shipper.logo}
                          alt={invite.shipper.name ?? ""}
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        <Building2 size={22} className="text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-bold tracking-tight">{invite.shipper?.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <MapPin size={10} className="opacity-60" />
                          {invite.shipper?.city ?? "—"}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <Mail size={10} className="opacity-60" />
                          {invite.shipper?.email ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    {canManage && (
                      <Button
                        size="sm"
                        onClick={() => acceptInvitation.mutate({ connectionId: invite.id })}
                        disabled={acceptInvitation.isPending}
                        className="h-10 px-6 font-bold text-[11px] bg-[var(--brand-lime)] text-[var(--brand-lime-foreground)] hover:bg-[var(--brand-lime)]/90 border-0 shadow-none rounded-sm"
                      >
                        {acceptInvitation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            Akzeptieren
                            <ArrowRight className="size-3.5 ml-1.5" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Keine neuen Anfragen"
              description="Kunden finden Sie über Ihr Profil. Sobald jemand eine Verbindung anfragt, erscheint sie hier."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForwarderConnectionsView;

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="relative py-14 px-8 flex flex-col items-center justify-center text-center border border-dashed border-border/80 bg-muted/30 overflow-hidden min-h-[200px]">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 12px)" }} />
      <div className="relative h-14 w-14 border border-dashed border-border/60 flex items-center justify-center mb-4">
        <Icon className="text-muted-foreground/40 size-6" />
      </div>
      <h4 className="relative text-[13px] font-bold tracking-tight text-foreground/80 mb-1.5">{title}</h4>
      <p className="relative text-muted-foreground text-[12px] max-w-sm leading-relaxed mb-5">{description}</p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="relative h-9 px-5 font-bold text-[11px] border-foreground/20 hover:bg-foreground hover:text-background transition-colors rounded-sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
