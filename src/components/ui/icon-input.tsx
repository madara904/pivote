import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type IconInputProps = React.ComponentProps<typeof Input> & {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  iconClassName?: string;
  rightElementClassName?: string;
};

function IconInput({
  icon,
  rightElement,
  containerClassName,
  iconClassName,
  rightElementClassName,
  className,
  ...props
}: IconInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      {icon ? (
        <div
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            iconClassName
          )}
        >
          {icon}
        </div>
      ) : null}
      <Input
        {...props}
        className={cn(
          icon ? "pl-9" : undefined,
          rightElement ? "pr-10" : undefined,
          className
        )}
      />
      {rightElement ? (
        <div
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2",
            rightElementClassName
          )}
        >
          {rightElement}
        </div>
      ) : null}
    </div>
  );
}

export { IconInput };
