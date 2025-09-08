// Client-side data processing utilities
import { SelectInquiryForwarder, SelectInquiry, SelectInquiryPackage } from "@/db/schema";
import { InquiryForwarderData } from "@/types/shared/inquiry-data";

type Package = SelectInquiryPackage;
type Inquiry = SelectInquiry & {
  packages: SelectInquiryPackage[];
  shipperOrganization: { id: string; name: string; email: string };
  createdBy: { id: string; name: string; email: string };
};
type Record = SelectInquiryForwarder & {
  inquiry: Inquiry;
};

export function processInquiryData(record: Record): InquiryForwarderData | null {
  const inquiry = record.inquiry;
  if (!inquiry) return null;
  
  const packages = inquiry.packages || [];
  
  
  const totalPieces = packages.reduce((sum: number, pkg: Package) => sum + pkg.pieces, 0);
  const totalGrossWeight = packages.reduce((sum: number, pkg: Package) => sum + parseFloat(pkg.grossWeight), 0);
  const totalChargeableWeight = packages.reduce((sum: number, pkg: Package) => sum + parseFloat(pkg.chargeableWeight || '0'), 0);
  const totalVolume = packages.reduce((sum: number, pkg: Package) => sum + parseFloat(pkg.volume || '0'), 0);
  
 
  const packageSummary = packages.length > 0 ? {
    count: packages.length,
    hasDangerousGoods: packages.some((pkg: Package) => !!pkg.isDangerous),
    temperatureControlled: packages.some((pkg: Package) => !!pkg.temperature),
    specialHandling: packages.some((pkg: Package) => !!pkg.specialHandling)
  } : null;
  

  const statusDateInfo = {
    formattedSentDate: record.sentAt ? formatDate(record.sentAt) : '',
    formattedViewedDate: record.viewedAt ? formatDate(record.viewedAt) : null,
    statusDetail: inquiry.status === "sent" && record.viewedAt 
      ? `Viewed ${formatDate(record.viewedAt)}`
      : inquiry.status === "sent" 
      ? `Sent ${formatDate(record.sentAt)}`
      : inquiry.status === "draft"
      ? "Not sent yet"
      : ""
  };

  return {
    id: record.id,
    inquiryId: record.inquiryId,
    forwarderOrganizationId: record.forwarderOrganizationId,
    sentAt: record.sentAt,
    viewedAt: record.viewedAt,
    createdAt: record.createdAt,
    inquiry: {
      ...inquiry,
      packages,
      totalPieces,
      totalGrossWeight: totalGrossWeight.toFixed(2),
      totalChargeableWeight: totalChargeableWeight > 0 ? totalChargeableWeight.toFixed(2) : null,
      totalVolume: totalVolume.toFixed(3),
      dimensionsSummary: packages.length > 0 
        ? packages.map((pkg: Package) => 
            `${pkg.length || 0}×${pkg.width || 0}×${pkg.height || 0}cm`
          ).join(", ")
        : "Keine Abmessungen"
    },
    packageSummary,
    statusDateInfo
  };
}

function formatDate(date: string | Date | null): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('de-DE');
  } catch {
    return 'Invalid date';
  }
}
