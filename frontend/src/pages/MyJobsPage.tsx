import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkOrderApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import type { WorkOrderSummary } from '../types';
import { PriorityChip, StatusChip, BreachChip } from '../components/Chips';

export default function MyJobsPage() {
  const [orders, setOrders] = useState<WorkOrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    WorkOrderApi.list({ size: 200 })
      .then((res) => setOrders(res.content))
      .catch((e) => setError(apiErrorMessage(e)));
  }, []);

  const open = orders.filter((o) => o.status !== 'CLOSED' && o.status !== 'CANCELLED');
  const done = orders.filter((o) => o.status === 'CLOSED' || o.status === 'CANCELLED');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Field view</div>
          <h1>My Jobs</h1>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {open.length === 0 && (
        <div className="empty-state">
          <div className="glyph">—</div>
          Nothing assigned to you right now.
        </div>
      )}

      {open.map((wo) => (
        <div key={wo.id} className="ticket" onClick={() => navigate(`/work-orders/${wo.id}`)} style={{ maxWidth: 480 }}>
          <div className="ticket-code">{wo.code}</div>
          <div className="ticket-title">{wo.title}</div>
          <div className="ticket-meta">
            <StatusChip status={wo.status} />
            <PriorityChip priority={wo.priority} />
            {wo.slaBreached && <BreachChip />}
          </div>
          <div className="ticket-meta" style={{ marginTop: 6 }}>{wo.siteName}</div>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <div className="section-title">Recently finished</div>
          {done.map((wo) => (
            <div key={wo.id} className="ticket" onClick={() => navigate(`/work-orders/${wo.id}`)} style={{ maxWidth: 480, opacity: 0.7 }}>
              <div className="ticket-code">{wo.code}</div>
              <div className="ticket-title">{wo.title}</div>
              <div className="ticket-meta"><StatusChip status={wo.status} /></div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
