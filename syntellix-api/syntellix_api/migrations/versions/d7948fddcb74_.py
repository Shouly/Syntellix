"""empty message

Revision ID: d7948fddcb74
Revises: c9872bbb92dc
Create Date: 2024-09-15 23:25:19.763022

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'd7948fddcb74'
down_revision = 'c9872bbb92dc'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('t_sys_upload_files',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('tenant_id', sa.Integer(), nullable=False),
    sa.Column('storage_type', sa.String(length=255), nullable=False),
    sa.Column('key', sa.String(length=255), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('size', sa.Integer(), nullable=False),
    sa.Column('extension', sa.String(length=255), nullable=False),
    sa.Column('mime_type', sa.String(length=255), nullable=True),
    sa.Column('created_by_role', sa.String(length=255), server_default='account', nullable=False),
    sa.Column('created_by', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
    sa.Column('used', mysql.TINYINT(display_width=1), server_default='0', nullable=False),
    sa.Column('used_by', sa.Integer(), nullable=True),
    sa.Column('used_at', sa.DateTime(), nullable=True),
    sa.Column('hash', sa.String(length=255), nullable=True),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_t_sys_upload_files'))
    )
    with op.batch_alter_table('t_sys_upload_files', schema=None) as batch_op:
        batch_op.create_index('idx_upload_file_tenant_id', ['tenant_id'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('t_sys_upload_files', schema=None) as batch_op:
        batch_op.drop_index('idx_upload_file_tenant_id')

    op.drop_table('t_sys_upload_files')
    # ### end Alembic commands ###
