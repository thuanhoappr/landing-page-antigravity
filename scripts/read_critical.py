"""Read AGENTS_CORE.md, AGENTS_TASK.md, CAPABILITIES.md head — spot generic templates."""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        for fname in ('AGENTS_CORE.md', 'AGENTS_TASK.md', 'CAPABILITIES.md'):
            sql = (
                'SELECT content FROM agent_context_files '
                f"WHERE agent_id = (SELECT id FROM agents WHERE agent_key='{AGENT_KEY}') "
                f"AND file_name='{fname}';"
            )
            content, _, _ = psql_exec(c, sql, tuples_only=True)
            print(f'=== {fname} ({len(content)} chars) ===')
            print(content[:6000])
            if len(content) > 6000:
                print('...[truncated]')
            print()


if __name__ == '__main__':
    main()
