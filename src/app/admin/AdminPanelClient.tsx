"use client";

import { useMemo, useState } from "react";

type TabKey = "products" | "customers" | "orders";
type Product = { id: number; name: string; price: number; description: string | null; quantity_remaining: number };
type Customer = { id: number; name: string; phone: string | null; zalo: string | null; registration_date: string };
type Order = {
  id: number;
  customer_id: number;
  customer_name: string;
  product_id: number;
  product_name: string;
  quantity: number;
  amount: number;
  status: string;
  purchase_date: string;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "products", label: "Sản phẩm" },
  { key: "customers", label: "Khách hàng" },
  { key: "orders", label: "Đơn hàng" },
];

async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Có lỗi xảy ra.");
  return data;
}

export default function AdminPanelClient({
  initialProducts,
  initialCustomers,
  initialOrders,
}: {
  initialProducts: Product[];
  initialCustomers: Customer[];
  initialOrders: Order[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("products");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({ id: 0, name: "", price: "0", description: "", quantity_remaining: "0" });
  const [customerForm, setCustomerForm] = useState({ id: 0, name: "", phone: "", zalo: "", registration_date: "" });
  const [orderForm, setOrderForm] = useState({
    id: 0,
    customer_id: "",
    product_id: "",
    quantity: "1",
    amount: "",
    status: "pending",
    purchase_date: "",
  });

  const isEditingProduct = productForm.id > 0;
  const isEditingCustomer = customerForm.id > 0;
  const isEditingOrder = orderForm.id > 0;
  const productOptions = useMemo(
    () => products.map((item) => ({ value: String(item.id), label: `${item.name} (ton: ${item.quantity_remaining})` })),
    [products],
  );
  const customerOptions = useMemo(
    () => customers.map((item) => ({ value: String(item.id), label: `${item.name}${item.phone ? ` - ${item.phone}` : ""}` })),
    [customers],
  );

  async function loadAll() {
    setBusy(true);
    setError(null);
    try {
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        requestJson("/api/admin/products"),
        requestJson("/api/admin/customers"),
        requestJson("/api/admin/orders"),
      ]);
      setProducts(productsRes);
      setCustomers(customersRes);
      setOrders(ordersRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được dữ liệu.");
    } finally {
      setBusy(false);
    }
  }

  async function saveProduct() {
    setBusy(true);
    try {
      await requestJson(isEditingProduct ? `/api/admin/products/${productForm.id}` : "/api/admin/products", {
        method: isEditingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productForm.name,
          price: Number(productForm.price),
          description: productForm.description,
          quantity_remaining: Number(productForm.quantity_remaining),
        }),
      });
      setProductForm({ id: 0, name: "", price: "0", description: "", quantity_remaining: "0" });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được sản phẩm.");
      setBusy(false);
    }
  }

  async function saveCustomer() {
    setBusy(true);
    try {
      await requestJson(isEditingCustomer ? `/api/admin/customers/${customerForm.id}` : "/api/admin/customers", {
        method: isEditingCustomer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerForm.name,
          phone: customerForm.phone,
          zalo: customerForm.zalo,
          registration_date: customerForm.registration_date || new Date().toISOString(),
        }),
      });
      setCustomerForm({ id: 0, name: "", phone: "", zalo: "", registration_date: "" });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được khách hàng.");
      setBusy(false);
    }
  }

  async function saveOrder() {
    setBusy(true);
    try {
      await requestJson(isEditingOrder ? `/api/admin/orders/${orderForm.id}` : "/api/admin/orders", {
        method: isEditingOrder ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: Number(orderForm.customer_id),
          product_id: Number(orderForm.product_id),
          quantity: Number(orderForm.quantity),
          amount: orderForm.amount ? Number(orderForm.amount) : undefined,
          status: orderForm.status,
          purchase_date: orderForm.purchase_date || new Date().toISOString(),
        }),
      });
      setOrderForm({
        id: 0,
        customer_id: "",
        product_id: "",
        quantity: "1",
        amount: "",
        status: "pending",
        purchase_date: "",
      });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không lưu được đơn hàng.");
      setBusy(false);
    }
  }

  async function deleteById(tab: TabKey, id: number) {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    setBusy(true);
    try {
      const base = tab === "products" ? "products" : tab === "customers" ? "customers" : "orders";
      await requestJson(`/api/admin/${base}/${id}`, { method: "DELETE" });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không xóa được dữ liệu.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg border ${activeTab === tab.key ? "bg-cyan-600 border-cyan-400" : "bg-slate-900 border-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {error && <div className="bg-rose-900/40 border border-rose-500 p-3 rounded-lg">{error}</div>}
        {busy && <p className="text-slate-400 text-sm">Đang xử lý...</p>}

        {/* Products */}
        {activeTab === "products" && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900 p-4 rounded-xl">
              <input className="px-3 py-2 rounded bg-slate-800" placeholder="Tên sản phẩm" value={productForm.name} onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" type="number" min={0} placeholder="Giá" value={productForm.price} onChange={(e) => setProductForm((s) => ({ ...s, price: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" type="number" min={0} placeholder="Số lượng còn lại" value={productForm.quantity_remaining} onChange={(e) => setProductForm((s) => ({ ...s, quantity_remaining: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" placeholder="Mô tả" value={productForm.description} onChange={(e) => setProductForm((s) => ({ ...s, description: e.target.value }))} />
              <div className="md:col-span-2 flex gap-2">
                <button className="px-4 py-2 rounded bg-emerald-600" onClick={() => void saveProduct()}>{isEditingProduct ? "Cập nhật" : "Thêm mới"}</button>
                {isEditingProduct && <button className="px-4 py-2 rounded bg-slate-700" onClick={() => setProductForm({ id: 0, name: "", price: "0", description: "", quantity_remaining: "0" })}>Hủy sửa</button>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b border-slate-700"><th className="py-2">Tên</th><th>Giá</th><th>Tồn kho</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800">
                      <td className="py-2">{item.name}</td><td>{item.price}</td><td>{item.quantity_remaining}</td><td>{item.description || "-"}</td>
                      <td className="space-x-2">
                        <button className="px-2 py-1 rounded bg-amber-600" onClick={() => setProductForm({ id: item.id, name: item.name, price: String(item.price), description: item.description || "", quantity_remaining: String(item.quantity_remaining) })}>Sửa</button>
                        <button className="px-2 py-1 rounded bg-rose-700" onClick={() => void deleteById("products", item.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Customers */}
        {activeTab === "customers" && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900 p-4 rounded-xl">
              <input className="px-3 py-2 rounded bg-slate-800" placeholder="Tên khách hàng" value={customerForm.name} onChange={(e) => setCustomerForm((s) => ({ ...s, name: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" placeholder="Số điện thoại" value={customerForm.phone} onChange={(e) => setCustomerForm((s) => ({ ...s, phone: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" placeholder="Zalo" value={customerForm.zalo} onChange={(e) => setCustomerForm((s) => ({ ...s, zalo: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" type="datetime-local" value={customerForm.registration_date} onChange={(e) => setCustomerForm((s) => ({ ...s, registration_date: e.target.value }))} />
              <div className="md:col-span-2 flex gap-2">
                <button className="px-4 py-2 rounded bg-emerald-600" onClick={() => void saveCustomer()}>{isEditingCustomer ? "Cập nhật" : "Thêm mới"}</button>
                {isEditingCustomer && <button className="px-4 py-2 rounded bg-slate-700" onClick={() => setCustomerForm({ id: 0, name: "", phone: "", zalo: "", registration_date: "" })}>Hủy sửa</button>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b border-slate-700"><th className="py-2">Tên</th><th>SĐT</th><th>Zalo</th><th>Ngày đăng ký</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {customers.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800">
                      <td className="py-2">{item.name}</td><td>{item.phone || "-"}</td><td>{item.zalo || "-"}</td><td>{new Date(item.registration_date).toLocaleString("vi-VN")}</td>
                      <td className="space-x-2">
                        <button className="px-2 py-1 rounded bg-amber-600" onClick={() => setCustomerForm({ id: item.id, name: item.name, phone: item.phone || "", zalo: item.zalo || "", registration_date: item.registration_date.slice(0, 16) })}>Sửa</button>
                        <button className="px-2 py-1 rounded bg-rose-700" onClick={() => void deleteById("customers", item.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900 p-4 rounded-xl">
              <select className="px-3 py-2 rounded bg-slate-800" value={orderForm.customer_id} onChange={(e) => setOrderForm((s) => ({ ...s, customer_id: e.target.value }))}>
                <option value="">Chọn khách hàng</option>
                {customerOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <select className="px-3 py-2 rounded bg-slate-800" value={orderForm.product_id} onChange={(e) => setOrderForm((s) => ({ ...s, product_id: e.target.value }))}>
                <option value="">Chọn sản phẩm</option>
                {productOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <input className="px-3 py-2 rounded bg-slate-800" type="number" min={1} placeholder="Số lượng" value={orderForm.quantity} onChange={(e) => setOrderForm((s) => ({ ...s, quantity: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" type="number" min={0} placeholder="Số tiền (để trống = tự tính)" value={orderForm.amount} onChange={(e) => setOrderForm((s) => ({ ...s, amount: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" placeholder="Trạng thái đơn" value={orderForm.status} onChange={(e) => setOrderForm((s) => ({ ...s, status: e.target.value }))} />
              <input className="px-3 py-2 rounded bg-slate-800" type="datetime-local" value={orderForm.purchase_date} onChange={(e) => setOrderForm((s) => ({ ...s, purchase_date: e.target.value }))} />
              <div className="md:col-span-2 flex gap-2">
                <button className="px-4 py-2 rounded bg-emerald-600" onClick={() => void saveOrder()}>{isEditingOrder ? "Cập nhật" : "Thêm mới"}</button>
                {isEditingOrder && <button className="px-4 py-2 rounded bg-slate-700" onClick={() => setOrderForm({ id: 0, customer_id: "", product_id: "", quantity: "1", amount: "", status: "pending", purchase_date: "" })}>Hủy sửa</button>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b border-slate-700"><th className="py-2">Khách hàng</th><th>Sản phẩm</th><th>SL</th><th>Số tiền</th><th>Trạng thái</th><th>Ngày mua</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {orders.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800">
                      <td className="py-2">{item.customer_name}</td><td>{item.product_name}</td><td>{item.quantity}</td><td>{item.amount}</td><td>{item.status}</td><td>{new Date(item.purchase_date).toLocaleString("vi-VN")}</td>
                      <td className="space-x-2">
                        <button className="px-2 py-1 rounded bg-amber-600" onClick={() => setOrderForm({ id: item.id, customer_id: String(item.customer_id), product_id: String(item.product_id), quantity: String(item.quantity), amount: String(item.amount), status: item.status, purchase_date: item.purchase_date.slice(0, 16) })}>Sửa</button>
                        <button className="px-2 py-1 rounded bg-rose-700" onClick={() => void deleteById("orders", item.id)}>Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
