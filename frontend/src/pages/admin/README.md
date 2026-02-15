# Admin Pages - Nibanky Banking System

## Overview
This directory contains 6 admin pages for managing the Nibanky banking system.

## Pages

### 1. AdminDashboard.jsx
**Route:** `/admin` or `/admin/dashboard`

Main admin dashboard with:
- Total users, transactions, and volume statistics
- Simple bar charts for transaction distribution
- Recent pending transactions (last 5)
- Recent pending KYCs (last 5)
- Real-time stats using `adminGetStats`

**Features:**
- Auto-refresh statistics
- Quick navigation to other admin pages
- Visual progress bars for pending items

---

### 2. AdminUsers.jsx
**Route:** `/admin/users`

User management interface with:
- Paginated user list table
- Filters: KYC status, active/inactive
- Search by email, CPF, or name
- User details modal
- Balance adjustment functionality
- Activate/deactivate users

**Actions:**
- View user details
- Toggle user active status
- Adjust user balance
- Filter and search users

---

### 3. AdminKyc.jsx
**Route:** `/admin/kyc`

KYC verification management with:
- Card-based layout for KYC submissions
- Tabs: Pending, Approved, Rejected
- Document image viewer
- Approve/reject actions
- Rejection reason textarea

**Features:**
- View document images (front, back, selfie)
- Approve KYC with one click
- Reject with detailed reason
- Filter by status

---

### 4. AdminTransactions.jsx
**Route:** `/admin/transactions`

Transaction management with:
- Paginated transaction table
- Filters: type, status, user email
- Search by transaction ID or email
- Transaction details modal
- Cancel pending transactions
- Export placeholder button

**Features:**
- View full transaction details
- Cancel pending transactions
- Filter by multiple criteria
- View gateway transaction IDs
- View metadata

---

### 5. AdminGateway.jsx
**Route:** `/admin/gateway`

Gateway configuration interface with:
- Current configuration overview
- Edit form for credentials
- Environment selector (sandbox/production)
- Active/inactive toggle
- Test connection button

**Configuration Fields:**
- API Key
- API Secret (password field)
- Webhook URL
- Environment (sandbox/production)
- Active status

**Features:**
- Visual status indicators
- Warning for production mode
- Information cards with tips
- Test connection (placeholder)

---

### 6. AdminLogs.jsx
**Route:** `/admin/logs`

Gateway logs viewer with:
- Paginated logs table
- Filters: type, status, date range
- Search by transaction ID or gateway ID
- Color-coded status indicators
- JSON viewer for request/response

**Features:**
- Status colors: success (green), error (red), pending (yellow)
- Formatted JSON display in modal
- Date range filtering
- Request/response data viewer
- Error details viewer

---

## Common Features

All admin pages include:
- **Authentication Check:** Redirects to `/` if `!user?.is_admin`
- **Loading States:** Spinner during data fetch
- **Error Handling:** Error messages in red alert boxes
- **Responsive Design:** Works on desktop and mobile
- **Framer Motion:** Smooth animations and transitions
- **Pagination:** For large datasets (where applicable)
- **Confirmation Dialogs:** For destructive actions

## Usage

### Import
```javascript
import { AdminDashboard, AdminUsers, AdminKyc, AdminTransactions, AdminGateway, AdminLogs } from './pages/admin';
```

### Routes (Example in App.jsx or Routes.jsx)
```javascript
import { AdminDashboard, AdminUsers, AdminKyc, AdminTransactions, AdminGateway, AdminLogs } from './pages/admin';

// In your routes:
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/users" element={<AdminUsers />} />
<Route path="/admin/kyc" element={<AdminKyc />} />
<Route path="/admin/transactions" element={<AdminTransactions />} />
<Route path="/admin/gateway" element={<AdminGateway />} />
<Route path="/admin/logs" element={<AdminLogs />} />
```

## API Services Used

All pages use services from `/services/transactions.js`:

- `adminGetStats()` - Dashboard statistics
- `adminGetUsers(params)` - List users
- `adminGetUser(id)` - Get user details
- `adminUpdateUser(id, data)` - Update user
- `adminGetKYCs(params)` - List KYC submissions
- `adminApproveKYC(id)` - Approve KYC
- `adminRejectKYC(id, reason)` - Reject KYC
- `adminGetTransactions(params)` - List transactions
- `adminCancelTransaction(id)` - Cancel transaction
- `adminGetGatewayConfig()` - Get gateway config
- `adminUpdateGatewayConfig(id, data)` - Update gateway config
- `adminGetGatewayLogs(params)` - Get gateway logs

## Components Used

- `Button` - Reusable button component
- `Card` - Card container component
- `Input` - Form input component
- `Modal` - Modal dialog component

## Icons

Uses `react-icons/fi` (Feather Icons):
- FiUsers, FiDollarSign, FiTrendingUp
- FiSearch, FiChevronLeft, FiChevronRight
- FiCheck, FiX, FiDownload, FiEye
- FiImage, FiAlertCircle

## Styling

All pages use:
- Tailwind CSS utility classes
- Custom CSS classes from existing components
- Consistent color scheme
- Responsive grid layouts

## Security

- All pages check `user.is_admin` on mount
- Redirect to home if not admin
- Confirmation dialogs for destructive actions
- Password fields for sensitive data (API secrets)

## Future Enhancements

- Real export functionality (AdminTransactions)
- Real connection test (AdminGateway)
- Real-time updates with WebSocket
- Advanced filtering options
- Bulk actions
- CSV/Excel export
- Activity logs for admin actions
