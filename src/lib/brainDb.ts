import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

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
  email: string | null;
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

export type OrderView = {
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

function getPostgresConnectionString() {
  return (
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    /* Vercel Storage "Connect Project" với prefix mặc định STORAGE → STORAGE_URL */
    process.env.STORAGE_URL?.trim() ||
    ""
  );
}

const postgresConnectionString = getPostgresConnectionString();
const usePostgres = Boolean(postgresConnectionString);

let pg: ReturnType<typeof postgres> | null = null;
function getPg() {
  if (!usePostgres) return null;
  if (!pg) {
    pg = postgres(postgresConnectionString, { ssl: "require", max: 5 });
  }
  return pg;
}

let pgSchemaReady: Promise<void> | null = null;

async function ensurePgSchema() {
  const sql = getPg()!;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (price >= 0),
      description TEXT,
      quantity_remaining INTEGER NOT NULL DEFAULT 0 CHECK (quantity_remaining >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      zalo TEXT,
      registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (phone IS NOT NULL OR zalo IS NOT NULL)
    )
  `;
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL DEFAULT 1,
      amount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (amount >= 0),
      status TEXT NOT NULL DEFAULT 'pending',
      purchase_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      sepay_invoice TEXT
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_phone
    ON customers(phone) WHERE phone IS NOT NULL
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_zalo
    ON customers(zalo) WHERE zalo IS NOT NULL
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_email
    ON customers(email) WHERE email IS NOT NULL
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_sepay_invoice
    ON orders(sepay_invoice) WHERE sepay_invoice IS NOT NULL
  `;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS sepay_invoice TEXT`;
  await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT`;
  await sql`
    CREATE TABLE IF NOT EXISTS sepay_webhook_processed (
      external_id TEXT PRIMARY KEY
    )
  `;
}

async function ensurePg() {
  if (!usePostgres) return;
  if (!pgSchemaReady) {
    pgSchemaReady = ensurePgSchema();
  }
  await pgSchemaReady;
}

/* ---------- SQLite (local hoặc /tmp trên Vercel khi chưa có Postgres) ---------- */

function resolveSqlitePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "brain.db");
  }
  return path.join(process.cwd(), "brain.db");
}

let sqliteDb: Database.Database | null = null;

function getSqlite(): Database.Database {
  if (sqliteDb) return sqliteDb;
  const dbPath = resolveSqlitePath();
  if (process.env.VERCEL) {
    const bundled = path.join(process.cwd(), "brain.db");
    try {
      if (!fs.existsSync(dbPath) && fs.existsSync(bundled)) {
        fs.copyFileSync(bundled, dbPath);
      }
    } catch {
      /* ignore */
    }
  }
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma("foreign_keys = ON");
  initSqliteSchema(sqliteDb);
  return sqliteDb;
}

function hasColumn(db: Database.Database, tableName: string, columnName: string) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return columns.some((column) => column.name === columnName);
}

function tryExecIgnoringDuplicateColumn(db: Database.Database, sql: string) {
  try {
    db.exec(sql);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate column name")) return;
    throw e;
  }
}

