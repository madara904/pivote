// Define the tier types for better type safety
export type TierType = 'basic' | 'medium' | 'advanced';

// Define the connection limits interface
export interface ConnectionLimits {
  basic: number;
  medium: number;
  advanced: number;
}

// Connection limits configuration
export const CONNECTION_LIMITS: ConnectionLimits = {
  basic: 1,
  medium: 3,
  advanced: 99999,
} as const;

// Individual constants for backward compatibility
export const MAX_BASICTIER_CONNECTIONS = CONNECTION_LIMITS.basic;
export const MAX_MEDIUMTIER_CONNECTIONS = CONNECTION_LIMITS.medium;
export const MAX_ADVANCEDTIER_CONNECTIONS = CONNECTION_LIMITS.advanced;

// Helper function to get connection limit by tier
export function getConnectionLimit(tier: TierType): number {
  return CONNECTION_LIMITS[tier];
}

// Helper function to check if a tier can have more connections
export function canAddConnection(currentConnections: number, tier: TierType): boolean {
  return currentConnections < getConnectionLimit(tier);
}