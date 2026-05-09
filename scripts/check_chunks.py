"""Scan memory_chunks for old DALL-E English format text."""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        out, _, _ = psql_exec(
            c,
            'SELECT count(*) FROM memory_chunks '
            f"WHERE agent_id=(SELECT id FROM agents WHERE agent_key='{AGENT_KEY}');",
        )
        print('=== memory_chunks total ===')
        print(out)

        out, _, _ = psql_exec(
            c,
            'SELECT path, length(text) AS len, '
            "(position('Prompt' in text)>0) AS has_prompt, "
            "(position('English' in text)>0 OR position('english' in text)>0) AS has_eng, "
            "(position('DALL' in text)>0) AS has_dalle "
            'FROM memory_chunks '
            f"WHERE agent_id=(SELECT id FROM agents WHERE agent_key='{AGENT_KEY}') "
            'ORDER BY path;',
        )
        print('=== chunks scan ===')
        print(out)


if __name__ == '__main__':
    main()