function initSqliteSchema(db: Database.Database) {
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
      email TEXT,
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
  if (!hasColumn(db, "orders", "quantity")) {
    tryExecIgnoringDuplicateColumn(db, "ALTER TABLE orders ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1");
  }
  if (!hasColumn(db, "orders", "sepay_invoice")) {
    tryExecIgnoringDuplicateColumn(db, "ALTER TABLE orders ADD COLUMN sepay_invoice TEXT");
    db.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_sepay_invoice ON orders(sepay_invoice) WHERE sepay_invoice IS NOT NULL",
    );
  }
  if (!hasColumn(db, "customers", "email")) {
    tryExecIgnoringDuplicateColumn(db, "ALTER TABLE customers ADD COLUMN email TEXT");
  }
  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_email ON customers(email) WHERE email IS NOT NULL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS sepay_webhook_processed (
      external_id TEXT PRIMARY KEY
    )
  `);
}

function getSqliteOrThrow(): Database.Database {
  if (usePostgres) {
    throw new Error("SQLite path requested while Postgres is configured");
  }
  return getSqlite();
}

/* ---------- Public API (luôn async) ---------- */

export async function listProductsAdmin() {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    return sql`
      SELECT id, name, price, description, quantity_remaining
      FROM products ORDER BY id DESC
    ` as Promise<
      Array<{
        id: number;
        name: string;
        price: number;
        description: string | null;
        quantity_remaining: number;
      }>
    >;
  }
  const db = getSqliteOrThrow();
  return db
    .prepare("SELECT id, name, price, description, quantity_remaining FROM products ORDER BY id DESC")
    .all() as Array<{
    id: number;
    name: string;
    price: number;
    description: string | null;
    quantity_remaining: number;
  }>;
}

export async function listCustomersAdmin() {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    return sql`
      SELECT id, name, email, phone, zalo, registration_date
      FROM customers ORDER BY id DESC
    ` as Promise<
      Array<{
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        zalo: string | null;
        registration_date: string;
      }>
    >;
  }
  const db = getSqliteOrThrow();
  return db
    .prepare("SELECT id, name, email, phone, zalo, registration_date FROM customers ORDER BY id DESC")
    .all() as Array<{
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    zalo: string | null;
    registration_date: string;
  }>;
}

export async function listOrdersAdmin() {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    return sql`
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
    ` as Promise<
      Array<{
        id: number;
        customer_id: number;
        customer_name: string;
        product_id: number;
        product_name: string;
        quantity: number;
        amount: number;
        status: string;
        purchase_date: string;
      }>
    >;
  }
  const db = getSqliteOrThrow();
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
        o.purchase_date
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      JOIN products p ON p.id = o.product_id
      ORDER BY o.id DESC
    `,
    )
    .all() as Array<{
    id: number;
    customer_id: number;
    customer_name: string;
    product_id: number;
    product_name: string;
    quantity: number;
    amount: number;
    status: string;
    purchase_date: string;
  }>;
}

export async function listProductsApi(): Promise<ProductRow[]> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const rows = await sql`
      SELECT id, name, price, description, quantity_remaining, created_at
      FROM products ORDER BY id DESC
    `;
    return rows as unknown as ProductRow[];
  }
  const db = getSqliteOrThrow();
  return db
    .prepare("SELECT id, name, price, description, quantity_remaining, created_at FROM products ORDER BY id DESC")
    .all() as ProductRow[];
}

export async function insertProduct(
  name: string,
  price: number,
  description: string | null,
  quantityRemaining: number,
): Promise<ProductRow> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const [row] = await sql`
      INSERT INTO products (name, price, description, quantity_remaining)
      VALUES (${name}, ${price}, ${description}, ${quantityRemaining})
      RETURNING id, name, price, description, quantity_remaining, created_at
    `;
    return row as unknown as ProductRow;
  }
  const db = getSqliteOrThrow();
  const r = db
    .prepare("INSERT INTO products (name, price, description, quantity_remaining) VALUES (?, ?, ?, ?)")
    .run(name, price, description, quantityRemaining);
  return db
    .prepare("SELECT id, name, price, description, quantity_remaining, created_at FROM products WHERE id = ?")
    .get(r.lastInsertRowid) as ProductRow;
}

export async function updateProduct(
  id: number,
  name: string,
  price: number,
  description: string | null,
  quantityRemaining: number,
): Promise<ProductRow | null> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const rows = await sql`
      UPDATE products SET name = ${name}, price = ${price}, description = ${description},
        quantity_remaining = ${quantityRemaining} WHERE id = ${id}
      RETURNING id, name, price, description, quantity_remaining, created_at
    `;
    return (rows[0] as unknown as ProductRow) ?? null;
  }
  const db = getSqliteOrThrow();
  const result = db
    .prepare(
      "UPDATE products SET name = ?, price = ?, description = ?, quantity_remaining = ? WHERE id = ?",
    )
    .run(name, price, description, quantityRemaining, id);
  if (result.changes === 0) return null;
  return db
    .prepare("SELECT id, name, price, description, quantity_remaining, created_at FROM products WHERE id = ?")
    .get(id) as ProductRow;
}

