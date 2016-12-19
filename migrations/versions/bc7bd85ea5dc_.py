"""empty message

Revision ID: bc7bd85ea5dc
Revises: 912b78b76fa4
Create Date: 2016-12-20 01:06:47.055685

"""

# revision identifiers, used by Alembic.
revision = 'bc7bd85ea5dc'
down_revision = '912b78b76fa4'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('product', sa.Column('store', sa.String(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('product', 'store')
    ### end Alembic commands ###
