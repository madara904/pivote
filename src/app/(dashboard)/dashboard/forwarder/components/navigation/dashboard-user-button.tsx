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
import { Skeleton } from "@/components/ui/skeleton";
import { signOut, useSession } from "@/lib/auth-client";
import { Gem, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getInitials(name?: string) {
  if (!name) return "";
  const words = name.split(" ").filter(Boolean);
  if (words.length === 1) return words[0][0]?.toUpperCase() ?? "";
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export const DashboardUserButton = () => {
  const router = useRouter();
  const { data, isPending } = useSession();

  const onLogout = () => {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border rounded-full p-1 hover:bg-secondary cursor-pointer">
        {data.user.image ? (
          <Avatar className="h-12 w-12">
            <AvatarImage src={data.user.image} />
          </Avatar>
        ) : (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-sm">{getInitials(data.user.name)}</AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="center">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{data.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {data.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/forwarder/einstellungen">
              <Gem className="mr-2 h-4 w-4" />
              <span>Jetzt upgraden</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/forwarder/einstellungen">
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