export async function deleteProductIfNoOrders(id: number): Promise<{ ok: true } | { error: "linked" | "missing" }> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const [linked] = await sql`SELECT id FROM orders WHERE product_id = ${id} LIMIT 1`;
    if (linked) return { error: "linked" };
    const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;
    if (!rows.length) return { error: "missing" };
    return { ok: true };
  }
  const db = getSqliteOrThrow();
  const linkedOrder = db.prepare("SELECT id FROM orders WHERE product_id = ? LIMIT 1").get(id) as
    | { id: number }
    | undefined;
  if (linkedOrder) return { error: "linked" };
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);
  if (result.changes === 0) return { error: "missing" };
  return { ok: true };
}

export async function listCustomersApi(): Promise<CustomerRow[]> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const rows = await sql`
      SELECT id, name, email, phone, zalo, registration_date, created_at
      FROM customers ORDER BY id DESC
    `;
    return rows as unknown as CustomerRow[];
  }
  const db = getSqliteOrThrow();
  return db
    .prepare("SELECT id, name, email, phone, zalo, registration_date, created_at FROM customers ORDER BY id DESC")
    .all() as CustomerRow[];
}

export async function insertCustomer(
  name: string,
  email: string | null,
  phone: string | null,
  zalo: string | null,
  registrationDate: string,
): Promise<CustomerRow> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const [row] = await sql`
      INSERT INTO customers (name, email, phone, zalo, registration_date)
      VALUES (${name}, ${email}, ${phone}, ${zalo}, ${registrationDate}::timestamptz)
      RETURNING id, name, email, phone, zalo, registration_date, created_at
    `;
    return row as unknown as CustomerRow;
  }
  const db = getSqliteOrThrow();
  const r = db
    .prepare("INSERT INTO customers (name, email, phone, zalo, registration_date) VALUES (?, ?, ?, ?, ?)")
    .run(name, email, phone, zalo, registrationDate);
  return db
    .prepare("SELECT id, name, email, phone, zalo, registration_date, created_at FROM customers WHERE id = ?")
    .get(r.lastInsertRowid) as CustomerRow;
}

export async function updateCustomer(
  id: number,
  name: string,
  email: string | null,
  phone: string | null,
  zalo: string | null,
  registrationDate: string,
): Promise<CustomerRow | null> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const rows = await sql`
      UPDATE customers SET name = ${name}, email = ${email}, phone = ${phone}, zalo = ${zalo},
        registration_date = ${registrationDate}::timestamptz WHERE id = ${id}
      RETURNING id, name, email, phone, zalo, registration_date, created_at
    `;
    return (rows[0] as unknown as CustomerRow) ?? null;
  }
  const db = getSqliteOrThrow();
  const result = db
    .prepare(
      "UPDATE customers SET name = ?, email = ?, phone = ?, zalo = ?, registration_date = ? WHERE id = ?",
    )
    .run(name, email, phone, zalo, registrationDate, id);
  if (result.changes === 0) return null;
  return db
    .prepare("SELECT id, name, email, phone, zalo, registration_date, created_at FROM customers WHERE id = ?")
    .get(id) as CustomerRow;
}

export async function deleteCustomerIfNoOrders(
  id: number,
): Promise<{ ok: true } | { error: "linked" | "missing" }> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const [linked] = await sql`SELECT id FROM orders WHERE customer_id = ${id} LIMIT 1`;
    if (linked) return { error: "linked" };
    const rows = await sql`DELETE FROM customers WHERE id = ${id} RETURNING id`;
    if (!rows.length) return { error: "missing" };
    return { ok: true };
  }
  const db = getSqliteOrThrow();
  const linkedOrder = db.prepare("SELECT id FROM orders WHERE customer_id = ? LIMIT 1").get(id) as
    | { id: number }
    | undefined;
  if (linkedOrder) return { error: "linked" };
  const result = db.prepare("DELETE FROM customers WHERE id = ?").run(id);
  if (result.changes === 0) return { error: "missing" };
  return { ok: true };
}

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

export async function listOrdersApi(): Promise<OrderView[]> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const rows = await sql.unsafe(orderSelectSql);
    return rows as unknown as OrderView[];
  }
  const db = getSqliteOrThrow();
  return db.prepare(orderSelectSql).all() as OrderView[];
}

