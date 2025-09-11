// Shared types for inquiry data processing

export interface InquiryForwarderData {
  id: string;
  inquiryId: string;
  forwarderOrganizationId: string;
  sentAt: Date;
  viewedAt: Date | null;
  createdAt: Date;
  inquiry: {
    id: string;
    referenceNumber: string;
    title: string;
    description: string | null;
    serviceType: string;
    originAirport: string;
    originCity: string;
    originCountry: string;
    destinationAirport: string;
    destinationCity: string;
    destinationCountry: string;
    cargoType: string;
    cargoDescription: string | null;
    readyDate: Date;
    deliveryDate?: Date | null;
    validityDate?: Date | null;
    status: string;
    shipperOrganizationId: string;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    packages: Array<{
      id: string;
      inquiryId: string;
      packageNumber: string;
      description: string | null;
      pieces: number;
      grossWeight: string;
      chargeableWeight: string | null;
      length: string | null;
      width: string | null;
      height: string | null;
      volume: string | null;
      temperature: string | null;
      specialHandling: string | null;
      isDangerous: boolean | null;
      dangerousGoodsClass: string | null;
      unNumber: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
    totalPieces: number;
    totalGrossWeight: string;
    totalChargeableWeight: string | null;
    totalVolume: string;
    dimensionsSummary: string;
    shipperOrganization: {
      id: string;
      name: string;
      email: string;
    };
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
  };
  packageSummary: {
    count: number;
    hasDangerousGoods: boolean;
    temperatureControlled: boolean;
    specialHandling: boolean;
  } | null;
  statusDateInfo: {
    formattedSentDate: string;
    formattedViewedDate: string | null;
    statusDetail: string;
  };
}
