import { api } from './client';
import type {
  Customer, DashboardSummary, LoginResponse, PageResponse, Part, Site,
  Technician, WorkOrderDetail, WorkOrderStatus, WorkOrderSummary,
} from '../types';

export const AuthApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }).then((r) => r.data),
};

export const CustomerApi = {
  list: (q?: string, page = 0, size = 10) =>
  api.get<PageResponse<Customer>>('/api/customers', {
    params: { q, page, size }
  }).then((r) => r.data),

  create: (name: string, contactEmail: string) =>
    api.post<Customer>('/api/customers', { name, contactEmail }).then((r) => r.data),

  update: (customerId: number, name: string, contactEmail: string) =>
    api.put<Customer>(`/api/customers/${customerId}`, { name, contactEmail }).then((r) => r.data),

  sites: (customerId: number) =>
    api.get<Site[]>(`/api/customers/${customerId}/sites`).then((r) => r.data),

  addSite: (customerId: number, name: string, address: string) =>
    api.post<Site>(`/api/customers/${customerId}/sites`, { name, address }).then((r) => r.data),

  updateSite: (customerId: number, siteId: number, name: string, address: string) =>
    api.put<Site>(`/api/customers/${customerId}/sites/${siteId}`, { name, address }).then((r) => r.data),

  delete: (id: number) =>
  api.delete(`/api/customers/${id}`),

deleteSite: (customerId: number, siteId: number) =>
  api.delete(`/api/customers/${customerId}/sites/${siteId}`),
};

export const PartApi = {
  list: () => api.get<Part[]>('/api/parts').then((r) => r.data),
  create: (payload: { name: string; sku: string; unitCost: number; stockQty: number }) =>
    api.post<Part>('/api/parts', payload).then((r) => r.data),
};

export const UserApi = {
  technicians: () => api.get<Technician[]>('/api/users/technicians').then((r) => r.data),
};

export const WorkOrderApi = {
  list: (params: { status?: WorkOrderStatus; q?: string; page?: number; size?: number }) =>
    api.get<PageResponse<WorkOrderSummary>>('/api/work-orders', { params }).then((r) => r.data),
  get: (id: number) => api.get<WorkOrderDetail>(`/api/work-orders/${id}`).then((r) => r.data),
  create: (payload: { title: string; description?: string; priority: string; customerId: number; siteId: number }) =>
    api.post<WorkOrderDetail>('/api/work-orders', payload).then((r) => r.data),
  update: (id: number, payload: { title: string; description?: string; priority: string }) =>
    api.put<WorkOrderDetail>(`/api/work-orders/${id}`, payload).then((r) => r.data),
  assign: (id: number, technicianId: number) =>
    api.post<WorkOrderDetail>(`/api/work-orders/${id}/assign`, { technicianId }).then((r) => r.data),
  changeStatus: (id: number, toStatus: WorkOrderStatus, note?: string) =>
    api.post<WorkOrderDetail>(`/api/work-orders/${id}/status`, { toStatus, note }).then((r) => r.data),
  logParts: (id: number, partId: number, qtyUsed: number) =>
    api.post<WorkOrderDetail>(`/api/work-orders/${id}/parts`, { partId, qtyUsed }).then((r) => r.data),
  logTime: (id: number, minutes: number, note?: string) =>
    api.post<WorkOrderDetail>(`/api/work-orders/${id}/time`, { minutes, note }).then((r) => r.data),
};

export const ReportApi = {
  summary: () => api.get<DashboardSummary>('/api/reports/summary').then((r) => r.data),
};
