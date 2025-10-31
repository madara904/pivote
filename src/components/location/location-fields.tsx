"use client"

import { useMemo } from "react";
import { countries, Country, Airport, getAirportsByCountry, incoterms, Incoterm } from "@/lib/locations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

// Airport selector
type AirportProps = {
  countryCode?: string;
  value?: string; // IATA
  onValueChange?: (code: string) => void;
  placeholder?: string;
  items?: Airport[];
  disabled?: boolean;
  size?: "sm" | "default";
};

export function AirportSelect({
  countryCode,
  value,
  onValueChange,
  placeholder = "Select airport",
  items,
  disabled,
  size,
}: AirportProps) {
  const options = items ?? getAirportsByCountry(countryCode);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || options.length === 0}>
      <SelectTrigger size={size} aria-label="Airport">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((a) => (
          <SelectItem key={a.code} value={a.code}>
            {a.code} — {a.city} ({a.name})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Combined location selector
type LocationProps = {
  role?: "origin" | "destination";
  countryCode?: string;
  airportCode?: string;
  onCountryChange?: (code: string) => void;
  onAirportChange?: (code: string) => void;
  disabled?: boolean;
};

export function LocationSelect({
  role,
  countryCode,
  airportCode,
  onCountryChange,
  onAirportChange,
  disabled,
}: LocationProps) {
  const airportPlaceholder = useMemo(
    () => (countryCode ? "Select airport" : "Select country first"),
    [countryCode]
  );

  return (
    <div className="flex gap-2">
      <CountrySelect
        value={countryCode}
        onValueChange={onCountryChange}
        placeholder={role ? `${role} country` : "Country"}
        disabled={disabled}
      />
      <AirportSelect
        countryCode={countryCode}
        value={airportCode}
        onValueChange={onAirportChange}
        placeholder={role ? `${role} airport` : airportPlaceholder}
        disabled={disabled}
      />
    </div>
  );
}

// Incoterm + place field
type IncotermPlaceProps = {
  incoterm?: Incoterm;
  place?: string;
  onIncotermChange?: (value: Incoterm) => void;
  onPlaceChange?: (value: string) => void;
  disabled?: boolean;
};

export function IncotermPlaceField({
  incoterm,
  place,
  onIncotermChange,
  onPlaceChange,
  disabled,
}: IncotermPlaceProps) {
  return (
    <div className="flex gap-2">
      <Select value={incoterm} onValueChange={(v) => onIncotermChange?.(v as Incoterm)} disabled={disabled}>
        <SelectTrigger aria-label="Incoterm">
          <SelectValue placeholder="Incoterm" />
        </SelectTrigger>
        <SelectContent>
          {incoterms.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={place ?? ""}
        onChange={(e) => onPlaceChange?.(e.target.value)}
        placeholder="Place (e.g., Shanghai, Warehouse X)"
        disabled={disabled}
        aria-label="Incoterm place"
      />
    </div>
  );
}

export default LocationSelect;


