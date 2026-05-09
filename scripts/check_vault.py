"""List candidate vault tables in goClaw Postgres."""
from _vps import open_ssh, psql_exec


def main() -> None:
    with open_ssh() as c:
        out, _, _ = psql_exec(c, '\\dt')
        print('=== tables ===')
        print(out)

        for tbl in ('vault_files', 'vault_documents', 'skill_files', 'agent_vault_files'):
            out, err, code = psql_exec(c, f'SELECT count(*) FROM {tbl};')
            if code == 0 and 'ERROR' not in out and 'does not exist' not in out:
                print(f'=== {tbl} EXISTS ===')
                print(out.strip())


if __name__ == '__main__':
    main()
