/**
 * Freight calculation utilities for different service types
 */

export type ServiceType = "air_freight" | "sea_freight" | "road_freight" | "rail_freight";

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
}

/**
 * Calculate volume from dimensions (in cm)
 */
export function calculateVolume(dimensions: PackageDimensions): number {
  return (dimensions.length * dimensions.width * dimensions.height) / 1_000_000; // Convert cm³ to m³
}

/**
 * Round to nearest 0.5 (half kilogram)
 * @param value - Value to round
 * @returns Value rounded to nearest 0.5
 */
function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * Calculate chargeable weight for air freight
 * Air freight uses 166.667 kg per m³ (CBM * 166.667)
 * Chargeable weight is rounded to nearest 0.5 kg
 * @param grossWeight - Total gross weight in kg
 * @param volumePerPiece - Volume in m³ (CBM) per piece
 * @param pieces - Number of pieces
 * @returns Chargeable weight in kg (rounded to nearest 0.5)
 */
export function calculateAirFreightChargeableWeight(
  grossWeight: number,
  volumePerPiece: number,
  pieces: number = 1
): number {
  // Calculate total CBM (volume per piece * number of pieces)
  const totalCBM = volumePerPiece * pieces;
  
  // Calculate volume weight: CBM * 166.667
  const volumeWeight = totalCBM * 166.667;
  
  // Get the maximum of actual weight or volume weight
  const chargeableWeight = Math.max(grossWeight, volumeWeight);
  
  // Round the final result to nearest 0.5 kg
  return roundToHalf(chargeableWeight);
}

/**
 * Calculate chargeable weight for sea freight
 * Sea freight uses 1:1000 ratio (1 m³ = 1000 kg)
 */
export function calculateSeaFreightChargeableWeight(
  grossWeight: number,
  volumePerPiece: number,
  pieces: number = 1
): number {
  const totalCBM = volumePerPiece * pieces;
  const volumeWeight = totalCBM * 1000; // 1 m³ = 1000 kg
  return Math.max(grossWeight, volumeWeight);
}

/**
 * Calculate chargeable weight based on service type
 * @param serviceType - Type of freight service
 * @param grossWeight - Total gross weight in kg
 * @param volumePerPiece - Volume in m³ (CBM) per piece
 * @param pieces - Number of pieces (default: 1)
 * @returns Chargeable weight in kg
 */
export function calculateChargeableWeight(
  serviceType: ServiceType,
  grossWeight: number,
  volumePerPiece: number,
  pieces: number = 1
): number {
  switch (serviceType) {
    case "air_freight":
      return calculateAirFreightChargeableWeight(grossWeight, volumePerPiece, pieces);
    case "sea_freight":
      return calculateSeaFreightChargeableWeight(grossWeight, volumePerPiece);
    case "road_freight":
    case "rail_freight":
      // For road and rail freight, chargeable weight is typically the gross weight
      return grossWeight;
    default:
      return grossWeight;
  }
}

