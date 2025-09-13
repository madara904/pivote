# Business Logic Implementation Summary

## Overview
This document outlines the comprehensive business logic implementation for the freight inquiry and quotation system, addressing all the requirements specified.

## Status Flow Implementation

### Inquiry Status Flow

#### 1. **Draft** → **Offen** → **Awarded/Closed/Cancelled/Expired**

**Draft Status:**
- Shipper creates inquiry but doesn't send it to forwarders yet
- Inquiry can be edited and modified
- No forwarders can see the inquiry
- Status: `draft`

**Offen Status:**
- Shipper sends inquiry to selected forwarders
- Inquiry becomes visible to selected forwarders
- Forwarders can submit quotations
- Status: `offen`
- Timestamp: `sentAt` is set

**Awarded Status:**
- Shipper accepts one quotation
- All other quotations are automatically rejected
- Inquiry is closed and cannot be modified
- Status: `awarded`
- Timestamp: `closedAt` is set

**Closed Status:**
- Shipper manually closes inquiry (all quotations rejected)
- No quotations were accepted
- Status: `closed`
- Timestamp: `closedAt` is set

**Cancelled Status:**
- Shipper cancels inquiry before awarding
- Cannot cancel if already awarded
- Status: `cancelled`
- Timestamp: `closedAt` is set

**Expired Status:**
- Inquiry expires based on `validityDate`
- Automatically updated when fetching data
- Status: `expired`
- Timestamp: `closedAt` is set

### Quotation Status Flow

#### 1. **Draft** → **Submitted** → **Accepted/Rejected/Withdrawn/Expired**

**Draft Status:**
- Forwarder creates quotation but doesn't submit it
- Quotation can be edited and modified
- Shipper cannot see the quotation
- Status: `draft`

**Submitted Status:**
- Forwarder submits quotation to shipper
- Quotation becomes visible to shipper
- Shipper can accept or reject
- Status: `submitted`
- Timestamp: `submittedAt` is set

**Accepted Status:**
- Shipper accepts the quotation
- All other quotations for the same inquiry are rejected
- Inquiry status changes to `awarded`
- Status: `accepted`
- Timestamp: `respondedAt` is set

**Rejected Status:**
- Shipper rejects the quotation
- Quotation cannot be modified
- Status: `rejected`
- Timestamp: `respondedAt` is set

**Withdrawn Status:**
- Forwarder withdraws quotation before shipper responds
- Cannot withdraw if already accepted or rejected
- Status: `withdrawn`
- Timestamp: `withdrawnAt` is set

**Expired Status:**
- Quotation expires based on `validUntil` date
- Automatically updated when fetching data
- Status: `expired`

## Key Business Rules Implemented

### 1. **Inquiry Creation and Management**
- ✅ **Draft Support**: Shippers can create inquiries as drafts
- ✅ **Send to Forwarders**: Draft inquiries can be sent to selected forwarders
- ✅ **No Modification After Sending**: Inquiries cannot be modified after being sent
- ✅ **Manual Closure**: Shippers can close inquiries manually
- ✅ **Cancellation**: Shippers can cancel inquiries (except if awarded)
- ✅ **Expiration**: Inquiries automatically expire based on validity date

### 2. **Quotation Creation and Management**
- ✅ **Draft Support**: Forwarders can create quotations as drafts
- ✅ **Submit Quotations**: Draft quotations can be submitted to shippers
- ✅ **Withdrawal**: Forwarders can withdraw quotations before shipper responds
- ✅ **No Modification After Submission**: Quotations cannot be modified after submission
- ✅ **Expiration**: Quotations automatically expire based on validUntil date

### 3. **Acceptance and Rejection Logic**
- ✅ **Single Acceptance**: Only one quotation can be accepted per inquiry
- ✅ **Automatic Rejection**: All other quotations are rejected when one is accepted
- ✅ **Inquiry Awarding**: Inquiry status changes to `awarded` when quotation is accepted
- ✅ **Transaction Safety**: All status changes are wrapped in database transactions

