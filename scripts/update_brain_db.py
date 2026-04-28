import json
import sqlite3
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "brain.db"
WAITLIST_PATH = ROOT / "waitlist.json"


def normalize_str(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text if text else None


def pick_first(data: dict[str, Any], keys: list[str]) -> str | None:
    for key in keys:
        if key in data:
            text = normalize_str(data.get(key))
            if text:
                return text
    return None


def load_waitlist_rows(raw_data: Any) -> list[dict[str, Any]]:
    if isinstance(raw_data, list):
        return [x for x in raw_data if isinstance(x, dict)]
    if isinstance(raw_data, dict):
        for key in ("data", "items", "waitlist", "customers", "rows"):
            value = raw_data.get(key)
            if isinstance(value, list):
                return [x for x in value if isinstance(x, dict)]
    return []


def create_tables(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
            description TEXT,
            quantity_remaining INTEGER NOT NULL DEFAULT 0 CHECK (quantity_remaining >= 0),
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            zalo TEXT,
            registration_date TEXT NOT NULL DEFAULT (datetime('now')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            CHECK (phone IS NOT NULL OR zalo IS NOT NULL)
        )
        """
    )

    conn.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_phone
        ON customers(phone) WHERE phone IS NOT NULL
        """
    )
    conn.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ux_customers_zalo
        ON customers(zalo) WHERE zalo IS NOT NULL
        """
    )

    conn.execute(
        """
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
        )
        """
    )


def import_customers(conn: sqlite3.Connection, waitlist_path: Path) -> tuple[int, int]:
    if not waitlist_path.exists():
        return (0, 0)

    raw_data = json.loads(waitlist_path.read_text(encoding="utf-8"))
    rows = load_waitlist_rows(raw_data)

    inserted = 0
    skipped = 0

    for item in rows:
        name = pick_first(item, ["name", "full_name", "customer_name", "ten", "ho_ten"]) or "Unknown"
        phone = pick_first(item, ["phone", "phone_number", "mobile", "sdt", "so_dien_thoai"])
        zalo = pick_first(item, ["zalo", "zalo_id", "zalo_name"])
        registration_date = pick_first(
            item,
            ["registration_date", "registered_at", "created_at", "signup_date", "ngay_dang_ky"],
        )

        if not phone and not zalo:
            skipped += 1
            continue

        conn.execute(
            """
            INSERT OR IGNORE INTO customers (name, phone, zalo, registration_date)
            VALUES (?, ?, ?, COALESCE(?, datetime('now')))
            """,
            (name, phone, zalo, registration_date),
        )

        if conn.execute("SELECT changes()").fetchone()[0] > 0:
            inserted += 1
        else:
            skipped += 1

    return (inserted, skipped)


def main() -> None:
    conn = sqlite3.connect(DB_PATH)
    try:
        create_tables(conn)
        inserted, skipped = import_customers(conn, WAITLIST_PATH)
        conn.commit()
    finally:
        conn.close()

    print(f"Database updated: {DB_PATH.name}")
    print("Created/ensured tables: products, customers, orders")
    if WAITLIST_PATH.exists():
        print(f"Imported from {WAITLIST_PATH.name}: inserted={inserted}, skipped={skipped}")
    else:
        print("No waitlist.json found. Import skipped.")


if __name__ == "__main__":
    main()
