import { NextResponse } from "next/server";
import { db } from "@/lib/brainDb";

export const runtime = "nodejs";

type OrderView = {
  id: number;
  customer_id: number;
  customer_name: string;
  product_id: number;
  product_name: string;
  quantity: number;
  amount: number;
  status: string;
  purchase_date: string;
  created_at: string;
};

const orderSelectSql = `
  SELECT
    o.id,
    o.customer_id,
    c.name AS customer_name,
    o.product_id,
    p.name AS product_name,
    o.quantity,
    o.amount,
    o.status,
    o.purchase_date,
    o.created_at
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  JOIN products p ON p.id = o.product_id
  ORDER BY o.id DESC
`;

export async function GET() {
  const rows = db.prepare(orderSelectSql).all() as OrderView[];
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const customerId = Number(body.customer_id);
  const productId = Number(body.product_id);
  const quantity = Number(body.quantity ?? 1);
  const status = String(body.status ?? "pending").trim() || "pending";
  const purchaseDate = String(body.purchase_date ?? "").trim() || new Date().toISOString();

  if (!Number.isInteger(customerId) || customerId <= 0) {
    return NextResponse.json({ error: "Khách hàng không hợp lệ." }, { status: 400 });
  }
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json({ error: "Sản phẩm không hợp lệ." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Số lượng phải lớn hơn 0." }, { status: 400 });
  }

  const tx = db.transaction(() => {
    const customer = db
      .prepare("SELECT id FROM customers WHERE id = ?")
      .get(customerId) as { id: number } | undefined;
    if (!customer) {
      throw new Error("CUSTOMER_NOT_FOUND");
    }

    const product = db
      .prepare("SELECT id, price, quantity_remaining FROM products WHERE id = ?")
      .get(productId) as { id: number; price: number; quantity_remaining: number } | undefined;
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }
    if (product.quantity_remaining < quantity) {
      throw new Error("NOT_ENOUGH_STOCK");
    }

    const amount = Number(body.amount ?? product.price * quantity);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("INVALID_AMOUNT");
    }

    db.prepare("UPDATE products SET quantity_remaining = quantity_remaining - ? WHERE id = ?").run(
      quantity,
      productId,
    );

    const result = db
      .prepare(
        "INSERT INTO orders (customer_id, product_id, quantity, amount, status, purchase_date) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(customerId, productId, quantity, amount, status, purchaseDate);

    return result.lastInsertRowid as number;
  });

  try {
    const orderId = tx();
    const created = db.prepare(`${orderSelectSql.replace("ORDER BY o.id DESC", "WHERE o.id = ?")}`).get(
      orderId,
    ) as OrderView;
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "CUSTOMER_NOT_FOUND") {
      return NextResponse.json({ error: "Không tìm thấy khách hàng." }, { status: 404 });
    }
    if (code === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }
    if (code === "NOT_ENOUGH_STOCK") {
      return NextResponse.json({ error: "Số lượng tồn kho không đủ." }, { status: 409 });
    }
    if (code === "INVALID_AMOUNT") {
      return NextResponse.json({ error: "Số tiền đơn hàng không hợp lệ." }, { status: 400 });
    }
    return NextResponse.json({ error: "Không tạo được đơn hàng." }, { status: 500 });
  }
}
