"""Push local context-files/*.md into goClaw agent_context_files table.

Resolves the issue where context files live in DB (Postgres) and only
get updated when Coach pastes content via web UI. This script lets us
sync programmatically.

Usage: python scripts/push_context_files.py [filename ...]
       (no args = all *.md in context-files/)
"""
from __future__ import annotations

import os
import sys

import paramiko

HOST = os.environ.get('VPS_HOST', '103.97.127.221')
PORT = int(os.environ.get('VPS_PORT', '2018'))
USERNAME = os.environ.get('VPS_USER', 'root')
PASSWORD = os.environ.get('VPS_PASS', 'A6GYD4nv34')
AGENT_KEY = os.environ.get('GOCLAW_AGENT_KEY', 'coach-ppr')

LOCAL_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'context-files',
)


def main() -> int:
    if not os.path.isdir(LOCAL_DIR):
        print(f'[!] missing {LOCAL_DIR}', file=sys.stderr)
        return 1

    if len(sys.argv) > 1:
        names = sys.argv[1:]
    else:
        names = [f for f in os.listdir(LOCAL_DIR) if f.endswith('.md')]

    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        c.connect(HOST, port=PORT, username=USERNAME, password=PASSWORD, timeout=20)

        for fname in names:
            path = os.path.join(LOCAL_DIR, fname)
            if not os.path.isfile(path):
                print(f'[!] skip (missing): {fname}')
                continue
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()

            tag = 'CTX_FILE_DELIM'
            while ('$' + tag + '$') in content:
                tag = tag + '_X'

            sql = (
                "UPDATE agent_context_files SET "
                f"content = ${tag}${content}${tag}$, "
                "updated_at = now() "
                "WHERE file_name = '" + fname + "' "
                "AND agent_id = (SELECT id FROM agents WHERE agent_key = '" + AGENT_KEY + "');\n"
            )

            stdin, stdout, stderr = c.exec_command(
                'docker exec -i goclaw-pickleball-postgres-1 psql '
                '-U goclaw -d goclaw -v ON_ERROR_STOP=1 -X --quiet'
            )
            stdin.write(sql)
            stdin.channel.shutdown_write()
            out = stdout.read().decode().strip()
            err = stderr.read().decode().strip()
            code = stdout.channel.recv_exit_status()
            print(f'[*] {fname} ({len(content)} chars) -> exit={code}')
            if out:
                print('   stdout:', out)
            if err:
                print('   stderr:', err)
        return 0
    finally:
        c.close()


if __name__ == '__main__':
    raise SystemExit(main())
