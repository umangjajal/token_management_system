import { useState } from "react";
import api from "../services/api";

export default function AddProduct({ shopId }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ unit: "pcs" });

  const search = async (q) => {
    setQuery(q);
    if (q.length < 2) return;
    const res = await api.get(`/master-products/search?q=${q}`);
    setSuggestions(res.data);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  await api.post(`/products/${shopId}`, formData);
};
  return (
    <div className="max-w-xl mx-auto p-4 space-y-3">
      <input
        placeholder="Search common product"
        value={query}
        onChange={e => search(e.target.value)}
        className="border p-2 w-full"
      />

      {suggestions.map(p => (
        <div
          key={p._id}
          onClick={() =>
            setForm({
              name: p.name,
              whyPurchase: p.whyPurchase,
              masterProductId: p._id
            })
          }
          className="border p-2 cursor-pointer"
        >
          {p.name}
        </div>
      ))}
<form
  onSubmit={handleSubmit}
  encType="multipart/form-data"
>
  <input type="file" name="image" accept="image/*" required />

  <input name="name" required />
  <input name="price" />
  <input name="unit" />
  <input name="stock" />
  <textarea name="description" />
  <textarea name="whyPurchase" />

  <button>Add product</button>
</form>

    </div>
  );
}
