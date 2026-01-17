import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function Cart() {
  const { shopId } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get(`/cart/${shopId}`).then(res => setItems(res.data.items));
  }, [shopId]);

  const updateQty = async (productId, qty) => {
    const res = await api.post("/cart/update", {
      shopId,
      productId,
      quantity: qty
    });
    setItems(res.data.items);
  };

  const uploadPrescription = async (productId, file) => {
    const data = new FormData();
    data.append("productId", productId);
    data.append("image", file);
    await api.post("/prescriptions/upload", data);
    alert("Prescription uploaded");
  };

  const generateToken = async () => {
    await api.post(`/tokens/${shopId}/join`);
    alert("Token generated");
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Your Cart</h1>

      {items.map(item => (
        <div key={item.productId} className="border p-3 rounded">
          <p className="font-medium">{item.name}</p>

          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={e =>
              updateQty(item.productId, Number(e.target.value))
            }
            className="border p-1 w-20"
          />

          {item.requiresPrescription && (
            <input
              type="file"
              onChange={e =>
                uploadPrescription(item.productId, e.target.files[0])
              }
              className="mt-2"
            />
          )}
        </div>
      ))}

      <button
        onClick={generateToken}
        className="bg-green-600 text-white px-5 py-2 rounded"
      >
        Generate Token
      </button>
    </div>
  );
}
