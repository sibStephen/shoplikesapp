"""empty message

Revision ID: 912b78b76fa4
Revises: b68b0feb188e
Create Date: 2016-09-12 00:38:07.644617

"""

# revision identifiers, used by Alembic.
revision = '912b78b76fa4'
down_revision = 'b68b0feb188e'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('fbuser', sa.Column('cover_id', sa.String(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('fbuser', 'cover_id')
    ### end Alembic commands ###
