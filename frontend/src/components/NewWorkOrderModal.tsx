import { useEffect, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { CustomerApi, WorkOrderApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Customer, Priority, Site } from '../types';

const overlayStyle: CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(18,22,28,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
};

export default function NewWorkOrderModal({
  onClose, onCreated, fixedCustomerId,
}: {
  onClose: () => void;
  onCreated: () => void;
  fixedCustomerId?: number;
}) {
  const { role } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [customerId, setCustomerId] = useState<number | ''>(fixedCustomerId ?? '');
  const [siteId, setSiteId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role !== 'CUSTOMER') {
      CustomerApi.list().then((res) => setCustomers(res.content)).catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    if (customerId) {
      CustomerApi.sites(Number(customerId)).then(setSites).catch(() => {});
    } else {
      setSites([]);
    }
  }, [customerId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customerId || !siteId) {
      setError('Choose a customer and site');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await WorkOrderApi.create({
        title, description, priority,
        customerId: Number(customerId), siteId: Number(siteId),
      });
      onCreated();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div className="card" style={{ width: 460, padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 4 }}>Raise a work order</h3>
        <p style={{ color: 'var(--ink-600)', fontSize: 12.5, marginTop: 0, marginBottom: 18 }}>
          Enters the pipeline as <strong>NEW</strong> and gets an SLA due date from its priority.
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!fixedCustomerId && (
            <div className="field">
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : '')} required>
                <option value="">Select a customer…</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div className="field">
            <label>Site</label>
            <select value={siteId} onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : '')} required disabled={!customerId}>
              <option value="">Select a site…</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={255} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="field">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={saving}>
              {saving ? 'Raising…' : 'Raise work order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
