"""Push local context-files/*.md into goClaw agent_context_files table.

Resolves the issue where context files live in DB (Postgres) and only
get updated when Coach pastes content via web UI. This script lets us
sync programmatically.

Usage: python scripts/push_context_files.py [filename ...]
       (no args = all *.md in context-files/)

Credentials read from env vars — see scripts/_vps.py.
"""
from __future__ import annotations

import os
import sys

from _vps import AGENT_KEY, open_ssh, psql_stdin

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

    with open_ssh(timeout=20) as c:
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
                'UPDATE agent_context_files SET '
                f"content = ${tag}${content}${tag}$, "
                'updated_at = now() '
                f"WHERE file_name = '{fname}' "
                f"AND agent_id = (SELECT id FROM agents WHERE agent_key = '{AGENT_KEY}');\n"
            )

            out, err, code = psql_stdin(c, sql)
            print(f'[*] {fname} ({len(content)} chars) -> exit={code}')
            if out.strip():
                print('   stdout:', out.strip())
            if err.strip():
                print('   stderr:', err.strip())
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
