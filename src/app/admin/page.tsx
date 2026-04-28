import {
  listProductsAdmin,
  listCustomersAdmin,
  listOrdersAdmin,
} from "@/lib/brainDb";
import AdminPanelClient from "./AdminPanelClient";

/** Luôn đọc DB mỗi request — tránh HTML tĩnh build-time (đơn hàng luôn rỗng). */
export const dynamic = "force-dynamic";

type Product = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  quantity_remaining: number;
};

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  zalo: string | null;
  registration_date: string;
};

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

export default async function AdminPage() {
  const [products, customers, orders] = await Promise.all([
    listProductsAdmin(),
    listCustomersAdmin(),
    listOrdersAdmin(),
  ]);

  return (
    <AdminPanelClient
      initialProducts={products as Product[]}
      initialCustomers={customers as Customer[]}
      initialOrders={orders as Order[]}
    />
  );
}
