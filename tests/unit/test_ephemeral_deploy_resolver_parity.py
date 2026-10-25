"""Parity guard: ephemeral-env.sh and deploy-shared.yml keep the same resolver targets."""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
TARGET = "module.appsync.aws_appsync_resolver.public_create_order"


def test_public_create_order_target_in_both() -> None:
    assert TARGET in (REPO_ROOT / "scripts" / "ephemeral-env.sh").read_text()
    assert TARGET in (REPO_ROOT / ".github" / "workflows" / "deploy-shared.yml").read_text()
