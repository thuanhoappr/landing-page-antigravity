"""Search all 9 context files for DALL-E / English prompt instruction markers.

Useful when bot output diverges from skill spec — pinpoint which context file
is anchoring the wrong format.
"""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        sql = (
            'SELECT file_name, length(content) AS len, '
            "(position('DALL' in content) > 0 OR position('dall-e' in content) > 0 OR position('dalle' in content) > 0) AS has_dalle, "
            "(position('English' in content) > 0 OR position('english' in content) > 0) AS has_english, "
            "(position('Prompt ảnh' in content) > 0 OR position('Prompt anh' in content) > 0) AS has_prompt_anh, "
            "(position('Mode 1' in content) > 0) AS has_mode1, "
            "(position('Canva' in content) > 0) AS has_canva "
            'FROM agent_context_files '
            f"WHERE agent_id = (SELECT id FROM agents WHERE agent_key='{AGENT_KEY}') "
            'ORDER BY file_name;'
        )
        out, _, _ = psql_exec(c, sql)
        print('=== context files marker scan ===')
        print(out)

        sql2 = (
            'SELECT path, length(content), '
            "to_char(updated_at,'YYYY-MM-DD HH24:MI') AS upd, "
            'substring(content from 1 for 200) AS preview '
            'FROM memory_documents '
            f"WHERE agent_id = (SELECT id FROM agents WHERE agent_key='{AGENT_KEY}') "
            "AND user_id='8616188982';"
        )
        out, _, _ = psql_exec(c, sql2)
        print('=== memory_documents ===')
        print(out)


if __name__ == '__main__':
    main()
