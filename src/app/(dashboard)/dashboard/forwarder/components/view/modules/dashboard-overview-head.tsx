"use client"

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UpgradeDialog from "@/components/upgrade-dialog";
import { Star } from "lucide-react";
import { useState } from "react";

const DashboardOverviewHead = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isHighTier = false;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <UpgradeDialog onOpenChange={setIsDialogOpen} open={isDialogOpen} />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary font-semibold text-lg">F</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">FreightCorp GmbH</h3>
            <p className="text-sm text-muted-foreground">
              Spedition & Logistik
            </p>
          </div>
        </div>
        {isHighTier ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-sm">4.8</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg blur-[2px] bg-muted/50">
            <Button onClick={() => setIsDialogOpen(true)} variant="default">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">4.8</span>
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Letzte Aktualisierung:</span>
          <span className="font-medium">vor 5 Min</span>
        </div>
      </div>
      <Separator className="mt-8" />
    </>
  );
};

export default DashboardOverviewHead;
