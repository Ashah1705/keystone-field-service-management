import { useEffect, useState } from 'react';
import { ReportApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import type { DashboardSummary } from '../types';
import { StatusChip } from '../components/Chips';

const STATUS_ORDER: (keyof DashboardSummary['countsByStatus'])[] =
  ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CLOSED', 'CANCELLED'];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ReportApi.summary().then(setSummary).catch((e) => setError(apiErrorMessage(e)));
  }, []);

  if (error) return <div className="error-banner">{error}</div>;
  if (!summary) return <p>Loading dashboard…</p>;

  const total = Object.values(summary.countsByStatus).reduce((a, b) => a + b, 0);
  const openCount = total - (summary.countsByStatus.CLOSED ?? 0) - (summary.countsByStatus.CANCELLED ?? 0);
  const maxCount = Math.max(1, ...STATUS_ORDER.map((s) => summary.countsByStatus[s] ?? 0));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Operations</div>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Open work orders</div>
          <div className="stat-value">{openCount}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Overdue / at risk</div>
          <div className="stat-value" style={{ color: summary.overdueCount > 0 ? 'var(--red-600)' : undefined }}>
            {summary.overdueCount}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">SLA compliance (est.)</div>
          <div className="stat-value">{summary.slaCompliancePercent}%</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Closed</div>
          <div className="stat-value">{summary.countsByStatus.CLOSED ?? 0}</div>
        </div>
      </div>

      <div className="section-title">Work orders by status</div>
      <div className="card" style={{ padding: '18px 20px' }}>
        {STATUS_ORDER.map((status) => {
          const count = summary.countsByStatus[status] ?? 0;
          return (
            <div key={String(status)} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 130 }}><StatusChip status={status as any} /></div>
              <div style={{ flex: 1, background: 'var(--slate-100)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                <div style={{
                  width: `${(count / maxCount) * 100}%`,
                  background: 'var(--ink-950)',
                  height: '100%',
                  borderRadius: 4,
                }} />
              </div>
              <div style={{ width: 30, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
