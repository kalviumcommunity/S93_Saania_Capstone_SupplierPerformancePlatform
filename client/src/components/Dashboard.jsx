import Header from "./Header";
import SupplierCard from "./SupplierCard";

const suppliers = [
  {
    id: 1,
    name: "ABC Suppliers",
    quality: 90,
    delivery: 85,
    cost: 80,
    score: 85,
  },
  {
    id: 2,
    name: "XYZ Suppliers",
    quality: 82,
    delivery: 92,
    cost: 88,
    score: 87,
  },
];

function Dashboard() {
  return (
    <div id="dashboard">
      <Header />
      <main id="suppliers">
        <h2>Supplier Dashboard</h2>
        <div className="supplier-list">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;