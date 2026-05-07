#!/usr/bin/env python3
"""Coach PPR proactive alert — chạy bằng systemd timer trên VPS.

Hai chế độ:
  - mode=instant : Tín hiệu 01 (paid mới) + 02 (lead mới). Mỗi 5 phút.
  - mode=morning : Tín hiệu 03 (Báo cáo sáng). Cron 08:00 mỗi ngày.

Gọi MCP tại http://127.0.0.1:3001/mcp (Streamable HTTP) → format text →
gửi DM admin qua Telegram Bot API. Idempotent nhờ MCP set
paid_notified_at / lead_notified_at trong cùng transaction.

Usage:
    python3 coach_ppr_alert.py --mode instant
    python3 coach_ppr_alert.py --mode morning

Env (load từ /opt/pickleball-landing/coach-ppr-bot.env):
    COACH_PPR_BOT_TOKEN=...
    ADMIN_TG_CHAT_ID=8616188982
    MCP_URL=http://127.0.0.1:3001/mcp   (optional, default trên)
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

ENV_FILE = "/opt/pickleball-landing/coach-ppr-bot.env"


def load_env():
    if os.path.isfile(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def http_post_json(url: str, body: dict, headers: dict | None = None, timeout: int = 30) -> tuple[int, str, dict]:
    """POST JSON, trả (status, raw_text, response_headers)."""
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            **(headers or {}),
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.read().decode("utf-8", "replace"), dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace"), dict(e.headers or {})


def mcp_call(tool_name: str, arguments: dict) -> dict:
    """Call MCP tool theo Streamable HTTP. Trả dict đã parse từ tool result text."""
    url = os.environ.get("MCP_URL", "http://127.0.0.1:3001/mcp").rstrip("/")
    init_body = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2025-06-18",
            "capabilities": {},
            "clientInfo": {"name": "coach-ppr-alert", "version": "1.0"},
        },
    }
    status, _, headers = http_post_json(url, init_body)
    if status >= 400:
        raise RuntimeError(f"MCP init failed: {status}")
    sid = None
    for k, v in headers.items():
        if k.lower() == "mcp-session-id":
            sid = v
            break
    if not sid:
        raise RuntimeError("MCP server did not return mcp-session-id header")

    http_post_json(
        url,
        {"jsonrpc": "2.0", "method": "notifications/initialized"},
        headers={"mcp-session-id": sid},
    )

    status, body, _ = http_post_json(
        url,
        {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": arguments},
        },
        headers={"mcp-session-id": sid},
        timeout=60,
    )
    if status >= 400:
        raise RuntimeError(f"MCP tools/call HTTP {status}: {body[:300]}")
    parsed = json.loads(body)
    if "error" in parsed:
        raise RuntimeError(f"MCP error: {parsed['error']}")
    text = parsed["result"]["content"][0]["text"]
    return json.loads(text)


def telegram_send(chat_id: str, text: str) -> dict:
    """Gửi tin nhắn Telegram via Bot API. Tự fallback Markdown→plain nếu lỗi parse."""
    token = os.environ.get("COACH_PPR_BOT_TOKEN", "").strip()
    if not token:
        raise RuntimeError("COACH_PPR_BOT_TOKEN missing in env")
    api = f"https://api.telegram.org/bot{token}/sendMessage"
    body = {
        "chat_id": chat_id,
        "text": text,
        "disable_web_page_preview": True,
    }
    status, raw, _ = http_post_json(api, body, timeout=20)
    parsed = json.loads(raw) if raw else {}
    if status >= 400 or not parsed.get("ok"):
        raise RuntimeError(f"Telegram send failed status={status} body={raw[:300]}")
    return parsed


def fmt_money(n) -> str:
    try:
        return f"{int(n):,}đ".replace(",", ".")
    except Exception:
        return f"{n}đ"


def build_instant_message(data: dict) -> str | None:
    """Tín hiệu 01+02. None nếu không có gì để nhắn."""
    paid = data.get("paid_orders") or []
    leads = data.get("new_leads") or []
    if not paid and not leads:
        return None
    parts: list[str] = []
    if paid:
        parts.append(f"💰 Đơn paid mới ({len(paid)}):")
        for o in paid:
            inv = o.get("sepay_invoice") or "(no-invoice)"
            parts.append(
                f"• {inv} · {o.get('customer_name')} · {fmt_money(o.get('amount'))}"
                f" · {o.get('product_name')}"
            )
        parts.append("")
    if leads:
        parts.append(f"🆕 Lead mới ({len(leads)}):")
        for c in leads:
            phone = c.get("phone") or "—"
            email = c.get("email") or "—"
            parts.append(f"• {c.get('name')} · {phone} · {email}")
    return "\n".join(parts).rstrip()


def build_morning_message(data: dict) -> str:
    """Tín hiệu 03 — Báo cáo sáng tổng hợp 24h."""
    period = data.get("period", {})
    new_customers = data.get("new_customers", {})
    summary = data.get("orders_summary") or {}
    pending = data.get("pending_payments") or []
    low_stock = data.get("low_stock_products") or []
    email_q = data.get("email_queue") or {}

    pending_alert_hours = 3
    overdue = [p for p in pending if _hours_since(p.get("created_at")) >= pending_alert_hours]

    today = datetime.now().astimezone().strftime("%d/%m/%Y")
    lines = [f"📊 BÁO CÁO 24h QUA — sáng {today}", ""]

    lines.append(f"• Lead mới: {new_customers.get('count', 0)}")
    paid = summary.get("paid", 0)
    pending_total = summary.get("pending", 0)
    cancelled = summary.get("cancelled", 0)
    lines.append(f"• Đơn (tổng kho): paid {paid} · pending {pending_total} · cancelled {cancelled}")

    lines.append(f"• Pending > {pending_alert_hours}h cần nhắc thanh toán: {len(overdue)}")
    for p in overdue[:8]:
        h = _hours_since(p.get("created_at"))
        inv = p.get("sepay_invoice") or "(no-invoice)"
        lines.append(
            f"   - {inv} · {p.get('customer_name')} · {fmt_money(p.get('amount'))} · {h:.1f}h"
        )
    if len(overdue) > 8:
        lines.append(f"   … và {len(overdue) - 8} đơn nữa")

    if low_stock:
        lines.append(f"• Tồn kho thấp: {len(low_stock)}")
        for s in low_stock[:5]:
            lines.append(f"   - {s.get('name')}: còn {s.get('quantity_remaining')}")

    if email_q:
        lines.append(
            f"• Email queue: {email_q.get('overdue_unsent', 0)} quá hạn / "
            f"{email_q.get('unsent_total', 0)} chưa gửi"
        )

    if period:
        lines.append("")
        lines.append(f"_period: {period.get('since', '?')} → {period.get('until', '?')}_")
    return "\n".join(lines)


def _hours_since(iso: str | None) -> float:
    if not iso:
        return 0.0
    try:
        if "T" not in iso:
            iso = iso.replace(" ", "T")
        if iso.endswith("Z"):
            iso = iso[:-1] + "+00:00"
        if "+" not in iso[10:] and "-" not in iso[10:]:
            iso = iso + "+00:00"
        d = datetime.fromisoformat(iso)
        delta = datetime.now(timezone.utc) - d.astimezone(timezone.utc)
        return delta.total_seconds() / 3600.0
    except Exception:
        return 0.0


def run_instant() -> int:
    chat_id = os.environ.get("ADMIN_TG_CHAT_ID", "").strip()
    if not chat_id:
        print("ERR: ADMIN_TG_CHAT_ID missing", file=sys.stderr)
        return 2
    out = mcp_call(
        "get_business_signals",
        {"pending_threshold_hours": 3, "mark_notified": True, "limit_per_signal": 10},
    )
    if not out.get("success"):
        print(f"WARN: tool returned non-success: {out}", file=sys.stderr)
        return 1
    data = out.get("data") or {}
    msg = build_instant_message(data)
    if not msg:
        print(f"[{datetime.now().isoformat(timespec='seconds')}] noop (no new paid/leads)")
        return 0
    print(f"[{datetime.now().isoformat(timespec='seconds')}] sending instant alert\n{msg}")
    telegram_send(chat_id, msg)
    return 0


def run_morning() -> int:
    chat_id = os.environ.get("ADMIN_TG_CHAT_ID", "").strip()
    if not chat_id:
        print("ERR: ADMIN_TG_CHAT_ID missing", file=sys.stderr)
        return 2
    out = mcp_call(
        "get_daily_ops_digest",
        {
            "include_email_queue": True,
            "pending_orders_limit": 50,
            "low_stock_threshold": 5,
        },
    )
    if not out.get("success"):
        print(f"WARN: tool returned non-success: {out}", file=sys.stderr)
        return 1
    data = out.get("data") or {}
    msg = build_morning_message(data)
    print(f"[{datetime.now().isoformat(timespec='seconds')}] sending morning digest\n{msg}")
    telegram_send(chat_id, msg)
    return 0


def main() -> int:
    load_env()
    p = argparse.ArgumentParser()
    p.add_argument("--mode", choices=["instant", "morning"], required=True)
    args = p.parse_args()
    try:
        if args.mode == "instant":
            return run_instant()
        return run_morning()
    except Exception as e:
        print(f"FATAL [{args.mode}]: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
