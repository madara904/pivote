"use client"

import { ColumnDef } from "@tanstack/react-table"
import { 
  Plane, 
  Ship, 
  Truck, 
  Train, 
  Package, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Package2
} from "lucide-react"
import { InquiryForwarderData } from "@/types/shared/inquiry-data"

// Helper functions to convert enum values to display text
const formatServiceType = (serviceType: string) => {
  const serviceTypeMap: Record<string, string> = {
    air_freight: "Luftfracht",
    sea_freight: "Seefracht", 
    road_freight: "Straßentransport",
    rail_freight: "Bahnfracht"
  }
  return serviceTypeMap[serviceType] || serviceType
}

const getServiceTypeIcon = (serviceType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    air_freight: <Plane className="h-4 w-4" />,
    sea_freight: <Ship className="h-4 w-4" />,
    road_freight: <Truck className="h-4 w-4" />,
    rail_freight: <Train className="h-4 w-4" />
  }
  return iconMap[serviceType] || <Package className="h-4 w-4" />
}

// Helper function to get container type based on service type
const getContainerType = (serviceType: string) => {
  const containerTypeMap: Record<string, string> = {
    sea_freight: "20'/40' Container",
    road_freight: "LKW/Trailer",
    rail_freight: "Wagon",
    air_freight: "N/A" // Air freight doesn't use containers
  }
  return containerTypeMap[serviceType] || "N/A"
}

// Helper function to determine import/export direction (placeholder - not implemented yet)
const getDirection = () => {
  // This is a placeholder - the actual logic would depend on your business rules
  // For now, we'll use a simple heuristic or return a default
  return "Import" // Placeholder - should be determined by actual business logic
}

const formatCargoType = (cargoType: string) => {
  const cargoTypeMap: Record<string, string> = {
    general: "General",
    dangerous: "Dangerous",
    perishable: "Perishable",
    fragile: "Fragile",
    oversized: "Oversized"
  }
  return cargoTypeMap[cargoType] || cargoType
}

const getCargoTypeIcon = (cargoType: string) => {
  if (cargoType === "dangerous") {
    return <AlertTriangle className="h-4 w-4 text-red-400" />
  }
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: "Entwurf",
    sent: "Gesendet",
    closed: "Geschlossen",
    cancelled: "Storniert"
  }
  return statusMap[status] || status
}

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    draft: <Clock className="h-4 w-4 text-slate-600" />,
    sent: <CheckCircle className="h-4 w-4 text-blue-400" />,
    closed: <CheckCircle className="h-4 w-4 text-green-400" />,
    cancelled: <XCircle className="h-4 w-4 text-red-400" />
  }
  return iconMap[status] || <Clock className="h-4 w-4 text-slate-600" />
}

export const columns: ColumnDef<InquiryForwarderData>[] = [
  {
    accessorFn: (row) => row.inquiry.referenceNumber,
    id: "referenz",
    header: "Referenz",
  },
  {
    accessorFn: (row) => row.inquiry.totalGrossWeight,
    id: "fracht",
    header: "Fracht",
    cell: ({ row }) => {
      const weight = row.getValue("fracht");
      const totalPieces = row.original.inquiry.totalPieces;
      const packageSummary = row.original.packageSummary;
      
      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <Package2 className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{weight ? `${weight} kg` : "N/A"}</span>
            <span className="text-xs text-muted-foreground">
              {totalPieces ? `${totalPieces} PKG` : "No packages"}
              {packageSummary?.hasDangerousGoods && " • Dangerous"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.inquiry.shipperOrganization.name,
    id: "shipper",
    header: "Shipper",
  },
  {
    accessorFn: (row) => row.inquiry.serviceType,
    id: "serviceType",
    header: "Service Type",
    cell: ({ row }) => {
      const serviceType = row.getValue("serviceType") as string;
      const direction = getDirection();
      const containerType = getContainerType(serviceType);
      
      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            {getServiceTypeIcon(serviceType)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{formatServiceType(serviceType)}</span>
            <span className="text-xs text-muted-foreground">
              {serviceType === "air_freight" ? direction : `${direction} • ${containerType}`}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.inquiry.cargoType,
    id: "cargoType",
    header: "Cargo Type",
    cell: ({ row }) => {
      const cargoType = row.getValue("cargoType") as string;
      const cargoDescription = row.original.inquiry.cargoDescription || "No description";
      
      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            {getCargoTypeIcon(cargoType)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{formatCargoType(cargoType)}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {cargoDescription}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.inquiry.originCity,
    id: "origin",
    header: "Abgangsort",
    cell: ({ row }) => {
      const originCity = row.getValue("origin") as string;
      const originCountry = row.original.inquiry.originCountry;
      
      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <MapPin className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{originCity}</span>
            <span className="text-xs text-muted-foreground">{originCountry}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.inquiry.destinationCity,
    id: "destination",
    header: "Bestimmungsort",
    cell: ({ row }) => {
      const destinationCity = row.getValue("destination") as string;
      const destinationCountry = row.original.inquiry.destinationCountry;
      
      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            <MapPin className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{destinationCity}</span>
            <span className="text-xs text-muted-foreground">{destinationCountry}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.inquiry.status,
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusDateInfo = row.original.statusDateInfo;
      const validityDate = row.original.inquiry.validityDate;
      
      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            {getStatusIcon(status)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{formatStatus(status)}</span>
            <span className="text-xs text-muted-foreground">{statusDateInfo.statusDetail}</span>
            {validityDate && (
              <span className="text-xs text-slate-500 mt-1">
                {new Date(validityDate).toLocaleDateString('de-DE')}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
]