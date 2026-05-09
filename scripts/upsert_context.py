"""UPSERT a context file into agent_context_files (insert or update).

Usage: python scripts/upsert_context.py <filename>
       (filename is taken from context-files/<filename>)
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
    if len(sys.argv) < 2:
        print('Usage: upsert_context.py <filename>', file=sys.stderr)
        return 1

    fname = sys.argv[1]
    path = os.path.join(LOCAL_DIR, fname)
    if not os.path.isfile(path):
        print(f'[!] missing: {path}', file=sys.stderr)
        return 1

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    tag = 'CTX_DELIM_X'
    while ('$' + tag + '$') in content:
        tag = tag + '_X'

    sql = (
        'INSERT INTO agent_context_files (agent_id, file_name, content, tenant_id) '
        f"SELECT a.id, '{fname}', "
        f"${tag}${content}${tag}$, "
        'a.tenant_id '
        f"FROM agents a WHERE a.agent_key = '{AGENT_KEY}' "
        'ON CONFLICT (agent_id, file_name) '
        'DO UPDATE SET content = EXCLUDED.content, updated_at = now() '
        'RETURNING file_name, length(content) AS len;\n'
    )

    with open_ssh(timeout=20) as c:
        out, err, code = psql_stdin(c, sql)
    print(f'[*] {fname} ({len(content)} chars) -> exit={code}')
    if out.strip():
        print('   stdout:', out.strip())
    if err.strip():
        print('   stderr:', err.strip())
    return 0 if code == 0 else 2


if __name__ == '__main__':
    raise SystemExit(main())
