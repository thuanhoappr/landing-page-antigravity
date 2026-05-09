"""Read CAPABILITIES.md tail (chars 5500-15500) to spot social-media template conflicts."""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    sql = (
        'SELECT content FROM agent_context_files '
        f"WHERE agent_id = (SELECT id FROM agents WHERE agent_key='{AGENT_KEY}') "
        "AND file_name='CAPABILITIES.md';"
    )
    with open_ssh() as c:
        out, _, _ = psql_exec(c, sql, tuples_only=True)
        content = out
        print(f'Total len: {len(content)}')
        print(content[5500:15500])


if __name__ == '__main__':
    main()
