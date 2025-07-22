"use client";
import { useQueryState, parseAsStringEnum } from "nuqs";
import {
  AccountSettingsCards,
  SecuritySettingsCards,
} from "@daveyplate/better-auth-ui";
import { User, Lock, Building2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import OrganizationCreateForm from "../../../components/organization-create-form";

const TABS = [
  { key: "account", label: "Konto", icon: User },
  { key: "security", label: "Sicherheit", icon: Lock },
  { key: "org", label: "Organisation", icon: Building2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const SettingsView = () => {
  const [tab, setTab] = useQueryState<TabKey>(
    "tab",
    parseAsStringEnum(["account", "security", "org"])
      .withDefault("account")
      .withOptions({ clearOnDefault: false, history: "push"})
  );
  const isMobile = useIsMobile();

  return (
    <>
      <div className={cn("flex", isMobile ? "flex-col" : "")}>
        <nav
          className={cn(
            "flex gap-2 bg-background",
            isMobile ? "flex-row p-4 border-b" : "w-56 p-6 flex-col"
          )}
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => setTab(key)}
              variant={tab === key ? "default" : "ghost"}
              className={cn(
                "flex items-center gap-2",
                isMobile ? "justify-center flex-1" : "justify-start w-full"
              )}
              title={isMobile ? label : undefined}
            >
              <Icon className="w-5 h-5" />
              {!isMobile && <span>{label}</span>}
            </Button>
          ))}
        </nav>
        <main className="flex-1 p-2 md:p-5">
          {tab === "account" && <AccountSettingsCards />}
          {tab === "security" && <SecuritySettingsCards />}
          {tab === "org" && <OrganizationCreateForm />}
        </main>
      </div>
    </>
  );
};

export default SettingsView;
