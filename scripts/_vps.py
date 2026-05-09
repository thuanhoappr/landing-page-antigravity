"""Shared VPS connection helper for goClaw DB inspect/sync scripts.

Reads credentials from environment variables (never hardcode).

Required env vars (set via .env or shell):
    VPS_HOST     — VPS hostname or IP (default: 103.97.127.221)
    VPS_PORT     — SSH port (default: 2018)
    VPS_USER     — SSH username (default: root)
    VPS_PASS     — SSH password (REQUIRED, no default)
    GOCLAW_AGENT_KEY — agent_key in goClaw DB (default: coach-ppr)
    GOCLAW_DB_CONTAINER — Postgres docker container name
                          (default: goclaw-pickleball-postgres-1)

Usage:
    from _vps import open_ssh, psql_exec

    with open_ssh() as c:
        out, err, code = psql_exec(c, "SELECT 1;")
"""
from __future__ import annotations

import os
import sys
from contextlib import contextmanager
from typing import Iterator, Tuple

try:
    import paramiko
except ImportError:
    print('[!] paramiko not installed. pip install paramiko', file=sys.stderr)
    raise


def _load_dotenv() -> None:
    """Best-effort .env loader (no python-dotenv dependency)."""
    here = os.path.dirname(os.path.abspath(__file__))
    root = os.path.dirname(here)
    for candidate in (os.path.join(root, '.env'), os.path.join(root, '.env.local')):
        if not os.path.isfile(candidate):
            continue
        try:
            with open(candidate, 'r', encoding='utf-8') as f:
                for raw in f:
                    line = raw.strip()
                    if not line or line.startswith('#') or '=' not in line:
                        continue
                    k, _, v = line.partition('=')
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    os.environ.setdefault(k, v)
        except OSError:
            continue


_load_dotenv()


HOST = os.environ.get('VPS_HOST', '103.97.127.221')
PORT = int(os.environ.get('VPS_PORT', '2018'))
USERNAME = os.environ.get('VPS_USER', 'root')
PASSWORD = os.environ.get('VPS_PASS', '')
AGENT_KEY = os.environ.get('GOCLAW_AGENT_KEY', 'coach-ppr')
DB_CONTAINER = os.environ.get('GOCLAW_DB_CONTAINER', 'goclaw-pickleball-postgres-1')


def _require_password() -> None:
    if not PASSWORD:
        print(
            '[!] VPS_PASS env var is empty. Set it in .env or shell before running.\n'
            '    Example: $env:VPS_PASS="your-pass"  (PowerShell)\n'
            '             export VPS_PASS=your-pass  (bash)',
            file=sys.stderr,
        )
        raise SystemExit(2)


@contextmanager
def open_ssh(timeout: int = 15) -> Iterator['paramiko.SSHClient']:
    """Yield an authenticated paramiko SSH client. Closes on exit."""
    _require_password()
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD, timeout=timeout)
    try:
        yield c
    finally:
        c.close()


def psql_exec(client: 'paramiko.SSHClient', sql: str, *, tuples_only: bool = False) -> Tuple[str, str, int]:
    """Run SQL inside the goClaw Postgres docker container. Returns (stdout, stderr, exit)."""
    flags = '-t -A' if tuples_only else ''
    cmd = (
        f'docker exec {DB_CONTAINER} psql -U goclaw -d goclaw {flags} -c '
        f'"{sql}"'
    )
    _, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    return out, err, code


def psql_stdin(client: 'paramiko.SSHClient', sql: str) -> Tuple[str, str, int]:
    """Pipe SQL via stdin (use for multiline / dollar-quoted statements)."""
    stdin, stdout, stderr = client.exec_command(
        f'docker exec -i {DB_CONTAINER} psql '
        '-U goclaw -d goclaw -v ON_ERROR_STOP=1 -X --quiet'
    )
    stdin.write(sql)
    stdin.channel.shutdown_write()
    out = stdout.read().decode()
    err = stderr.read().decode()
    code = stdout.channel.recv_exit_status()
    return out, err, code
