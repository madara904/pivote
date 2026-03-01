"use client";

import * as React from "react";
import { format } from "date-fns";
import { de as deDateFns } from "date-fns/locale";
import { de as deDayPicker } from "react-day-picker/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Minimum selectable date (e.g. today) */
  minDate?: Date;
  /** @see aria-labelledby */
  "aria-labelledby"?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Datum wählen",
  disabled,
  className,
  id,
  minDate,
  "aria-labelledby": ariaLabelledBy,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value
    ? typeof value === "string"
      ? new Date(value)
      : value
    : undefined;

  const isValidDate = date && !isNaN(date.getTime());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-labelledby={ariaLabelledBy}
          className={cn(
            "h-10 w-full justify-start text-left font-normal text-[13px]",
            !isValidDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {isValidDate ? (
            format(date, "dd.MM.yyyy", { locale: deDateFns })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 min-w-[320px]" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? date : undefined}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          disabled={
            minDate
              ? (d) => {
                  const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                  const minStart = new Date(
                    minDate.getFullYear(),
                    minDate.getMonth(),
                    minDate.getDate()
                  );
                  return dStart < minStart;
                }
              : undefined
          }
          defaultMonth={isValidDate ? date : new Date()}
          locale={deDayPicker}
        />
      </PopoverContent>
    </Popover>
  );
}
