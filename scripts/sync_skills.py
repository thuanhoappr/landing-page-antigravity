"""Sync skills/*/SKILL.md (+ optional scripts/assets/references) -> goClaw vault.

Mirrors the layout of `sync_vault.py` but targets `skills/` subdirectory under
the agent's workspace volume so goClaw can index Skill files alongside vault
content. Each skill folder is uploaded preserving structure:

    skills/<skill-name>/SKILL.md
    skills/<skill-name>/assets/...   (if any)
    skills/<skill-name>/scripts/...  (if any)
    skills/<skill-name>/references/... (if any)

Idempotent — re-running overwrites changed files; rescan registers/updates.
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
    'skills',
)
REMOTE_BASE = '/var/lib/docker/volumes/goclaw-pickleball_goclaw-workspace/_data'
REMOTE_DIR = f'{REMOTE_BASE}/{AGENT_DIR}/skills'


def run(client: paramiko.SSHClient, cmd: str) -> tuple[int, str, str]:
    stdin, stdout, stderr = client.exec_command(cmd)
    code = stdout.channel.recv_exit_status()
    return code, stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')


def collect_files(root: str) -> list[tuple[str, str]]:
    """Return list of (abs_local_path, rel_path_from_root)."""
    out: list[tuple[str, str]] = []
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            local = os.path.join(dirpath, f)
            rel = os.path.relpath(local, root).replace(os.sep, '/')
            out.append((local, rel))
    return out


def main() -> int:
    if not os.path.isdir(LOCAL_DIR):
        print(f'[!] local dir missing: {LOCAL_DIR}', file=sys.stderr)
        return 1

    files = collect_files(LOCAL_DIR)
    if not files:
        print(f'[!] no files in {LOCAL_DIR}', file=sys.stderr)
        return 1

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD, timeout=20)
        print(f'[*] mkdir -p {REMOTE_DIR}')
        run(client, f'mkdir -p "{REMOTE_DIR}"')

        sftp = client.open_sftp()
        # ensure intermediate dirs exist
        seen_dirs: set[str] = set()
        for _, rel in files:
            d = os.path.dirname(rel)
            if d and d not in seen_dirs:
                run(client, f'mkdir -p "{REMOTE_DIR}/{d}"')
                seen_dirs.add(d)

        for local, rel in files:
            remote = f'{REMOTE_DIR}/{rel}'
            print(f'[*] put {rel} ({os.path.getsize(local)} bytes)')
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
