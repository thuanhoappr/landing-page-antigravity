import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "brain.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

function hasColumn(tableName: string, columnName: string) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string;
  }>;
  return columns.some((column) => column.name === columnName);
}

/** Tránh lỗi khi nhiều worker Next.js chạy init song song (duplicate column). */
function tryExecIgnoringDuplicateColumn(sql: string) {
  try {
    db.exec(sql);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate column name")) return;
    throw e;
  }
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
      description TEXT,
      quantity_remaining INTEGER NOT NULL DEFAULT 0 CHECK (quantity_remaining >= 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      zalo TEXT,
      registration_date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK (phone IS NOT NULL OR zalo IS NOT NULL)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_phone
    ON customers(phone) WHERE phone IS NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_zalo
    ON customers(zalo) WHERE zalo IS NOT NULL;

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      amount REAL NOT NULL DEFAULT 0 CHECK (amount >= 0),
      status TEXT NOT NULL DEFAULT 'pending',
      purchase_date TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  if (!hasColumn("orders", "quantity")) {
    tryExecIgnoringDuplicateColumn("ALTER TABLE orders ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1");
  }
  if (!hasColumn("orders", "sepay_invoice")) {
    tryExecIgnoringDuplicateColumn("ALTER TABLE orders ADD COLUMN sepay_invoice TEXT");
    db.exec("CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_sepay_invoice ON orders(sepay_invoice) WHERE sepay_invoice IS NOT NULL");
  }
}

initSchema();

export type ProductRow = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  quantity_remaining: number;
  created_at: string;
};

export type CustomerRow = {
  id: number;
  name: string;
  phone: string | null;
  zalo: string | null;
  registration_date: string;
  created_at: string;
};

export type OrderRow = {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  amount: number;
  status: string;
  purchase_date: string;
  created_at: string;
  sepay_invoice: string | null;
};

export { db };
