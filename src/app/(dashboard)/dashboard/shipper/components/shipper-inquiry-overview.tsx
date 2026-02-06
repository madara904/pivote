"use client";

import { useMemo } from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShipperInquiryTable } from "./shipper-inquiry-table";
import { getShipperDisplayStatus, ShipperStatusContext, ShipperInquiryStatus } from "@/lib/shipper-status-utils";
import { ShipperPackage } from "@/types/trpc-inferred";

const ShipperInquiryOverview = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.inquiry.shipper.getMyInquiries.queryOptions());

  const calculateTotalWeight = (packages: ShipperPackage[]) => {
    return packages.reduce((total, pkg) => total + parseFloat(pkg.grossWeight), 0).toFixed(2);
  };

  const calculateTotalPieces = (packages: ShipperPackage[]) => {
    return packages.reduce((total, pkg) => total + pkg.pieces, 0);
  };

  const transformedInquiries = useMemo(() => {
    if (!data) return [];
    return data.map((inquiry) => {
      const statusContext: ShipperStatusContext = {
        inquiryStatus: inquiry.status as ShipperInquiryStatus,
        quotationCount: inquiry.quotations.length,
        hasAcceptedQuotation: inquiry.quotations.some(q => q.status === "accepted"),
        hasRejectedQuotations: inquiry.quotations.some(q => q.status === "rejected"),
        forwarderResponseSummary: inquiry.forwarderResponseSummary
      };

      const displayStatus = getShipperDisplayStatus(statusContext);

      return {
        id: inquiry.id,
        referenceNumber: inquiry.referenceNumber,
        status: displayStatus,
        sentAt: inquiry.sentToForwarders[0]?.sentAt || inquiry.createdAt,
        responseDate: inquiry.sentToForwarders.find(f => f.viewedAt)?.viewedAt ?? undefined,
        quotedPrice: inquiry.quotations.length > 0 ? Number(inquiry.quotations[0].totalPrice) : undefined,
        currency: inquiry.quotations.length > 0 ? inquiry.quotations[0].currency : "EUR",
        serviceType: inquiry.serviceType,
        serviceDirection: inquiry.serviceDirection,
        cargoType: inquiry.cargoType,
        cargoDescription: inquiry.cargoDescription,
        weight: calculateTotalWeight(inquiry.packages),
        unit: "kg",
        pieces: calculateTotalPieces(inquiry.packages),
        shipperName: inquiry.createdBy.name,
        forwarderResponseSummary: inquiry.forwarderResponseSummary,
        quotations: inquiry.quotations,
        quotationCount: inquiry.quotations.length,
        hasAcceptedQuotation: statusContext.hasAcceptedQuotation,
        hasRejectedQuotations: statusContext.hasRejectedQuotations,
        origin: {
          code: inquiry.originAirport,
          city: inquiry.originCity,
          country: inquiry.originCountry
        },
        destination: {
          code: inquiry.destinationAirport,
          city: inquiry.destinationCity,
          country: inquiry.destinationCountry
        }
      };
    });
  }, [data]);

  return <ShipperInquiryTable inquiries={transformedInquiries} />;
};

export default ShipperInquiryOverview;