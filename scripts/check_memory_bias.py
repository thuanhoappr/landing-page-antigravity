"""Inspect episodic_summaries, memory_chunks, agent_evolution_suggestions for bias."""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        out, _, _ = psql_exec(c, '\\d episodic_summaries')
        print('=== episodic_summaries schema ===')
        print(out)

        out, _, _ = psql_exec(
            c,
            'SELECT count(*) FROM episodic_summaries '
            f"WHERE agent_id=(SELECT id FROM agents WHERE agent_key='{AGENT_KEY}');",
        )
        print('=== episodic_summaries count ===')
        print(out)

        out, _, _ = psql_exec(c, '\\d memory_chunks')
        print('=== memory_chunks schema ===')
        print(out)

        out, _, _ = psql_exec(
            c,
            'SELECT count(*) FROM agent_evolution_suggestions '
            f"WHERE agent_id=(SELECT id FROM agents WHERE agent_key='{AGENT_KEY}');",
        )
        print('=== agent_evolution_suggestions count ===')
        print(out)


if __name__ == '__main__':
    main()
