"""empty message

Revision ID: acaa9cbcc5bc
Revises: bc7bd85ea5dc
Create Date: 2016-12-20 17:42:57.719272

"""

# revision identifiers, used by Alembic.
revision = 'acaa9cbcc5bc'
down_revision = 'bc7bd85ea5dc'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.add_column('product', sa.Column('currency', sa.String(), nullable=True))
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('product', 'currency')
    ### end Alembic commands ###