export async function getOrderViewById(orderId: number): Promise<OrderView | null> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const [row] = await sql`
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
      WHERE o.id = ${orderId}
    `;
    return (row as unknown as OrderView) ?? null;
  }
  const db = getSqliteOrThrow();
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
    .get(orderId) as OrderView | null;
}

type OrderRecord = {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  amount: number;
  status: string;
  purchase_date: string;
};

export async function getOrderRecord(id: number): Promise<OrderRecord | null> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const [row] = await sql`
      SELECT id, customer_id, product_id, quantity, amount, status, purchase_date
      FROM orders WHERE id = ${id}
    `;
    return (row as unknown as OrderRecord) ?? null;
  }
  const db = getSqliteOrThrow();
  return db
    .prepare(
      "SELECT id, customer_id, product_id, quantity, amount, status, purchase_date FROM orders WHERE id = ?",
    )
    .get(id) as OrderRecord | null;
}

export async function getOrderForDelete(id: number) {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const [row] = await sql`
      SELECT id, product_id, quantity, status, sepay_invoice FROM orders WHERE id = ${id}
    `;
    return row as
      | { id: number; product_id: number; quantity: number; status: string; sepay_invoice: string | null }
      | undefined;
  }
  const db = getSqliteOrThrow();
  return db
    .prepare("SELECT id, product_id, quantity, status, sepay_invoice FROM orders WHERE id = ?")
    .get(id) as
    | { id: number; product_id: number; quantity: number; status: string; sepay_invoice: string | null }
    | undefined;
}

