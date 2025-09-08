'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';

interface InquiriesFiltersProps {
  search: string | null;
  status: string | null;
  serviceType: string | null;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (search: string | null) => void;
  onStatusChange: (status: string | null) => void;
  onServiceTypeChange: (serviceType: string | null) => void;
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (sortOrder: string) => void;
}

export function InquiriesFilters({
  search,
  status,
  serviceType,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onServiceTypeChange,
  onSortByChange,
  onSortOrderChange,
}: InquiriesFiltersProps) {
  const [searchInput, setSearchInput] = useState(search || '');

  const handleSearch = () => {
    onSearchChange(searchInput.trim() || null);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearchChange(null);
  };

  return (
    <Card className='border-none'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title, reference number, or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
          {search && (
            <Button variant="outline" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select 
              value={status || 'all'} 
              onValueChange={(value) => onStatusChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Service Type</label>
            <Select 
              value={serviceType || 'all'} 
              onValueChange={(value) => onServiceTypeChange(value === 'all' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                <SelectItem value="air_freight">Air Freight</SelectItem>
                <SelectItem value="sea_freight">Sea Freight</SelectItem>
                <SelectItem value="road_freight">Road Freight</SelectItem>
                <SelectItem value="rail_freight">Rail Freight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="readyDate">Ready Date</SelectItem>
                <SelectItem value="deliveryDate">Delivery Date</SelectItem>
                <SelectItem value="referenceNumber">Reference Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Order</label>
            <Select value={sortOrder} onValueChange={onSortOrderChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}