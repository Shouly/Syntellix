"""empty message

Revision ID: a8188ba98d59
Revises: 9bb257773a67
Create Date: 2024-09-30 10:58:57.148939

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'a8188ba98d59'
down_revision = '9bb257773a67'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('t_sys_conversation', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_pinned', sa.Boolean(), nullable=False))
        batch_op.drop_column('pinned')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('t_sys_conversation', schema=None) as batch_op:
        batch_op.add_column(sa.Column('pinned', mysql.TINYINT(display_width=1), autoincrement=False, nullable=False))
        batch_op.drop_column('is_pinned')

    # ### end Alembic commands ###