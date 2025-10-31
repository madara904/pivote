"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import InquiryTable from "./inquiry-table";
import InquiryHeader from "./inquiry-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { InquirySearch } from "@/app/(dashboard)/dashboard/forwarder/frachtanfragen/components/inquiry-search";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, ClipboardCheck, ClipboardX } from "lucide-react";
import type { FreightInquiry } from "./components/inquiry-data-table";

// Filter function
const filterInquiries = (inquiries: FreightInquiry[], query: string) => {
  if (!query.trim()) return inquiries;

  const lowerQuery = query.toLowerCase().trim();
  
  return inquiries.filter((inquiry) => {
    // Search in reference number
    if (inquiry.referenceNumber?.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in shipper name
    if (inquiry.shipperName?.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in origin city/country
    if (inquiry.origin?.code?.toLowerCase().includes(lowerQuery)) return true;
    if (inquiry.origin?.country?.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in destination city/country
    if (inquiry.destination?.code?.toLowerCase().includes(lowerQuery)) return true;
    if (inquiry.destination?.country?.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in service type
    const serviceTypeLabels: Record<string, string> = {
      air_freight: "luftfracht",
      sea_freight: "seefracht",
      road_freight: "straßenfracht",
    };
    const serviceLabel = serviceTypeLabels[inquiry.serviceType] || inquiry.serviceType;
    if (serviceLabel.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in cargo description
    if (inquiry.cargoDescription?.toLowerCase().includes(lowerQuery)) return true;
    
    // Search in cargo type
    if (inquiry.cargoType?.toLowerCase().includes(lowerQuery)) return true;

    return false;
  });
};

const InquiryView = () => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam === "quoted" || tabParam === "expired" ? tabParam : "open";
  const [searchQuery, setSearchQuery] = useState("");

  const [inquiryData] = trpc.inquiry.forwarder.getMyInquiriesFast.useSuspenseQuery(undefined, {
    staleTime: 1000 * 30, // 30 seconds (reduced from 5 minutes)
    refetchInterval: 1000 * 60 * 2, // 2 minutes (reduced from 5 minutes)
    refetchIntervalInBackground: true,
    refetchOnMount: true,
  });

  // Transform the data to match the FreightInquiry interface
  const transformedData = useMemo(() => inquiryData?.map((item) => {
    return {
      id: item.inquiryId, 
      referenceNumber: item.inquiry.referenceNumber,
      status: item.inquiry.status, 
      quotationStatus: item.quotationStatus, 
      responseStatus: item.responseStatus,
      sentAt: item.sentAt,
      responseDate: item.viewedAt || undefined,
      quotedPrice: item.quotationPrice ? Number(item.quotationPrice) : undefined,
      currency: item.quotationCurrency || "EUR",
      serviceType: item.inquiry.serviceType,
      serviceDirection: item.inquiry.serviceDirection,
      cargoType: item.inquiry.cargoType,
      cargoDescription: item.inquiry.cargoDescription,
      weight: item.inquiry.totalGrossWeight,
      unit: "kg" as const,
      pieces: item.inquiry.totalPieces,
      shipperName: item.inquiry.shipperOrganization.name,
      origin: {
        code: item.inquiry.originCity,
        country: item.inquiry.originCountry
      },
      destination: {
        code: item.inquiry.destinationCity,
        country: item.inquiry.destinationCountry
      }
    };
  }) || [], [inquiryData]);

  // Categorize inquiries
  const categorizedInquiries = useMemo(() => {
    const open: typeof transformedData = [];
    const quoted: typeof transformedData = [];
    const expired: typeof transformedData = [];

    transformedData.forEach((inquiry) => {
      const isExpiredOrCancelled = 
        inquiry.status === "expired" || 
        inquiry.status === "cancelled" || 
        inquiry.status === "closed" ||
        inquiry.responseStatus === "rejected";
      
      const isQuoted = inquiry.responseStatus === "quoted";
      const isOpen = inquiry.status === "open" && inquiry.responseStatus === "pending" && !isQuoted;

      if (isExpiredOrCancelled) {
        expired.push(inquiry);
      } else if (isQuoted) {
        quoted.push(inquiry);
      } else if (isOpen) {
        open.push(inquiry);
      } else {
        // Default to open for any other cases
        open.push(inquiry);
      }
    });

    // Apply search filter
    const filteredOpen = filterInquiries(open, searchQuery);
    const filteredQuoted = filterInquiries(quoted, searchQuery);
    const filteredExpired = filterInquiries(expired, searchQuery);

    return { 
      open: filteredOpen, 
      quoted: filteredQuoted, 
      expired: filteredExpired 
    };
  }, [transformedData, searchQuery]);

  if (!inquiryData || inquiryData.length === 0) {
    return (
      <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <InquiryHeader/>
        <Empty className="border border-dashed rounded-lg py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardX className="h-12 w-12 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Keine Frachtanfragen gefunden</EmptyTitle>
            <EmptyDescription>
              Es wurden noch keine Frachtanfragen erstellt.
            </EmptyDescription>
            <div className="mt-6">
              <Button 
                variant="outline" 
                size="lg"
                className="group hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                Mit Versendern verbinden
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </div>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4" style={{ scrollbarGutter: 'stable' }}>
      <InquiryHeader/>
      <InquirySearch 
        className="mb-4" 
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />
      <Tabs defaultValue={defaultTab} className="w-full" activationMode="manual">
        <TabsList className="h-auto bg-transparent p-0 gap-0 w-full grid grid-cols-3 border-b border-border/40 rounded-none overflow-x-auto">
          <TabsTrigger 
            value="open"
            className="flex flex-col items-center justify-center gap-1 py-2 sm:py-3 px-2 sm:px-4 rounded-none border-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative shrink-0 min-w-0"
          >
            <span className="text-xs sm:text-sm font-medium text-center truncate w-full">Offen ({categorizedInquiries.open.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="quoted"
            className="flex flex-col items-center justify-center gap-1 py-2 sm:py-3 px-2 sm:px-4 rounded-none border-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative shrink-0 min-w-0"
          >
            <span className="text-xs sm:text-sm font-medium text-center truncate w-full">Angeboten ({categorizedInquiries.quoted.length})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="expired"
            className="flex flex-col items-center justify-center gap-1 py-2 sm:py-3 px-2 sm:px-4 rounded-none border-0 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground data-[state=active]:border-b-2 data-[state=active]:border-b-primary relative shrink-0 min-w-0"
          >
            <span className="text-xs sm:text-sm font-medium text-center truncate w-full">
              <span className="hidden sm:inline">Abgelaufen/Abgebrochen</span>
              <span className="sm:hidden">Abgel./Abb.</span>
              <span> ({categorizedInquiries.expired.length})</span>
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4 mt-4">
          {categorizedInquiries.open.length === 0 ? (
            <Empty className="border border-dashed rounded-lg py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardX className="h-12 w-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Keine offenen Anfragen</EmptyTitle>
                <EmptyDescription>
                  Es gibt derzeit keine offenen Anfragen.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <InquiryTable data={categorizedInquiries.open} />
          )}
        </TabsContent>

        <TabsContent value="quoted" className="space-y-4 mt-4">
          {categorizedInquiries.quoted.length === 0 ? (
            <Empty className="border border-dashed rounded-lg py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardX className="h-12 w-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Keine Angebote abgegeben</EmptyTitle>
                <EmptyDescription>
                  Sie haben noch keine Angebote abgegeben.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <InquiryTable data={categorizedInquiries.quoted} />
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4 mt-4">
          {categorizedInquiries.expired.length === 0 ? (
            <Empty className="border border-dashed rounded-lg py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardX className="h-12 w-12 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>Keine abgelaufenen Anfragen</EmptyTitle>
                <EmptyDescription>
                  Es gibt derzeit keine abgelaufenen oder abgebrochenen Anfragen.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <InquiryTable data={categorizedInquiries.expired} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InquiryView;
