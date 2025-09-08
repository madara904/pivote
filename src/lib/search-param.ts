import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs';

export const inquirySearchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  search: parseAsString,
  status: parseAsStringEnum(['draft', 'sent', 'closed', 'cancelled']),
  serviceType: parseAsStringEnum(['air_freight', 'sea_freight', 'road_freight', 'rail_freight']),
  sortBy: parseAsStringEnum(['createdAt', 'readyDate', 'deliveryDate', 'referenceNumber']).withDefault('createdAt'),
  sortOrder: parseAsStringEnum(['asc', 'desc']).withDefault('desc'),
};