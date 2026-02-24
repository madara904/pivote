"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DotLoading } from "@/components/ui/dot-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  ExternalLink,
  UnplugIcon,
  Info,
  Edit,
  Sparkles,
  Mail,
  CheckCircle2,
  Search,
  Filter,
  AlertCircle,
  MessageCircleQuestion,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { formatGermanDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

const ForwarderConnectionsView = () => {
  const trpcOptions = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");

  const { data: pendingData, isLoading: pendingLoading } = useQuery(
    trpcOptions.connections.forwarder.listPendingInvites.queryOptions(),
  );
  const { data: connectedData, isLoading: connectedLoading } = useQuery(
    trpcOptions.connections.forwarder.listConnectedShippers.queryOptions(),
  );

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

  if (pendingLoading || connectedLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <DotLoading size="md" className="text-muted-foreground" />
      </div>
    );
  }

  const canManage = pendingData?.canManage ?? connectedData?.canManage ?? false;
  const isProfileComplete = true;

  return (
    <div className="max-w-6xl mx-auto mt-4 pb-20 px-4 space-y-8">
      <OnboardingBanner />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-border bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className={
            "h-12 w-12 flex items-center justify-center border shrink-0 bg-background border-border"
          }>
            {isProfileComplete ? (
              <CheckCircle2 className="size-6 text-green-600" />
            ) : (
              <MessageCircleQuestion className="size-6 text-destructive" />
            )}
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
              Netzwerk-Sichtbarkeit
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5">
              {isProfileComplete
                ? "Ihr Profil ist vollständig und für Kunden im Netzwerk sichtbar."
                : "Vervollständigen Sie Ihr Profil, um von neuen Kunden gefunden zu werden."}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto h-9 px-6 font-black uppercase text-[10px] tracking-widest rounded-none border-border hover:bg-background"
          onClick={() => toast.info("Profil-Editor öffnen")}
        >
          <Edit className="size-3 mr-2" />
          Profil bearbeiten
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <TabsList className="grid w-full md:w-auto grid-cols-2 h-10 p-1 rounded-none border-border bg-background">
            <TabsTrigger
              value="active"
              className={cn(
                "rounded-none text-[10px] font-black uppercase tracking-widest transition-all",
                "data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              )}
            >
              Partner ({connectedData?.items.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className={cn(
                "rounded-none text-[10px] font-black uppercase tracking-widest transition-all relative",
                "data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              )}
            >
              Anfragen ({pendingData?.items.length || 0})
              {((pendingData?.items?.length ?? 0) > 0) && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="PARTNER SUCHEN..."
                className="w-full bg-background border border-border pl-9 pr-4 py-2 h-10 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 border-border shrink-0 rounded-none bg-background">
              <Filter className="size-3" />
            </Button>
          </div>
        </div>

        <TabsContent value="active" className="mt-0 outline-none animate-in fade-in-50 duration-300">
          {connectedData?.items.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedData.items.map((connection) => (
                <div
                  key={connection.id}
                  className="group p-5 border border-border bg-background hover:border-primary transition-all shadow-sm flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 min-w-0">
                      <div className="h-12 w-12 border border-border flex items-center justify-center bg-slate-50 shrink-0">
                        {connection.shipper?.logo ? (
                          <img src={connection.shipper.logo} alt={connection.shipper.name} className="object-cover h-full w-full" />
                        ) : (
                          <Building2 size={20} className="text-muted-foreground/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black tracking-tighter truncate uppercase leading-tight">
                          {connection.shipper?.name}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1 mt-1">
                          <MapPin size={10} /> {connection.shipper?.city}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-end justify-between mt-6 pt-4 border-t border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">Partner seit</span>
                      <span className="text-[10px] font-mono font-bold text-foreground uppercase">
                        {connection.acceptedAt ? formatGermanDate(connection.acceptedAt) : "-"}
                      </span>
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
                          className="h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        >
                          <UnplugIcon className="h-3 w-3 mr-1.5" />
                          Trennen
                        </Button>
                      </ConfirmationDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="Keine Partner verbunden"
              description="Sobald Sie eine Kundenanfrage akzeptieren, wird diese hier als aktive Verbindung gelistet."
              action={{ label: "Anfragen prüfen", onClick: () => setActiveTab("pending") }}
            />
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-0 outline-none animate-in fade-in-50 duration-300">
          {pendingData?.items.length ? (
            <div className="border border-border divide-y divide-border">
              {pendingData.items.map((invite) => (
                <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6 bg-background hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 border border-border flex items-center justify-center bg-background shrink-0">
                      {invite.shipper?.logo ? (
                        <img src={invite.shipper.logo} alt={invite.shipper.name} className="object-cover h-full w-full" />
                      ) : (
                        <Building2 size={24} className="text-muted-foreground/40" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight">{invite.shipper?.name}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <MapPin size={10} /> {invite.shipper?.city}
                        </span>
                        <span className="text-muted-foreground/20 text-[10px] hidden sm:inline">•</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <Mail size={10} /> {invite.shipper?.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-10 px-6 font-black uppercase text-[10px] tracking-widest rounded-none">
                      Details
                    </Button>
                    {canManage && (
                      <Button
                        size="sm"
                        onClick={() => acceptInvitation.mutate({ connectionId: invite.id })}
                        disabled={acceptInvitation.isPending}
                        className="h-10 px-8 font-black uppercase text-[10px] tracking-widest rounded-none shadow-md shadow-primary/10"
                      >
                        Akzeptieren
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Mail}
              title="Keine neuen Anfragen"
              description="Aktuell keine neuen Anfragen."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForwarderConnectionsView;

function OnboardingBanner() {
  return (
    <div className="p-8 bg-accent/40 border border-accent/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-50">
        <Info size={40}/>
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
            Verbindungsanfragen
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: "01", title: "Profil Sichtbarkeit", desc: "Kunden finden Sie über die Suche und senden Ihnen eine gezielte Verbindungsanfrage." },
            { step: "02", title: "Anfrage Prüfen", desc: "Sie erhalten alle wichtigen Infos zum Kunden vorab und entscheiden über die Annahme." },
            { step: "03", title: "Datenfluss", desc: "Nach der Annahme können Aufträge und Dokumente sofort digital ausgetauscht werden." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-3">
              <span className="text-xs font-black text-secondary-foreground">{item.step}</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground">{item.title}</p>
              <p className="text-[11px] text-secondary-foreground/80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: any;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="border border-dashed border-border py-24 px-8 flex flex-col items-center justify-center text-center bg-slate-50/20">
      <div className="h-20 w-20 border border-dashed border-border/60 flex items-center justify-center mb-6">
        <Icon className="text-muted-foreground/30 size-10" />
      </div>
      <h4 className="font-black uppercase tracking-[0.2em] text-foreground/70 mb-3 text-[12px]">{title}</h4>
      <p className="text-muted-foreground text-[11px] max-w-sm leading-relaxed mb-8 uppercase font-bold">{description}</p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="h-10 px-8 font-black uppercase text-[10px] tracking-widest rounded-none border-foreground hover:bg-foreground hover:text-white transition-colors"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}