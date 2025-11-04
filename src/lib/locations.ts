// Centralized country and airport lookups for freight locations
// Kept small to start; extend as needed.

export type Country = {
  code: string; // ISO 3166-1 alpha-2
  name: string;
};

export type Airport = {
  code: string; // IATA
  name: string;
  city: string;
  countryCode: string; // ISO code to join to a country
};

export const countries: Country[] = [
  { code: "DE", name: "Deutschland" },
  { code: "CN", name: "China" },
  { code: "US", name: "Vereinigte Staaten" },
  { code: "NL", name: "Niederlande" },
  { code: "GB", name: "Vereinigtes Königreich" },
  { code: "AE", name: "Vereinigte Arabische Emirate" },
  { code: "IN", name: "Indien" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "Südkorea" },
  { code: "TR", name: "Türkiye" },
];

export const airports: Airport[] = [
  // Germany
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", countryCode: "DE" },
  { code: "MUC", name: "Munich Airport", city: "Munich", countryCode: "DE" },
  { code: "LEJ", name: "Leipzig/Halle Airport", city: "Leipzig", countryCode: "DE" },
  // China
  { code: "PVG", name: "Shanghai Pudong Intl", city: "Shanghai", countryCode: "CN" },
  { code: "CAN", name: "Guangzhou Baiyun Intl", city: "Guangzhou", countryCode: "CN" },
  { code: "PEK", name: "Beijing Capital", city: "Beijing", countryCode: "CN" },
  // United States
  { code: "JFK", name: "New York JFK", city: "New York", countryCode: "US" },
  { code: "LAX", name: "Los Angeles", city: "Los Angeles", countryCode: "US" },
  { code: "ORD", name: "Chicago O'Hare", city: "Chicago", countryCode: "US" },
  // Netherlands
  { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", countryCode: "NL" },
  // United Kingdom
  { code: "LHR", name: "London Heathrow", city: "London", countryCode: "GB" },
  { code: "LGW", name: "London Gatwick", city: "London", countryCode: "GB" },
  // United Arab Emirates
  { code: "DXB", name: "Dubai Intl", city: "Dubai", countryCode: "AE" },
  { code: "DWC", name: "Al Maktoum Intl (DWC)", city: "Dubai", countryCode: "AE" },
  { code: "AUH", name: "Abu Dhabi Intl", city: "Abu Dhabi", countryCode: "AE" },
  // India
  { code: "DEL", name: "Delhi (Indira Gandhi)", city: "New Delhi", countryCode: "IN" },
  { code: "BOM", name: "Mumbai (Chhatrapati Shivaji)", city: "Mumbai", countryCode: "IN" },
  // Japan
  { code: "NRT", name: "Tokyo Narita", city: "Tokyo", countryCode: "JP" },
  { code: "HND", name: "Tokyo Haneda", city: "Tokyo", countryCode: "JP" },
  // South Korea
  { code: "ICN", name: "Seoul Incheon", city: "Seoul", countryCode: "KR" },
  // Türkiye
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", countryCode: "TR" },
];

export function getAirportsByCountry(countryCode?: string): Airport[] {
  if (!countryCode) return [];
  return airports.filter((a) => a.countryCode === countryCode);
}

export function getAirportByCode(airportCode?: string): Airport | undefined {
  if (!airportCode) return undefined;
  return airports.find((a) => a.code === airportCode);
}

export function getCountryByCode(countryCode?: string): Country | undefined {
  if (!countryCode) return undefined;
  return countries.find((c) => c.code === countryCode);
}

export function getCountryNameByCode(countryCode?: string): string {
  const country = getCountryByCode(countryCode);
  return country?.name || "";
}

export const incoterms = [
  "EXW",
  "FCA",
  "FAS",
  "FOB",
  "CPT",
  "CIP",
  "CFR",
  "CIF",
  "DAP",
  "DPU",
  "DDP",
] as const;

export type Incoterm = (typeof incoterms)[number];