### 4. **Expiration Handling**
- ✅ **Automatic Checking**: Expired items are checked when fetching data
- ✅ **Inquiry Expiration**: Based on `validityDate` field
- ✅ **Quotation Expiration**: Based on `validUntil` field
- ✅ **Status Updates**: Expired items are automatically marked as expired

### 5. **Forwarder Inquiry Management**
- ✅ **Inquiry Rejection**: Forwarders can reject inquiries (decline to quote)
- ✅ **View Tracking**: System tracks when forwarders view inquiries
- ✅ **Access Control**: Forwarders can only see inquiries sent to them

## Database Schema Changes

### New Status Enums
```sql
-- Inquiry Status
"draft"        -- Shipper creating inquiry
"offen"        -- Sent to forwarders, open for quotations
"awarded"      -- Shipper accepted a quotation
"closed"       -- All quotations rejected or inquiry manually closed
"cancelled"    -- Inquiry cancelled by shipper
"expired"      -- Inquiry expired by validity date

-- Quotation Status
"draft"        -- Forwarder creating quotation
"submitted"    -- Forwarder submitted quotation (angeboten/ausstehend)
"accepted"     -- Shipper accepted quotation
"rejected"     -- Shipper rejected quotation
"withdrawn"    -- Forwarder withdrew quotation
"expired"      -- Quotation expired by validUntil date
```

### New Fields Added
- `inquiry.sentAt` - When inquiry was sent to forwarders
- `inquiry.closedAt` - When inquiry was closed/awarded
- `quotation.submittedAt` - When quotation was submitted (not default)
- `quotation.withdrawnAt` - When forwarder withdrew quotation

## New tRPC Procedures

### Shipper Procedures
- `createInquiryDraft` - Create inquiry as draft
- `sendInquiryToForwarders` - Send draft inquiry to forwarders
- `closeInquiry` - Close inquiry manually
- `cancelInquiry` - Cancel inquiry

### Forwarder Procedures
- `submitQuotation` - Submit draft quotation
- `withdrawQuotation` - Withdraw quotation
- `rejectInquiry` - Reject inquiry (decline to quote)

### Utility Functions
- `checkAndUpdateExpiredItems` - Check and update expired inquiries and quotations
- `isInquiryExpired` - Check if inquiry is expired
- `isQuotationExpired` - Check if quotation is expired

## Business Logic Compliance

### ✅ **Shipper Workflow**
1. Create inquiry as draft → `draft`
2. Send to forwarders → `offen`
3. Receive quotations → `offen` (status unchanged)
4. Accept quotation → `awarded` (all others rejected)
5. OR reject all → `closed`
6. OR cancel → `cancelled`
7. OR expire → `expired`

### ✅ **Forwarder Workflow**
1. Receive inquiry → View inquiry
2. Create quotation as draft → `draft`
3. Submit quotation → `submitted`
4. Shipper accepts → `accepted`
5. OR shipper rejects → `rejected`
6. OR withdraw → `withdrawn`
7. OR expire → `expired`

### ✅ **Key Business Rules**
- ✅ Inquiries cannot be modified after sending
- ✅ Quotations cannot be modified after submission
- ✅ Only one quotation can be accepted per inquiry
- ✅ All other quotations are rejected when one is accepted
- ✅ Forwarders can withdraw quotations before shipper responds
- ✅ Forwarders can reject inquiries (decline to quote)
- ✅ Expired items are automatically updated
- ✅ Closed/awarded inquiries cannot be reopened
- ✅ Cancelled inquiries cannot be reopened

## Migration Required

The schema changes require a database migration to:
1. Update the status enums
2. Add new timestamp fields
3. Update existing data to use new status values

## Testing Recommendations

1. **Status Transition Testing**: Test all possible status transitions
2. **Expiration Testing**: Test automatic expiration logic
3. **Transaction Testing**: Test that acceptance properly rejects other quotations
4. **Access Control Testing**: Test that users can only access their own data
5. **Edge Case Testing**: Test withdrawal, rejection, and cancellation scenarios

This implementation fully addresses all the business logic requirements specified in the original request.
