import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _vps import open_ssh


def run(c, cmd, t=60):
    _, o, _ = c.exec_command(cmd, timeout=t)
    return o.read().decode("utf-8", errors="replace")


with open_ssh(timeout=20) as c:
    print(run(c, "docker ps -a --filter name=landing --format '{{.Names}} {{.Status}}'"))
    print(run(c, "tail -5 /tmp/landing-build.log 2>/dev/null || echo no-build-log"))
    print(run(c, "curl -m 5 -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ || echo down"))
