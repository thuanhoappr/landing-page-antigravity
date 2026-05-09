"""Check skills + vault_documents tables schema for tao-* skills."""
from _vps import open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        out, _, _ = psql_exec(c, '\\d skills')
        print('=== skills schema ===')
        print(out)

        out, _, _ = psql_exec(
            c,
            'SELECT slug, version, length(skill_md), '
            "to_char(updated_at,'MM-DD HH24:MI') AS upd "
            'FROM skills '
            "WHERE slug LIKE 'tao-%' OR slug LIKE '%creative%' OR slug LIKE '%canva%' "
            'ORDER BY slug;',
        )
        print('=== skills row for tao-* (may error if column differs) ===')
        print(out)

        out, _, _ = psql_exec(
            c,
            'SELECT path, length(content), '
            "to_char(updated_at,'MM-DD HH24:MI') AS upd "
            'FROM vault_documents '
            "WHERE path LIKE '%tao-creative%' OR path LIKE '%canva-spec%' "
            'ORDER BY path;',
        )
        print('=== vault_documents tao/canva ===')
        print(out)


if __name__ == '__main__':
    main()
