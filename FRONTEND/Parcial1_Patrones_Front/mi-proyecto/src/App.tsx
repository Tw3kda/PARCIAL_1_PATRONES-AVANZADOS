import { useEffect, useState,FormEvent } from "react";

interface Order {
  id: number;
  item: string;
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");

  // Cargar pedidos
  const fetchOrders = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/orders")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Agregar pedido
  const handleAddOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    fetch("http://127.0.0.1:8000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: newItem }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(() => {
        setNewItem("");
        fetchOrders(); // recarga los pedidos
      })
      .catch((err) => setError(err.message));
  };

  // Eliminar pedido
  const handleDeleteOrder = (id: number) => {
    fetch(`http://127.0.0.1:8000/api/orders/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(() => fetchOrders())
      .catch((err) => setError(err.message));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>📦 Pedidos</h1>

      <form onSubmit={handleAddOrder} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Nuevo pedido"
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "5px 10px" }}>
          Agregar
        </button>
      </form>

      {loading && <p>Cargando pedidos...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && orders.length === 0 && <p>No hay pedidos disponibles</p>}

      {!loading && !error && orders.length > 0 && (
        <ul>
          {orders.map((order) => (
            <li key={order.id} style={{ marginBottom: "5px" }}>
              #{order.id} - {order.item}{" "}
              <button
                onClick={() => handleDeleteOrder(order.id)}
                style={{ marginLeft: "10px", padding: "2px 5px" }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
