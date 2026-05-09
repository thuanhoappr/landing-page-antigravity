"""Reset coach-ppr session for user 8616188982 to clear cached pattern.

Backs up the last 30 messages first, then truncates messages to []
so Gemini stops biasing toward old DALL-E English prompt format.
"""
import json
import paramiko

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('103.97.127.221', port=2018, username='root', password='A6GYD4nv34', timeout=15)

# 1) Backup last 30 messages to local file via SSH cat
cmd = (
    'docker exec goclaw-pickleball-postgres-1 psql -U goclaw -d goclaw -t -A -c "'
    "SELECT messages "
    "FROM sessions "
    "WHERE id = '019df1a9-582e-7f23-b8d1-c98c9a17fa93';"
    '"'
)
i, o, e = c.exec_command(cmd)
raw = o.read().decode().strip()
err = e.read().decode().strip()
if err:
    print('STDERR:', err)
try:
    msgs = json.loads(raw)
    print(f'[*] Total messages: {len(msgs)}')
    backup = msgs[-30:]
    with open('session_backup.json', 'w', encoding='utf-8') as f:
        json.dump({'session_id': '019df1a9-582e-7f23-b8d1-c98c9a17fa93',
                   'total_messages': len(msgs),
                   'backed_up_last_30': backup}, f, ensure_ascii=False, indent=2)
    print(f'[*] Backup saved: session_backup.json ({len(backup)} msgs)')
    # show last user/assistant exchange roles to confirm
    for m in msgs[-6:]:
        role = m.get('role', '?')
        content = (m.get('content') or '')[:80] if isinstance(m.get('content'), str) else str(m.get('content'))[:80]
        print(f'   [{role}] {content!r}')
except Exception as ex:
    print('Could not parse messages:', ex)
    print('Raw head:', raw[:200])

# 2) Reset session messages to []
print()
print('[*] Resetting session messages...')
cmd2 = (
    'docker exec goclaw-pickleball-postgres-1 psql -U goclaw -d goclaw -c "'
    "UPDATE sessions "
    "SET messages='[]'::jsonb, summary=NULL, compaction_count=0, "
    "memory_flush_compaction_count=0, memory_flush_at=0, "
    "input_tokens=0, output_tokens=0, "
    "updated_at=now() "
    "WHERE id='019df1a9-582e-7f23-b8d1-c98c9a17fa93' "
    "RETURNING id, jsonb_array_length(messages) AS new_len;"
    '"'
)
i, o, e = c.exec_command(cmd2)
print(o.read().decode())
err = e.read().decode().strip()
if err:
    print('STDERR:', err)

c.close()
print('[*] Done. User can now retest on Telegram with fresh conversation.')
