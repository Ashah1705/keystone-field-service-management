export type Role = 'DISPATCHER' | 'TECHNICIAN' | 'MANAGER' | 'CUSTOMER';

export type WorkOrderStatus =
  | 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED' | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface LoginResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
  expiresInMinutes: number;
}

export interface Customer {
  id: number;
  name: string;
  contactEmail?: string;
  createdAt: string;
}

export interface Site {
  id: number;
  customerId: number;
  name: string;
  address: string;
}

export interface Part {
  id: number;
  name: string;
  sku: string;
  unitCost: number;
  stockQty: number;
}

export interface StatusHistoryEntry {
  fromStatus: WorkOrderStatus | null;
  toStatus: WorkOrderStatus;
  changedBy: string;
  changedAt: string;
  note: string | null;
}

export interface WorkOrderSummary {
  id: number;
  code: string;
  title: string;
  priority: Priority;
  status: WorkOrderStatus;
  customerId: number;
  customerName: string;
  siteId: number;
  siteName: string;
  assignedToId: number | null;
  assignedToName: string | null;
  slaDueAt: string | null;
  slaBreached: boolean;
  updatedAt: string;
}

export interface WorkOrderDetail extends WorkOrderSummary {
  description: string | null;
  partsCost: number;
  totalMinutes: number;
  createdAt: string;
  history: StatusHistoryEntry[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DashboardSummary {
  countsByStatus: Record<string, number>;
  overdueCount: number;
  slaCompliancePercent: number;
}

export interface Technician {
  id: number;
  name: string;
  email: string;
}
