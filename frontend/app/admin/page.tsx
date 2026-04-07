"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardChatPanel } from "@/components/dashboard-chat-panel";
import { PRODUCT_API, ORDER_API, USER_API } from "@/lib/api";
import {
  clearSession,
  getSessionUser,
  handleUnauthorizedSession,
  isExpiredSessionError,
} from "@/lib/auth";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  blocked: boolean;
  sellerStatus?: string;
};

type Product = {
  _id: string;
  name: string;
  category?: string;
  image?: string;
  sellerId: string;
  status: string;
};

type Order = {
  _id: string;
  buyerId: string;
  status: string;
  totalAmount: number;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
};

type Analytics = {
  totalUsers: number;
  totalSellers: number;
  approvedSellers: number;
  blockedUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topSellingProducts: Array<{ productId: string; name: string; quantitySold: number }>;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalSellers: 0,
    approvedSellers: 0,
    blockedUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    monthlyRevenue: [],
    topSellingProducts: [],
  });
  const [tab, setTab] = useState<"overview" | "users" | "sellers" | "products" | "orders">(
    "overview"
  );
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const user = getSessionUser();

    if (!user || user.role !== "admin") {
      router.replace("/login");
      return;
    }

    void fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const results = await Promise.allSettled([
        USER_API.get("/admin/users"),
        USER_API.get("/admin/sellers"),
        PRODUCT_API.get("/admin/all"),
        ORDER_API.get("/"),
        USER_API.get("/admin/analytics"),
        ORDER_API.get("/admin/analytics"),
      ]);

      const [
        usersResult,
        sellersResult,
        productsResult,
        ordersResult,
        userAnalyticsResult,
        orderAnalyticsResult,
      ] = results;

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value.data.users || []);
      }

      if (sellersResult.status === "fulfilled") {
        setSellers(sellersResult.value.data.sellers || []);
      }

      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.data.products || []);
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value.data.orders || []);
      }

      const mergedAnalytics = { ...analytics };

      if (userAnalyticsResult.status === "fulfilled") {
        Object.assign(mergedAnalytics, userAnalyticsResult.value.data.analytics || {});
      }

      if (orderAnalyticsResult.status === "fulfilled") {
        Object.assign(mergedAnalytics, orderAnalyticsResult.value.data.analytics || {});
      }

      setAnalytics(mergedAnalytics);

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
            "Some admin sections could not be loaded. The page is showing available data."
        );
      }
    } catch (error: any) {
      if (isExpiredSessionError(error)) {
        clearSession();
        router.replace("/login");
        return;
      }

      setPageError(error.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockUser = async (id: string) => {
    try {
      await USER_API.patch(`/admin/users/${id}/block`);
      await fetchAdminData();
    } catch (error: any) {
      if (isExpiredSessionError(error)) {
        handleUnauthorizedSession();
        return;
      }

      alert(error.response?.data?.message || "Failed to update user status");
    }
  };

  const updateSellerStatus = async (id: string, sellerStatus: "approved" | "rejected") => {
    try {
      await USER_API.patch(`/admin/sellers/${id}/status`, { sellerStatus });
      await fetchAdminData();
    } catch (error: any) {
      if (isExpiredSessionError(error)) {
        handleUnauthorizedSession();
        return;
      }

      alert(error.response?.data?.message || "Failed to update seller status");
    }
  };

  const approveProduct = async (id: string) => {
    try {
      await PRODUCT_API.patch(`/${id}/approve`);
      await fetchAdminData();
    } catch (error: any) {
      if (isExpiredSessionError(error)) {
        handleUnauthorizedSession();
        return;
      }

      alert(error.response?.data?.message || "Failed to approve product");
    }
  };

  if (loading) {
    return <p className="p-8 text-center">Loading admin dashboard...</p>;
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Admin Control</p>
            <h1 className="text-3xl font-semibold text-stone-900">Platform Dashboard</h1>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href="#admin-chat">Chat Section</a>
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

        <div className="mb-8 flex flex-wrap gap-2">
          {[
            ["overview", "Overview"],
            ["users", "Users"],
            ["sellers", "Sellers"],
            ["products", "Products"],
            ["orders", "Orders"],
          ].map(([value, label]) => (
            <Button
              key={value}
              variant={tab === value ? "default" : "outline"}
              onClick={() => setTab(value as typeof tab)}
            >
              {label}
            </Button>
          ))}
        </div>

        {pageError ? (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {pageError}
          </div>
        ) : null}

        {tab === "overview" ? <Overview analytics={analytics} /> : null}
        {tab === "users" ? (
          <UsersList users={users} toggleBlockUser={toggleBlockUser} />
        ) : null}
        {tab === "sellers" ? (
          <SellersList sellers={sellers} updateSellerStatus={updateSellerStatus} />
        ) : null}
        {tab === "products" ? (
          <ProductsList products={products} approveProduct={approveProduct} />
        ) : null}
        {tab === "orders" ? <OrdersList orders={orders} /> : null}

        <section id="admin-chat">
          <DashboardChatPanel
            title="Admin Messaging Hub"
            description="Handle buyer support and seller coordination directly from the admin dashboard."
            className="mt-8"
            emptyStateMessage="Choose a buyer or seller conversation from the admin messaging hub."
          />
        </section>
      </div>
    </div>
  );
}

function Overview({ analytics }: { analytics: Analytics }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Users" value={analytics.totalUsers} />
        <StatCard title="Sellers" value={analytics.totalSellers} />
        <StatCard title="Orders" value={analytics.totalOrders} />
        <StatCard title="Revenue" value={`₹${analytics.totalRevenue.toFixed(2)}`} />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Platform Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketplace Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow label="Approved Sellers" value={analytics.approvedSellers} />
            <MetricRow label="Blocked Users" value={analytics.blockedUsers} />
            <MetricRow label="Pending Orders" value={analytics.pendingOrders} />
            <MetricRow
              label="Top Product"
              value={analytics.topSellingProducts[0]?.name || "No sales yet"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsersList({
  users,
  toggleBlockUser,
}: {
  users: User[];
  toggleBlockUser: (id: string) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user._id}>
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-stone-900">{user.name}</p>
              <p className="text-sm text-stone-500">{user.email}</p>
              <p className="text-sm capitalize text-stone-600">{user.role}</p>
            </div>

            {user.role !== "admin" ? (
              <Button
                variant={user.blocked ? "outline" : "destructive"}
                onClick={() => void toggleBlockUser(user._id)}
              >
                {user.blocked ? "Unblock" : "Block"}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SellersList({
  sellers,
  updateSellerStatus,
}: {
  sellers: User[];
  updateSellerStatus: (id: string, sellerStatus: "approved" | "rejected") => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {sellers.map((seller) => (
        <Card key={seller._id}>
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-stone-900">{seller.name}</p>
              <p className="text-sm text-stone-500">{seller.email}</p>
              <p className="text-sm capitalize text-stone-600">
                Status: {seller.sellerStatus || "approved"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => void updateSellerStatus(seller._id, "approved")}>
                Approve
              </Button>
              <Button variant="destructive" onClick={() => void updateSellerStatus(seller._id, "rejected")}>
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProductsList({
  products,
  approveProduct,
}: {
  products: Product[];
  approveProduct: (id: string) => Promise<void>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <Card key={product._id}>
          <CardContent className="p-4">
            <div className="mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-stone-200">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <p className="text-sm uppercase tracking-wide text-stone-500">
              {product.category || "General"}
            </p>
            <h3 className="text-lg font-medium text-stone-900">{product.name}</h3>
            <p className="text-sm text-stone-600">Seller: {product.sellerId}</p>
            <p className="mb-3 text-sm text-stone-600">Status: {product.status}</p>

            {product.status !== "APPROVED" ? (
              <Button onClick={() => void approveProduct(product._id)}>Approve Product</Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order._id}>
          <CardContent className="p-5">
            <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <p className="font-medium text-stone-900">Order #{order._id.slice(-6)}</p>
              <p className="text-sm text-stone-600">{order.status}</p>
            </div>
            <p className="text-sm text-stone-500">Buyer: {order.buyerId}</p>
            <p className="text-sm text-stone-500">Items: {order.items.length}</p>
            <p className="mt-2 font-semibold text-stone-900">₹{order.totalAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm uppercase tracking-wide text-stone-500">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-stone-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="font-medium text-stone-900">{value}</span>
    </div>
  );
}
