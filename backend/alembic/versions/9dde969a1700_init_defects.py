"""init_defects

Revision ID: 9dde969a1700
Revises: 
Create Date: 2026-08-12 12:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '9dde969a1700'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'defects',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('type', sa.Enum('pothole', 'crack', name='defecttype'), nullable=False),
        sa.Column('status', sa.Enum('detected', 'in_progress', 'fixed', 'rejected', name='defectstatus'), nullable=False),
        sa.Column('severity', sa.Enum('low', 'medium', 'high', 'critical', name='defectseverity'), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('confidence', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('image_url', sa.String(length=512), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_defects_id'), 'defects', ['id'], unique=False)
    op.create_index(op.f('ix_defects_status'), 'defects', ['status'], unique=False)
    op.create_index(op.f('ix_defects_severity'), 'defects', ['severity'], unique=False)
    op.create_index(op.f('ix_defects_type'), 'defects', ['type'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_defects_type'), table_name='defects')
    op.drop_index(op.f('ix_defects_severity'), table_name='defects')
    op.drop_index(op.f('ix_defects_status'), table_name='defects')
    op.drop_index(op.f('ix_defects_id'), table_name='defects')
    op.drop_table('defects')
    
    op.execute('DROP TYPE defecttype')
    op.execute('DROP TYPE defectstatus')
    op.execute('DROP TYPE defectseverity')
