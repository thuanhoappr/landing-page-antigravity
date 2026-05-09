"""Reset a goClaw session for a user to clear conversation pattern bias.

Backs up the last 30 messages first, then truncates messages to []
so the LLM stops biasing toward old output format.

Usage:
    SESSION_ID=<uuid> python scripts/reset_session.py
    (or pass as argv[1])

Credentials + session id read from env vars — see scripts/_vps.py.
"""
from __future__ import annotations

import json
import os
import sys

from _vps import open_ssh, psql_exec


def main() -> int:
    session_id = os.environ.get('GOCLAW_SESSION_ID') or (sys.argv[1] if len(sys.argv) > 1 else '')
    if not session_id:
        print(
            'Usage: SESSION_ID=<uuid> python scripts/reset_session.py\n'
            '       OR    python scripts/reset_session.py <uuid>',
            file=sys.stderr,
        )
        return 1

    with open_ssh() as c:
        out, _, _ = psql_exec(
            c,
            f"SELECT messages FROM sessions WHERE id = '{session_id}';",
            tuples_only=True,
        )
        try:
            msgs = json.loads(out.strip())
            print(f'[*] Total messages: {len(msgs)}')
            backup = msgs[-30:]
            with open('session_backup.json', 'w', encoding='utf-8') as f:
                json.dump(
                    {
                        'session_id': session_id,
                        'total_messages': len(msgs),
                        'backed_up_last_30': backup,
                    },
                    f,
                    ensure_ascii=False,
                    indent=2,
                )
            print(f'[*] Backup saved: session_backup.json ({len(backup)} msgs)')
            for m in msgs[-6:]:
                role = m.get('role', '?')
                content = m.get('content') or ''
                preview = content[:80] if isinstance(content, str) else str(content)[:80]
                print(f'   [{role}] {preview!r}')
        except Exception as ex:
            print('Could not parse messages:', ex)
            print('Raw head:', out[:200])

        print()
        print('[*] Resetting session messages...')
        out, err, code = psql_exec(
            c,
            "UPDATE sessions "
            "SET messages='[]'::jsonb, summary=NULL, compaction_count=0, "
            "memory_flush_compaction_count=0, memory_flush_at=0, "
            "input_tokens=0, output_tokens=0, "
            "updated_at=now() "
            f"WHERE id='{session_id}' "
            'RETURNING id, jsonb_array_length(messages) AS new_len;',
        )
        print(out)
        if err.strip():
            print('STDERR:', err)

    print('[*] Done. User can now retest with fresh conversation.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
