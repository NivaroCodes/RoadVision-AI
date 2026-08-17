from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "e4b2c7a91350"
down_revision: str | None = "c7f0a8d94312"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE defecttype ADD VALUE IF NOT EXISTS 'road_collapse'")
    op.execute("ALTER TYPE defecttype ADD VALUE IF NOT EXISTS 'damaged_manhole'")
    op.execute("ALTER TYPE defecttype ADD VALUE IF NOT EXISTS 'other'")
    op.execute("ALTER TYPE defectstatus ADD VALUE IF NOT EXISTS 'submitted'")
    op.execute("ALTER TYPE defectstatus ADD VALUE IF NOT EXISTS 'verified'")
    priority = sa.Enum("low", "medium", "high", "critical", name="prioritylevel")
    analysis = sa.Enum("pending", "completed", "failed", name="analysisstatus")
    verification = sa.Enum("pending", "verified", "not_verified", "manual_review", name="verificationstatus")
    priority.create(op.get_bind(), checkfirst=False)
    analysis.create(op.get_bind(), checkfirst=False)
    verification.create(op.get_bind(), checkfirst=False)
    op.alter_column("defects", "type", existing_type=sa.Enum(name="defecttype"), nullable=True)
    op.alter_column("defects", "severity", existing_type=sa.Enum(name="defectseverity"), nullable=True)
    op.alter_column("defects", "confidence", existing_type=sa.Float(), nullable=True)
    op.add_column("defects", sa.Column("confirmation_count", sa.Integer(), server_default="1", nullable=False))
    op.add_column("defects", sa.Column("priority", priority, server_default="low", nullable=False))
    op.add_column("defects", sa.Column("priority_reasons", sa.JSON(), server_default=sa.text("'[]'::json"), nullable=False))
    op.add_column("defects", sa.Column("analysis_status", analysis, server_default="pending", nullable=False))
    op.add_column("defects", sa.Column("assigned_to_id", sa.Integer(), nullable=True))
    op.add_column("defects", sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("defects", sa.Column("after_image_url", sa.String(length=512), nullable=True))
    op.add_column("defects", sa.Column("verification_status", verification, server_default="pending", nullable=False))
    op.add_column("defects", sa.Column("verification_confidence", sa.Float(), nullable=True))
    op.create_index("ix_defects_priority", "defects", ["priority"], unique=False)
    op.create_index("ix_defects_assigned_to_id", "defects", ["assigned_to_id"], unique=False)
    op.create_foreign_key("fk_defects_assigned_to_id_users", "defects", "users", ["assigned_to_id"], ["id"], ondelete="SET NULL")
    op.create_table(
        "defect_reports",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("defect_id", sa.BigInteger(), nullable=False),
        sa.Column("resident_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(length=512), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["defect_id"], ["defects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resident_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_defect_reports_defect_id", "defect_reports", ["defect_id"], unique=False)
    op.create_index("ix_defect_reports_resident_id", "defect_reports", ["resident_id"], unique=False)
    op.create_table(
        "defect_events",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("defect_id", sa.BigInteger(), nullable=False),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["actor_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["defect_id"], ["defects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_defect_events_actor_id", "defect_events", ["actor_id"], unique=False)
    op.create_index("ix_defect_events_defect_id", "defect_events", ["defect_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_defect_events_defect_id", table_name="defect_events")
    op.drop_index("ix_defect_events_actor_id", table_name="defect_events")
    op.drop_table("defect_events")
    op.drop_index("ix_defect_reports_resident_id", table_name="defect_reports")
    op.drop_index("ix_defect_reports_defect_id", table_name="defect_reports")
    op.drop_table("defect_reports")
    op.drop_constraint("fk_defects_assigned_to_id_users", "defects", type_="foreignkey")
    op.drop_index("ix_defects_assigned_to_id", table_name="defects")
    op.drop_index("ix_defects_priority", table_name="defects")
    for column in ("verification_confidence", "verification_status", "after_image_url", "assigned_at", "assigned_to_id", "analysis_status", "priority_reasons", "priority", "confirmation_count"):
        op.drop_column("defects", column)
    sa.Enum(name="verificationstatus").drop(op.get_bind(), checkfirst=False)
    sa.Enum(name="analysisstatus").drop(op.get_bind(), checkfirst=False)
    sa.Enum(name="prioritylevel").drop(op.get_bind(), checkfirst=False)
