import { Clock, LucideIcon, XCircle, Search, CheckCircleIcon, Building2, House, Link2, BarChart3, User, Lock } from "lucide-react";


interface FunctionalityAction {
    title: string;
    url: string;
    icon: LucideIcon;
    keywords: string[];
    group: "inquiries" | "settings" | "general";
}

export const SEARCH_FUNCTIONALITY_LIST: FunctionalityAction[] = [

    {
        title: "Frachtanfragen durchsuchen",
        url: "/dashboard/forwarder/frachtanfragen",
        icon: Search,
        keywords: ["search", "inquiries", "frachtanfragen", "suchen", "anfragen", "suche", "durchsuchen"],
        group: "inquiries",
    },
    {
        title: "Offene Frachtanfragen anzeigen",
        url: "/dashboard/forwarder/frachtanfragen?tab=open",
        icon: Clock,
        keywords: ["open", "offen", "inquiries", "frachtanfragen", "pending", "ausstehend", "anzeigen"],
        group: "inquiries",
    },
    {
        title: "Angebotene Frachtanfragen anzeigen",
        url: "/dashboard/forwarder/frachtanfragen?tab=quoted",
        icon: CheckCircleIcon,
        keywords: ["quoted", "angeboten", "inquiries", "frachtanfragen", "offered", "anzeigen"],
        group: "inquiries",
    },
    {
        title: "Abgelaufene Frachtanfragen anzeigen",
        url: "/dashboard/forwarder/frachtanfragen?tab=expired",
        icon: XCircle,
        keywords: ["expired", "abgelaufen", "inquiries", "frachtanfragen", "expired", "anzeigen"],
        group: "inquiries",
    },

    {
        title: "Kontoeinstellungen ändern",
        url: "/dashboard/forwarder/einstellungen/konto",
        icon: User,
        keywords: ["account", "konto", "profile", "settings", "einstellungen", "profil", "ändern"],
        group: "settings",
    },
    {
        title: "Sicherheitseinstellungen ändern",
        url: "/dashboard/forwarder/einstellungen/sicherheit",
        icon: Lock,
        keywords: ["security", "sicherheit", "password", "passwort", "settings", "einstellungen", "ändern"],
        group: "settings",
    },
    {
        title: "Organisation verwalten",
        url: "/dashboard/forwarder/einstellungen/organisation",
        icon: Building2,
        keywords: ["organization", "organisation", "org", "company", "firma", "settings", "einstellungen", "verwalten"],
        group: "settings",
    },

    {
        title: "Zur Übersicht",
        url: "/dashboard/forwarder",
        icon: House,
        keywords: ["dashboard", "übersicht", "home", "start", "overview"],
        group: "general",
    },
    {
        title: "Verbindungen anzeigen",
        url: "/dashboard/forwarder/verbindungen",
        icon: Link2,
        keywords: ["connections", "verbindungen", "partners", "netzwerk", "einladungen", "anzeigen"],
        group: "general",
    },
    {
        title: "Statistiken anzeigen",
        url: "/dashboard/forwarder/statistiken",
        icon: BarChart3,
        keywords: ["statistics", "statistiken", "stats", "analytics", "analytik", "reports", "anzeigen"],
        group: "general",
    },
];