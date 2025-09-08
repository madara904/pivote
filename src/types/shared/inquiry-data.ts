import { SelectInquiryForwarder, SelectInquiry, SelectInquiryPackage, SelectOrganization, SelectUser } from "@/db/schema";

export type InquiryForwarderData = SelectInquiryForwarder & {
    inquiry: SelectInquiry & {
      packages: SelectInquiryPackage[];
      shipperOrganization: Pick<SelectOrganization, 'id' | 'name' | 'email'>;
      createdBy: Pick<SelectUser, 'id' | 'name' | 'email'>;
      totalPieces: number;
      totalGrossWeight: string;
      totalChargeableWeight: string | null;
      totalVolume: string;
      dimensionsSummary: string;
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
  };