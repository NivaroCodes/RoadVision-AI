"""add_net_to_defecttype

Revision ID: ab7757ff2fc9
Revises: a74e3193ec03
Create Date: 2026-08-13 00:19:12.224235

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ab7757ff2fc9'
down_revision: Union[str, None] = 'a74e3193ec03'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE defecttype ADD VALUE 'net'")


def downgrade() -> None:
    pass
