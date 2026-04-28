import { db } from "@/lib/brainDb";
import AdminPanelClient from "./AdminPanelClient";

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
  const products = db
    .prepare(
      "SELECT id, name, price, description, quantity_remaining FROM products ORDER BY id DESC",
    )
    .all() as Product[];
  const customers = db
    .prepare("SELECT id, name, phone, zalo, registration_date FROM customers ORDER BY id DESC")
    .all() as Customer[];
  const orders = db
    .prepare(
      `
      SELECT
        o.id,
        o.customer_id,
        c.name AS customer_name,
        o.product_id,
        p.name AS product_name,
        o.quantity,
        o.amount,
        o.status,
        o.purchase_date
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN products p ON p.id = o.product_id
      ORDER BY o.id DESC
      `,
    )
    .all() as Order[];

  return <AdminPanelClient initialProducts={products} initialCustomers={customers} initialOrders={orders} />;
}
