"""Add priority to tasks.

Revision ID: 0002
Revises: 0001
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "tasks",
        sa.Column("priority", sa.String(length=10), nullable=False, server_default="medium"),
    )
    op.create_check_constraint(
        "valid_task_priority",
        "tasks",
        "priority IN ('low', 'medium', 'high')",
    )


def downgrade():
    op.drop_constraint("valid_task_priority", "tasks", type_="check")
    op.drop_column("tasks", "priority")
