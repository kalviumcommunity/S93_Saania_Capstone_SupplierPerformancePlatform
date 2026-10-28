
function SupplierCard({ supplier, onEdit, onDelete }) {
  return (
    <article className="supplier-card">
      <h3>{supplier.name}</h3>
      <p>Quality: {supplier.quality}%</p>
      <p>Delivery: {supplier.delivery}%</p>
      <p>Cost Score: {supplier.cost}%</p>
      <strong>Overall Score: {supplier.score}%</strong>

      <div className="supplier-actions">
        <button onClick={() => onEdit(supplier)}>
          Edit
        </button>

        <button onClick={() => onDelete(supplier.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default SupplierCard;
