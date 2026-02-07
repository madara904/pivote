"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DotLoading } from "@/components/ui/dot-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Users, 
  Building2, 
  ShieldCheck,
  MapPin,
  ArrowUpRight
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

  // Mutations
  const acceptInvitation = useMutation(trpcOptions.connections.forwarder.acceptInvitation.mutationOptions({
    onSuccess: async () => {
      toast.success("Einladung angenommen");
      await queryClient.invalidateQueries(trpcOptions.connections.forwarder.listPendingInvites.queryFilter());
      await queryClient.invalidateQueries(trpcOptions.connections.forwarder.listConnectedShippers.queryFilter());
    },
  }));

  const removeConnection = useMutation(trpcOptions.connections.forwarder.removeConnection.mutationOptions({
    onSuccess: async () => {
      toast.success("Verbindung getrennt");
      await queryClient.invalidateQueries(trpcOptions.connections.forwarder.listConnectedShippers.queryFilter());
    },
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
    <div className="flex flex-col w-full lg:mx-auto lg:w-[75%] ">
      <Tabs defaultValue="active" className="w-full space-y-12">
        
        {/* TAB-LISTE ALS METRIK-BLOCKS */}
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-transparent h-auto p-0">
          
          {/* Tab 1: Netzwerk */}
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:border-primary border border-border bg-background p-6 rounded-none flex items-center gap-x-6 transition-all shadow-sm justify-start w-full text-left"
          >
            <div className="flex items-center justify-center p-4 shrink-0">
              <Users className="text-primary" size={32} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/80 leading-none mb-1">
                Verbundene Partner
              </span>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
                  {connectedData?.items.length || 0}
                </p>
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">aktiv</span>
              </div>
            </div>
          </TabsTrigger>

          {/* Tab 2: Anfragen */}
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:border-primary border border-border bg-background p-6 rounded-none flex items-center gap-x-6 transition-all shadow-sm justify-start relative overflow-hidden w-full text-left"
          >
            {pendingData?.items.length ? (
                <div className="absolute top-0 right-0 h-1.5 w-full bg-orange-500" />
            ) : null}
            <div className="flex items-center justify-center p-4 shrink-0 w-fit h-fit">
              <UserPlus className="text-primary" size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/80 leading-none mb-1">
                Neue Anfragen
              </span>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black tracking-tighter text-slate-900 leading-none">
                  {pendingData?.items.length || 0}
                </p>
                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">offen</span>
              </div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* CONTENT BEREICH */}
        <div className="w-full min-h-[400px]">
          <TabsContent value="active" className="mt-0 outline-none w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col space-y-6">
              <div className="flex items-baseline justify-between border-b border-border pb-2">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Aktive Partnernetzwerk</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedData?.items.length ? (
                  connectedData.items.map((connection) => (
                    <div key={connection.id} className="group p-6 border bg-background hover:border-primary transition-all relative shadow-sm">
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className="h-10 w-10 border border-border flex items-center justify-center bg-slate-50 shrink-0">
                              {connection.shipper?.logo ? <img src={connection.shipper.logo} alt="" className="object-cover h-full w-full" /> : <Building2 size={16} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-base font-black tracking-tighter truncate uppercase leading-tight">{connection.shipper?.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                  <MapPin size={10} /> {connection.shipper?.city}
                              </p>
                            </div>
                          </div>
                          <ShieldCheck className="text-emerald-500/20 group-hover:text-emerald-500 transition-colors" size={18} />
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <span className="text-[9px] font-mono font-bold text-muted-foreground/60 uppercase">
                            Seit {connection.acceptedAt ? new Date(connection.acceptedAt).toLocaleDateString("de-DE") : "-"}
                          </span>
                          
                          {canManage && (
                            <ConfirmationDialog
                              title="Verbindung trennen"
                              description="Möchten Sie diese Verbindung wirklich trennen?"
                              onConfirm={() => removeConnection.mutate({ connectionId: connection.id })}
                            >
                              <Button 
                                variant="ghost" 
                                className="h-auto p-0 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 hover:bg-transparent transition-colors"
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
                  <div className="col-span-full py-20 border border-dashed border-border flex justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Keine aktiven Partner</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-0 outline-none w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col space-y-6">
              <div className="flex items-baseline justify-between border-b border-border pb-2">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">Offene Anfragen</h3>
              </div>

              <div className="space-y-3 max-w-3xl">
                {pendingData?.items.length ? (
                  pendingData.items.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-5 bg-slate-50/50 border border-border group hover:bg-background transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 border border-border flex items-center justify-center bg-background">
                          {invite.shipper?.logo ? <img src={invite.shipper.logo} alt="" className="object-cover h-full w-full" /> : <Building2 size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight">{invite.shipper?.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{invite.shipper?.city}</p>
                            <span className="text-muted-foreground/20 text-[10px]">•</span>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{invite.shipper?.email}</p>
                          </div>
                        </div>
                      </div>
                      {canManage && (
                        <Button
                          size="sm"
                          onClick={() => acceptInvitation.mutate({ connectionId: invite.id })}
                          disabled={acceptInvitation.isPending}
                          className="h-9 px-6 font-black uppercase text-[10px] tracking-widest rounded-none"
                        >
                          Akzeptieren
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-20 border border-dashed border-border flex justify-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Keine offenen Anfragen</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>

      </Tabs>
    </div>
  );
};

export default ForwarderConnectionsView;