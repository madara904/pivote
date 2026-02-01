"use client"

import { countries, Country } from "@/lib/locations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Country selector
type CountryProps = {
  value?: string; // ISO code
  onValueChange?: (code: string) => void;
  placeholder?: string;
  items?: Country[];
  disabled?: boolean;
  size?: "sm" | "default";
};

export function CountrySelect({
  value,
  onValueChange,
  placeholder = "Select country",
  items = countries,
  disabled,
  size,
}: CountryProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size={size} aria-label="Country">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

