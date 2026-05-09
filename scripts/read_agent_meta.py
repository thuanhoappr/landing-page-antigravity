"""Read agents.frontmatter, agent_description, model, reasoning_config for current agent."""
from _vps import AGENT_KEY, open_ssh, psql_exec


def main() -> None:
    sql = (
        "SELECT '=== frontmatter ===' || E'\\n' || COALESCE(frontmatter, '(null)') || "
        "E'\\n=== agent_description ===\\n' || agent_description || "
        "E'\\n=== model ===\\n' || provider || ' / ' || model || "
        "E'\\n=== thinking_level ===\\n' || COALESCE(thinking_level, '(null)') || "
        "E'\\n=== reasoning_config ===\\n' || COALESCE(reasoning_config::text, '(null)') || "
        "E'\\n=== other_config ===\\n' || COALESCE(other_config::text, '(null)') "
        f"FROM agents WHERE agent_key='{AGENT_KEY}';"
    )
    with open_ssh() as c:
        out, _, _ = psql_exec(c, sql, tuples_only=True)
        print(out)


if __name__ == '__main__':
    main()
