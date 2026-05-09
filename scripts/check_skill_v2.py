"""v2: read correct columns of skills + vault_documents for tao-creative-fb."""
from _vps import open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        out, _, _ = psql_exec(
            c,
            'SELECT slug, version, file_path, file_size, '
            "to_char(updated_at,'MM-DD HH24:MI') AS upd, enabled "
            'FROM skills '
            "WHERE slug LIKE '%creative%' OR slug LIKE '%canva%' "
            'ORDER BY slug;',
        )
        print('=== skills tao-creative/canva ===')
        print(out)

        out, _, _ = psql_exec(c, '\\d vault_documents')
        print('=== vault_documents schema ===')
        print(out)


if __name__ == '__main__':
    main()
