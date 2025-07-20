import { Button } from "@/components/ui/button";
import UpgradeDialog from "@/components/upgrade-dialog";
import { Star } from "lucide-react";
import { useState } from "react";

const DashboardRating = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isHighTier = false;

  return (
    <>
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
    </>
  );
};

export default DashboardRating;
