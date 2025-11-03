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
    <div className="pt-4">
      <div className="flex flex-col gap-4 container mx-auto">
        <UpgradeDialog onOpenChange={setIsDialogOpen} open={isDialogOpen} />
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary font-semibold text-xl">F</span>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <h3 className="font-bold text-xl">FreightCorp GmbH</h3>
              <p className="text-sm text-muted-foreground font-medium">
                Spedition & Logistik
              </p>
            </div>
            {isHighTier ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm text-primary">4.8</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg blur-xs">
                <Button onClick={() => setIsDialogOpen(true)} variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm text-primary ml-1">4.8</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Separator className="my-8"/>
    </div>
  );
};

export default DashboardOverviewHead;
