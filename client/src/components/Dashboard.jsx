import { useState, useEffect } from "react";
import Header from "./Header";
import SupplierCard from "./SupplierCard";

const API_URL = "http://localhost:5000/api/suppliers";

function Dashboard() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    contactPerson: "",
    category: "",
    status: "Pending",
  });

  async function fetchSuppliers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch suppliers");
      }

      setSuppliers(data.suppliers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
  async function loadSuppliers() {
    await fetchSuppliers();
  }

  loadSuppliers();
}, []);

  function handleEdit(supplier) {
    setEditingSupplier(supplier);

    setForm({
      name: supplier.name || "",
      email: supplier.email || "",
      contactPerson: supplier.contactPerson || "",
      category: supplier.category || "",
      status: supplier.status || "Pending",
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleUpdate(event) {
    event.preventDefault();

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${editingSupplier._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Update failed");
      }

      setEditingSupplier(null);
      await fetchSuppliers();
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

      const response = await fetch(`${API_URL}/${supplier._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Delete failed");
      }

      await fetchSuppliers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div id="dashboard">
      <Header />

      <main id="suppliers">
        <h2>Supplier Dashboard</h2>

        {error && <p role="alert">{error}</p>}

        {loading ? (
          <p>Loading suppliers...</p>
        ) : (
          <div className="supplier-list">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier._id}
                supplier={{
                  ...supplier,
                  id: supplier._id,
                  quality: supplier.quality ?? 0,
                  delivery: supplier.delivery ?? 0,
                  cost: supplier.cost ?? 0,
                  score: supplier.score ?? 0,
                }}
                onEdit={() => handleEdit(supplier)}
                onDelete={() => handleDelete(supplier)}
              />
            ))}

            {suppliers.length === 0 && <p>No suppliers found.</p>}
          </div>
        )}

        {editingSupplier && (
          <section>
            <h3>Edit Supplier</h3>

            <form onSubmit={handleUpdate}>
              <label>
                Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Contact Person
                <input
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Category
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </label>

              <button type="submit">Save Changes</button>

              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
              >
                Cancel
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
