"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DotLoading } from "@/components/ui/dot-loading";
import { 
  UserPlus, 
  Users, 
  Mail, 
  Building2, 
  ShieldCheck,
  ArrowUpRight,
  MapPin,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

const ForwarderConnectionsView = () => {
  const trpcOptions = useTRPC();
  const queryClient = useQueryClient();

  // Queries
  const { data: pendingData, isLoading: pendingLoading } =
    useQuery(trpcOptions.connections.forwarder.listPendingInvites.queryOptions());
  const { data: connectedData, isLoading: connectedLoading } =
    useQuery(trpcOptions.connections.forwarder.listConnectedShippers.queryOptions());

  // Error Helper
  const handleError = (error: any) => {
    const message = error?.message || "Ein Fehler ist aufgetreten";
    toast.error(message);
  };

  // Mutations
  const acceptInvitation = useMutation(trpcOptions.connections.forwarder.acceptInvitation.mutationOptions({
    onSuccess: async () => {
      toast.success("Einladung angenommen");
      await queryClient.invalidateQueries(trpcOptions.connections.forwarder.listPendingInvites.queryFilter());
      await queryClient.invalidateQueries(trpcOptions.connections.forwarder.listConnectedShippers.queryFilter());
    },
    onError: handleError,
  }));

  const removeConnection = useMutation(trpcOptions.connections.forwarder.removeConnection.mutationOptions({
    onSuccess: async () => {
      toast.success("Verbindung getrennt");
      await queryClient.invalidateQueries(trpcOptions.connections.forwarder.listConnectedShippers.queryFilter());
    },
    onError: handleError,
  }));

  if (pendingLoading || connectedLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <DotLoading size="md" className="text-muted-foreground" />
      </div>
    );
  }

  const canManage = pendingData?.canManage ?? connectedData?.canManage ?? false;

  return (
    <div className="max-w-[1400px]">
      {/* 1. Header Bereich */}
      <div className="px-6 py-8 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Partnerverwaltung</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right px-4 border-r border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aktiv</p>
                <p className="text-xl font-bold">{connectedData?.items.length || 0}</p>
             </div>
             <div className="text-right px-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Anfragen</p>
                <p className="text-xl font-bold text-primary">{pendingData?.items.length || 0}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12">
        
        {/* LINKE SPALTE: Einladungen (Fokus) */}
        <div className="col-span-12 lg:col-span-5 p-8 border-r border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-8">
            <UserPlus className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Ausstehende Einladungen</h2>
          </div>

          <div className="space-y-3">
            {pendingData?.items.length ? (
              pendingData.items.map((invite) => (
                <div 
                  key={invite.id} 
                  className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {invite.shipper?.logo ? (
                        <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <img src={invite.shipper.logo} alt={invite.shipper.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 flex-shrink-0">
                          <Building2 className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-none mb-1 truncate">{invite.shipper?.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                          <Mail className="h-3 w-3 flex-shrink-0" /> 
                          <span className="truncate">{invite.shipper?.email}</span>
                        </p>
                        {(invite.shipper?.city || invite.shipper?.country) && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {[invite.shipper.city, invite.shipper.postalCode, invite.shipper.country].filter(Boolean).join(", ")}
                            </span>
                          </p>
                        )}
                        {invite.invitedAt && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>Eingeladen am {new Date(invite.invitedAt).toLocaleDateString("de-DE")}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {canManage && (
                      <Button
                        size="sm"
                        className="h-8 text-xs font-bold px-4 flex-shrink-0"
                        disabled={acceptInvitation.isPending}
                        onClick={() => acceptInvitation.mutate({ connectionId: invite.id })}
                      >
                        Annehmen
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="Keine neuen Einladungen" />
            )}
          </div>
        </div>

        {/* RECHTE SPALTE: Bestehende Verbindungen */}
        <div className="col-span-12 lg:col-span-7 p-8">
          <div className="flex items-center gap-2 mb-8">
            <Users className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Aktive Verbindungen</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectedData?.items.length ? (
              connectedData.items.map((connection) => (
                <div 
                  key={connection.id}
                  className="p-5 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        {connection.shipper?.logo ? (
                          <div className="h-12 w-12 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <img src={connection.shipper.logo} alt={connection.shipper.name} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 flex-shrink-0">
                            <Building2 className="h-6 w-6" />
                          </div>
                        )}
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 truncate">{connection.shipper?.name}</p>
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500 truncate">{connection.shipper?.email}</p>
                          {(connection.shipper?.city || connection.shipper?.country) && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {[connection.shipper.city, connection.shipper.postalCode, connection.shipper.country].filter(Boolean).join(", ")}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center bg-white group-hover:border-primary/20 transition-colors flex-shrink-0">
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter border-slate-200">
                        {connection.acceptedAt ? (
                          <>Aktiv seit {new Date(connection.acceptedAt).toLocaleDateString("de-DE")}</>
                        ) : (
                          <>Aktiv</>
                        )}
                      </Badge>
                      {canManage && (
                        <ConfirmationDialog
                          title="Verbindung trennen"
                          description={`Möchten Sie die Verbindung zu ${connection.shipper?.name ?? "diesem Versender"} wirklich trennen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                          confirmText="Verbindung trennen"
                          cancelText="Abbrechen"
                          variant="destructive"
                          loading={removeConnection.isPending}
                          loadingText="Trennen..."
                          onConfirm={() => removeConnection.mutate({ connectionId: connection.id })}
                          disabled={removeConnection.isPending}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={removeConnection.isPending}
                            className="text-[10px] font-bold hover:text-red-500 uppercase tracking-widest transition-colors"
                          >
                            Trennen
                          </Button>
                        </ConfirmationDialog>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2">
                <EmptyState message="Noch keine aktiven Verbindungen vorhanden" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-Komponente für leere Zustände
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
      <p className="text-xs font-medium text-slate-400 italic">{message}</p>
    </div>
  );
}

export default ForwarderConnectionsView;