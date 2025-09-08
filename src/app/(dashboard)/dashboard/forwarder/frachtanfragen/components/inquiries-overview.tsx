'use client';

import { useQueryState } from "nuqs";
import { trpc } from "@/trpc/client";
import { InquiriesFilters } from "./inquiries-filters";
import { InquiriesTable } from "./inquiries-table";

export function InquiriesOverview() {
  // nuqs state management
  const [page, setPage] = useQueryState('page', { defaultValue: '1' });
  const [limit] = useQueryState('limit', { defaultValue: '20' });
  const [status, setStatus] = useQueryState('status', { defaultValue: '' });
  const [serviceType, setServiceType] = useQueryState('serviceType', { defaultValue: '' });
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });
  const [sortBy, setSortBy] = useQueryState('sortBy', { defaultValue: 'createdAt' });
  const [sortOrder, setSortOrder] = useQueryState('sortOrder', { defaultValue: 'desc' });


  // Query for inquiries
  const [ data ] = trpc.inquiry.forwarder.getMyInquiries.useSuspenseQuery();

  if (!data)
  {
    return (<p>no Data</p>)
  }

  // Handle filter changes
  const handleStatusChange = (value: string | null) => {
    setStatus(value);
    setPage('1');
  };

  const handleServiceTypeChange = (value: string | null) => {
    setServiceType(value);
    setPage('1');
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setPage('1');
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value);
    setPage('1');
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(String(newPage));
  };

  // Filter and sort data based on current filters
  const filteredData = data ? data.filter(inquiry => {
    const inquiryData = inquiry?.inquiry;
    if (!inquiryData) return false;
    
    // Status filter
    if (status && inquiryData.status !== status) return false;
    
    // Service type filter
    if (serviceType && inquiryData.serviceType !== serviceType) return false;
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        inquiryData.title.toLowerCase().includes(searchLower) ||
        inquiryData.referenceNumber.toLowerCase().includes(searchLower) ||
        inquiryData.description?.toLowerCase().includes(searchLower) ||
        inquiryData.originCity.toLowerCase().includes(searchLower) ||
        inquiryData.destinationCity.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    return true;
  }) : [];



const sortedData = [...filteredData].sort((a, b) => {

  if (!a || !b) return 0;
  
  const aData = a.inquiry;
  const bData = b.inquiry;
  if (!aData || !bData) return 0;
  
  let aValue, bValue;
  
  switch (sortBy) {
    case 'readyDate':
      aValue = new Date(aData.readyDate).getTime();
      bValue = new Date(bData.readyDate).getTime();
      break;
    case 'deliveryDate':
      aValue = aData.deliveryDate ? new Date(aData.deliveryDate).getTime() : 0;
      bValue = bData.deliveryDate ? new Date(bData.deliveryDate).getTime() : 0;
      break;
    case 'referenceNumber':
      aValue = aData.referenceNumber.toLowerCase();
      bValue = bData.referenceNumber.toLowerCase();
      break;
    case 'createdAt':
    default:
      aValue = new Date(aData.createdAt).getTime();
      bValue = new Date(bData.createdAt).getTime();
  }
  

  if (sortOrder === 'asc') {
    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  } else {
    if (aValue > bValue) return -1;
    if (aValue < bValue) return 1;
    return 0;
  }
});

  // Pagination
  const currentPage = parseInt(page);
  const pageSize = parseInt(limit);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);


  const totalPages = Math.ceil(filteredData.length / pageSize);




  return (
    <div className="space-y-6">
      {/* Filters */}
      <InquiriesFilters
        search={search}
        status={status}
        serviceType={serviceType}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={setSearch}
        onStatusChange={handleStatusChange}
        onServiceTypeChange={handleServiceTypeChange}
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />

      {/* Inquiries Table */}
      <InquiriesTable
        inquiries={paginatedData.filter((inquiry): inquiry is NonNullable<typeof inquiry> => inquiry !== null)}
        totalCount={filteredData.length}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
}