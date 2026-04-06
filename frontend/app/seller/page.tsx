"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SellerPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    category: ""
  });

 const [sellerId, setSellerId] = useState("");

useEffect(() => {
  const id = localStorage.getItem("userId");
  if (id) setSellerId(id);
}, []);

  // ➕ ADD PRODUCT
 const addProduct = async () => {
  try {
    if (!sellerId) {
      alert("Seller not logged in ❌");
      return;
    }

    await axios.post("http://localhost:3002/api/products", {
      ...form,
      price: Number(form.price), // ✅ IMPORTANT
      sellerId
    });

    alert("Product added ✅");

    setForm({ name: "", price: "", image: "", category: "" });

    fetchProducts();
  } catch (err) {
    console.log(err.response?.data || err.message); // 🔥 DEBUG
    alert(err.response?.data?.error || "Error ❌");
  }
};

  // ❌ DELETE
  const deleteProduct = async (id: string) => {
    await axios.delete(`http://localhost:3002/api/products/${id}`);
    fetchProducts();
  };

  // 📦 FETCH PRODUCTS
  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:3002/api/products");
    setProducts(res.data.filter((p: any) => p.sellerId === sellerId));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h2 className="text-2xl font-semibold mb-6">Seller Dashboard 🛍️</h2>

      {/* ADD PRODUCT CARD */}
      <Card className="mb-8">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-medium">Add Product</h3>

          <Input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <Input
            placeholder="Image URL"
            value={form.image}
            onChange={(e) =>
              setForm({ ...form, image: e.target.value })
            }
          />

          <Input
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />

          <Button onClick={addProduct}>Add Product</Button>
        </CardContent>
      </Card>

      {/* PRODUCTS GRID */}
      <h3 className="text-lg font-semibold mb-4">My Products</h3>

      {products.length === 0 && (
        <p className="text-muted-foreground">No products yet</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <Card key={p._id}>
            <CardContent className="p-0">

              {/* IMAGE */}
              <img
                src={p.image}
                className="w-full h-60 object-cover rounded-t-md"
              />

              {/* CONTENT */}
              <div className="p-3">
                <p className="text-sm text-muted-foreground uppercase">
                  {p.category}
                </p>

                <h4 className="font-medium">{p.name}</h4>

                <p className="text-lg font-semibold mt-1">
                  ₹{p.price}
                </p>

                <Button
                  variant="destructive"
                  className="mt-3 w-full"
                  onClick={() => deleteProduct(p._id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}