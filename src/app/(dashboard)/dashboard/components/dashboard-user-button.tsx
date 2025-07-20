"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useActiveOrganization, useSession, organization } from "@/lib/auth-client";
import { ChevronsUpDown, Gem, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function getInitials(name?: string) {
  if (!name) return "";
  const words = name.split(" ").filter(Boolean);
  if (words.length === 1) return words[0][0]?.toUpperCase() ?? "";
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}


export const DashboardUserButton = () => {

  const { data: activeOrganization } = useActiveOrganization()
  const router = useRouter();
  const { data, isPending } = useSession();

  useEffect(() => {
    const restoreActiveOrganization = async () => {
      if (data?.session?.activeOrganizationId && !activeOrganization) {
        try {
          const result = await organization.setActive({
            organizationId: data.session.activeOrganizationId,
          });
          
          if (!result.data) {
            console.error("Failed to restore active organization:", result.error);
          }
        } catch (error) {
          console.error("Error restoring active organization:", error);
        }
      }
    };

    restoreActiveOrganization();
  }, [data?.session?.activeOrganizationId, activeOrganization]);

  const onLogout = () => {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  if (isPending || !data?.user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-lg shadow p-3 w-full flex items-center justify-between hover:bg-secondary overflow-hidden cursor-pointer">
        {data.user.image ? (
          <Avatar>
            <AvatarImage src={data.user.image} />
          </Avatar>
        ) : (
          <Avatar>
            <AvatarFallback>{getInitials(data.user.name)}</AvatarFallback>
          </Avatar>
        )}
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="ml-2 truncate text-sm">{data.user.name}</span>
          <span>{activeOrganization?.name || "Keine Organisation"}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="center">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{data.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {data.user.email}
              
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/einstellungen">
              <Gem className="mr-2 h-4 w-4" />
              <span>Jetzt upgraden</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/einstellungen">
              <Settings className="mr-2 h-4 w-4" />
              <span>Einstellungen</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Abmelden</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
