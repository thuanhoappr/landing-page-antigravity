"""Deploy landing site to VPS (pickleball30phut.com chạy Docker, không phải Vercel).

Usage:
    python scripts/deploy_landing_vps.py           # dry-run
    python scripts/deploy_landing_vps.py --apply   # git pull + docker rebuild

Requires VPS_PASS in .env / .env.local (see scripts/_vps.py).
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from _vps import open_ssh  # noqa: E402

REMOTE_ROOT = "/opt/pickleball-landing"


def run(c, cmd: str, timeout: int = 600) -> tuple[str, str, int]:
    _, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    code = stdout.channel.recv_exit_status()
    return out, err, code


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    steps = [
        f"cd {REMOTE_ROOT} && git fetch origin master && git reset --hard origin/master",
        f"test -f {REMOTE_ROOT}/public/downloads/Cam-nang-Pickleball-Newbie.pdf && ls -la {REMOTE_ROOT}/public/downloads/Cam-nang-Pickleball-Newbie.pdf",
        f"cd {REMOTE_ROOT} && docker compose build landing",
        f"cd {REMOTE_ROOT} && docker compose up -d --force-recreate landing",
        "docker ps --filter name=landing --format '{{.Names}} {{.Status}}'",
        f"curl -s -o /dev/null -w '%{{http_code}}' 'http://127.0.0.1:3000/api/download/cam-nang?invoice=PB-test' || true",
    ]

    print("[i] VPS deploy plan (pickleball30phut.com):")
    for s in steps:
        print(f"  $ {s}")

    if not args.apply:
        print("\n[DRY-RUN] Re-run with --apply")
        return 0

    with open_ssh() as c:
        for i, cmd in enumerate(steps, 1):
            print(f"\n[{i}/{len(steps)}] {cmd}")
            out, err, code = run(c, cmd)
            if out.strip():
                print(out[-4000:] if len(out) > 4000 else out)
            if err.strip():
                print(err[-2000:] if len(err) > 2000 else err)
            if code != 0 and i <= 4:
                print(f"[!] Exit {code}")
                return code
            time.sleep(1)

    print("\n[OK] Landing redeployed. Test:")
    print("  https://pickleball30phut.com/api/download/cam-nang?invoice=PB-1779180395373")
    print("  https://pickleball30phut.com/thank-you?invoice=PB-1779180395373&product=cam-nang")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
