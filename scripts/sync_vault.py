"""Sync vault-ready/*.md -> goClaw Knowledge Vault on VPS.

Pipeline:
  1. SFTP all .md files in ./vault-ready/ to the agent workspace volume.
  2. chown to host user `ubuntu` so container user `goclaw` (same uid) can read.
  3. POST /v1/vault/rescan on the gateway to register/update documents.

Idempotent: re-running picks up any new/changed files and skips unchanged ones
(reported as "unchanged" in the rescan response).

Env vars (override defaults):
  VPS_HOST, VPS_PORT, VPS_USER, VPS_PASS  (SSH connection)
  GOCLAW_AGENT_DIR                        (per-agent dir under /app/workspace/)
"""
from __future__ import annotations
import os
import sys

import paramiko

HOST = os.environ.get('VPS_HOST', '103.97.127.221')
PORT = int(os.environ.get('VPS_PORT', '2018'))
USERNAME = os.environ.get('VPS_USER', 'root')
PASSWORD = os.environ.get('VPS_PASS', 'A6GYD4nv34')

AGENT_DIR = os.environ.get('GOCLAW_AGENT_DIR', 'coach-ppr/coach-ppr')

LOCAL_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'vault-ready',
)
REMOTE_BASE = '/var/lib/docker/volumes/goclaw-pickleball_goclaw-workspace/_data'
REMOTE_DIR = f'{REMOTE_BASE}/{AGENT_DIR}/vault-ready'


def run(client: paramiko.SSHClient, cmd: str) -> tuple[int, str, str]:
    stdin, stdout, stderr = client.exec_command(cmd)
    code = stdout.channel.recv_exit_status()
    return code, stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')


def main() -> int:
    if not os.path.isdir(LOCAL_DIR):
        print(f'[!] local dir missing: {LOCAL_DIR}', file=sys.stderr)
        return 1

    md_files = sorted(f for f in os.listdir(LOCAL_DIR) if f.endswith('.md'))
    if not md_files:
        print(f'[!] no .md files in {LOCAL_DIR}', file=sys.stderr)
        return 1

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD, timeout=20)

        print(f'[*] mkdir -p {REMOTE_DIR}')
        run(client, f'mkdir -p "{REMOTE_DIR}"')

        sftp = client.open_sftp()
        for fname in md_files:
            local = os.path.join(LOCAL_DIR, fname)
            remote = f'{REMOTE_DIR}/{fname}'
            print(f'[*] put {fname} ({os.path.getsize(local)} bytes)')
            sftp.put(local, remote)
        sftp.close()

        run(client, f'chown -R ubuntu:ubuntu "{REMOTE_DIR}" && chmod -R u+rw,g+rw "{REMOTE_DIR}"')

        print('[*] POST /v1/vault/rescan')
        code, out, err = run(
            client,
            (
                'TOKEN=$(docker exec goclaw-pickleball-goclaw-1 sh -c '
                "'printenv GOCLAW_GATEWAY_TOKEN' | tr -d '\\r\\n'); "
                'docker exec goclaw-pickleball-goclaw-1 sh -c "'
                "wget -qO- --post-data='' --header='Authorization: Bearer $TOKEN' "
                'http://localhost:18790/v1/vault/rescan"'
            ),
        )
        print('rescan response:', out.strip() or '(empty)')
        if err.strip():
            print('STDERR:', err)
        return 0
    finally:
        client.close()


if __name__ == '__main__':
    raise SystemExit(main())
