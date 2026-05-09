"""List vault_documents paths for current agent (tenant_key=GOCLAW_AGENT_KEY)."""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        out, _, _ = psql_exec(
            c,
            'SELECT path, length(summary) AS sum_len, doc_type, '
            "to_char(updated_at,'MM-DD HH24:MI') AS upd "
            'FROM vault_documents '
            f"WHERE agent_id = (SELECT id FROM agents WHERE agent_key='{AGENT_KEY}') "
            'ORDER BY path;',
        )
        print(f'=== vault_documents for {AGENT_KEY} ===')
        print(out)


if __name__ == '__main__':
    main()
