from collections.abc import Sequence

from alembic import op

revision: str = "f5c8d2b70461"
down_revision: str | None = "e4b2c7a91350"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE verificationstatus ADD VALUE IF NOT EXISTS 'failed'")


def downgrade() -> None:
    op.execute("ALTER TABLE defects ALTER COLUMN verification_status DROP DEFAULT")
    op.execute("ALTER TYPE verificationstatus RENAME TO verificationstatus_with_failed")
    op.execute("CREATE TYPE verificationstatus AS ENUM ('pending', 'verified', 'not_verified', 'manual_review')")
    op.execute("ALTER TABLE defects ALTER COLUMN verification_status TYPE verificationstatus USING verification_status::text::verificationstatus")
    op.execute("ALTER TABLE defects ALTER COLUMN verification_status SET DEFAULT 'pending'::verificationstatus")
    op.execute("DROP TYPE verificationstatus_with_failed")
