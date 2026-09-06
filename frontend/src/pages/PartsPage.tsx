import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { PartApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import type { Part } from '../types';

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [stockQty, setStockQty] = useState('0');
  const [saving, setSaving] = useState(false);

  function load() {
    PartApi.list().then(setParts).catch((e) => setError(apiErrorMessage(e)));
  }

  useEffect(load, []);

  async function createPart(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await PartApi.create({
        name, sku,
        unitCost: Number(unitCost),
        stockQty: Number(stockQty),
      });
      setName(''); setSku(''); setUnitCost(''); setStockQty('0');
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const lowStock = parts.filter((p) => p.stockQty <= 10);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="eyebrow">Inventory</div>
          <h1>Parts</h1>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {lowStock.length > 0 && (
        <div className="error-banner" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}>
          {lowStock.length} part{lowStock.length > 1 ? 's' : ''} running low (10 or fewer in stock).
        </div>
      )}

      <div className="detail-grid">
        <table className="card">
          <thead>
            <tr><th>Name</th><th>SKU</th><th>Unit cost</th><th>Stock</th></tr>
          </thead>
          <tbody>
            {parts.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{p.sku}</td>
                <td>${p.unitCost.toFixed(2)}</td>
                <td style={{ color: p.stockQty <= 10 ? 'var(--red-600)' : undefined, fontWeight: 600 }}>
                  {p.stockQty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <div className="section-title">Add a part</div>
          <form onSubmit={createPart} className="card" style={{ padding: 18 }}>
            <div className="field">
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label>SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="field">
                <label>Unit cost ($)</label>
                <input type="number" step="0.01" min="0" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} required />
              </div>
              <div className="field">
                <label>Starting stock</label>
                <input type="number" min="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-accent" type="submit" disabled={saving}>
              {saving ? 'Adding…' : 'Add part'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
