"""Dump full memory_documents content for current user (default 8616188982)."""
import os

from _vps import AGENT_KEY, open_ssh, psql_exec

USER_ID = os.environ.get('GOCLAW_USER_ID', '8616188982')


def main() -> None:
    sql = (
        "SELECT '=== ' || path || ' ===' || E'\\n' || content || E'\\n\\n' "
        'FROM memory_documents '
        f"WHERE agent_id = (SELECT id FROM agents WHERE agent_key='{AGENT_KEY}') "
        f"AND user_id='{USER_ID}' "
        'ORDER BY path;'
    )
    with open_ssh() as c:
        out, _, _ = psql_exec(c, sql, tuples_only=True)
        print(out)


if __name__ == '__main__':
    main()
