"""empty message

Revision ID: c078dda10fa4
Revises: a8188ba98d59
Create Date: 2024-10-12 17:18:32.044100

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'c078dda10fa4'
down_revision = 'a8188ba98d59'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('t_sys_conversation_message', schema=None) as batch_op:
        batch_op.drop_column('next_message_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('t_sys_conversation_message', schema=None) as batch_op:
        batch_op.add_column(sa.Column('next_message_id', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True))

    # ### end Alembic commands ###