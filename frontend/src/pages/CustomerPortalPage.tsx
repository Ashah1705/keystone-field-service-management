import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkOrderApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import type { WorkOrderSummary } from '../types';
import { PriorityChip, StatusChip } from '../components/Chips';
import NewWorkOrderModal from '../components/NewWorkOrderModal';

export default function CustomerPortalPage() {
  const [orders, setOrders] = useState<WorkOrderSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  function load() {
    WorkOrderApi.list({ size: 200 })
      .then((res) => setOrders(res.content))
      .catch((e) => setError(apiErrorMessage(e)));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Self-service</div>
          <h1>My Requests</h1>
        </div>
        <button className="btn btn-accent" onClick={() => setShowNew(true)}>+ Raise a request</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="glyph">—</div>
          No requests yet. Raise one when something needs attention.
        </div>
      ) : (
        <table className="card">
          <thead>
            <tr>
              <th>Code</th><th>Title</th><th>Site</th><th>Priority</th><th>Status</th><th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((wo) => (
              <tr key={wo.id} onClick={() => navigate(`/work-orders/${wo.id}`)} style={{ cursor: 'pointer' }}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{wo.code}</td>
                <td>{wo.title}</td>
                <td>{wo.siteName}</td>
                <td><PriorityChip priority={wo.priority} /></td>
                <td><StatusChip status={wo.status} /></td>
                <td>{new Date(wo.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showNew && (
        <NewWorkOrderModal
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
        />
      )}
    </div>
  );
}
