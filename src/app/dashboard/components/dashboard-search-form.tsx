import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";
import { DashboardCommand } from "./dashboard-command";
import { useState, useEffect } from "react";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <form {...props}>
      <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
      <div className="relative overflow-visible">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Schnellsuche..."
          className="h-8 pl-7 pr-12"
          onClick={() => setCommandOpen(true)}
          readOnly
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 opacity-50 select-none" />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          ⌘K
        </kbd>
      </div>
    </form>
  );
}
