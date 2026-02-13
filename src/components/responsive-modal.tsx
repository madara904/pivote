import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const ResponsiveModal = ({
  children,
  open,
  title,
  onOpenChange,
  contentClassName,
  headerClassName,
  bodyClassName,
}: ResponsiveModalProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="top">
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-h-[90vh] flex flex-col p-0 sm:max-w-4xl", contentClassName)}>
        <DialogHeader className={cn("flex-shrink-0 px-6 pt-6 pb-2", headerClassName)}>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={cn("flex-1 overflow-y-auto px-6 pb-6 min-h-0", bodyClassName)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};