/**
 * Freight calculation utilities for different service types
 */

export type ServiceType = "air_freight" | "sea_freight" | "road_freight" | "rail_freight";

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
}

export interface PackageData {
  grossWeight: number;
  chargeableWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  volume?: number;
  pieces: number;
  isDangerous: boolean;
  temperature?: string | null;
  specialHandling?: string | null;
  description?: string | null;
  dangerousGoodsClass?: string | null;
  unNumber?: string | null;
}

/**
 * Calculate volume from dimensions (in cm)
 */
export function calculateVolume(dimensions: PackageDimensions): number {
  return (dimensions.length * dimensions.width * dimensions.height) / 1_000_000; // Convert cm³ to m³
}

/**
 * Calculate chargeable weight for air freight
 * Air freight uses 1:6000 ratio (1 m³ = 6000 kg)
 */
export function calculateAirFreightChargeableWeight(
  grossWeight: number,
  volume: number
): number {
  const volumeWeight = volume * 6000; // 1 m³ = 6000 kg
  return Math.max(grossWeight, volumeWeight);
}

/**
 * Calculate chargeable weight for sea freight
 * Sea freight uses 1:1000 ratio (1 m³ = 1000 kg)
 */
export function calculateSeaFreightChargeableWeight(
  grossWeight: number,
  volume: number
): number {
  const volumeWeight = volume * 1000; // 1 m³ = 1000 kg
  return Math.max(grossWeight, volumeWeight);
}

/**
 * Calculate chargeable weight based on service type
 */
export function calculateChargeableWeight(
  serviceType: ServiceType,
  grossWeight: number,
  volume: number
): number {
  switch (serviceType) {
    case "air_freight":
      return calculateAirFreightChargeableWeight(grossWeight, volume);
    case "sea_freight":
      return calculateSeaFreightChargeableWeight(grossWeight, volume);
    case "road_freight":
    case "rail_freight":
      // For road and rail freight, chargeable weight is typically the gross weight
      return grossWeight;
    default:
      return grossWeight;
  }
}

/**
 * Process package data and calculate proper volumes and chargeable weights
 */
export function processPackageData(
  packages: PackageData[],
  serviceType: ServiceType
): {
  processedPackages: Array<PackageData & { calculatedVolume: number; calculatedChargeableWeight: number }>;
  totalGrossWeight: number;
  totalChargeableWeight: number;
  totalVolume: number;
  totalPieces: number;
  hasDangerousGoods: boolean;
  hasTemperatureControl: boolean;
  hasSpecialHandling: boolean;
} {
  let totalGrossWeight = 0;
  let totalChargeableWeight = 0;
  let totalVolume = 0;
  let totalPieces = 0;
  let hasDangerousGoods = false;
  let hasTemperatureControl = false;
  let hasSpecialHandling = false;

  const processedPackages = packages.map(pkg => {
    // Calculate volume if dimensions are available
    const calculatedVolume = pkg.volume || 
      (pkg.length && pkg.width && pkg.height 
        ? calculateVolume({ length: pkg.length, width: pkg.width, height: pkg.height })
        : 0);

    // Calculate chargeable weight
    const calculatedChargeableWeight = pkg.chargeableWeight || 
      calculateChargeableWeight(serviceType, pkg.grossWeight, calculatedVolume);

    // Update totals
    totalGrossWeight += pkg.grossWeight;
    totalChargeableWeight += calculatedChargeableWeight;
    totalVolume += calculatedVolume;
    totalPieces += pkg.pieces;

    // Check for special requirements
    if (pkg.isDangerous) hasDangerousGoods = true;
    if (pkg.temperature) hasTemperatureControl = true;
    if (pkg.specialHandling) hasSpecialHandling = true;

    return {
      ...pkg,
      calculatedVolume,
      calculatedChargeableWeight
    };
  });

  return {
    processedPackages,
    totalGrossWeight,
    totalChargeableWeight,
    totalVolume,
    totalPieces,
    hasDangerousGoods,
    hasTemperatureControl,
    hasSpecialHandling
  };
}

/**
 * Get the volume ratio for display purposes
 */
export function getVolumeRatio(serviceType: ServiceType): string {
  switch (serviceType) {
    case "air_freight":
      return "1:6000 (1 m³ = 6000 kg)";
    case "sea_freight":
      return "1:1000 (1 m³ = 1000 kg)";
    case "road_freight":
    case "rail_freight":
      return "N/A (Gewichtsbasiert)";
    default:
      return "N/A";
  }
}