export async function createOrderManual(body: {
  customer_id: number;
  product_id: number;
  quantity: number;
  amount?: number;
  status: string;
  purchase_date: string;
}): Promise<OrderView | { error: string }> {
  await ensurePg();
  const { customer_id: customerId, product_id: productId, quantity, status, purchase_date: purchaseDate } =
    body;

  if (usePostgres) {
    const sql = getPg()!;
    try {
      const orderId = await sql.begin(async (tx) => {
        const [customer] = await tx`SELECT id FROM customers WHERE id = ${customerId}`;
        if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
        const [product] =
          await tx`SELECT id, price, quantity_remaining FROM products WHERE id = ${productId}`;
        if (!product) throw new Error("PRODUCT_NOT_FOUND");
        if ((product as { quantity_remaining: number }).quantity_remaining < quantity) {
          throw new Error("NOT_ENOUGH_STOCK");
        }
        const amount = Number(body.amount ?? (product as { price: number }).price * quantity);
        if (!Number.isFinite(amount) || amount < 0) throw new Error("INVALID_AMOUNT");
        await tx`
          UPDATE products SET quantity_remaining = quantity_remaining - ${quantity}
          WHERE id = ${productId}
        `;
        const [inserted] = await tx`
          INSERT INTO orders (customer_id, product_id, quantity, amount, status, purchase_date)
          VALUES (${customerId}, ${productId}, ${quantity}, ${amount}, ${status}, ${purchaseDate}::timestamptz)
          RETURNING id
        `;
        return (inserted as { id: number }).id;
      });
      return (await getOrderViewById(orderId))!;
    } catch (e) {
      const code = e instanceof Error ? e.message : "UNKNOWN";
      if (
        code === "CUSTOMER_NOT_FOUND" ||
        code === "PRODUCT_NOT_FOUND" ||
        code === "NOT_ENOUGH_STOCK" ||
        code === "INVALID_AMOUNT"
      ) {
        return { error: code };
      }
      throw e;
    }
  }

  const db = getSqliteOrThrow();
  const tx = db.transaction(() => {
    const customer = db.prepare("SELECT id FROM customers WHERE id = ?").get(customerId) as { id: number } | undefined;
    if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
    const product = db
      .prepare("SELECT id, price, quantity_remaining FROM products WHERE id = ?")
      .get(productId) as { id: number; price: number; quantity_remaining: number } | undefined;
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (product.quantity_remaining < quantity) throw new Error("NOT_ENOUGH_STOCK");
    const amount = Number(body.amount ?? product.price * quantity);
    if (!Number.isFinite(amount) || amount < 0) throw new Error("INVALID_AMOUNT");
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
    return (await getOrderViewById(orderId))!;
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    if (
      code === "CUSTOMER_NOT_FOUND" ||
      code === "PRODUCT_NOT_FOUND" ||
      code === "NOT_ENOUGH_STOCK" ||
      code === "INVALID_AMOUNT"
    ) {
      return { error: code };
    }
    throw e;
  }
}

export async function updateOrderPut(
  id: number,
  body: {
    customer_id?: number;
    product_id?: number;
    quantity?: number;
    amount?: number;
    status?: string;
    purchase_date?: string;
  },
): Promise<OrderView | { error: string } | null> {
  await ensurePg();
  const existing = await getOrderRecord(id);
  if (!existing) return null;

  const customerId = Number(body.customer_id ?? existing.customer_id);
  const productId = Number(body.product_id ?? existing.product_id);
  const quantity = Number(body.quantity ?? existing.quantity);
  const status = String(body.status ?? existing.status).trim() || existing.status;
  const purchaseDate = String(body.purchase_date ?? existing.purchase_date).trim() || existing.purchase_date;

  if (usePostgres) {
    const sql = getPg()!;
    try {
      await sql.begin(async (tx) => {
        const [c] = await tx`SELECT id FROM customers WHERE id = ${customerId}`;
        if (!c) throw new Error("CUSTOMER_NOT_FOUND");
        const [oldProduct] =
          await tx`SELECT id, price, quantity_remaining FROM products WHERE id = ${existing.product_id}`;
        const [newProduct] = await tx`SELECT id, price, quantity_remaining FROM products WHERE id = ${productId}`;
        if (!oldProduct || !newProduct) throw new Error("PRODUCT_NOT_FOUND");
        await tx`
          UPDATE products SET quantity_remaining = quantity_remaining + ${existing.quantity}
          WHERE id = ${existing.product_id}
        `;
        const [avail] =
          await tx`SELECT quantity_remaining FROM products WHERE id = ${productId}`;
        if ((avail as { quantity_remaining: number }).quantity_remaining < quantity) {
          throw new Error("NOT_ENOUGH_STOCK");
        }
        await tx`
          UPDATE products SET quantity_remaining = quantity_remaining - ${quantity}
          WHERE id = ${productId}
        `;
        const amount = Number(body.amount ?? (newProduct as { price: number }).price * quantity);
        if (!Number.isFinite(amount) || amount < 0) throw new Error("INVALID_AMOUNT");
        await tx`
          UPDATE orders SET customer_id = ${customerId}, product_id = ${productId},
            quantity = ${quantity}, amount = ${amount}, status = ${status},
            purchase_date = ${purchaseDate}::timestamptz WHERE id = ${id}
        `;
      });
      return await getOrderViewById(id);
    } catch (e) {
      const code = e instanceof Error ? e.message : "UNKNOWN";
      if (
        code === "CUSTOMER_NOT_FOUND" ||
        code === "PRODUCT_NOT_FOUND" ||
        code === "NOT_ENOUGH_STOCK" ||
        code === "INVALID_AMOUNT"
      ) {
        return { error: code };
      }
      throw e;
    }
  }

  const db = getSqliteOrThrow();
  const tx = db.transaction(() => {
    const customer = db.prepare("SELECT id FROM customers WHERE id = ?").get(customerId) as { id: number } | undefined;
    if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
    const oldProduct = db
      .prepare("SELECT id, price, quantity_remaining FROM products WHERE id = ?")
      .get(existing.product_id) as { id: number; price: number; quantity_remaining: number } | undefined;
    const newProduct = db
      .prepare("SELECT id, price, quantity_remaining FROM products WHERE id = ?")
      .get(productId) as { id: number; price: number; quantity_remaining: number } | undefined;
    if (!oldProduct || !newProduct) throw new Error("PRODUCT_NOT_FOUND");
    db.prepare("UPDATE products SET quantity_remaining = quantity_remaining + ? WHERE id = ?").run(
      existing.quantity,
      existing.product_id,
    );
    const available = db
      .prepare("SELECT quantity_remaining FROM products WHERE id = ?")
      .get(productId) as { quantity_remaining: number };
    if (available.quantity_remaining < quantity) throw new Error("NOT_ENOUGH_STOCK");
    db.prepare("UPDATE products SET quantity_remaining = quantity_remaining - ? WHERE id = ?").run(
      quantity,
      productId,
    );
    const amount = Number(body.amount ?? newProduct.price * quantity);
    if (!Number.isFinite(amount) || amount < 0) throw new Error("INVALID_AMOUNT");
    db.prepare(
      "UPDATE orders SET customer_id = ?, product_id = ?, quantity = ?, amount = ?, status = ?, purchase_date = ? WHERE id = ?",
    ).run(customerId, productId, quantity, amount, status, purchaseDate, id);
  });
  try {
    tx();
    return await getOrderViewById(id);
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    if (
      code === "CUSTOMER_NOT_FOUND" ||
      code === "PRODUCT_NOT_FOUND" ||
      code === "NOT_ENOUGH_STOCK" ||
      code === "INVALID_AMOUNT"
    ) {
      return { error: code };
    }
    throw e;
  }
}

export async function deleteOrderById(id: number): Promise<boolean> {
  await ensurePg();
  const existing = await getOrderForDelete(id);
  if (!existing) return false;
  const shouldRestoreStock =
    existing.status === "paid" || (existing.status === "pending" && !existing.sepay_invoice);

  if (usePostgres) {
    const sql = getPg()!;
    await sql.begin(async (tx) => {
      await tx`DELETE FROM orders WHERE id = ${id}`;
      if (shouldRestoreStock) {
        await tx`
          UPDATE products SET quantity_remaining = quantity_remaining + ${existing.quantity}
          WHERE id = ${existing.product_id}
        `;
      }
    });
    return true;
  }
  const db = getSqliteOrThrow();
  db.transaction(() => {
    db.prepare("DELETE FROM orders WHERE id = ?").run(id);
    if (shouldRestoreStock) {
      db.prepare("UPDATE products SET quantity_remaining = quantity_remaining + ? WHERE id = ?").run(
        existing.quantity,
        existing.product_id,
      );
    }
  })();
  return true;
}

const SEPAY_PLACEHOLDER_PRODUCT = "Thanh toán khóa học (SePay)";

export async function sepayCheckoutInsertPending(params: {
  customerName: string;
  customerPhone: string;
  amount: number;
  invoice: string;
}): Promise<void> {
  await ensurePg();
  const { customerName, customerPhone, amount, invoice } = params;

  if (usePostgres) {
    const sql = getPg()!;
    const envId = Number(process.env.SEPAY_PRODUCT_ID);
    await sql.begin(async (tx) => {
      let productId: number;
      if (Number.isInteger(envId) && envId > 0) {
        const [p] = await tx`SELECT id FROM products WHERE id = ${envId}`;
        if (!p) throw new Error("PRODUCT_NOT_FOUND");
        productId = (p as { id: number }).id;
      } else {
        const rows = await tx`SELECT id FROM products ORDER BY id ASC LIMIT 1`;
        if (rows.length) {
          productId = (rows[0] as { id: number }).id;
        } else {
          const [ins] = await tx`
            INSERT INTO products (name, price, description, quantity_remaining)
            VALUES (${SEPAY_PLACEHOLDER_PRODUCT}, 0, ${"Đơn tạo từ trang thanh-toan / SePay"}, 999999)
            RETURNING id
          `;
          productId = (ins as { id: number }).id;
        }
      }
      const [existing] = await tx`SELECT id FROM customers WHERE phone = ${customerPhone}`;
      let customerId: number;
      if (existing) {
        customerId = (existing as { id: number }).id;
        await tx`UPDATE customers SET name = ${customerName} WHERE id = ${customerId}`;
      } else {
        const [ins] = await tx`
          INSERT INTO customers (name, phone) VALUES (${customerName}, ${customerPhone})
          RETURNING id
        `;
        customerId = (ins as { id: number }).id;
      }
      await tx`
        INSERT INTO orders (customer_id, product_id, quantity, amount, status, sepay_invoice)
        VALUES (${customerId}, ${productId}, 1, ${amount}, 'pending', ${invoice})
      `;
    });
    return;
  }

  const db = getSqliteOrThrow();
  db.transaction(() => {
    const envId = Number(process.env.SEPAY_PRODUCT_ID);
    let productId: number;
    if (Number.isInteger(envId) && envId > 0) {
      const row = db.prepare("SELECT id FROM products WHERE id = ?").get(envId) as { id: number } | undefined;
      if (!row) throw new Error("PRODUCT_NOT_FOUND");
      productId = row.id;
    } else {
      const first = db.prepare("SELECT id FROM products ORDER BY id ASC LIMIT 1").get() as { id: number } | undefined;
      if (first) {
        productId = first.id;
      } else {
        const result = db
          .prepare(
            "INSERT INTO products (name, price, description, quantity_remaining) VALUES (?, 0, ?, 999999)",
          )
          .run(SEPAY_PLACEHOLDER_PRODUCT, "Đơn tạo từ trang thanh-toan / SePay");
        productId = Number(result.lastInsertRowid);
      }
    }
    const existing = db.prepare("SELECT id FROM customers WHERE phone = ?").get(customerPhone) as
      | { id: number }
      | undefined;
    let customerId: number;
    if (existing) {
      db.prepare("UPDATE customers SET name = ? WHERE id = ?").run(customerName, existing.id);
      customerId = existing.id;
    } else {
      const inserted = db.prepare("INSERT INTO customers (name, phone) VALUES (?, ?)").run(customerName, customerPhone);
      customerId = Number(inserted.lastInsertRowid);
    }
    db.prepare(
      "INSERT INTO orders (customer_id, product_id, quantity, amount, status, sepay_invoice) VALUES (?, ?, 1, ?, 'pending', ?)",
    ).run(customerId, productId, amount, invoice);
  })();
}

export async function sepayIpnMarkPaid(invoice: string): Promise<{
  matched: boolean;
  alreadyPaid?: boolean;
}> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    return sql.begin(async (tx) => {
      const [order] = await tx`
        SELECT id, product_id, quantity, status FROM orders WHERE sepay_invoice = ${invoice}
      `;
      if (!order) {
        return { matched: false };
      }
      const o = order as { id: number; product_id: number; quantity: number; status: string };
      if (o.status === "paid") {
        return { matched: true, alreadyPaid: true };
      }
      await tx`
        UPDATE products SET quantity_remaining = quantity_remaining - ${o.quantity}
        WHERE id = ${o.product_id}
      `;
      await tx`UPDATE orders SET status = 'paid' WHERE id = ${o.id}`;
      return { matched: true, alreadyPaid: false };
    });
  }
  const db = getSqliteOrThrow();
  return db.transaction(() => {
    const order = db
      .prepare("SELECT id, product_id, quantity, status FROM orders WHERE sepay_invoice = ?")
      .get(invoice) as { id: number; product_id: number; quantity: number; status: string } | undefined;
    if (!order) {
      return { matched: false as const };
    }
    if (order.status === "paid") {
      return { matched: true as const, alreadyPaid: true };
    }
    db.prepare("UPDATE products SET quantity_remaining = quantity_remaining - ? WHERE id = ?").run(
      order.quantity,
      order.product_id,
    );
    db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(order.id);
    return { matched: true as const, alreadyPaid: false };
  })();
}

