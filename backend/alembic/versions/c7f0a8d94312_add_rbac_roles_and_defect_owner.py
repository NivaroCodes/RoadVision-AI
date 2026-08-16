from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "c7f0a8d94312"
down_revision: str | None = "98c5f41baa19"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE userrole RENAME TO userrole_old")
    sa.Enum("admin", "road_service", "resident", name="userrole").create(
        op.get_bind(), checkfirst=False
    )
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute(
        "ALTER TABLE users ALTER COLUMN role TYPE userrole USING "
        "(CASE role::text WHEN 'dispatcher' THEN 'admin' "
        "WHEN 'inspector' THEN 'road_service' ELSE 'resident' END)::userrole"
    )
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'resident'::userrole")
    op.execute("DROP TYPE userrole_old")
    op.add_column("defects", sa.Column("owner_id", sa.Integer(), nullable=True))
    op.create_index("ix_defects_owner_id", "defects", ["owner_id"], unique=False)
    op.create_foreign_key(
        "fk_defects_owner_id_users",
        "defects",
        "users",
        ["owner_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_defects_owner_id_users", "defects", type_="foreignkey")
    op.drop_index("ix_defects_owner_id", table_name="defects")
    op.drop_column("defects", "owner_id")
    op.execute("ALTER TYPE userrole RENAME TO userrole_new")
    sa.Enum("inspector", "dispatcher", name="userrole").create(
        op.get_bind(), checkfirst=False
    )
    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute(
        "ALTER TABLE users ALTER COLUMN role TYPE userrole USING "
        "(CASE role::text WHEN 'admin' THEN 'dispatcher' ELSE 'inspector' END)::userrole"
    )
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'inspector'::userrole")
    op.execute("DROP TYPE userrole_new")
