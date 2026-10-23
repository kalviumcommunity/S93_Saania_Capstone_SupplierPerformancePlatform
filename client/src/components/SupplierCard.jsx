function SupplierCard({ supplier }) {
  return (
    <article className="supplier-card">
      <h3>{supplier.name}</h3>
      <p>Quality: {supplier.quality}%</p>
      <p>Delivery: {supplier.delivery}%</p>
      <p>Cost Score: {supplier.cost}%</p>
      <strong>Overall Score: {supplier.score}%</strong>
    </article>
  );
}

export default SupplierCard;