/** Trả true nếu lần đầu nhận id webhook (để tránh xử lý trùng khi SePay retry). */
export async function consumeSeapyWebhookOnce(externalId: string): Promise<boolean> {
  await ensurePg();
  if (usePostgres) {
    const sql = getPg()!;
    const rows = await sql`
      INSERT INTO sepay_webhook_processed (external_id) VALUES (${externalId})
      ON CONFLICT (external_id) DO NOTHING
      RETURNING external_id
    `;
    return rows.length > 0;
  }
  const db = getSqliteOrThrow();
  const r = db.prepare("INSERT OR IGNORE INTO sepay_webhook_processed (external_id) VALUES (?)").run(externalId);
  return r.changes > 0;
}

function concatBankText(payload: {
  code?: string | null;
  content?: string | null;
  description?: string | null;
}) {
  return [payload.code, payload.content, payload.description]
    .map((s) => (s == null ? "" : String(s)))
    .join(" ");
}

export function extractPbInvoiceFromText(text: string): string | null {
  const m = text.match(/PB-\d+/);
  return m ? m[0] : null;
}

function parseSePayTransactionDate(input?: string | null): Date | null {
  if (!input) return null;
  const text = String(input).trim();
  if (!text) return null;
  // SePay bank webhook thường dùng định dạng "YYYY-MM-DD HH:mm:ss"
  const isoLike = text.replace(" ", "T");
  const d = new Date(isoLike);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function findBestPendingInvoiceByAmount(
  amountVnd: number,
  transactionDate?: string | null,
): Promise<string | null> {
  await ensurePg();
  const txDate = parseSePayTransactionDate(transactionDate);
  if (usePostgres) {
    const sql = getPg()!;
    const rows = await sql`
      SELECT sepay_invoice, created_at FROM orders
      WHERE status = 'pending'
        AND sepay_invoice IS NOT NULL
        AND amount = ${amountVnd}
        AND created_at > NOW() - INTERVAL '1 days'
      ORDER BY id DESC
      LIMIT 20
    `;
    if (!rows.length) return null;
    if (rows.length === 1) return String((rows[0] as { sepay_invoice: string }).sepay_invoice);
    if (!txDate) return null;
    const txMs = txDate.getTime();
    let best: { invoice: string; score: number } | null = null;
    for (const r of rows as unknown as Array<{ sepay_invoice: string; created_at: string }>) {
      const created = new Date(r.created_at);
      const createdMs = created.getTime();
      if (Number.isNaN(createdMs)) continue;
      const score = Math.abs(txMs - createdMs);
      if (!best || score < best.score) {
        best = { invoice: String(r.sepay_invoice), score };
      }
    }
    return best?.invoice ?? null;
  }
  const db = getSqliteOrThrow();
  const rows = db
    .prepare(
      `SELECT sepay_invoice, created_at FROM orders
       WHERE status = 'pending' AND sepay_invoice IS NOT NULL AND amount = ?
         AND datetime(created_at) > datetime('now', '-1 days')
       ORDER BY id DESC LIMIT 20`,
    )
    .all(amountVnd) as { sepay_invoice: string; created_at: string }[];
  if (!rows.length) return null;
  if (rows.length === 1) return rows[0].sepay_invoice;
  if (!txDate) return null;
  const txMs = txDate.getTime();
  let best: { invoice: string; score: number } | null = null;
  for (const row of rows) {
    const created = new Date(row.created_at);
    const createdMs = created.getTime();
    if (Number.isNaN(createdMs)) continue;
    const score = Math.abs(txMs - createdMs);
    if (!best || score < best.score) {
      best = { invoice: row.sepay_invoice, score };
    }
  }
  return best?.invoice ?? null;
}

/**
 * Webhook "Có tiền vào" (JSON có id, content, transferAmount, …) — tài liệu SePay.
 * Tìm mã PB- trong nội dung; nếu không có thì khớp đơn pending theo số tiền khi chỉ có 1 đơn (mã VietQR PAY…).
 */
export async function sepayProcessBankIncomeWebhook(payload: {
  id?: number;
  transactionDate?: string | null;
  transferType?: string;
  transferAmount?: number;
  code?: string | null;
  content?: string | null;
  description?: string | null;
  referenceCode?: string | null;
}): Promise<{ handled: boolean; duplicate?: boolean; matched?: boolean }> {
  await ensurePg();
  if (payload.transferType && payload.transferType !== "in") {
    return { handled: false };
  }
  const amt = Number(payload.transferAmount);
  if (!Number.isFinite(amt) || amt <= 0) {
    return { handled: false };
  }
  const extId =
    payload.id != null && Number.isFinite(Number(payload.id)) && Number(payload.id) > 0
      ? `bank:${payload.id}`
      : `bank:${amt}:${String(payload.content ?? "")}:${String(payload.referenceCode ?? "")}`;

  const text = concatBankText(payload);
  let invoice = extractPbInvoiceFromText(text);
  if (!invoice) {
    invoice = await findBestPendingInvoiceByAmount(Math.round(amt), payload.transactionDate);
  }
  if (!invoice) {
    return { handled: true, matched: false };
  }

  const first = await consumeSeapyWebhookOnce(extId);
  const result = await sepayIpnMarkPaid(invoice);
  // Duplicate webhook vẫn thử markPaid để hồi phục case bản cũ đã ghi id quá sớm.
  return {
    handled: true,
    duplicate: !first,
    matched: result.matched || result.alreadyPaid === true,
  };
}
