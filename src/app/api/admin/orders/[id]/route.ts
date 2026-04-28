import { NextResponse } from "next/server";
import { db } from "@/lib/brainDb";

export const runtime = "nodejs";

type OrderRecord = {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  amount: number;
  status: string;
  purchase_date: string;
};

type ProductStock = {
  id: number;
  price: number;
  quantity_remaining: number;
};

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getOrderView(orderId: number) {
  return db
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
          o.purchase_date,
          o.created_at
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        JOIN products p ON p.id = o.product_id
        WHERE o.id = ?
      `,
    )
    .get(orderId);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "ID đơn hàng không hợp lệ." }, { status: 400 });
  }

  const existing = db
    .prepare("SELECT id, customer_id, product_id, quantity, amount, status, purchase_date FROM orders WHERE id = ?")
    .get(id) as OrderRecord | undefined;
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const customerId = Number(body.customer_id ?? existing.customer_id);
  const productId = Number(body.product_id ?? existing.product_id);
  const quantity = Number(body.quantity ?? existing.quantity);
  const status = String(body.status ?? existing.status).trim() || existing.status;
  const purchaseDate = String(body.purchase_date ?? existing.purchase_date).trim() || existing.purchase_date;

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

    const oldProduct = db
      .prepare("SELECT id, price, quantity_remaining FROM products WHERE id = ?")
      .get(existing.product_id) as ProductStock | undefined;
    const newProduct = db
      .prepare("SELECT id, price, quantity_remaining FROM products WHERE id = ?")
      .get(productId) as ProductStock | undefined;

    if (!oldProduct || !newProduct) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Return previous reserved quantity to old product first.
    db.prepare("UPDATE products SET quantity_remaining = quantity_remaining + ? WHERE id = ?").run(
      existing.quantity,
      existing.product_id,
    );

    const available = db
      .prepare("SELECT quantity_remaining FROM products WHERE id = ?")
      .get(productId) as { quantity_remaining: number };
    if (available.quantity_remaining < quantity) {
      throw new Error("NOT_ENOUGH_STOCK");
    }

    db.prepare("UPDATE products SET quantity_remaining = quantity_remaining - ? WHERE id = ?").run(
      quantity,
      productId,
    );

    const amount = Number(body.amount ?? newProduct.price * quantity);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error("INVALID_AMOUNT");
    }

    db.prepare(
      "UPDATE orders SET customer_id = ?, product_id = ?, quantity = ?, amount = ?, status = ?, purchase_date = ? WHERE id = ?",
    ).run(customerId, productId, quantity, amount, status, purchaseDate, id);
  });

  try {
    tx();
    const updated = getOrderView(id);
    return NextResponse.json(updated);
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
    return NextResponse.json({ error: "Không cập nhật được đơn hàng." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = parseId(idParam);
  if (!id) {
    return NextResponse.json({ error: "ID đơn hàng không hợp lệ." }, { status: 400 });
  }

  const existing = db
    .prepare(
      "SELECT id, product_id, quantity, status, sepay_invoice FROM orders WHERE id = ?",
    )
    .get(id) as {
      id: number;
      product_id: number;
      quantity: number;
      status: string;
      sepay_invoice: string | null;
    } | undefined;
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  }

  const shouldRestoreStock =
    existing.status === "paid" || (existing.status === "pending" && !existing.sepay_invoice);

  db.transaction(() => {
    db.prepare("DELETE FROM orders WHERE id = ?").run(id);
    if (shouldRestoreStock) {
      db.prepare("UPDATE products SET quantity_remaining = quantity_remaining + ? WHERE id = ?").run(
        existing.quantity,
        existing.product_id,
      );
    }
  })();

  return NextResponse.json({ ok: true });
}
