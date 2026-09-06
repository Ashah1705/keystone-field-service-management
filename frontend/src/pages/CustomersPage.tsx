import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CustomerApi } from '../api/endpoints';
import { apiErrorMessage } from '../api/client';
import type { Customer, Site } from '../types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Create customer
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Create site
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');

  // Edit site
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [editSiteName, setEditSiteName] = useState('');
  const [editSiteAddress, setEditSiteAddress] = useState('');

  // Edit customer
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');

  // ------------------------------------------------------------
  // LOAD CUSTOMERS
  // ------------------------------------------------------------

  function loadCustomers() {
    CustomerApi.list(search, page)
      .then((res) => {
        setCustomers(res.content);
        setTotalPages(res.totalPages);
      })
      .catch((e) => setError(apiErrorMessage(e)));
  }

  useEffect(() => {
    loadCustomers();
  }, [page, search]);

  // ------------------------------------------------------------
  // LOAD SITES
  // ------------------------------------------------------------

  useEffect(() => {
    if (selected) {
      CustomerApi.sites(selected.id)
        .then(setSites)
        .catch((e) => setError(apiErrorMessage(e)));
    }
  }, [selected]);

  // ------------------------------------------------------------
  // CREATE CUSTOMER
  // ------------------------------------------------------------

  async function createCustomer(e: FormEvent) {
    e.preventDefault();

    try {
      await CustomerApi.create(newName, newEmail);

      setNewName('');
      setNewEmail('');

      loadCustomers();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // ------------------------------------------------------------
  // UPDATE CUSTOMER
  // ------------------------------------------------------------

  async function updateCustomer(e: FormEvent) {
    e.preventDefault();

    if (!editingCustomer) return;

    try {
      const updated = await CustomerApi.update(
        editingCustomer.id,
        editCustomerName,
        editCustomerEmail
      );

      setCustomers((current) =>
        current.map((c) =>
          c.id === updated.id ? updated : c
        )
      );

      setSelected(updated);

      setEditingCustomer(null);
      setEditCustomerName('');
      setEditCustomerEmail('');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // ------------------------------------------------------------
  // DELETE CUSTOMER
  // ------------------------------------------------------------

  async function deleteCustomer(customer: Customer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`
    );

    if (!confirmed) return;

    try {
      await CustomerApi.delete(customer.id);

      // Remove from customer list
      setCustomers((current) =>
        current.filter((c) => c.id !== customer.id)
      );

      // If deleted customer was selected, clear selection
      if (selected?.id === customer.id) {
        setSelected(null);
        setSites([]);
      }

      // Close edit form if open
      if (editingCustomer?.id === customer.id) {
        setEditingCustomer(null);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // ------------------------------------------------------------
  // CREATE SITE
  // ------------------------------------------------------------

  async function createSite(e: FormEvent) {
    e.preventDefault();

    if (!selected) return;

    try {
      await CustomerApi.addSite(
        selected.id,
        siteName,
        siteAddress
      );

      setSiteName('');
      setSiteAddress('');

      const updated = await CustomerApi.sites(selected.id);
      setSites(updated);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // ------------------------------------------------------------
  // UPDATE SITE
  // ------------------------------------------------------------

  async function updateSite(e: FormEvent) {
    e.preventDefault();

    if (!selected || !editingSite) return;

    try {
      const updated = await CustomerApi.updateSite(
        selected.id,
        editingSite.id,
        editSiteName,
        editSiteAddress
      );

      setSites((current) =>
        current.map((s) =>
          s.id === updated.id ? updated : s
        )
      );

      setEditingSite(null);
      setEditSiteName('');
      setEditSiteAddress('');
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // ------------------------------------------------------------
  // DELETE SITE
  // ------------------------------------------------------------

  async function deleteSite(site: Site) {
    if (!selected) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${site.name}"?`
    );

    if (!confirmed) return;

    try {
      await CustomerApi.deleteSite(
        selected.id,
        site.id
      );

      setSites((current) =>
        current.filter((s) => s.id !== site.id)
      );

      if (editingSite?.id === site.id) {
        setEditingSite(null);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <div className="eyebrow">Accounts</div>
          <h1>Customers & Sites</h1>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="detail-grid">

        {/* ======================================================
            LEFT SIDE - CUSTOMERS
        ====================================================== */}

        <div>

          <table className="card">

            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
              </tr>
            </thead>

            <tbody>

              {customers.map((c) => (

                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{
                    cursor: 'pointer',
                    background:
                      selected?.id === c.id
                        ? 'var(--slate-50)'
                        : undefined
                  }}
                >

                  {/* CUSTOMER NAME */}

                  <td>
                    {c.name}
                  </td>

                  {/* EMAIL + ACTION BUTTONS */}

                  <td>

                    <span>
                      {c.contactEmail}
                    </span>

                    <span className="action-buttons">

                      {/* EDIT CUSTOMER */}

                      <button
                        className="icon-btn icon-btn-edit"
                        type="button"
                        title="Edit customer"
                        aria-label="Edit customer"
                        onClick={(e) => {
                          e.stopPropagation();

                          setEditingCustomer(c);
                          setEditCustomerName(c.name);
                          setEditCustomerEmail(
                            c.contactEmail ?? ''
                          );
                        }}
                      >
                        ✎
                      </button>

                      {/* DELETE CUSTOMER */}

                      <button
                        className="icon-btn icon-btn-delete"
                        type="button"
                        title="Delete customer"
                        aria-label="Delete customer"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomer(c);
                        }}
                      >
                        ×
                      </button>

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {/* ==================================================
              ADD CUSTOMER
          ================================================== */}

          <div className="section-title">
            Add customer
          </div>

          <form
            onSubmit={createCustomer}
            className="card"
            style={{ padding: 16 }}
          >

            <div className="form-row">

              <div className="field">

                <label>Name</label>

                <input
                  value={newName}
                  onChange={(e) =>
                    setNewName(e.target.value)
                  }
                  required
                />

              </div>


              <div className="field">

                <label>Contact email</label>

                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) =>
                    setNewEmail(e.target.value)
                  }
                />

              </div>

            </div>

            <button
              className="btn btn-primary"
              type="submit"
            >
              Add customer
            </button>

          </form>


          {/* ==================================================
              EDIT CUSTOMER
          ================================================== */}

          {editingCustomer && (

            <>
              <div className="section-title">
                Edit customer
              </div>

              <form
                onSubmit={updateCustomer}
                className="card"
                style={{ padding: 16 }}
              >

                <div className="form-row">

                  <div className="field">

                    <label>Name</label>

                    <input
                      value={editCustomerName}
                      onChange={(e) =>
                        setEditCustomerName(e.target.value)
                      }
                      required
                    />

                  </div>


                  <div className="field">

                    <label>Contact email</label>

                    <input
                      type="email"
                      value={editCustomerEmail}
                      onChange={(e) =>
                        setEditCustomerEmail(e.target.value)
                      }
                    />

                  </div>

                </div>


                <button
                  className="btn btn-primary"
                  type="submit"
                >
                  Save changes
                </button>


                <button
                  className="btn"
                  type="button"
                  style={{ marginLeft: 8 }}
                  onClick={() =>
                    setEditingCustomer(null)
                  }
                >
                  Cancel
                </button>

              </form>

            </>

          )}

        </div>


        {/* ======================================================
            RIGHT SIDE - SITES
        ====================================================== */}

        <div>

          {selected ? (

            <>

              <div className="section-title">
                Sites for {selected.name}
              </div>


              {/* SITES */}

              {sites.map((s) => (

                <div
                  className="card"
                  key={s.id}
                  style={{
                    padding: '10px 14px',
                    marginBottom: 8
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >

                    {/* SITE INFORMATION */}

                    <div>

                      <strong>
                        {s.name}
                      </strong>

                      <div
                        style={{
                          fontSize: 12.5,
                          color: 'var(--ink-600)'
                        }}
                      >
                        {s.address}
                      </div>

                    </div>


                    {/* SITE ACTION BUTTONS */}

                    <div className="action-buttons">

                      {/* EDIT SITE */}

                      <button
                        className="icon-btn icon-btn-edit"
                        type="button"
                        title="Edit site"
                        aria-label="Edit site"
                        onClick={() => {
                          setEditingSite(s);
                          setEditSiteName(s.name);
                          setEditSiteAddress(s.address);
                        }}
                      >
                        ✎
                      </button>


                      {/* DELETE SITE */}

                      <button
                        className="icon-btn icon-btn-delete"
                        type="button"
                        title="Delete site"
                        aria-label="Delete site"
                        onClick={() => deleteSite(s)}
                      >
                        ×
                      </button>

                    </div>

                  </div>

                </div>

              ))}


              {/* ==================================================
                  EDIT SITE
              ================================================== */}

              {editingSite && (

                <>

                  <div className="section-title">
                    Edit site
                  </div>

                  <form
                    onSubmit={updateSite}
                    className="card"
                    style={{
                      padding: 16,
                      marginTop: 10
                    }}
                  >

                    <div className="field">

                      <label>
                        Site name
                      </label>

                      <input
                        value={editSiteName}
                        onChange={(e) =>
                          setEditSiteName(e.target.value)
                        }
                        required
                      />

                    </div>


                    <div className="field">

                      <label>
                        Address
                      </label>

                      <input
                        value={editSiteAddress}
                        onChange={(e) =>
                          setEditSiteAddress(e.target.value)
                        }
                        required
                      />

                    </div>


                    <button
                      className="btn btn-accent"
                      type="submit"
                    >
                      Save changes
                    </button>


                    <button
                      className="btn"
                      type="button"
                      style={{ marginLeft: 8 }}
                      onClick={() =>
                        setEditingSite(null)
                      }
                    >
                      Cancel
                    </button>

                  </form>

                </>

              )}


              {/* ==================================================
                  ADD SITE
              ================================================== */}

              <form
                onSubmit={createSite}
                className="card"
                style={{
                  padding: 16,
                  marginTop: 10
                }}
              >

                <div className="field">

                  <label>
                    Site name
                  </label>

                  <input
                    value={siteName}
                    onChange={(e) =>
                      setSiteName(e.target.value)
                    }
                    required
                  />

                </div>


                <div className="field">

                  <label>
                    Address
                  </label>

                  <input
                    value={siteAddress}
                    onChange={(e) =>
                      setSiteAddress(e.target.value)
                    }
                    required
                  />

                </div>


                <button
                  className="btn btn-accent"
                  type="submit"
                >
                  Add site
                </button>

              </form>

            </>

          ) : (

            <div className="empty-state">
              Select a customer to manage its sites.
            </div>

          )}

        </div>

      </div>


      {/* ========================================================
          PAGINATION
      ======================================================== */}

      {totalPages > 1 && (

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginTop: 20
          }}
        >

          <button
            className="btn"
            type="button"
            disabled={page === 0}
            onClick={() =>
              setPage((current) => current - 1)
            }
          >
            ← Previous
          </button>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--ink-400)'
            }}
          >
            Page {page + 1} of {totalPages}
          </span>

          <button
            className="btn"
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() =>
              setPage((current) => current + 1)
            }
          >
            Next →
          </button>

        </div>

      )}

    </div>
  );
}