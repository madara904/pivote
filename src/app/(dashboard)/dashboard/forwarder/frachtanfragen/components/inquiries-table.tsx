'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Eye, 
  Package, 
  Truck, 
  Plane, 
  Ship, 
  Train,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { SelectInquiry, SelectInquiryForwarder } from '@/db/schema';

// Type for the inquiry data as returned by the tRPC query
type InquiryData = SelectInquiryForwarder & {
  inquiry: SelectInquiry & {
    shipperOrganization: { name: string };
    createdBy: { name: string | null; email: string };
    packages: Array<{ id: string }>;
    totalPieces: number;
    totalGrossWeight: string;
    totalChargeableWeight: string | null;
    totalVolume: string;
    dimensionsSummary: string;
  };
  packageSummary: {
    count: number;
    totalPieces: number;
    totalGrossWeight: string;
    totalChargeableWeight: string;
    totalVolume: string;
    hasDangerousGoods: boolean;
    temperatureControlled: boolean;
    specialHandling: boolean;
  } | null;
};

interface InquiriesTableProps {
  inquiries: InquiryData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function InquiriesTable({
  inquiries,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: InquiriesTableProps) {
  const router = useRouter();

  const handleRowClick = (inquiryId: string) => {
    router.push(`/dashboard/forwarder/frachtanfragen/${inquiryId}`);
  };

  // Service type icons
  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'air_freight': return <Plane className="h-4 w-4" />;
      case 'sea_freight': return <Ship className="h-4 w-4" />;
      case 'road_freight': return <Truck className="h-4 w-4" />;
      case 'rail_freight': return <Train className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Status badge colors and icons
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft': 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-300', 
          icon: <Clock className="h-3 w-3" /> 
        };
      case 'sent': 
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-300', 
          icon: <TrendingUp className="h-3 w-3" /> 
        };
      case 'closed': 
        return { 
          color: 'bg-green-100 text-green-800 border-green-300', 
          icon: <CheckCircle className="h-3 w-3" /> 
        };
      case 'cancelled': 
        return { 
          color: 'bg-red-100 text-red-800 border-red-300', 
          icon: <XCircle className="h-3 w-3" /> 
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-300', 
          icon: <Clock className="h-3 w-3" /> 
        };
    }
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {totalCount > 0 ? `${inquiries.length} of ${totalCount} Inquiries` : 'No Inquiries'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inquiries.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference & Title</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Shipper</TableHead>
                    <TableHead>Packages</TableHead>
                    <TableHead>Ready Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => {
                    const statusInfo = getStatusInfo(inquiry.inquiry.status);
                    return (
                      <TableRow 
                        key={inquiry.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleRowClick(inquiry.inquiry.id)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{inquiry.inquiry.referenceNumber}</div>
                            <div className="text-sm text-gray-600 truncate max-w-[200px]">
                              {inquiry.inquiry.title}
                            </div>
                            {!inquiry.viewedAt && (
                              <Badge variant="secondary" className="text-xs">New</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getServiceIcon(inquiry.inquiry.serviceType)}
                            <span className="text-sm capitalize">
                              {inquiry.inquiry.serviceType.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{inquiry.inquiry.originCity}</div>
                            <div className="text-gray-400">↓</div>
                            <div>{inquiry.inquiry.destinationCity}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{inquiry.inquiry.shipperOrganization.name}</div>
                            <div className="text-xs text-gray-600">{inquiry.inquiry.createdBy.name || inquiry.inquiry.createdBy.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{inquiry.inquiry.totalPieces} pcs</div>
                            <div className="text-gray-600">{parseFloat(inquiry.inquiry.totalGrossWeight || '0').toLocaleString()} kg</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(inquiry.inquiry.readyDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusInfo.color} border flex items-center gap-1`}>
                            {statusInfo.icon}
                            {inquiry.inquiry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Showing {startIndex} to {endIndex} of {totalCount} results
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => onPageChange(page)}
                          className="w-8"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}