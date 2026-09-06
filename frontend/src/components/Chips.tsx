import type { Priority, WorkOrderStatus } from '../types';

export function StatusChip({ status }: { status: WorkOrderStatus }) {
  return <span className={`chip chip-${status}`}>{status.replace('_', ' ')}</span>;
}

export function PriorityChip({ priority }: { priority: Priority }) {
  return <span className={`chip chip-priority-${priority}`}>{priority}</span>;
}

export function BreachChip() {
  return <span className="chip chip-breach">SLA breach</span>;
}
