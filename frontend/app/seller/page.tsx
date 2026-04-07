"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DashboardChatPanel } from "@/components/dashboard-chat-panel";
import { PRODUCT_API, ORDER_API } from "@/lib/api";
import {
  clearSession,
  getSessionUser,
  handleUnauthorizedSession,
  isExpiredSessionError,
} from "@/lib/auth";

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  colors?: string[];
  variants?: Array<{
    color: string;
    image: string;
  }>;
  category?: string;
  status: "PENDING" | "APPROVED";
};

type SellerOrder = {
  _id: string;
  status: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    sellerId: string;
  }>;
  sellerRevenue: number;
};

type SellerAnalytics = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
};

const initialForm = {
  name: "",
  price: "",
  image: "",
  variantLines: "",
  category: "",
  quantity: "",
  description: "",
};

const parseVariantLines = (input: string) =>
  input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [colorPart, ...imageParts] = line.split("|");
      return {
        color: String(colorPart || "").trim(),
        image: imageParts.join("|").trim(),
      };
    })
    .filter((variant) => variant.color && variant.image);

export default function SellerDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [analytics, setAnalytics] = useState<SellerAnalytics>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    monthlyRevenue: [],
  });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const user = getSessionUser();

    if (!user || user.role !== "seller") {
      router.replace("/login");
      return;
    }

    void fetchSellerData();
  }, [router]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const results = await Promise.allSettled([
        PRODUCT_API.get("/seller/me"),
        ORDER_API.get("/seller/orders"),
        ORDER_API.get("/seller/analytics"),
      ]);

      const [productsResult, ordersResult, analyticsResult] = results;

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.data.products || []);
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value.data.orders || []);
      }

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value.data.analytics || analytics);
      }

      const rejected = results.filter((result) => result.status === "rejected");
      if (rejected.length > 0) {
        const firstError = rejected[0].reason;
        if (isExpiredSessionError(firstError)) {
          clearSession();
          router.replace("/login");
          return;
        }

        setPageError(
          firstError?.response?.data?.message ||
            "Some seller sections could not be loaded. Showing available data."
        );
      }
    } catch (error: any) {
      if (isExpiredSessionError(error)) {
        clearSession();
        router.replace("/login");
        return;
      }

      setPageError(error.response?.data?.message || "Failed to load seller dashboard");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async () => {
    const user = getSessionUser();
    if (!user || user.role !== "seller") {
      handleUnauthorizedSession();
      return;
    }

    if (!form.name || !form.price) {
      alert("Product name and price are required");
      return;
    }

    try {
      setSaving(true);
      await PRODUCT_API.post("/", {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity || 0),
        variants: parseVariantLines(form.variantLines),
      });
      setForm(initialForm);
      await fetchSellerData();
    } catch (error: any) {
      if (isExpiredSessionError(error)) {
        handleUnauthorizedSession();
        return;
      }

      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await ORDER_API.patch(`/${id}/status`, { status });
      await fetchSellerData();
    } catch (error: any) {
      if (isExpiredSessionError(error)) {
        handleUnauthorizedSession();
        return;
      }

      alert(error.response?.data?.message || "Failed to update order status");
    }
  };

  if (loading) {
    return <p className="p-8 text-center">Loading seller dashboard...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Seller Workspace
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">Seller Dashboard</h1>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href="#seller-chat">Chat Section</a>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard title="Total Orders" value={analytics.totalOrders} />
          <StatCard title="Pending Orders" value={analytics.pendingOrders} />
          <StatCard title="Total Revenue" value={`₹${analytics.totalRevenue.toFixed(2)}`} />
        </div>

        {pageError ? (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {pageError}
          </div>
        ) : null}

        <div className="mb-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyRevenue}>
                  <defs>
                    <linearGradient id="sellerRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0f766e"
                    fill="url(#sellerRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Product name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <Input
                placeholder="Price"
                type="number"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
              <Input
                placeholder="Image URL"
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
              />
              <Textarea
                placeholder={"Color image pairs (one per line)\nRed | https://example.com/red.jpg\nBlue | https://example.com/blue.jpg"}
                value={form.variantLines}
                onChange={(event) => setForm({ ...form, variantLines: event.target.value })}
                className="min-h-[110px]"
              />
              <Input
                placeholder="Category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              />
              <Input
                placeholder="Stock quantity"
                type="number"
                value={form.quantity}
                onChange={(event) => setForm({ ...form, quantity: event.target.value })}
              />
              <Input
                placeholder="Short description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
              <Button onClick={addProduct} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Create Product"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Your Products</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Card key={product._id}>
                <CardContent className="p-4">
                  <div className="mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm uppercase tracking-wide text-slate-500">
                      {product.category || "General"}
                    </p>
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="font-semibold">₹{product.price}</p>
                    <p className="text-sm text-slate-500">Status: {product.status}</p>
                    {product.colors && product.colors.length > 0 ? (
                      <p className="text-sm text-slate-500">
                        Colors: {product.colors.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Your Orders</h2>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-slate-500">
                  Orders will appear here when buyers purchase your approved products.
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="p-5">
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Order #{order._id.slice(-6)}</p>
                        <p className="font-medium">Revenue: ₹{order.sellerRevenue.toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-medium text-slate-700">{order.status}</p>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={`${order._id}-${item.productId}`}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <span>{item.name}</span>
                          <span>
                            {item.quantity} x ₹{item.price}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {order.status === "PENDING" ? (
                        <Button size="sm" onClick={() => updateStatus(order._id, "CONFIRMED")}>
                          Confirm
                        </Button>
                      ) : null}
                      {order.status === "CONFIRMED" ? (
                        <Button size="sm" onClick={() => updateStatus(order._id, "SHIPPED")}>
                          Ship
                        </Button>
                      ) : null}
                      {order.status === "SHIPPED" ? (
                        <Button size="sm" onClick={() => updateStatus(order._id, "DELIVERED")}>
                          Mark Delivered
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <section id="seller-chat">
          <DashboardChatPanel
            title="Seller Chat Inbox"
            description="Talk to buyers about their orders and contact admin support without leaving the seller dashboard."
            className="mt-8"
            emptyStateMessage="Choose a buyer or admin conversation from the seller inbox."
          />
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
