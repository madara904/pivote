"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DotLoading } from "@/components/ui/dot-loading";
import { Check, Link2Off } from "lucide-react";
import { toast } from "sonner";

const ForwarderConnectionsView = () => {
  const utils = trpc.useUtils();

  const { data: pendingData, isLoading: pendingLoading } =
    trpc.connections.forwarder.listPendingInvites.useQuery();
  const { data: connectedData, isLoading: connectedLoading } =
    trpc.connections.forwarder.listConnectedShippers.useQuery();

  const acceptInvitation = trpc.connections.forwarder.acceptInvitation.useMutation({
    onSuccess: () => {
      toast.success("Einladung angenommen.");
      utils.connections.forwarder.listPendingInvites.invalidate();
      utils.connections.forwarder.listConnectedShippers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeConnection = trpc.connections.forwarder.removeConnection.useMutation({
    onSuccess: () => {
      toast.success("Verbindung entfernt.");
      utils.connections.forwarder.listConnectedShippers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (pendingLoading || connectedLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <DotLoading size="md" className="text-muted-foreground" />
      </div>
    );
  }

  const canManage = pendingData?.canManage ?? connectedData?.canManage ?? false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Einladungen</CardTitle>
          <CardDescription>Ausstehende Verbindungsanfragen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingData?.items.length ? (
            pendingData.items.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <div className="font-medium">{invite.shipper?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {invite.shipper?.email}
                  </div>
                </div>
                {canManage ? (
                  <Button
                    size="sm"
                    disabled={acceptInvitation.isPending}
                    onClick={() =>
                      acceptInvitation.mutate({ connectionId: invite.id })
                    }
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Annehmen
                  </Button>
                ) : (
                  <Badge variant="secondary">Ausstehend</Badge>
                )}
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
          <CardTitle>Verbunden</CardTitle>
          <CardDescription>Aktive Verbindungen zu Versendern.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedData?.items.length ? (
            connectedData.items.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div>
                  <div className="font-medium">{connection.shipper?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {connection.shipper?.email}
                  </div>
                </div>
                {canManage ? (
                  <Button
                    size="sm"
                    variant="outline"
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

export default ForwarderConnectionsView;
