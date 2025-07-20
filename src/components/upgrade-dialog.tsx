import { useId } from "react";
import { CheckIcon, Gem} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

interface UpgradeDialogProps {
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PLAN_OPTIONS = [
  { value: "1", name: "Essential", price: "$4 per member/month" },
  { value: "2", name: "Standard", price: "$19 per member/month" },
  { value: "3", name: "Enterprise", price: "$32 per member/month" },
] as const;

const FEATURES = [
  "Create unlimited projects.",
  "Remove watermarks.",
  "Add unlimited users and free viewers.",
  "Upload unlimited files.",
  "7-day money back guarantee.",
  "Advanced permissions.",
] as const;

export default function UpgradeDialog({
  title = "Jetzt upgraden um diese Funktion zu freizuschalten! 🚀",
  description = "Wähle zwischen folgenden Optionen aus.",
  open,
  onOpenChange,
}: UpgradeDialogProps) {
  const id = useId();
  const isMobile = useIsMobile();

  const RadioCard = ({ value, name, price }: { value: string; name: string; price: string }) => (
    <div className="border-input has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-md border px-4 py-3 shadow-xs outline-none">
      <RadioGroupItem
        value={value}
        id={`${id}-${value}`}
        aria-describedby={`${id}-${value}-description`}
        className="order-1 after:absolute after:inset-0"
      />
      <div className="grid grow gap-1">
        <Label htmlFor={`${id}-${value}`}>{name}</Label>
        <p
          id={`${id}-${value}-description`}
          className="text-muted-foreground text-xs"
        >
          {price}
        </p>
      </div>
    </div>
  );

  const FeatureItem = ({ feature }: { feature: string }) => (
    <li className="flex gap-2">
      <CheckIcon
        size={16}
        className="text-primary mt-0.5 shrink-0"
        aria-hidden="true"
      />
      {feature}
    </li>
  );

  const upgradeForm = (
    <form className="space-y-5">
      <RadioGroup className="gap-2" defaultValue="2">
        {PLAN_OPTIONS.map((plan) => (
          <RadioCard
            key={plan.value}
            value={plan.value}
            name={plan.name}
            price={plan.price}
          />
        ))}
      </RadioGroup>

      <div className="space-y-3">
        <p>
          <strong className="text-sm font-medium">Features include:</strong>
        </p>
        <ul className="text-muted-foreground space-y-2 text-sm">
          {FEATURES.map((feature) => (
            <FeatureItem key={feature} feature={feature} />
          ))}
        </ul>
      </div>

      <div className="grid gap-2">
        <Button type="button" className="w-full">
          Upgrade plan
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => onOpenChange?.(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );

  const dialogHeader = (
    <>
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full border"
        aria-hidden="true"
      >
        <Gem className="opacity-80" size={16} />
      </div>
      <DialogHeader>
        <DialogTitle className="text-left whitespace-nowrap">{title}</DialogTitle>
        <DialogDescription className="text-left">{description}</DialogDescription>
      </DialogHeader>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{upgradeForm}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="mb-2 flex flex-col gap-2">
          {dialogHeader}
        </div>
        {upgradeForm}
      </DialogContent>
    </Dialog>
  );
}