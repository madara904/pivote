"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DotLoading } from "@/components/ui/dot-loading";
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

  return (
    <div className="space-y-6">
      <Card>
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
                  className="rounded-lg border p-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="font-medium">{forwarder.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {forwarder.city || "-"} · {forwarder.postalCode || "-"} ·{" "}
                      {forwarder.country || "-"}
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

      <Card>
        <CardHeader>
          <CardTitle>Ausstehende Einladungen</CardTitle>
          <CardDescription>Bereits versendete Anfragen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingData?.items.length ? (
            pendingData.items.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <div className="font-medium">{invite.forwarder?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {invite.forwarder?.email}
                  </div>
                </div>
                <Badge variant="secondary">Ausstehend</Badge>
              </div>
            ))
          ) : (
            <Alert>
              <AlertDescription>
                Keine ausstehenden Einladungen.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verbundene Spediteure</CardTitle>
          <CardDescription>Aktive Verbindungen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedData?.items.length ? (
            connectedData.items.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <div className="font-medium">
                    {connection.forwarder?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {connection.forwarder?.email}
                  </div>
                </div>
                {canManage ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={removeConnection.isPending}
                    onClick={() =>
                      removeConnection.mutate({ connectionId: connection.id })
                    }
                  >
                    <Link2Off className="mr-2 h-4 w-4" />
                    Trennen
                  </Button>
                ) : (
                  <Badge variant="secondary">Verbunden</Badge>
                )}
              </div>
            ))
          ) : (
            <Alert>
              <AlertDescription>
                Noch keine Verbindungen.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipperConnectionsView;
