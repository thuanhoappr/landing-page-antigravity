"""Verify AGENTS.md content in DB (length + first 800 chars)."""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    sql = (
        "SELECT length(content) || E'\\n---\\n' || substring(content from 1 for 800) "
        'FROM agent_context_files '
        "WHERE file_name='AGENTS.md' "
        f"AND agent_id=(SELECT id FROM agents WHERE agent_key='{AGENT_KEY}');"
    )
    with open_ssh() as c:
        out, _, _ = psql_exec(c, sql, tuples_only=True)
        print(out)


if __name__ == '__main__':
    main()
