import { ClipboardList, LucideIcon, Plus, Users, House, Settings } from "lucide-react";

interface FunctionalityAction {
  title: string;
  url: string;
  icon: LucideIcon;
  keywords: string[];
  group: "inquiries" | "general" | "settings";
}

export const SEARCH_FUNCTIONALITY_LIST_SHIPPER: FunctionalityAction[] = [
  {
    title: "Übersicht",
    url: "/dashboard/shipper",
    icon: House,
    keywords: ["dashboard", "übersicht", "home", "start", "overview"],
    group: "general",
  },
  {
    title: "Frachtanfragen anzeigen",
    url: "/dashboard/shipper/frachtanfragen",
    icon: ClipboardList,
    keywords: ["inquiries", "frachtanfragen", "anfragen", "anzeigen", "liste"],
    group: "inquiries",
  },
  {
    title: "Neue Anfrage erstellen",
    url: "/dashboard/shipper/frachtanfragen/neu",
    icon: Plus,
    keywords: ["neu", "create", "anfrage", "frachtanfrage", "erstellen"],
    group: "inquiries",
  },
  {
    title: "Verbindungen verwalten",
    url: "/dashboard/shipper/verbindungen",
    icon: Users,
    keywords: ["connections", "verbindungen", "spediteure", "einladungen"],
    group: "general",
  },
  {
    title: "Einstellungen",
    url: "/dashboard/shipper/einstellungen",
    icon: Settings,
    keywords: ["settings", "einstellungen", "konto", "security", "org"],
    group: "settings",
  },
];
