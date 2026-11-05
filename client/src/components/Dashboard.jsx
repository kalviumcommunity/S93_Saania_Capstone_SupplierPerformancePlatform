import { useState, useEffect } from "react";
import Header from "./Header";
import SupplierCard from "./SupplierCard";

const API_URL = "http://localhost:5000/api/suppliers";
const PERFORMANCE_URL = "http://localhost:5000/api/performance";

const emptyForm = {
  name: "",
  email: "",
  contactPerson: "",
  category: "",
  status: "Pending",
};

function Dashboard({ token, onLogout }) {
  const [suppliers, setSuppliers] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const supplierResponse = await fetch(API_URL, { headers });
      const supplierData = await supplierResponse.json();

      if (!supplierResponse.ok) {
        throw new Error(
          supplierData.message || "Failed to load suppliers"
        );
      }

      setSuppliers(supplierData.suppliers || []);

      // Performance records are optional for this dashboard.
      try {
        const performanceResponse = await fetch(PERFORMANCE_URL, {
          headers,
        });

        if (performanceResponse.ok) {
          const performanceData = await performanceResponse.json();

          setPerformances(
            Array.isArray(performanceData)
              ? performanceData
              : performanceData.performances || []
          );
        } else {
          setPerformances([]);
        }
      } catch {
        setPerformances([]);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const supplierResponse = await fetch(API_URL, { headers });
        const supplierData = await supplierResponse.json();

        if (!supplierResponse.ok) {
          throw new Error(
            supplierData.message || "Failed to load suppliers"
          );
        }

        let performanceRecords = [];

        try {
          const performanceResponse = await fetch(PERFORMANCE_URL, {
            headers,
          });

          if (performanceResponse.ok) {
            const performanceData = await performanceResponse.json();

            performanceRecords = Array.isArray(performanceData)
              ? performanceData
              : performanceData.performances || [];
          }
        } catch {
          performanceRecords = [];
        }

        if (!ignore) {
          setSuppliers(supplierData.suppliers || []);
          setPerformances(performanceRecords);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load dashboard");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [token]);

  function getPerformance(supplierId) {
    return performances.find((record) => {
      const recordSupplierId =
        typeof record.supplier === "object"
          ? record.supplier?._id
          : record.supplier;

      return String(recordSupplierId) === String(supplierId);
    });
  }

  function openAddForm() {
    setEditingSupplier(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function handleEdit(supplier) {
    setEditingSupplier(supplier);

    setForm({
      name: supplier.name || "",
      email: supplier.email || "",
      contactPerson: supplier.contactPerson || "",
      category: supplier.category || "",
      status: supplier.status || "Pending",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");
      setSuccess("");

      const isEditing = Boolean(editingSupplier);

      const response = await fetch(
        isEditing ? `${API_URL}/${editingSupplier._id}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to save supplier"
        );
      }

      setShowForm(false);
      setEditingSupplier(null);
      setForm(emptyForm);

      setSuccess(
        isEditing
          ? "Supplier updated successfully."
          : "Supplier added successfully."
      );

      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(supplier) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${supplier.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${supplier._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to delete supplier"
        );
      }

      setSuccess("Supplier deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      supplier.name?.toLowerCase().includes(searchText) ||
      supplier.email?.toLowerCase().includes(searchText) ||
      supplier.category?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = suppliers.filter(
    (supplier) => supplier.status === "Active"
  ).length;

  const pendingCount = suppliers.filter(
    (supplier) => supplier.status === "Pending"
  ).length;

  const evaluatedCount = suppliers.filter(
    (supplier) => getPerformance(supplier._id)
  ).length;

  return (
    <div className="dashboard-layout">
      <Header onLogout={onLogout} />

      <main className="main-content" id="dashboard">
        <div className="top-heading">
          <div>
            <p className="page-kicker">WORKSPACE / OVERVIEW</p>
            <h1>Good to see you.</h1>
            <p className="page-subtitle">
              Here's your supplier overview.
            </p>
          </div>

          <button className="add-button" onClick={openAddForm}>
            <span>+</span> Add Supplier
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <section className="stats-grid">
          <article className="stat-card stat-primary">
            <div className="stat-top">
              <span>Total Suppliers</span>
              <span className="stat-icon">♙</span>
            </div>
            <strong>{suppliers.length}</strong>
            <small>All registered suppliers</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Active</span>
              <span className="stat-icon green-icon">✓</span>
            </div>
            <strong>{activeCount}</strong>
            <small>Currently active</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Pending</span>
              <span className="stat-icon gold-icon">◷</span>
            </div>
            <strong>{pendingCount}</strong>
            <small>Awaiting activation</small>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Evaluated</span>
              <span className="stat-icon purple-icon">↗</span>
            </div>
            <strong>{evaluatedCount}</strong>
            <small>With performance records</small>
          </article>
        </section>

        <section className="supplier-section" id="suppliers">
          <div className="section-heading">
            <div>
              <p className="page-kicker">YOUR DIRECTORY</p>
              <h2>Suppliers</h2>
              <p>Manage and review your supplier records.</p>
            </div>

            <span className="supplier-count">
              {filteredSuppliers.length} records
            </span>
          </div>

          <div className="toolbar">
            <div className="search-field">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search suppliers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="status-filter"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">Loading suppliers...</div>
          ) : filteredSuppliers.length > 0 ? (
            <div className="supplier-list">
              {filteredSuppliers.map((supplier) => (
                <SupplierCard
                  key={supplier._id}
                  supplier={{
                    ...supplier,
                    performance: getPerformance(supplier._id),
                  }}
                  token={token}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-symbol">SP</div>
              <h3>No suppliers found</h3>
              <p>
                {suppliers.length === 0
                  ? "Add your first supplier to get started."
                  : "Try another search or status filter."}
              </p>

              {suppliers.length === 0 && (
                <button className="add-button" onClick={openAddForm}>
                  + Add Supplier
                </button>
              )}
            </div>
          )}
        </section>

        <section className="performance-panel" id="performance">
          <div>
            <p className="page-kicker">PERFORMANCE</p>
            <h2>Supplier Evaluation</h2>
            <p>
              {evaluatedCount} of {suppliers.length} suppliers have
              performance records.
            </p>
          </div>

          <div className="evaluation-number">
            <strong>{evaluatedCount}</strong>
            <span>Evaluated</span>
          </div>
        </section>
      </main>

      {showForm && (
        <div className="modal-overlay">
          <section className="supplier-modal">
            <div className="modal-heading">
              <div>
                <p className="page-kicker">
                  {editingSupplier ? "EDIT RECORD" : "NEW RECORD"}
                </p>
                <h2>
                  {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                </h2>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form className="supplier-form" onSubmit={handleSubmit}>
              <label>
                Supplier Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </label>

              <label>
                Contact Person
                <input
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Enter contact person"
                  required
                />
              </label>

              <label>
                Category
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Enter category"
                  required
                />
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="add-button">
                  {editingSupplier ? "Save Changes" : "Add Supplier"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard;