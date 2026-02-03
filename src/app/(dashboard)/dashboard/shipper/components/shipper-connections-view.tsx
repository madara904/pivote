"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DotLoading } from "@/components/ui/dot-loading";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Mail, Link2Off } from "lucide-react";
import { toast } from "sonner";

const ShipperConnectionsView = () => {
  const utils = trpc.useUtils();

  const { data: connectedData, isLoading: connectedLoading } =
    trpc.connections.shipper.listConnectedForwarders.useQuery();
  const { data: pendingData, isLoading: pendingLoading } =
    trpc.connections.shipper.listPendingInvites.useQuery();
  const { data: recommendedData, isLoading: recommendedLoading } =
    trpc.connections.shipper.listRecommendedForwarders.useQuery();

  const inviteForwarder = trpc.connections.shipper.inviteForwarder.useMutation({
    onSuccess: (data) => {
      if (data.alreadyInvited) {
        toast.info("Einladung bereits ausstehend.");
      } else {
        toast.success("Einladung gesendet.");
      }
      utils.connections.shipper.listPendingInvites.invalidate();
      utils.connections.shipper.listConnectedForwarders.invalidate();
      utils.connections.shipper.listRecommendedForwarders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeConnection = trpc.connections.shipper.removeConnection.useMutation({
    onSuccess: () => {
      toast.success("Verbindung entfernt.");
      utils.connections.shipper.listConnectedForwarders.invalidate();
      utils.connections.shipper.listRecommendedForwarders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getInitials = (name?: string | null) => {
    if (!name) return "";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (connectedLoading || pendingLoading || recommendedLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <DotLoading size="md" className="text-muted-foreground" />
      </div>
    );
  }

  const canManage =
    connectedData?.canManage ??
    pendingData?.canManage ??
    recommendedData?.canManage ??
    false;

  const hasConnections = (connectedData?.items.length || 0) > 0 || (pendingData?.items.length || 0) > 0;

  return (
    <div className="space-y-6">
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Spediteurverbindungen</CardTitle>
          <CardDescription>Aktive und ausstehende Verbindungen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasConnections ? (
            <>
              {/* Connected connections */}
              {connectedData?.items.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={connection.forwarder?.logo || undefined} alt={connection.forwarder?.name || ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(connection.forwarder?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {connection.forwarder?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {connection.forwarder?.email || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="mr-2">Aktiv</Badge>
                    {canManage ? (
                      <ConfirmationDialog
                        title="Verbindung trennen"
                        description={`Möchten Sie die Verbindung zu ${connection.forwarder?.name ?? "diesem Spediteur"} wirklich trennen?`}
                        confirmText="Verbindung trennen"
                        cancelText="Abbrechen"
                        variant="destructive"
                        loading={removeConnection.isPending}
                        loadingText="Trennen..."
                        onConfirm={() =>
                          removeConnection.mutate({ connectionId: connection.id })
                        }
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={removeConnection.isPending}
                        >
                          <Link2Off className="mr-2 h-4 w-4" />
                          Trennen
                        </Button>
                      </ConfirmationDialog>
                    ) : null}
                  </div>
                </div>
              ))}
              
              {/* Pending connections */}
              {pendingData?.items.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={invite.forwarder?.logo || undefined} alt={invite.forwarder?.name || ""} />
                      <AvatarFallback className="text-xs">
                        {getInitials(invite.forwarder?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{invite.forwarder?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {invite.forwarder?.email || "—"}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">Ausstehend</Badge>
                </div>
              ))}
            </>
          ) : (
            <Alert>
              <AlertDescription>
                Noch keine Verbindungen.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <Card className="border-none">
        <CardHeader>
          <CardTitle>Empfohlene Spediteure</CardTitle>
          <CardDescription>
            Basierend auf Postleitzahl oder Region.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendedData?.items.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedData.items.map((forwarder) => (
                <div
                  key={forwarder.id}
                  className="rounded-lg border p-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={forwarder.logo || undefined} alt={forwarder.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(forwarder.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{forwarder.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {forwarder.city || "-"}, {forwarder.country || "-"}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={!canManage || inviteForwarder.isPending}
                    onClick={() =>
                      inviteForwarder.mutate({
                        forwarderOrganizationId: forwarder.id,
                      })
                    }
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Einladen
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                Keine Empfehlungen verfügbar.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>



    </div>
  );
};

export default ShipperConnectionsView;
