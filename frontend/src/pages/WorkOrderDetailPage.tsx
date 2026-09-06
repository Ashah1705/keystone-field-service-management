import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PartApi, UserApi, WorkOrderApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Part, Technician, WorkOrderDetail, WorkOrderStatus } from '../types';
import { PriorityChip, StatusChip, BreachChip } from '../components/Chips';

const NEXT_STEPS: Record<WorkOrderStatus, { to: WorkOrderStatus; label: string }[]> = {
  NEW: [],
  ASSIGNED: [{ to: 'IN_PROGRESS', label: 'Start job' }, { to: 'CANCELLED', label: 'Cancel' }],
  IN_PROGRESS: [{ to: 'ON_HOLD', label: 'Put on hold' }, { to: 'COMPLETED', label: 'Mark complete' }],
  ON_HOLD: [{ to: 'IN_PROGRESS', label: 'Resume' }],
  COMPLETED: [{ to: 'CLOSED', label: 'Close job' }, { to: 'IN_PROGRESS', label: 'Reopen' }],
  CLOSED: [],
  CANCELLED: [],
};

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, userId } = useAuth();
  const [wo, setWo] = useState<WorkOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [assignTo, setAssignTo] = useState<number | ''>('');
  const [partId, setPartId] = useState<number | ''>('');
  const [qty, setQty] = useState(1);
  const [minutes, setMinutes] = useState(30);
  const [timeNote, setTimeNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    WorkOrderApi.get(Number(id)).then(setWo).catch((e) => setError(apiErrorMessage(e)));
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    if (role === 'DISPATCHER' || role === 'MANAGER') {
      UserApi.technicians().then(setTechnicians).catch(() => {});
    }
    PartApi.list().then(setParts).catch(() => {});
  }, [role]);

  async function run(action: () => Promise<WorkOrderDetail>) {
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      setWo(updated);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (error && !wo) return <div className="error-banner">{error}</div>;
  if (!wo) return <p>Loading…</p>;

  const isAssignedTechnician = role === 'TECHNICIAN' && wo.assignedToId === userId;
  const canLogWork = isAssignedTechnician || role === 'MANAGER';
  const canDispatch = role === 'DISPATCHER' || role === 'MANAGER';
  const nextSteps = NEXT_STEPS[wo.status].filter((step) => {
  if (step.to === 'CANCELLED') {
    return canDispatch;
  }

  if (step.to === 'CLOSED') {
    return role === 'MANAGER';
  }

  if (step.to === 'IN_PROGRESS' && wo.status === 'COMPLETED') {
    return role === 'MANAGER';
  }

  if (step.to === 'COMPLETED') {
    return isAssignedTechnician;
  }

  if (step.to === 'ON_HOLD') {
    return isAssignedTechnician;
  }

  if (step.to === 'IN_PROGRESS') {
    return isAssignedTechnician || role === 'MANAGER';
  }

  return isAssignedTechnician || role === 'MANAGER';
});

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>← Back</button>

      <div className="page-header">
        <div>
          <div className="eyebrow">{wo.code}</div>
          <h1>{wo.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusChip status={wo.status} />
          <PriorityChip priority={wo.priority} />
          {wo.slaBreached && <BreachChip />}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="detail-grid">
        <div>
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">Details</div>
            <p style={{ marginTop: 0 }}>{wo.description || <em>No description provided.</em>}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
              <div><strong>Customer</strong><br />{wo.customerName}</div>
              <div><strong>Site</strong><br />{wo.siteName}</div>
              <div><strong>Assigned to</strong><br />{wo.assignedToName ?? 'Unassigned'}</div>
              <div><strong>SLA due</strong><br />{fmt(wo.slaDueAt)}</div>
              <div><strong>Parts cost</strong><br />${wo.partsCost.toFixed(2)}</div>
              <div><strong>Time logged</strong><br />{wo.totalMinutes} min</div>
            </div>

            {nextSteps.length > 0 && (
              <>
                <div className="section-title">Move status</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {nextSteps.map((step) => (
                    <button
                      key={step.to}
                      className={step.to === 'CANCELLED' ? 'btn btn-danger' : 'btn btn-primary'}
                      disabled={busy}
                      onClick={() => run(() => WorkOrderApi.changeStatus(wo.id, step.to))}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {canDispatch && !wo.status.match(/CLOSED|CANCELLED/) && (
              <>
                <div className="section-title">{wo.assignedToId ? 'Reassign' : 'Assign'} technician</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={assignTo} onChange={(e) => setAssignTo(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Select technician…</option>
                    {technicians.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button
                    className="btn btn-accent"
                    disabled={!assignTo || busy}
                    onClick={() => run(() => WorkOrderApi.assign(wo.id, Number(assignTo)))}
                  >
                    Assign
                  </button>
                </div>
              </>
            )}

            {canLogWork && (
              <>
                <div className="section-title">Log parts used</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={partId} onChange={(e) => setPartId(e.target.value ? Number(e.target.value) : '')} style={{ flex: 1 }}>
                    <option value="">Select part…</option>
                    {parts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stockQty} in stock)</option>)}
                  </select>
                  <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ width: 70 }} />
                  <button
                    className="btn btn-ghost"
                    disabled={!partId || busy}
                    onClick={() => run(() => WorkOrderApi.logParts(wo.id, Number(partId), qty))}
                  >
                    Log
                  </button>
                </div>

                <div className="section-title">Log time</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="number" min={1} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} style={{ width: 90 }} />
                  <input placeholder="Note (optional)" value={timeNote} onChange={(e) => setTimeNote(e.target.value)} style={{ flex: 1 }} />
                  <button
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => run(() => WorkOrderApi.logTime(wo.id, minutes, timeNote || undefined))}
                  >
                    Log
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div className="section-title">Status history</div>
          {wo.history.length === 0 && <p style={{ color: 'var(--ink-400)', fontSize: 13 }}>No history yet.</p>}
          {wo.history.slice().reverse().map((h, i) => (
            <div className="history-row" key={i}>
              <div className="history-time">{fmt(h.changedAt)}</div>
              <div>
                <strong>{h.fromStatus ?? 'raised'} → {h.toStatus}</strong> by {h.changedBy}
                {h.note && <div style={{ color: 'var(--ink-600)' }}>{h.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
