import { Command, CommandInput, CommandItem, CommandList, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SEARCH_FUNCTIONALITY_LIST } from "@/lib/constants/search-functionality-list";

interface Props {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const functionalityActions = SEARCH_FUNCTIONALITY_LIST;

export const DashboardCommand = ({ open, setOpen }: Props) => {
    const isMobile = useIsMobile();
    const router = useRouter();

    const handleSelect = (url: string) => {
        router.push(url);
        setOpen(false);
    };

    const commandContent = (
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <CommandInput 
                placeholder="Schnellsuche..."
            />
            <CommandList>
                <CommandGroup heading="Frachtanfragen">
                    {functionalityActions
                        .filter(action => action.group === "inquiries")
                        .map((action) => {
                            const Icon = action.icon;
                            return (
                                <CommandItem
                                    key={action.url}
                                    value={`${action.title} ${action.keywords.join(" ")}`}
                                    onSelect={() => handleSelect(action.url)}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{action.title}</span>
                                </CommandItem>
                            );
                        })}
                </CommandGroup>
                <CommandGroup heading="Einstellungen">
                    {functionalityActions
                        .filter(action => action.group === "settings")
                        .map((action) => {
                            const Icon = action.icon;
                            return (
                                <CommandItem
                                    key={action.url}
                                    value={`${action.title} ${action.keywords.join(" ")}`}
                                    onSelect={() => handleSelect(action.url)}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{action.title}</span>
                                </CommandItem>
                            );
                        })}
                </CommandGroup>
                <CommandGroup heading="Allgemein">
                    {functionalityActions
                        .filter(action => action.group === "general")
                        .map((action) => {
                            const Icon = action.icon;
                            return (
                                <CommandItem
                                    key={action.url}
                                    value={`${action.title} ${action.keywords.join(" ")}`}
                                    onSelect={() => handleSelect(action.url)}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{action.title}</span>
                                </CommandItem>
                            );
                        })}
                </CommandGroup>
                <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
            </CommandList>
        </Command>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen} direction="bottom">
                <DrawerContent>
                    <DrawerHeader className="sr-only">
                        <DrawerTitle>Schnellsuche</DrawerTitle>
                        <DrawerDescription>Search for a command to run...</DrawerDescription>
                    </DrawerHeader>
                    {commandContent}
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogHeader className="sr-only">
                <DialogTitle>Schnellsuche</DialogTitle>
                <DialogDescription>Search for a command to run...</DialogDescription>
            </DialogHeader>
            <DialogContent
                className={cn("overflow-hidden p-0 max-w-lg")}
                showCloseButton={true}
            >
                {commandContent}
            </DialogContent>
        </Dialog>
    );
}