"""Check agent_context_files table schema + 1 sample row."""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        out, _, _ = psql_exec(c, '\\d agent_context_files')
        print(out)
        out, _, _ = psql_exec(
            c,
            'SELECT id, agent_id, tenant_id, file_name, length(content) AS len '
            "FROM agent_context_files "
            f"WHERE agent_id=(SELECT id FROM agents WHERE agent_key='{AGENT_KEY}') "
            'ORDER BY file_name LIMIT 1;',
        )
        print('=== sample row ===')
        print(out)


if __name__ == '__main__':
    main()
