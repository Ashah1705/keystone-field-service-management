import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkOrderApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import type { WorkOrderStatus, WorkOrderSummary } from '../types';
import { PriorityChip, BreachChip } from '../components/Chips';
import NewWorkOrderModal from '../components/NewWorkOrderModal';

const COLUMNS: WorkOrderStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED'];

export default function BoardPage() {
  const [orders, setOrders] = useState<WorkOrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  function load() {
    WorkOrderApi.list({ q: query || undefined, size: 200 })
      .then((res) => setOrders(res.content))
      .catch((e) => setError(apiErrorMessage(e)));
  }

  useEffect(load, [query]);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Dispatch</div>
          <h1>Work Order Board</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            placeholder="Search title or code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 220 }}
          />
          <button className="btn btn-accent" onClick={() => setShowNew(true)}>+ New work order</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="board">
        {COLUMNS.map((status) => {
          const items = orders.filter((o) => o.status === status);
          return (
            <div key={status} className="board-column">
              <div className="board-column-header">
                <span>{status.replace('_', ' ')}</span>
                <span className="board-column-count">{items.length}</span>
              </div>
              {items.map((wo) => (
                <div key={wo.id} className="ticket" onClick={() => navigate(`/work-orders/${wo.id}`)}>
                  <div className="ticket-code">{wo.code}</div>
                  <div className="ticket-title">{wo.title}</div>
                  <div className="ticket-meta">
                    <PriorityChip priority={wo.priority} />
                    {wo.slaBreached && <BreachChip />}
                  </div>
                  <div className="ticket-meta" style={{ marginTop: 6 }}>
                    {wo.assignedToName ?? 'Unassigned'} · {wo.siteName}
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--ink-400)', padding: '8px 4px' }}>No jobs</div>
              )}
            </div>
          );
        })}
      </div>

      {showNew && (
        <NewWorkOrderModal
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
        />
      )}
    </div>
  );
}
